const testMessage = async (message) => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      context: 'responder',
    }),
  });

  const data = await response.json();
  console.log(`Question: ${message}`);
  console.log(`Response: ${data.message?.substring(0, 200)}...`);
  console.log(`Relevant blocks found: ${data.retrieved_blocks?.length || 0}`);
  if (data.retrieved_blocks && data.retrieved_blocks.length > 0) {
    console.log(`First relevant block: ${data.retrieved_blocks[0].substring(0, 100)}...`);
  }
  console.log('---');
  return data;
};

// Test just the first question to verify the system
const runSingleTest = async () => {
  try {
    const result = await testMessage("What should I do if someone has a severe allergic reaction?");
    // Check if the response has medical content
    if (result.message.includes('allergic') || result.message.includes('medical')) {
      console.log('✅ Response appears to be medical-related');
    } else {
      console.log('❌ Response does not seem medical-related');
    }
  } catch (error) {
