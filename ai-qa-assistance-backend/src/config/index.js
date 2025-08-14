require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    },
    upload: {
        maxCollectionSize: parseInt(process.env.MAX_COLLECTION_SIZE) || 10 * 1024 * 1024, // 10MB
        maxEnvironmentSize: parseInt(process.env.MAX_ENVIRONMENT_SIZE) || 1 * 1024 * 1024, // 1MB
        allowedFileTypes: ['application/json', '.json']
    },
    storage: {
        uploadsDir: process.env.UPLOADS_DIR || 'uploads',
        collectionsDir: 'collections',
        environmentsDir: 'environments'
    }
};
