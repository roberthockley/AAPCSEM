// summarizeWithLightmodel.js
// npm install node-llama-cpp@latest

import path from "path";
import { fileURLToPath } from "url";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

// process.env.LLAMA_CPP_FORCE_CPU = '1';

// Setup __dirname manually in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(__dirname, "mistral-7b-instruct-v0.2.Q4_0.gguf");
//tinyllama-1.1b-chat-v1.0.Q4_K_M (0.7gb) 
//phi-2.Q4_K_M.gguf (1.7gb)
//mistral-7b-instruct-v0.2.Q4_K_M.gguf (4.2gb)

let session = null;

async function loadSession() {
  if (!session) {
    const llama = await getLlama();
    const model = await llama.loadModel({
      modelPath: MODEL_PATH,
      nCtx: 2048,
      seed: 42,
    });
    const context = await model.createContext();
    session = new LlamaChatSession({ contextSequence: context.getSequence() });  // ✅ Fixed line
  }
}

export async function summarizeWithLightmodel(query, answer) {
  await loadSession();

const prompt = `<s>[INST]
You are an AI assistant supporting a contact center. Below is a transcript of the last 10 exchanges between a customer and an agent.
 
Your task is to:
- Look at the last customer message and check if it is a clear, meaningful, informational question that should be answered using the company's knowledge base.
- If the last question is vague or anaphoric (like "How much is that?"), rewrite or rephrase the customer's question so it clearly references the relevant product or subject mentioned earlier. This includes information from the Agent which makes the question more specific.
- Then, determine if this clarified question requires a specific or technical answer using the knowledge base, ignoring questions about weather, mood, feelings, or small talk.
 
Respond with a JSON object on a **single line**, using the following keys and values (no newline characters allowed):
- "IsAQuestion": "YES" or "NO"
- "RewordedQuestion": The rewritten question (if rewording was needed), or the original last question if it was already clear.
 
Last customer message:
"${query}"
 
Transcript:
${answer}
 
[/INST]>`;

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

  const result = await session.prompt(prompt, 
    // {maxTokens: 1000,}
  );
  return result.trim();
}

// === Test Run ===
const result = await summarizeWithLightmodel(
  "Do they have a first class section?",
  `"Customer": "How much is the train to London?",
    "Agent": "$10",
    "Customer": "What time does it leave?",
    "Agent": "11:33 am",
    "Customer": "Do they have a first class section?`
);

console.log("Refined summary:", result);
