import Database from 'better-sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class VectorStore {
  private db: Database.Database;
  private gemini: GoogleGenerativeAI;

  constructor() {
    // Initialize SQLite database
    this.db = new Database('./rag-vectors.db', { verbose: console.log });

    // Create tables
    this.initTables();

    // Initialize Gemini client
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBdtYLpUucxwys-2KIHELwKT6OQPb7VWL0');
  }

  private initTables() {
    // Create documents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create embeddings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER,
        vector TEXT NOT NULL, -- Store as JSON string for simplicity
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      )
    `);
  }

  async addDocuments(documents: { source: string; content: string }[]) {
    const insertDoc = this.db.prepare('INSERT INTO documents (source, content) VALUES (?, ?)');

    for (const doc of documents) {
      // Split content into chunks (approximately)
      const chunks = this.chunkText(doc.content);

      for (const chunk of chunks) {
        // Insert document
        const docResult = insertDoc.run(doc.source, chunk);

        // Generate embedding
        const embedding = await this.embedText(chunk);

        // Store embedding
        const insertEmbed = this.db.prepare('INSERT INTO embeddings (document_id, vector) VALUES (?, ?)');
        insertEmbed.run(docResult.lastInsertRowid, JSON.stringify(embedding));
      }
    }
  }

  private chunkText(text: string): string[] {
    // Simple chunking - split by double newlines, then further split if too long
    const paragraphs = text.split('\n\n');
    const chunks: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.length > 1000) {
        // Further split long paragraphs
        const subchunks = paragraph.match(/.{1,500}(?:[.!?]|\n|$)/g) || [paragraph];
        chunks.push(...subchunks);
      } else {
        chunks.push(paragraph);
      }
    }

    return chunks.filter(chunk => chunk.trim().length > 20); // Filter out very short chunks
  }

  private async embedText(text: string): Promise<number[]> {
    try {
      // Log API call
      console.log('Calling Gemini embedding API...');

      // Use the embeddings API endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedText?key=${process.env.GOOGLE_API_KEY || 'AIzaSyBdtYLpUucxwys-2KIHELwKT6OQPb7VWL0'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      console.log('Embedding generated successfully, length:', data.embedding?.value?.length || 0);
      return data.embedding.value; // The embedding values

    } catch (error) {
      console.error('Gemini embedding failed, using fallback:', error);
      // Return zero vector as fallback with proper logging
      console.log('Using zero vector fallback');
      return new Array(768).fill(0);
    }
  }

  async search(query: string, topK: number = 3): Promise<{ content: string; source: string; score: number }[]> {
    console.log(`Searching for: ${query}`);

    // Try embedding-based search first
    let queryEmbedding: number[];
    try {
      queryEmbedding = await this.embedText(query);

      // Check if embedding is just zeros (API failed)
      const isZeroVector = queryEmbedding.every(v => v === 0);
      if (isZeroVector) {
        console.log('Embedding API unavailable, using keyword matching...');
        return this.keywordSearch(query, topK);
      }
    } catch (error) {
      console.log('Embedding failed, using keyword matching...');
      return this.keywordSearch(query, topK);
    }

    // Get all embeddings and calculate similarity
    const selectEmbeddings = this.db.prepare(`
      SELECT e.id, e.vector, e.document_id, d.content, d.source
      FROM embeddings e
      JOIN documents d ON e.document_id = d.id
    `);

    const embeddings = selectEmbeddings.all();

    // Calculate cosine similarity
    const results = embeddings.map((emb: any) => {
      const vector = JSON.parse(emb.vector);
      // Check if stored vector is also zero (API failed during storage)
      const isStoredZeroVector = vector.every((v: number) => v === 0);
      if (isStoredZeroVector) {
        // Fall back to keyword similarity for this content
        return {
          content: emb.content,
          source: emb.source,
          score: this.keywordSimilarity(query, emb.content),
          vector: vector
        };
      }

      const similarity = this.cosineSimilarity(queryEmbedding, vector);
      return {
        content: emb.content,
        source: emb.source,
        score: similarity,
        vector: vector
      };
    });

    // Sort by similarity and return top K
    results.sort((a, b) => b.score - a.score);

    console.log(`Found ${results.length} documents, top scores:`, results.slice(0, topK).map(r => r.score.toFixed(3)));

    return results.slice(0, topK).map(r => ({
      content: r.content,
      source: r.source,
      score: r.score
    }));
  }

  // Keyword-based search fallback
  private keywordSearch(query: string, topK: number): { content: string; source: string; score: number }[] {
    console.log('Using keyword search fallback');

    const selectEmbeddings = this.db.prepare(`
      SELECT d.content, d.source
      FROM documents d
    `);

    const documents = selectEmbeddings.all();

    const results = documents.map((doc: any) => ({
      content: doc.content,
      source: doc.source,
      score: this.keywordSimilarity(query, doc.content)
    }));

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK).filter(r => r.score > 0.4); // Increased threshold for selective matches
  }

  // Simple keyword similarity
  private keywordSimilarity(query: string, content: string): number {
    const queryWords = this.extractKeywords(query);
    const contentWords = this.extractKeywords(content);

    let matches = 0;
    for (const word of queryWords) {
      if (contentWords.includes(word)) matches++;
    }

    return matches / queryWords.length;
  }

  // Extract keywords
  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'how', 'use', 'when', 'with'].includes(word));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    // Cosine similarity = (a · b) / (||a|| * ||b||)
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  close() {
    this.db.close();
  }

  // Initialize with existing knowledge base
  async initializeKnowledgeBase() {
    const fs = require('fs');
    const path = require('path');

    const knowledgeFiles = [
      { file: 'medical-protocols.txt', source: 'medical' },
      { file: 'fire-safety-protocols.txt', source: 'fire' },
      { file: 'gate-management-faqs.txt', source: 'gate' }
    ];

    for (const { file, source } of knowledgeFiles) {
      const filePath = path.join(process.cwd(), 'lib', 'knowledge-base', file);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`Adding ${file} to vector store...`);
        await this.addDocuments([{ source, content }]);
      }
    }
  }
}
