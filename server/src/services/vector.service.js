import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_API_KEY, INDEX_NAME } from "../config/config.js";

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pc.Index(INDEX_NAME);

export const createMemory = async ({ vectors = [], metadata, messageId }) => {
  try {
    const response = await index.upsert([
      {
        id: messageId,
        values: vectors,
        metadata,
      },
    ]);

    return response;
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
    throw new Error("Failed to create memory in Pinecone.");
  }
};

export const queryMemory = async ({
  queryVector,
  metadata = {},
  limit = 5,
}) => {
  try {
    const queryOptions = {
      vector: queryVector,
      topK: limit,
      includeMetadata: true,
      filter: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    const response = await index.query(queryOptions);

    return response.matches;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw new Error("Failed to query memory from Pinecone.");
  }
};
