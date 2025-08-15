import path from "path";
import { fileURLToPath } from "url";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

// process.env.LLAMA_CPP_FORCE_CPU = '1';

// Setup __dirname manually in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(__dirname, "mistralai_Mistral-Small-3.2-24B-Instruct-2506-Q4_K_M.gguf");//"mistral-7b-claude-chat.Q8_0.gguf");//"gpt-oss-20b-Q5_K_M.gguf");//"mistral-7b-instruct-v0.2.Q4_K_M.gguf")//"mistral-7b-instruct-v0.2.Q4_0.gguf");//"mistral-7b-instruct-v0.2.Q4_K_M.gguf")//"mistral-7b-instruct-v0.2.Q4_0.gguf");
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
  console.log("Last Message:",transcriptSegment)
  /*const prompt = `
You are an AI assistant in a contact center.

[CONTEXT]
Last customer message: "${transcriptSegment}"
Transcript (latest to oldest): ${lastTurns}

[INSTRUCTIONS]
1. Determine if the last customer message is a clear, specific, informational question that can be answered from the company knowledge base.
2. If it is vague, ambiguous, or uses unclear references (e.g., "that", "it", "they"), rewrite it by replacing those references with the correct subject from earlier messages in the transcript so it becomes fully clear and self-contained.
3. Always use details from earlier messages — such as product names, destinations, or services — to make the rewritten question clear.
4. Keep the original meaning and tense. Do not add any new information not found in the transcript.
5. IMPORTANT: You must always output a "RewordedQuestion" containing the rewritten or clarified last message, even if "IsAQuestion" is "NO".

[OUTPUT FORMAT]
Respond with exactly one single-line JSON object:
{"IsAQuestion":"YES" or "NO","RewordedQuestion":"<rewritten last message with full context>"}

[RESTRICTIONS]
- Absolutely no text before or after the JSON.
- No explanations, reasoning, or comments.
- The first output character must be "{" and the last must be "}".

[OUTPUT]
JSON:
`;*/


const prompt = `<s>[INST]
You are an AI assistant supporting a contact center. You receive the last 10 exchanges between a customer and an agent, and the last customer message.

INPUT:
Transcript (last 10 exchanges):
${lastTurns}

Last customer message:
"${transcriptSegment}"

Your task:
1. Determine if the last customer message is a clear, meaningful question suitable for the company's knowledge base.
2. If the last message is vague, ambiguous, or uses pronouns, rewrite it **concisely** to include all relevant details and context from anywhere in the entire transcript—such as product names, programs, or customer-specific information—to make the question fully clear and self-contained.
3. Preserve the original intent and tense.
4. Do not add any new information not present in the transcript.
5. The rewritten question should help an agent immediately understand the customer's intent.
6. Respond **only** with a single-line JSON object containing exactly these keys: 
{"IsAQuestion": "YES" or "NO", "RewordedQuestion": "<rewritten question if meaningful, else privide ${transcriptSegment}>"}.
Do not include any extra text, notes, explanations, or formatting outside this JSON.

IMPORTANT: The JSON keys must be exactly "IsAQuestion" and "RewordedQuestion".

Rules:
- Do not include any text outside the JSON object.
- Do not add explanations, comments, or notes.
- Do not add newlines or whitespace outside the JSON.
- "RewordedQuestion" must be the ${transcriptSegment} if the last customer message is not a meaningful question.
- Do not add any additional quotes around the values for IsAQuestion or RewordedQuestion


Output:
Respond only with a single-line JSON object as specified. Do **not** include any explanations, comments, or additional text.Your entire response must be the JSON object with exactly these keys and spelling (case sensitive): 

{"IsAQuestion": "YES" or "NO", "RewordedQuestion": "<rewritten or original question with all relevant details and relevant context about the subject in question>"}
[/INST]>`;

console.log("Query:",transcriptSegment, "Transcript:",lastTurns)
  const result = await session.prompt(prompt, 
     {maxTokens: 512,}
  );
  return result.trim();
}
