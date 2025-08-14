# AI QA Assistance Backend

A Node.js backend API for AI-powered Postman collection assistance and management.

## Features

- **Chatbot API**: AI-powered assistance for Postman collection execution and API testing
- **Collection Management**: Upload, download, and manage Postman collections
- **Environment Management**: Handle environment variables and configuration files
- **File Storage**: Secure file storage with validation and size limits

## Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Chatbot API

- `POST /api/chatbot` - Send messages to AI assistant

### Collection Management

- `POST /api/upload-collection` - Upload Postman collection
- `GET /api/upload-collection` - List all collections
- `GET /api/upload-collection/:id` - Download specific collection
- `DELETE /api/upload-collection/:id` - Delete specific collection

### Environment Management

- `POST /api/environment` - Upload environment file
- `GET /api/environment` - List all environments
- `GET /api/environment/:id` - Get specific environment
- `DELETE /api/environment/:id` - Delete specific environment

### Collection Information

- `GET /api/collection-info/:id` - Get detailed collection information

## File Structure

```
src/
├── index.js                 # Main server file
├── routes/
│   ├── chatbot.js          # Chatbot API routes
│   ├── upload-collection.js # Collection management routes
│   ├── environment.js      # Environment management routes
│   └── collection-info.js  # Collection information routes
uploads/
├── collections/            # Stored Postman collections
└── environments/           # Stored environment files
```

## File Upload Limits

- **Collections**: Maximum 10MB
- **Environment Files**: Maximum 1MB
- **Supported Formats**: JSON files only

## Error Handling

The API includes comprehensive error handling for:

- File validation errors
- OpenAI API errors
- File system errors
- Invalid request formats

## Security Features

- File type validation
- File size limits
- CORS configuration
- Input sanitization

## Environment Variables

| Variable         | Description                              | Required | Default |
| ---------------- | ---------------------------------------- | -------- | ------- |
| `OPENAI_API_KEY` | OpenAI API key for chatbot functionality | Yes      | -       |
| `PORT`           | Server port number                       | No       | 3001    |

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling
- **openai**: OpenAI API client
- **dotenv**: Environment variable management
