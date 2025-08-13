
// npm install llama-node
// npm install @llama-node/llama-cpp

// const { pipeline } = require('@xenova/transformers');
// const { load_clientembeddings_once_fromS3 } = require('./load_clientembeddings_once_fromS3');
// const { refineWithBedrock } = require('./tinybedrock_summarizer');

import { pipeline } from '@xenova/transformers';
import { refineWithBedrock } from './tinybedrock_summarizer.js';

import { load_clientembeddings_once_fromS3 } from './load_clientembeddings_once_fromS3.js';


// === Cache embedding model globally ===
let extractorPromise;
async function getEmbedding(text) {
  console.log("Text",text)
  if (!extractorPromise) {
    console.time("embeddingModelLoad");
    extractorPromise = pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5');
    console.timeEnd("embeddingModelLoad");
    //Xenova/all-MiniLM-L12-v2 //Xenova/bge-small-en-v1.5 //Xenova/bge-m3 //Xenova/bge-base-en-v1.5
  }
  const extractor = await extractorPromise;
  console.log("Embedding model loaded");
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);

}

// === Optional: per-client cache (redundant if already handled in the loader) ===
// const clientCache = new Map();

async function embed_query_search_retrieve(clauderesponse, clientName) {
 
  try {
     console.time("queryTime");
    const { index, idToMetadata } = await load_clientembeddings_once_fromS3(clientName);
    const queryEmbedding = await getEmbedding(clauderesponse);

    const topK = index.searchKnn(queryEmbedding, 2);

    const topResults = topK.neighbors.map((id, i) => {
      const distance = topK.distances[i];
      const similarity = 1 - distance;
      const data = idToMetadata.get(id);
      console.timeEnd("queryTime");
      return {
        matched_question: data?.question || null,
        matched_answer: data?.answer || null,
        similarity_score: parseFloat(similarity.toFixed(4))
      };
    });

    // Filter by threshold
    const SIMILARITY_THRESHOLD = 0.60;
    const relevantMatches = topResults.filter(r => r.similarity_score >= SIMILARITY_THRESHOLD);

    if (relevantMatches.length === 0) {
      return {
        query: clauderesponse,
        matched_question: null,
        matched_answer: "Not relevant / cannot be answered from company's KB",
        similarity_score: null,
        refined_summary: null
      };
    }

    const topMatch = relevantMatches[0];

    // Generate short, user-friendly summary from TinyLLaMA or tiny bedrock model
    // const refined_summary = await summarizeWithTinyLlama(clauderesponse, topMatch.matched_answer);
    const refined_summary = await refineWithBedrock(clauderesponse, topMatch.matched_answer);


    return {
      query: clauderesponse,
      matched_question: topMatch.matched_question,
      matched_answer: topMatch.matched_answer,
      similarity_score: topMatch.similarity_score,
      refined_summary
    };

  } catch (error) {
    console.error(`ERROR in embed_query_search_retrieve for ${clientName}:`, error.message);
    throw error;
  }
}


async function test() {
  const result = await embed_query_search_retrieve("How long will my PR take?", "ICA");
  console.log(result);
}
test();



// EXPECTED OUTPUT
// {
//   query: 'who is NCSS?',
//   matched_question: 'Who is National Council of Social Service (NCSS)?',
//   matched_answer: 'The National Council of Social Service (NCSS) is the umbrella body for over 500-member social service agencies in Singapore. Its mission is to provide leadership and direction in enhancing the capabilities and capacity of our members, advocating for social service needs and strengthening strategic partnerships, for an effective social service ecosystem.',
//   similarity_score: 0.7478
// }