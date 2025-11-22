const testRAG = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "What should I do if someone has a severe allergic reaction?", context: 'responder' })
    });
    const data = await response.json();
    console.log('✅ RAG Test Successful');
    console.log(`Response length: ${data.message?.length || 0}`);
    console.log(`Is truncated: ${data.message?.includes('[Response truncated]')}`);
    console.log('Sample response:');
    console.log(data.message?.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Test failed');
  }
};

testRAG();
