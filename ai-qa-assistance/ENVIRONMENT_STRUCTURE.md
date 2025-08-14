# Environment Structure Documentation

## Overview

The application now supports a new organized structure for managing Postman collections and their environment variables. This structure provides better organization and easier management of different environments.

## New Structure

```
postman_collections/
├── Pidilite/
│   ├── postman_v1.json          # Postman collection file
│   └── uat.env.json             # Environment variables for UAT
```

## File Descriptions

### `postman_v1.json`

- Contains the Postman collection with all API requests
- All variable placeholders (e.g., `{{baseUrl}}`) are resolved using environment variables
- Supports all HTTP methods, headers, and body types

### `uat.env.json`

- Simple key-value JSON format for environment variables
- Contains all necessary variables for the UAT environment
- Automatically loaded by the application when running collections

## Environment Variables

The current UAT environment includes:

```json
{
  "baseUrl": "https://pidiliteapi.psv-psv-facets-psv-qa.capillary-psv.facets.cloud",
  "accessToken": "eyJraWQiOiJjb21tb24iLCJhbGciOiJSUzI1NiJ9...",
  "CLIENT_API_KEY": "f19a64b9-d74e-4308-9181-26562b9e412f",
  "B2C_API_KEY": "206a31f0-3384-4e6d-a138-b33987593237",
  "One_View_API_KEY": "f2dd8af1-38bf-4f51-b9cb-58ba691f8ac5",
  "B2B_API_KEY": "82318c13-f7ef-46a2-92a8-91881c436a83"
}
```

## Benefits

1. **Better Organization**: Collections and environments are grouped by project
2. **Easy Environment Management**: Separate files for different environments (UAT, PROD, etc.)
3. **Version Control Friendly**: Simple JSON format is easy to track in git
4. **Automatic Loading**: Application automatically loads environment variables
5. **Fallback Support**: Maintains backward compatibility with old structure

## Usage

1. **Running Collections**: The application automatically loads environment variables from the new structure
2. **Adding New Environments**: Create new `.env.json` files for different environments
3. **Updating Variables**: Simply edit the environment JSON file to update variables
4. **Multiple Projects**: Create new folders for different projects following the same structure

## Migration

The application automatically:

- Tries to load from the new structure first
- Falls back to the old uploads directory if needed
- Combines environment variables with any provided variables
- Maintains backward compatibility

## Future Enhancements

- Support for multiple environment files (dev.env.json, prod.env.json, etc.)
- Environment-specific collection files
- Variable encryption for sensitive data
- Environment validation and testing
