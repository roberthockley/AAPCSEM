

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
const bedrock = new BedrockRuntimeClient({ region: "ap-southeast-1" });

export async function refineWithBedrock(query, answer) {

    const prompt = `\n\nHuman: User asked: "${query}"\nKnowledge base answer: "${answer}"\n\n
    Summarize in a concise, user-friendly response that directly answers the user's question.\n\nAssistant:`;

  const input = {
    modelId: "anthropic.claude-instant-v1", // or another lightweight Bedrock model
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: prompt,
      max_tokens_to_sample: 60,
      temperature: 0.5,
      stop_sequences: ["\n\n"],
    }),
  };

  const command = new InvokeModelCommand(input);
  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.completion.trim();
}

// === Test Run ===
// const result = await refineWithBedrock(
//   "how many members are there in ncss",
//   "The National Council of Social Service (NCSS) is the umbrella body for over 500-member social service agencies in Singapore. Its mission is to provide leadership and direction in enhancing the capabilities and capacity of our members, advocating for social service needs and strengthening strategic partnerships, for an effective social service ecosystem."
// );

// console.log("Refined summary:", result);