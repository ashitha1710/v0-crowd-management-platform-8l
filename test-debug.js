const { VectorStore } = require('./lib/vector-db.ts');

async function debugRAG() {
  try {
    console.log('Creating vector store...');
    const store = new VectorStore();

    console.log('Initializing knowledge base...');
    await store.initializeKnowledgeBase();

    console.log('Testing search for "dizzy"...');
    const results = await store.search('someone is dizzy', 3);

    console.log('Results:', results.map(r => ({ score: r.score, content: r.content.substring(0, 50) })));

    store.close();
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugRAG();
