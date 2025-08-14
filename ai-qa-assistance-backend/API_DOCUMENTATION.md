# API Documentation

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, no authentication is required for the API endpoints.

## Endpoints

### Health Check

**GET** `/health`

Returns the health status of the server.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Chatbot API

#### Send Message

**POST** `/api/chatbot`

Send a message to the AI assistant for Postman collection assistance.

**Request Body:**

```json
{
  "message": "How do I set up environment variables?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you with Postman today?"
    }
  ],
  "variables": {
    "BASE_URL": "https://api.example.com",
    "API_KEY": ""
  }
}
```

**Response:**

```json
{
  "response": "To set up environment variables in Postman...",
  "variables": {
    "API_KEY": "your_api_key_here"
  }
}
```

**Error Response:**

```json
{
  "error": "OpenAI API key not configured"
}
```

---

### Collection Management

#### Upload Collection

**POST** `/api/upload-collection`

Upload a Postman collection file.

**Request:**

- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing JSON file

**File Requirements:**

- Format: JSON
- Max Size: 10MB
- Must contain valid Postman collection structure

**Response:**

```json
{
  "success": true,
  "message": "Collection uploaded successfully",
  "collection": {
    "id": 1704067200000,
    "name": "My API Collection",
    "description": "Collection description",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "totalRequests": 15,
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "filename": "1704067200000_My_API_Collection.json",
    "filepath": "/path/to/file",
    "size": 2048
  }
}
```

#### List Collections

**GET** `/api/upload-collection`

Get a list of all uploaded collections.

**Response:**

```json
{
  "collections": [
    {
      "id": 1704067200000,
      "name": "My API Collection",
      "description": "Collection description",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      "totalRequests": 15,
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "filename": "1704067200000_My_API_Collection.json",
      "filepath": "/path/to/file"
    }
  ]
}
```

#### Download Collection

**GET** `/api/upload-collection/:id`

Download a specific collection by ID.

**Parameters:**

- `id` (path): Collection timestamp ID

**Response:**

- File download with Content-Type: `application/json`
- Content-Disposition: `attachment`

#### Delete Collection

**DELETE** `/api/upload-collection/:id`

Delete a specific collection by ID.

**Parameters:**

- `id` (path): Collection timestamp ID

**Response:**

```json
{
  "success": true,
  "message": "Collection deleted successfully"
}
```

---

### Environment Management

#### Upload Environment

**POST** `/api/environment`

Upload an environment file.

**Request:**

- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `file`: JSON file
  - `collectionId` (optional): Associate with specific collection

**File Requirements:**

- Format: JSON
- Max Size: 1MB
- Can be Postman environment format or simple key-value pairs

**Response:**

```json
{
  "success": true,
  "message": "Environment file uploaded successfully",
  "environment": {
    "id": "1704067200000",
    "name": "Production",
    "filename": "1704067200000_Production.json",
    "filepath": "/path/to/file",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "size": 512,
    "variables": {
      "BASE_URL": "https://api.production.com",
      "API_KEY": "prod_key_123"
    }
  }
}
```

#### List Environments

**GET** `/api/environment`

Get a list of all environment files.

**Query Parameters:**

- `collectionId` (optional): Filter by collection ID

**Response:**

```json
{
  "environments": [
    {
      "id": "1704067200000",
      "name": "Production",
      "filename": "1704067200000_Production.json",
      "filepath": "/path/to/file",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "size": 512,
      "variables": {
        "BASE_URL": "https://api.production.com",
        "API_KEY": "prod_key_123"
      }
    }
  ]
}
```

#### Get Environment

**GET** `/api/environment/:id`

Get a specific environment by ID.

**Parameters:**

- `id` (path): Environment timestamp ID

**Query Parameters:**

- `collectionId` (optional): Collection ID if environment is collection-specific

**Response:**

```json
{
  "id": "1704067200000",
  "name": "Production",
  "filename": "1704067200000_Production.json",
  "filepath": "/path/to/file",
  "uploadedAt": "2024-01-01T00:00:00.000Z",
  "size": 512,
  "variables": {
    "BASE_URL": "https://api.production.com",
    "API_KEY": "prod_key_123"
  }
}
```

#### Delete Environment

**DELETE** `/api/environment/:id`

Delete a specific environment by ID.

**Parameters:**

- `id` (path): Environment timestamp ID

**Query Parameters:**

- `collectionId` (optional): Collection ID if environment is collection-specific

**Response:**

```json
{
  "success": true,
  "message": "Environment deleted successfully"
}
```

---

### Collection Information

#### Get Collection Info

**GET** `/api/collection-info/:id`

Get detailed information about a specific collection.

**Parameters:**

- `id` (path): Collection timestamp ID

**Response:**

```json
{
  "success": true,
  "collection": {
    "name": "My API Collection",
    "totalRequests": 15
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (in development mode)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors, file too large, etc.)
- `404` - Not Found (file/collection not found)
- `500` - Internal Server Error

### Error Types

- **File Validation Errors**: Invalid file type, size limits exceeded
- **OpenAI API Errors**: API key issues, rate limiting, etc.
- **File System Errors**: File not found, permission issues
- **JSON Parsing Errors**: Invalid JSON format

---

## File Formats

### Postman Collection

Must follow the standard Postman collection schema:

```json
{
  "info": {
    "name": "Collection Name",
    "description": "Description",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Request Name",
      "request": {
        "method": "GET",
        "url": {
          "raw": "https://api.example.com/endpoint"
        }
      }
    }
  ]
}
```

### Environment Files

Can be either:

1. **Postman Environment Format:**

```json
{
  "name": "Environment Name",
  "values": [
    {
      "key": "BASE_URL",
      "value": "https://api.example.com",
      "enabled": true
    }
  ]
}
```

2. **Simple Key-Value Format:**

```json
{
  "BASE_URL": "https://api.example.com",
  "API_KEY": "your_api_key"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

- File type validation
- File size limits
- Input sanitization
- CORS configuration
- Environment variable protection

## Testing

Use the included test script:

```bash
npm test
```

Or test individual endpoints with tools like:

- Postman
- curl
- Insomnia
- Thunder Client
