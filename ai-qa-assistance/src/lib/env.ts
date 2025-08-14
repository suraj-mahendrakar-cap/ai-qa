// Environment Configuration
// Copy this to .env.local and update the values as needed

export const env = {
    // Backend API Configuration
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',

    // OpenAI Configuration (if needed for frontend)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Frontend Configuration
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'AI QA Assistance',
};

// Example .env.local file content:
/*
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_APP_NAME=AI QA Assistance
*/
