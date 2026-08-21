// =============================================================================
// Embedding Service
// Generates text embeddings using Google's text-embedding-004 model.
// Used for RAG tone-matching: converts user posts into vectors for
// cosine similarity retrieval.
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const FALLBACK_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 3072;

export class EmbeddingService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(env.geminiApiKey);
  }

  /**
   * Generate an embedding vector for a single text string.
   */
  public async embedText(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  /**
   * Generate embeddings for multiple text chunks in batch.
   * Returns an array of vectors in the same order as input chunks.
   */
  public async embedBatch(texts: string[]): Promise<number[][]> {
    const model = this.client.getGenerativeModel({ model: FALLBACK_MODEL });
    const results: number[][] = [];

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const embeddings = await Promise.all(
        batch.map(async (text) => {
          const result = await model.embedContent(text);
          return result.embedding.values;
        })
      );
      results.push(...embeddings);
    }

    return results;
  }

  /**
   * Split a large text block into semantic chunks.
   * Each chunk represents roughly one post or one coherent thought.
   */
  public chunkText(text: string, maxChunkLength: number = 500): string[] {
    // Split by double newlines (post boundaries), then by single newlines
    const rawChunks = text
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 20); // Ignore very short fragments

    const finalChunks: string[] = [];

    for (const chunk of rawChunks) {
      if (chunk.length <= maxChunkLength) {
        finalChunks.push(chunk);
      } else {
        // Break long chunks by sentences
        const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
        let currentChunk = '';
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChunkLength && currentChunk) {
            finalChunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += ' ' + sentence;
          }
        }
        if (currentChunk.trim()) {
          finalChunks.push(currentChunk.trim());
        }
      }
    }

    return finalChunks;
  }
}

// Singleton export
export const embeddingService = new EmbeddingService();
