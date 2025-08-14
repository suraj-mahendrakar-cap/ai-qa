# Environment Setup Guide

## 🎯 Overview

This guide explains the new organized structure for managing Postman collections and environment variables in the AI QA Assistance application.

## 📁 New File Structure

```
ai-qa-assistance/
├── postman_collections/
│   └── Pidilite/
│       ├── postman_v1.json          # Postman collection
│       └── uat.env.json             # Environment variables
├── scripts/
│   └── manage-env.js                # Environment management utility
└── uploads/collections/             # Legacy uploads (fallback)
```

## 🔧 Environment Variables

### Current UAT Environment

The `uat.env.json` file contains all necessary variables for the UAT environment:

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

## 🛠️ Environment Management

### Using npm Scripts (Recommended)

```bash
# List all environment variables
npm run env:list

# Add a new variable
npm run env:add API_KEY your-api-key-value

# Update an existing variable
npm run env:update baseUrl https://new-api.example.com

# Remove a variable
npm run env:remove OLD_VARIABLE

# Create a backup
npm run env:backup
```

### Using the Script Directly

```bash
# List variables
node scripts/manage-env.js list

# Add variable
node scripts/manage-env.js add NEW_KEY new-value

# Update variable
node scripts/manage-env.js update EXISTING_KEY new-value

# Remove variable
node scripts/manage-env.js remove KEY_TO_REMOVE

# Create backup
node scripts/manage-env.js backup
```

## 🚀 Application Integration

### Automatic Loading

The application automatically:

1. Loads environment variables from `postman_collections/Pidilite/uat.env.json`
2. Combines them with any variables provided via the API
3. Uses the combined variables to resolve `{{variableName}}` placeholders in the collection

### Fallback Support

If the new structure is not available, the application falls back to:

1. The old uploads directory structure
2. Any variables provided via the API request

## 📋 Features

### ✅ What's Working

- **Organized Structure**: Collections and environments are grouped by project
- **Simple JSON Format**: Easy to read and edit environment variables
- **Automatic Loading**: No manual configuration needed
- **Backward Compatibility**: Works with existing uploads
- **cURL Generation**: Copy complete cURL commands from execution results
- **Environment Management**: CLI tools for easy variable management

### 🔄 Migration Benefits

- **Better Organization**: Clear separation of collections and environments
- **Version Control Friendly**: Simple JSON files are easy to track in git
- **Multiple Environments**: Easy to add dev, staging, prod environments
- **Team Collaboration**: Shared environment files for consistent testing

## 🎯 Usage Examples

### 1. Running Collections

```bash
# Start the application
npm run dev

# Navigate to Test Run page
# Click "Run Collection"
# All environment variables are automatically loaded
```

### 2. Managing Variables

```bash
# Check current variables
npm run env:list

# Add a new API key
npm run env:add NEW_API_KEY abc123def456

# Update the base URL
npm run env:update baseUrl https://new-environment.example.com
```

### 3. Copying cURL Commands

1. Run a collection
2. Click the copy icon (📋) next to any request result
3. The complete cURL command is copied to clipboard
4. Paste in terminal to execute the same request

## 🔮 Future Enhancements

### Planned Features

- **Multiple Environment Support**: `dev.env.json`, `prod.env.json`, etc.
- **Environment Validation**: Validate variables before running collections
- **Variable Encryption**: Secure storage for sensitive data
- **Environment Testing**: Test environment connectivity
- **Import/Export**: Easy migration between environments

### Adding New Projects

To add a new project, create a new folder structure:

```
postman_collections/
├── Pidilite/
│   ├── postman_v1.json
│   └── uat.env.json
└── NewProject/
    ├── collection.json
    ├── dev.env.json
    └── prod.env.json
```

## 🆘 Troubleshooting

### Common Issues

1. **Variables not loading**

   - Check file path: `postman_collections/Pidilite/uat.env.json`
   - Verify JSON syntax is valid
   - Check file permissions

2. **Collection not found**

   - Ensure collection file exists: `postman_collections/Pidilite/postman_v1.json`
   - Check file naming convention

3. **Missing variables error**
   - Use `npm run env:list` to check current variables
   - Add missing variables with `npm run env:add`

### Getting Help

- Check the application logs for detailed error messages
- Verify environment file syntax with a JSON validator
- Use the backup feature before making changes: `npm run env:backup`

## 📚 Related Documentation

- [CURL Functionality](./CURL_FUNCTIONALITY.md) - Details about cURL command generation
- [Environment Structure](./ENVIRONMENT_STRUCTURE.md) - Technical implementation details
- [Chatbot Functionality](./CHATBOT_FUNCTIONALITY.md) - AI assistant features
- [Run Functionality](./RUN_FUNCTIONALITY.md) - Collection execution details
