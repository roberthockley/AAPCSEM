// load_clientembeddings_once_fromS3.js
// const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
// const hnswlib = require("hnswlib-node");

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import hnswlib from "hnswlib-node";

const s3 = new S3Client({ region: "ap-southeast-2" }); //S3 bucket is in ap-southeast-2
const BUCKET = "song-ai-dhl2";
const EMBEDDINGS_PREFIX = "embeddings/";

const cache = new Map();

export async function load_clientembeddings_once_fromS3(clientName) {
  if (cache.has(clientName)) {
    console.log("Cache found")
    return cache.get(clientName);
  } else {
    console.log("Cache missing")
    const cmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: `${EMBEDDINGS_PREFIX}${clientName}_FAQ3.json`
    });

    const response = await s3.send(cmd);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const jsonStr = Buffer.concat(chunks).toString("utf-8");
    const items = JSON.parse(jsonStr); // contains: embedding, metadata, Q&A
    if (!items.length) throw new Error(`No embeddings found for client: ${clientName}`);

    const DIM = Object.values(items[0].embedding).length;
    // console.log("DIM:", DIM, "Type:", typeof DIM);

    // === Build HNSW index ===
    // const index = new hnswlib.Hnswlib("cosine", DIM);
    const index = new hnswlib.HierarchicalNSW("cosine", DIM);
    console.log("Index", index)
    index.initIndex(items.length);

    const idToMetadata = new Map();

    items.forEach((item, i) => {
      const embeddingArray = Object.values(item.embedding); // <-- convert object to array
      if (!Array.isArray(embeddingArray)) {
        throw new Error("Invalid embedding format: could not convert to array");
      }
      index.addPoint(embeddingArray, i);

      idToMetadata.set(i, {
        question: item.question || null,
        answer: item.answer || null,
        metadata: item.metadata
      });
    });

    const result = { index, idToMetadata };
    cache.set(clientName, result); // Cache for reuse
    console.log("P",JSON.stringify(result))
    return result;
  }
}



// async function test() {
//   const result = await load_clientembeddings_once_fromS3("NCSS");
//   console.log(result);
// }
// test();

// EXPECTED OUTPUT:
// {
//   index: HierarchicalNSW {},   // your vector index is built
//   idToMetadata: Map(24) {      // 24 vectors were indexed
//     0 => {
//       page_content: 'The National Council of Social Service (NCSS)...',
//       metadata: [Object]
//     },
//     ...
//   }
// }

// WHAT THIS MEANS
// index: The hnswlib-node vector index is initialized and populated. 
// You're ready to run vector similarity queries on it.
// idToMetadata: A Map that links each vector ID (0 to 23) to:
// page_content: the text chunk
// metadata: additional data (but you're seeing [Object] instead of full content)

