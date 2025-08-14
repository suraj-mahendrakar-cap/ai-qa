const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

// Function to parse variables from AI response
function parseVariablesFromResponse(response, currentVariables) {
    const variablesToUpdate = {};

    // Look for patterns like "set VARIABLE_NAME to VALUE" or "VARIABLE_NAME: VALUE"
    const variablePatterns = [
        /set\s+([A-Z_][A-Z0-9_]*)\s+to\s+["']?([^"'\n]+)["']?/gi,
        /([A-Z_][A-Z0-9_]*)\s*:\s*["']?([^"'\n]+)["']?/gi,
        /variable\s+([A-Z_][A-Z0-9_]*)\s*=\s*["']?([^"'\n]+)["']?/gi,
    ];

    for (const pattern of variablePatterns) {
        let match;
        while ((match = pattern.exec(response)) !== null) {
            const [, variableName, value] = match;
            if (variableName && value && !currentVariables[variableName]) {
                variablesToUpdate[variableName.trim()] = value.trim();
            }
        }
    }

    return variablesToUpdate;
}

// POST /api/chatbot - Handle chat messages
router.post('/', async (req, res) => {
    try {
        const { message, conversationHistory, variables } = req.body;

        // Check if OpenAI API key is configured
        if (!config.openai.apiKey) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        // Create system prompt for Postman collection assistance
        const systemPrompt = `You are an AI assistant specialized in helping users with Postman collection execution and API testing. Your role is to:

1. Help users understand and configure environment variables and global variables
2. Assist with API testing issues and troubleshooting
3. Provide guidance on Postman collection structure and best practices
4. Help users set up authentication, headers, and request configurations
5. Suggest improvements for API testing workflows

When users mention missing variables or need help with configuration:
- Ask for specific details about what they're trying to achieve
- Help them identify what variables they need
- Provide example values when appropriate
- Explain the purpose of each variable
- Suggest best practices for variable naming and organization

Current environment variables: ${JSON.stringify(variables, null, 2)}

Always respond in a helpful, conversational tone. If you identify variables that need to be set, return them in a structured format that can be parsed by the frontend.

If the user is asking about specific API endpoints or testing scenarios, provide practical advice and examples.`;

        // Prepare conversation messages
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: message }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: config.openai.model,
            messages,
            max_tokens: config.openai.maxTokens,
            temperature: config.openai.temperature,
        });

        const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        // Parse response for variables
        const variablesToUpdate = parseVariablesFromResponse(response, variables);

        res.json({
            response,
            variables: variablesToUpdate
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

module.exports = router;
