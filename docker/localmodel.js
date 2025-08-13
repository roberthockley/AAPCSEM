import path from "path";
import { fileURLToPath } from "url";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

// process.env.LLAMA_CPP_FORCE_CPU = '1';

// Setup __dirname manually in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(__dirname, "mistral-7b-instruct-v0.2.Q4_K_M.gguf")//"mistral-7b-instruct-v0.2.Q4_0.gguf");//"mistral-7b-instruct-v0.2.Q4_K_M.gguf")//"mistral-7b-instruct-v0.2.Q4_0.gguf");
//"tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"); 
//phi-2.Q4_K_M.gguf (1.7gb)
//mistral-7b-instruct-v0.2.Q4_K_M.gguf (4.2gb)

let session = null;

export async function loadSession() {
  if (!session) {
    const llama = await getLlama();
    const model = await llama.loadModel({
      modelPath: MODEL_PATH,
      nCtx: 512,
      seed: 42,
    });
    const context = await model.createContext();
    session = new LlamaChatSession({ contextSequence: context.getSequence() });  // ✅ Fixed line
  }
}
export async function summarizeWithLightmodel(transcriptSegment, lastTurns) {
  //await loadSession();
/*
 const prompt =  `<s>[INST]
You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent. Your task is to detect whether the last customer utterance is a meaningful question, and if it is vague or unclear (like "How much is it?"), rewrite it into a clear, fully specified question using the prior conversation context. Always produce a clear question for the agent to understand customer intent.

Instructions:

- If the last customer message is a clear and meaningful question, set "IsAQuestion": "YES" and use the original question as "RewordedQuestion".
- If the last customer message is vague or anaphoric, always rewrite it into a clear, context-aware question using the transcript (including agent messages) so it explicitly references relevant items or topics.
- Never respond with a request for clarification or a non-question in "RewordedQuestion". Always output a well-formed question.
- Respond ONLY with a single-line JSON object with keys "IsAQuestion" and "RewordedQuestion".
- We do not need an explanation as part of the results.

Examples:

Last customer message: "How much is it?"
Transcript: {"Customer": "What time is the train to London?", "Agent": "11:33 am", "Customer": "How much is it?"}

Response:
{"IsAQuestion": "YES", "RewordedQuestion": "How much does the 11:33 am train to London cost?"}

Last customer message: "I like trucks"
Transcript: {"Customer": "What time is the train to London?", "Agent": "11:33 am", "Customer": "I like trucks"}

Response:
{"IsAQuestion": "NO", "RewordedQuestion": "I like trucks"}

---

Last customer message:
"${transcriptSegment}"

Transcript:
${lastTurns}

[/INST]></s>`*/
const prompt = `<s>[INST]
You are an AI assistant supporting a contact center. You receive the last 10 exchanges between a customer and an agent, and the last customer message.

INPUT:
Transcript (last 10 exchanges):
${lastTurns}

Last customer message:
"${transcriptSegment}"

Your task:
1. Determine if the last customer message is a clear, meaningful question suitable for the company’s knowledge base.
2. If the last message is vague, ambiguous, or uses pronouns (e.g., “How much is that?”), rewrite it **concisely** to include all relevant details and context from anywhere in the entire transcript—such as product names, programs, or customer-specific information—to make the question fully clear and self-contained.
3. Preserve the original intent and tense.
4. Do not add any new information not present in the transcript.
5. The rewritten question should help an agent immediately understand the customer's intent.
6. Respond **only** with a single-line JSON object with these exact keys and spelling (case sensitive):

IMPORTANT: The JSON keys must be exactly "IsAQuestion" and "RewordedQuestion".


Output:
Respond only with a single-line JSON object with exactly these keys and spellings (case sensitive):

{"IsAQuestion": "YES" or "NO", "RewordedQuestion": "<rewritten or original question with all relevant details and relevant context about the subject in question>"}
[/INST]>`;
/*
const prompt = `<s>[INST]
You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent. The problem we are trying to solve is intent detection, and if the last utterance from a customer is a question.
 
Your task is to:
- Look at the last customer message and check if it is a clear, meaningful, informational question that should be answered using the company's knowledge base.
- If the last question is vague or anaphoric (like "How much is that?"), rewrite or rephrase the customer's question using the transcript provided for more context so it clearly references the relevant product or subject mentioned earlier. 
This includes information from the Agent which makes the question more specific.
- Do not provide a question for the customer to answer in the reworded question. The reworded question is to help the agent better understand the customer's intent.
 
Respond only with a JSON object on a **single line**, using the following keys and values (no newline characters allowed):
- "IsAQuestion": "YES" or "NO"
- "RewordedQuestion": The rewritten question (if rewording was needed), or the original last question if it was already clear.
- We do not need an explanation as part of the results.

Last customer message:
"${transcriptSegment}"
 
Transcript:
${lastTurns}
 
[/INST]>`;
*/
/*
const prompt = `<s>[INST]
You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent.
 
Your task is to:
- Look at the last customer message and decide if it expresses a clear intent, request, or question that the agent should address.
- If the last message is vague, incomplete, or refers to something mentioned earlier (e.g., "How much is that?"), rewrite it so it clearly and fully reflects the customer’s intended meaning using the context in the transcript.
- Ignore casual greetings, small talk, or comments unrelated to the conversation purpose (e.g., weather, mood, jokes).
- Base your decision solely on the customer's most recent message, using the rest of the transcript only for context to clarify vague references.
 
Respond with a JSON object on a single line (no newline characters), using the following keys and values exactly:
- "HasIntent": "YES" or "NO" (YES if the last customer message contains a clear intent or request, otherwise NO)
- "ClarifiedMessage": The rewritten message (if rewording was needed), or the original last message if it was already clear.
 
Last customer message:
"${transcriptSegment}"
 
Transcript:
${lastTurns}
 
[/INST]>`;
*/
/*
  const prompt = `<s>[INST]
  You are an assistant that answers user questions using only the information provided.
  Question:
  ${query}
  Information:
  ${answer}
  Write a short and accurate answer. Do not add or invent anything. If the answer is not in the information, respond with "I don't know."
  [/INST]>`;
*/
console.log("Query:",transcriptSegment, "Transcript:",lastTurns)
  const result = await session.prompt(prompt, 
     {maxTokens: 100,}
  );
  return result.trim();
}
