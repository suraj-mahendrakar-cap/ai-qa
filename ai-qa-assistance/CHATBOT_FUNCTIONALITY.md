# AI Chatbot with OpenAI Integration

This document describes the new AI chatbot functionality that helps users configure environment variables and provides intelligent assistance for Postman collection execution.

## Features

### 1. Intelligent Variable Configuration

- **Missing Variable Detection**: Automatically identifies missing environment variables in Postman collections
- **Smart Suggestions**: Provides suggested values for common variables
- **Context-Aware Help**: Understands where variables are used and provides relevant guidance

### 2. OpenAI-Powered Assistance

- **Natural Language Processing**: Understands user queries in natural language
- **Contextual Responses**: Maintains conversation context for better assistance
- **Variable Parsing**: Automatically extracts and sets variables from AI responses

### 3. Interactive Chat Interface

- **Real-time Chat**: Live conversation with the AI assistant
- **Variable Management**: Built-in variable editor with save/load functionality
- **Conversation History**: Maintains chat history for context

## Setup

### 1. OpenAI API Key Configuration

Create a `.env.local` file in your project root:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Installation

The required dependencies are already installed:

- `openai`: OpenAI API client
- All UI components are included

## How to Use

### Accessing the Chatbot

1. **From Collections Page**: Click the "AI Assistant" button in the header
2. **Automatic Trigger**: The chatbot opens automatically when missing variables are detected
3. **Manual Access**: Available from any page via the sidebar

### Variable Configuration

When the chatbot detects missing variables:

1. **Review Missing Variables**: The AI lists all missing variables with context
2. **Get Suggestions**: Ask for help with specific variables
3. **Set Variables**: Use the variable panel to configure values
4. **Save Configuration**: Save variables for future use

### Example Conversations

#### Setting up API Keys

```
User: "I need help setting up the CLIENT_API_KEY variable"
AI: "I can help you with that! The CLIENT_API_KEY is used for authentication in your API requests. You'll need to get this from your API provider. For testing, you can use a placeholder value like 'your-api-key-here'. Would you like me to set this up for you?"
```

#### Understanding Variable Usage

```
User: "What is the baseUrl variable used for?"
AI: "The baseUrl variable is the root URL for your API endpoints. It's used in multiple requests in your collection. For example, if your API is hosted at 'https://api.example.com', you would set baseUrl to that value. This allows you to easily switch between different environments (development, staging, production) by changing just one variable."
```

#### Troubleshooting Issues

```
User: "My requests are failing with 401 errors"
AI: "A 401 error typically means authentication is failing. Let me check your current variables... I see that your accessToken variable might be expired or missing. You'll need to get a fresh access token from your authentication endpoint. Would you like me to help you set up the authentication flow?"
```

## Technical Implementation

### API Endpoint

- **Route**: `POST /api/chatbot`
- **Purpose**: Processes user messages and returns AI responses
- **Features**: Variable parsing, conversation history, context awareness

### Key Components

1. **Chatbot Component** (`src/components/chatbot.tsx`)

   - Interactive chat interface
   - Variable management panel
   - Message history and auto-scroll

2. **Chatbot API** (`src/app/api/chatbot/route.ts`)

   - OpenAI integration
   - Variable parsing from responses
   - Conversation context management

3. **Enhanced Run API** (`src/app/api/upload-collection/[id]/run/route.ts`)
   - Missing variable detection
   - Variable substitution in requests
   - Integration with chatbot flow

### Variable Detection

The system automatically detects variables in:

- **URLs**: `{{baseUrl}}/api/endpoint`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Request Bodies**: `{"api_key": "{{CLIENT_API_KEY}}"}`

### Variable Substitution

Variables are replaced in real-time during request execution:

```javascript
// Before substitution
"https://{{baseUrl}}/api/users";

// After substitution (if baseUrl = "https://api.example.com")
"https://api.example.com/api/users";
```

## AI Capabilities

### Understanding Context

The AI assistant can:

- Analyze Postman collection structure
- Understand variable dependencies
- Provide context-specific suggestions
- Explain API testing concepts

### Variable Management

- **Automatic Detection**: Identifies missing variables
- **Smart Suggestions**: Provides example values
- **Best Practices**: Suggests naming conventions
- **Security Guidance**: Warns about sensitive data

### Troubleshooting

- **Error Analysis**: Helps diagnose API issues
- **Authentication Help**: Guides through auth setup
- **Request Debugging**: Suggests fixes for failed requests
- **Performance Tips**: Recommends optimization strategies

## Security Considerations

### API Key Protection

- **Environment Variables**: API keys stored in `.env.local`
- **No Persistence**: Chat history not stored permanently
- **Secure Transmission**: All API calls use HTTPS

### Variable Security

- **Local Storage**: Variables saved locally in browser
- **No Server Storage**: Sensitive data not stored on server
- **User Control**: Users manage their own variable values

## Best Practices

### Variable Naming

- Use descriptive names: `API_BASE_URL` instead of `url`
- Follow conventions: `UPPER_CASE` for environment variables
- Group related variables: `AUTH_TOKEN`, `AUTH_REFRESH_TOKEN`

### Security

- Never commit API keys to version control
- Use placeholder values in examples
- Regularly rotate sensitive tokens

### Organization

- Group variables by environment (dev, staging, prod)
- Document variable purposes
- Use consistent naming across collections

## Troubleshooting

### Common Issues

1. **OpenAI API Key Not Configured**

   - Ensure `.env.local` file exists
   - Verify API key is valid
   - Check for typos in variable name

2. **Variables Not Detected**

   - Use double curly braces: `{{variable_name}}`
   - Check for typos in variable names
   - Ensure variables are in supported locations

3. **Chatbot Not Responding**
   - Check network connectivity
   - Verify OpenAI API key is working
   - Check browser console for errors

### Debug Information

The system provides detailed logging for:

- Variable detection process
- API request execution
- Chatbot interactions
- Error conditions

## Future Enhancements

Potential improvements for future versions:

- **Multi-language Support**: Support for different languages
- **Advanced Variable Types**: Support for complex variable structures
- **Integration with Postman**: Direct sync with Postman environments
- **Team Collaboration**: Shared variable management
- **Advanced AI Models**: Support for GPT-4 and other models
- **Custom Prompts**: User-defined AI behavior
- **Analytics**: Usage statistics and insights
