const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
    try {
        console.log('Testing API endpoints...\n');

        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);

        // Test collections endpoint
        console.log('\n2. Testing collections endpoint...');
        const collectionsResponse = await axios.get(`${BASE_URL}/api/upload-collection`);
        console.log('✅ Collections endpoint working:', collectionsResponse.data);

        // Test environments endpoint
        console.log('\n3. Testing environments endpoint...');
        const environmentsResponse = await axios.get(`${BASE_URL}/api/environment`);
        console.log('✅ Environments endpoint working:', environmentsResponse.data);

        console.log('\n🎉 All basic endpoints are working!');
        console.log('\nNote: To test file uploads and chatbot functionality, you need to:');
        console.log('- Set OPENAI_API_KEY in your .env file');
        console.log('- Use a tool like Postman or curl to test POST endpoints');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Server is not running. Please start the server first with: npm run dev');
        } else {
            console.error('❌ Test failed:', error.message);
        }
    }
}

testAPI();
