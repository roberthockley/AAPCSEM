// server.js
const http = require('http');
const WebSocket = require("ws");
const { KinesisClient, ListShardsCommand, GetShardIteratorCommand, GetRecordsCommand } = require("@aws-sdk/client-kinesis");
const { BedrockRuntimeClient, InvokeModelCommand, ConversationRole, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require("@aws-sdk/client-bedrock-agent-runtime");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const dynamodbClient = new DynamoDBClient({ region: "ap-southeast-1" });
const bedrockClient = new BedrockRuntimeClient({ region: "ap-southeast-1" });
const bedrockAgentClient = new BedrockAgentRuntimeClient({ region: "ap-southeast-1" });
const REGION = process.env.AWS_REGION || "ap-southeast-1";
const STREAM_NAME = process.env.KINESIS_STREAM_NAME || "connect-audio-stream";

// Initialize Kinesis client
const kinesisClient = new KinesisClient({ region: REGION });

// Transcript data store keyed by contactId
// Each value is an object: { fullTranscript: string, lastTurns: string[] }
const transcriptStore = new Map();

// WebSocket connections store keyed by contactId, value is Set of ws connections
const connections = new Map();

// Starts a WebSocket server to manage client connections and registries
function startWebSocketServer(port = 3000) {
    const server = http.createServer((req, res) => {
        if (req.url === '/health-check') {
            console.log("HC")
            res.writeHead(200);
            res.end('OK');
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        let contactId;

        ws.on('message', function incoming(message) {
            const msg = JSON.parse(message);
            if (msg.contactId) {
                contactId = msg.contactId;
                connections.set(contactId, ws);
                console.log(`New agent connection for contactId: ${contactId}`);
            }
            if (msg.questionForKB) {
                queryKB(msg.contactId, msg.questionForKB);
            }
            if (msg.requestId && msg.result) {
                resultsTracking(msg);
            }
        });

        ws.on('close', () => {
            if (contactId) {
                connections.delete(contactId);
                console.log(`Agent disconnected: ${contactId}`);
            }
        });
    });

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

async function resultsTracking(message) {
    const dynamodbCommand = new PutItemCommand({
        TableName: "aaresults",
        Item: {
            contactId: { S: message.contactId },
            requestId: { S: message.requestId },
            feedback: { S: message.result },
            question: { S: message.question },
            response: { S: message.response }
        }
    });

    await dynamodbClient.send(dynamodbCommand);
    console.log(`✅ Stored feedback for ${message.contactId} - ${message.requestId}`);
}
// Utility to update transcript store for a given contactId and notify clients
function updateTranscript(contactId, transcriptSegment, role) {
    if (!transcriptStore.has(contactId)) {
        transcriptStore.set(contactId, { fullTranscript: "", lastTurns: [] });
    }
    const data = transcriptStore.get(contactId);
    //console.log("Data", data)
    // Append new text segment to full transcript
    data.fullTranscript += transcriptSegment + " ";

    // Track last 10 turns (simple fixed size queue)
    data.lastTurns.push(transcriptSegment);
    if (data.lastTurns.length > 10) {
        data.lastTurns.shift();
    }
    if (role.Transcript.ParticipantRole == "CUSTOMER") {
        console.log("Updating CCP")
        //updateCCP(transcriptSegment, contactId, data)
        isQuestion(transcriptSegment, contactId, data)
    }

}

// When a call ends you can drop stored data for the contactId to free memory
function endCallCleanup(contactId) {
    console.log(`Cleaning up transcripts for contactId: ${contactId}`);
    transcriptStore.delete(contactId);
    if (wsClients.has(contactId)) {
        wsClients.get(contactId).forEach((client) => {
            client.close();
        });
        wsClients.delete(contactId);
    }
}

// Consume all shards by fetching iterators and polling them continuously
async function consumeAllShards() {
    const shardsResponse = await kinesisClient.send(new ListShardsCommand({ StreamName: STREAM_NAME }));
    const shards = shardsResponse.Shards || [];

    shards.forEach((shard) => {
        consumeShard(shard.ShardId);
    });
}

// Consume a single shard in an infinite loop
async function consumeShard(shardId) {
    try {
        const iteratorResponse = await kinesisClient.send(new GetShardIteratorCommand({
            StreamName: STREAM_NAME,
            ShardId: shardId,
            ShardIteratorType: "LATEST", // Adjust to TRIM_HORIZON if you want all history
        }));

        let shardIterator = iteratorResponse.ShardIterator;

        while (shardIterator) {
            const recordsResponse = await kinesisClient.send(new GetRecordsCommand({
                ShardIterator: shardIterator,
                Limit: 100,
            }));
            const records = recordsResponse.Records || [];
            // Process each record
            for (const record of records) {
                const payload = Buffer.from(record.Data).toString("utf-8");
                // Expect payload to be JSON including contactId and transcript content
                try {
                    const data = JSON.parse(payload);
                    const contactId = data.ContactId || data.contactId;
                    console.log("****", data.EventType)
                    switch (data.EventType) {
                        case "SEGMENTS":
                            for (let i = 0; i < data.Segments.length; i++) {
                                let keys = Object.keys(data?.Segments[i])
                                switch (keys[0]) {
                                    case "Utterance":
                                        console.log(`Utterance is: ${data?.Segments[i]?.Utterance?.PartialContent}`)
                                        break;
                                    case "Transcript":
                                        console.log(`Transcript is: ${data?.Segments[i]?.Transcript?.Content}`)
                                        updateTranscript(contactId, `${data?.Segments[i]?.Transcript?.ParticipantRole}: ${data?.Segments[i]?.Transcript?.Content} `, data?.Segments[i]);
                                        break;
                                    default:

                                }
                            }
                            break;
                        case "COMPLETED":
                            console.log(`data is ${JSON.stringify(data)}`)
                            postCallSymmary(data.ContactId)
                            break;
                        default:
                    }
                    // Example: If you receive a call end signal, clean up transcript store
                    if (data.ContactId && data.EventType === "CallEnded") {
                        endCallCleanup(data.ContactId);
                    }
                } catch (e) {
                    console.error("Failed to parse record JSON", e, payload);
                }
            }

            shardIterator = recordsResponse.NextShardIterator;

            // Poll delay, adjust as needed (e.g., 1s)
            await new Promise((r) => setTimeout(r, 1000));
        }
    } catch (err) {
        console.error(`Error consuming shard ${shardId}`, err);
        // Optionally retry after delay or exit to let container restart it
    }
}

//Nova Lite
/*
async function isQuestion(transcriptSegment, contactId, data) {
    const prompt = `
  You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent.

  Your task is to:
                                Look at the last customer message and check if it is a clear, meaningful, informational question that should be answered using the company's knowledge base.
  If the last question is vague or anaphoric(like "How much is that?"), rewrite or rephrase the customer’s question so it clearly references the relevant product or subject mentioned earlier.
                                Then, determine if this clarified question requires a specific or technical answer using the knowledge base, ignoring questions about weather, mood, feelings, or small talk.

                                    Respond with a JSON object with the following keys and values, new line characters are not allowed:
                            Key1 = "IsAQuestion"
                            Value1 = "YES" or "NO" indicating whether it should be answered using the knowledge base,
                                Key2 = "RewordedQuestion"
                            Value2 = The rewritten question(if rewording was needed), or the original last question if it was already clear
Last customer message: ${transcriptSegment}
                            Transcript:
${JSON.stringify(data.lastTurns, null, 2)}
                            `;
    console.log("Q for isaquestion", JSON.stringify(data.lastTurns, null, 2))
    const modelId = "apac.amazon.nova-lite-v1:0";
    const inputText = prompt;
    const message = {
        content: [{ text: inputText }],
        role: ConversationRole.USER,
    };

    const request = {
        modelId,
        messages: [message],
        inferenceConfig: {
            maxTokens: 500, // The maximum response length
            temperature: 0.5, // Using temperature for randomness control
            //topP: 0.9,        // Alternative: use topP instead of temperature
        },
    };

    try {
        const response = await bedrockClient.send(new ConverseCommand(request));
        let cleaned = response.output.message.content[0].text
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
            const jsonString = match[0];
            console.log(jsonString);

            // Optionally, parse the JSON if you want to use it as an object:
            try {
                const jsonObj = JSON.parse(jsonString);
                console.log(jsonObj);
                if (jsonObj.IsAQuestion == "YES") {
                    console.log("**** Updating CCP line 218", jsonObj.RewordedQuestion, contactId, data)
                    updateCCP(jsonObj.RewordedQuestion, contactId, null, false)//,null to data if want last turns
                }
            } catch (e) {
                console.error("Invalid JSON:", e);
            }
        }

    } catch (error) {
        console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error.message}`);
        throw error;
    }
}*/
// Cloude Sonnet 3.5
async function isQuestion(transcriptSegment, contactId, data) {
    const prompt = `
  You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent.

  Your task is to:
                                Look at the last customer message and check if it is a clear, meaningful, informational question that should be answered using the company's knowledge base.
  If the last question is vague or anaphoric(like "How much is that?"), use the previous turns of the conversation in the reverse order to rewrite or rephrase the customer's question so it clearly references the relevant product or subject mentioned earlier.
                                Then, determine if this clarified question requires a specific or technical answer using the knowledge base, ignoring questions about weather, mood, feelings, or small talk.

                                    Respond with a JSON object with the following keys and values, new line characters are not allowed:
                            Key1 = "IsAQuestion"
                            Value1 = "YES" or "NO" indicating whether it should be answered using the knowledge base,
                                Key2 = "RewordedQuestion"
                            Value2 = The rewritten question(if rewording was needed), or the original last question if it was already clear
Last customer message: ${transcriptSegment}
                            Transcript:
${JSON.stringify(data.lastTurns, null, 2)}
                            `;
    const nativeRequest = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 512,
        temperature: 0.5,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    const bedrockParams = {
        body: JSON.stringify(nativeRequest),
        contentType: "application/json",
        accept: "application/json",
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    };


    const isQCommand = new InvokeModelCommand(bedrockParams);

    try {
        const response = await bedrockClient.send(isQCommand);
        const responseBody = response.body.transformToString(); // node-fetch-like response stream
        console.log("Response:", JSON.parse(responseBody));
        let content = JSON.parse(responseBody)
        // Optionally, parse the JSON if you want to use it as an object:
        try {
            const jsonObj = JSON.parse(content.content[0].text);
            console.log(jsonObj.IsAQuestion);
            if (jsonObj.IsAQuestion == "YES") {
                console.log("**** Updating CCP line 309", jsonObj.RewordedQuestion, contactId, data)
                updateCCP(jsonObj.RewordedQuestion, contactId, null, false)//,null to data if want last turns
            }
        } catch (e) {
            console.error("Invalid JSON:", e);
        }
    } catch (error) {
        console.error(`ERROR: Can't invoke '${bedrockParams.modelId}'. Reason: ${error.message}`);
        throw error;
    }
}

async function postCallSymmary(psContactId) {
    console.log(transcriptStore.get(psContactId)?.fullTranscript)
    const prompt = `This call is from a Contact Center. 
    Please summarize this call and provide next actions. 
    Please use bullet points not hyphens, bullet points can not be numerical. 
    Please give a title for Summary and Actions. 
    Do not lie, and do not make anything up, please stick to what was said. 
    Enure all topics are summarised. 
    The transcript is between the agent and the customer and the details are: + ${transcriptStore.get(psContactId)?.fullTranscript}`;

    const nativeRequest = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 8192,
        temperature: 0.5,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    };
    const bedrockParams = {
        body: JSON.stringify(nativeRequest),
        contentType: "application/json",
        accept: "application/json",
        modelId: "anthropic.claude-3-haiku-20240307-v1:0"
    };
    console.log(bedrockParams)
    const bedrockCommand = new InvokeModelCommand(bedrockParams);
    const bedrockResponse = await bedrockClient.send(bedrockCommand);
    console.log(bedrockResponse);
    const responseBody = Buffer.from(bedrockResponse.body).toString('utf-8');
    const parsedResponse = JSON.parse(responseBody);
    console.log("Parsed Response:", parsedResponse.content[0].text);
    console.log("**** Updating CCP line 266", psContactId, parsedResponse.content[0].text)
    updateCCPPCS(psContactId, parsedResponse.content[0].text)
}

async function updateCCPPCS(contactId, summary) {
    const summaryMatch = summary.match(/Summary:\s*([\s\S]*?)Actions:/);
    const actionsMatch = summary.match(/Actions:\s*([\s\S]*?)(?:Note:|$)/);
    const noteMatch = summary.match(/Note:\s*([\s\S]*)$/);
    let attribute = {}
    attribute.contactId = contactId
    attribute.attributes = {}
    if (summaryMatch) {
        const summaryLines = summaryMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('•') || line.startsWith('-'));
        summaryLines.forEach((line, idx) => {
            attribute.attributes[`PCSSummary${idx + 1}`] = line;
        });
    } else { attribute.attributes[`PCSSummary1`] = summary }
    if (actionsMatch) {
        const actionLines = actionsMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('•'));
        actionLines.forEach((line, idx) => {
            attribute.attributes[`PCSAction${idx + 1}`] = line;
        });
    }
    if (noteMatch) {
        const noteLines = noteMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        noteLines.forEach((line, idx) => {
            attribute.attributes[`PCSNote${idx + 1}`] = line;
        });
    }
    const cws = connections.get(contactId);
    if (cws && cws.readyState === WebSocket.OPEN) {
        cws.send(JSON.stringify(attribute));
        console.log("Sent data to WebSocket:", attribute);
    } else {
        console.warn("WebSocket not open or not found for contactId:", contactId);
    }
    console.log("Send to WS", attribute)
}

async function updateCCP(transcriptSegment, contactId, data, qna) {
    console.log("****", data)
    let attribute = {}
    attribute.contactId = contactId
    attribute.attributes = {}
    attribute.attributes.AAQuestion = transcriptSegment
    attribute.attributes.AALocation = data?.location
    attribute.attributes.AAText = data?.lastTurns
    attribute.attributes.QnA = qna
    attribute.attributes.requestId = data?.requestId
    const cws = connections.get(contactId);
    if (cws && cws.readyState === WebSocket.OPEN) {
        cws.send(JSON.stringify(attribute));
        console.log("Sent data to WebSocket:", attribute);
    } else {
        console.warn("WebSocket not open or not found for contactId:", contactId);
    }
    console.log("Send to WS", attribute)
}
// Start HTTP + WS server and Kinesis consumption
async function main() {
    startWebSocketServer(3000);
    await consumeAllShards();
}

async function queryKB(contactId, questionForKB) {
    const modelArn = "arn:aws:bedrock:ap-southeast-1:949449004747:inference-profile/apac.anthropic.claude-3-haiku-20240307-v1:0";//"arn:aws:bedrock:ap-southeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0";//anthropic.claude-3-5-sonnet-20240620-v1:0";
    const kbParams = {
        input: {
            text: `You are a question answering agent. I will provide you with a set of search results. The user will provide you with a question. Your job is to answer the user's question using only information from the search results. If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. 
      Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.
      Please summarise the results in bullet points, make this summary in 3 to 5 bullet points only, and no more than 50 words, and only the main facts are needed.
      Here are the search results in numbered order:
      $search_results$\n\n${questionForKB}`
        },
        retrieveAndGenerateConfiguration: {
            type: "KNOWLEDGE_BASE",
            knowledgeBaseConfiguration: {
                knowledgeBaseId: "SZSOQTRFJI",
                modelArn: modelArn,
                retrievalConfiguration: {
                    vectorSearchConfiguration: {
                        numberOfResults: 3,
                        overrideSearchType: "SEMANTIC"
                    }
                }
            }
        },
        /*guardrailConfiguration: {
          guardrailId: "qs3f2t6era9g",  // Replace with your actual Guardrail ID
          guardrailVersion: "2"
        }*/
    };
    try {
        const kbCommand = new RetrieveAndGenerateCommand(kbParams);
        const bedrockKBresponse = await bedrockAgentClient.send(kbCommand);
        console.log(bedrockKBresponse)
        /*const minScoreThreshold = 0.53;
    
        // Filter retrieved chunks by relevance score
        const filteredResults = response.retrievalResults
          ?.filter(result => result.score >= minScoreThreshold)
          .map(result => ({
            ...result
          }));*/
        let connectInputData = {};
        connectInputData.text = bedrockKBresponse.output.text
        connectInputData.location = bedrockKBresponse.citations[0]?.retrievedReferences[0]?.location?.s3Location?.uri || bedrockKBresponse?.citations[0]?.retrievedReferences[0]?.location?.webLocation?.url
        connectInputData.question = questionForKB
        console.log("CI", connectInputData)
        let kbResponse = {}
        kbResponse.lastTurns = `${connectInputData.text} Reference: ${connectInputData.location}`
        kbResponse.location = connectInputData.location
        kbResponse.requestId = bedrockKBresponse['$metadata'].requestId
        console.log("**** Updating CCP line 385", questionForKB, contactId, kbResponse)
        updateCCP(questionForKB, contactId, kbResponse, true)

    } catch (err) {
        console.error(err);
        body.error = String(err);
        return {
            statusCode: 500,
            body: body
        };
    }

}


main().catch(console.error);
