# Environment Files Feature

## Overview

The Environment Files feature allows users to upload and manage environment-specific configuration files for Postman collections. Each collection can have its own set of environment files, enabling isolated testing environments.

## Features

### 1. **Collection-Specific Environments**

- Each Postman collection has its own environment management section
- Environment files are stored in collection-specific directories
- No interference between different collections' environments

### 2. **Environment File Upload**

- Drag-and-drop interface for easy file upload
- Support for both Postman environment format and simple key-value JSON
- File validation and error handling
- Progress tracking during upload

### 3. **Environment Management**

- Dropdown selection for available environment files
- Environment details display (name, variables count, upload date)
- Variable preview with truncation for long values
- Delete functionality for unwanted environments

### 4. **Integration with Collection Execution**

- Selected environment variables are automatically applied during collection execution
- Environment variables are substituted in API requests
- Fallback to default environment if no collection-specific environment is selected

## File Format

The system supports two environment file formats:

### 1. **Postman Environment Format (Recommended)**

```json
{
  "id": "9a5c6e8d-bb33-4b43-85a1-259d0b18e876",
  "name": "QA/UAT",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://api.example.com",
      "type": "default",
      "enabled": true
    },
    {
      "key": "apiKey",
      "value": "your-api-key-here",
      "type": "default",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment",
  "_postman_exported_at": "2025-08-08T06:29:50.993Z",
  "_postman_exported_using": "Postman/11.57.5-250807-0110"
}
```

### 2. **Simple Key-Value Format**

```json
{
  "baseUrl": "https://api.example.com",
  "apiKey": "your-api-key-here",
  "accessToken": "your-access-token"
}
```

## Usage Instructions

### Uploading Environment Files

1. Navigate to the Postman Collections page
2. Find the collection you want to add an environment for
3. In the collection card, locate the "Environment" section
4. Click the "Upload" button
5. Drag and drop a JSON environment file or click "Browse Files"
6. The file will be uploaded and automatically selected

### Managing Environments

1. Use the dropdown to select from available environment files
2. View environment details including variable count and upload date
3. Preview environment variables in the details card
4. Use the refresh button to reload the environment list
5. Delete unwanted environments using the trash icon

### Running Collections with Environments

1. Select an environment file for your collection
2. Click the "Run" button on the collection card
3. The collection will execute using the selected environment variables
4. View execution results in the modal that appears

## API Endpoints

### Upload Environment File

- **POST** `/api/environment`
- **Body**: FormData with `file` and optional `collectionId`
- **Response**: Environment metadata

### List Environment Files

- **GET** `/api/environment?collectionId={id}`
- **Response**: Array of environment files

### Get Environment File

- **GET** `/api/environment/{id}?collectionId={id}`
- **Response**: Environment file details

### Delete Environment File

- **DELETE** `/api/environment/{id}?collectionId={id}`
- **Response**: Success confirmation

## File Storage

Environment files are stored in the following structure:

```
uploads/
├── environments/
│   ├── {collectionId1}/          # Collection-specific environments
│   │   ├── {timestamp}_env1.json
│   │   └── {timestamp}_env2.json
│   ├── {collectionId2}/
│   │   └── {timestamp}_env3.json
│   └── global/                   # Global environments (if any)
│       └── {timestamp}_global.json
```

## Security Considerations

- File size limit: 1MB per environment file
- Only JSON files are accepted
- Files are validated for proper structure
- Collection-specific isolation prevents cross-collection access

## Benefits

1. **Isolation**: Each collection has its own environment space
2. **Flexibility**: Support for both Postman and simple formats
3. **Ease of Use**: Drag-and-drop upload and intuitive management
4. **Integration**: Seamless integration with collection execution
5. **Organization**: Clear separation of environments by collection

## Example Workflow

1. **Upload Collection**: Upload your Postman collection
2. **Upload Environment**: Upload environment file in Postman format
3. **Select Environment**: Choose the environment from the dropdown
4. **Run Collection**: Execute the collection with environment variables
5. **View Results**: Review execution results with applied variables

## Troubleshooting

### Common Issues

- **File Upload Fails**: Ensure file is JSON format and under 1MB
- **Environment Not Showing**: Check if collectionId is properly set
- **Variables Not Applied**: Verify environment is selected before running collection
- **Delete Fails**: Ensure you have proper permissions and file exists

### File Format Issues

- **Postman Format**: Ensure `values` array contains objects with `key`, `value`, and `enabled` properties
- **Simple Format**: Ensure JSON contains key-value pairs only
- **Validation Errors**: Check JSON syntax and structure

## Sample Files

### Postman Environment Sample

See `sample-postman-environment.json` for a complete example of the Postman environment format.

### Simple Environment Sample

```json
{
  "baseUrl": "https://api.example.com",
  "apiKey": "your-api-key",
  "timeout": "30000"
}
```
