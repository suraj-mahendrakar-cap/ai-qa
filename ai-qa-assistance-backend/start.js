#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found. Creating .env.example...');

    const envExample = `# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001

# File Upload Limits (in bytes)
MAX_COLLECTION_SIZE=10485760  # 10MB
MAX_ENVIRONMENT_SIZE=1048576   # 1MB
`;

    fs.writeFileSync(envPath, envExample);
    console.log('📝 Created .env file. Please update it with your OpenAI API key.');
    console.log('🔑 Get your API key from: https://platform.openai.com/api-keys\n');
}

// Check if OpenAI API key is set
require('dotenv').config();
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('⚠️  OpenAI API key not configured. Chatbot functionality will not work.');
    console.log('🔑 Please update your .env file with a valid OpenAI API key.\n');
}

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const collectionsDir = path.join(uploadsDir, 'collections');
const environmentsDir = path.join(uploadsDir, 'environments');

[uploadsDir, collectionsDir, environmentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

console.log('🚀 Starting AI QA Assistance Backend...\n');

// Start the server
require('./src/index.js');
