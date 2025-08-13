import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import hnswlib from 'hnswlib-node';

const s3 = new S3Client({ region: 'ap-southeast-2' }); // S3 bucket is in ap-southeast-2

const BUCKET = "song-ai-dhl2";
const EMBEDDINGS_PREFIX = "embeddings/";

const cache = new Map();
export async function load_clientembeddings_once_fromS3(clientName) {
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

  const index = new hnswlib.HierarchicalNSW("cosine", DIM);
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
  return (cache.get(clientName))
}

//module.exports = { load_clientembeddings_once_fromS3 }