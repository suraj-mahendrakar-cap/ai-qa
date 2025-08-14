# cURL Copy Functionality

## Overview

The Execution Results page now includes functionality to copy cURL commands for each API request. When users click the copy icon next to any request result, the complete cURL command will be copied to the clipboard.

## Features

### 1. cURL Command Generation

- Automatically generates complete cURL commands from Postman collection requests
- Includes all headers, body data, and the full URL
- Supports both raw JSON and form-data body types
- Handles GET, POST, PUT, DELETE, and other HTTP methods

### 2. Visual Feedback

- Copy icon turns green briefly when cURL command is copied
- Tooltip shows "Copy cURL command" on hover
- Automatic reset of visual feedback after 2 seconds

### 3. Supported Request Types

#### GET Requests

```bash
curl -X GET -H "Accept: application/json" "https://api.example.com/endpoint"
```

#### POST Requests with JSON Body

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer token" -d '{"key": "value"}' "https://api.example.com/endpoint"
```

#### POST Requests with Form Data

```bash
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=user&password=pass' "https://api.example.com/endpoint"
```

## Implementation Details

### Backend Changes

- Modified `ExecutionResult` interface to include `originalRequest` data
- Updated API route (`/api/upload-collection/[id]/run/route.ts`) to preserve original request information
- Added headers and body data to execution results

### Frontend Changes

- Updated `ExecutionResults` component to include cURL generation logic
- Modified `test-run` page to include copy functionality
- Added visual feedback for successful copy operations

### Key Functions

#### `generateCurlCommand(result: ExecutionResult): string`

Generates a complete cURL command from execution result data:

- Extracts HTTP method
- Adds all request headers
- Includes body data (JSON or form-data)
- Appends the full URL

#### `copyToClipboard(text: string): Promise<void>`

Handles clipboard operations with visual feedback:

- Copies text to clipboard
- Shows visual feedback
- Auto-resets after 2 seconds

## Usage

1. Navigate to the Execution Results page
2. Run a Postman collection
3. Click the copy icon (📋) next to any request result
4. The complete cURL command is copied to clipboard
5. Paste the command in your terminal to execute the same request

## Benefits

- **Easy Testing**: Copy and paste cURL commands for manual testing
- **Debugging**: Share exact request commands with team members
- **Documentation**: Generate command-line examples for API documentation
- **Automation**: Use cURL commands in scripts and automation tools

## Technical Notes

- All variable placeholders (e.g., `{{baseUrl}}`) are resolved to actual values
- Headers are properly escaped and formatted
- Body data is correctly formatted for both JSON and form-data
- URLs are properly quoted to handle special characters
