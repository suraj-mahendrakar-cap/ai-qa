export const config = {
    // Backend API configuration
    backend: {
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
        apiPrefix: '/api',
    },

    // OpenAI configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },

    // File upload limits
    upload: {
        maxCollectionSize: 10 * 1024 * 1024, // 10MB
        maxEnvironmentSize: 1 * 1024 * 1024, // 1MB
    },

    // Execution settings
    execution: {
        timeout: 300000, // 5 minutes
        requestTimeout: 30000, // 30 seconds per request
    }
};

export const getApiUrl = (endpoint: string) => {
    return `${config.backend.baseUrl}${config.backend.apiPrefix}${endpoint}`;
};
