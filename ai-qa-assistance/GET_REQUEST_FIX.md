# GET Request Fix Documentation

## 🎯 Problem Identified

The Postman collection had several GET requests that included request bodies, which violates HTTP standards and causes errors when executed. The error message was:

```
Error: Request with GET/HEAD method cannot have body.
```

## 🔧 Root Cause

The collection was exported from Postman with `protocolProfileBehavior.disableBodyPruning: true`, which allows GET requests to have bodies in Postman, but this is not valid HTTP and causes failures when executed programmatically.

## ✅ Fixes Applied

### 1. **Removed Bodies from GET Requests**

- Identified 9 GET requests with invalid bodies
- Removed all `body` properties from GET requests
- Removed `protocolProfileBehavior` settings

### 2. **Updated Headers**

- Enabled all previously disabled headers
- Updated token headers to use environment variables
- Added missing `Authorization` headers
- Standardized header format

### 3. **Updated Environment Variables**

- Added actual CT token value from working cURL
- Updated `CT_Token` variable with real JWT token

## 📋 Fixed Requests

The following requests were fixed:

1. **B2C_customerget** - GET request with body removed
2. **B2C_orgdetailsget** - GET request with body removed
3. **B2C_Customer/transactions** - GET request with body removed
4. **B2C_Customer/redemptions** - GET request with body removed
5. **B2C_Customer/Lookup** - GET request with body removed
6. **B2C_Points/isredeemable** - GET request with body removed
7. **B2B_Customerget** - GET request with body removed
8. **B2B_Orgdetailsget** - GET request with body removed
9. **B2B_transactions** - GET request with body removed

## 🔧 Header Updates

### Before Fix

```json
{
  "key": "customer-status",
  "value": "active",
  "disabled": true
},
{
  "key": "X-CAP-API-OAUTH-TOKEN",
  "value": "{{accessToken}}",
  "type": "text",
  "disabled": true
}
```

### After Fix

```json
{
  "key": "customer-status",
  "value": "active"
},
{
  "key": "X-CAP-API-OAUTH-TOKEN",
  "value": "{{accessToken}}"
},
{
  "key": "Authorization",
  "value": "Bearer {{accessToken}}"
}
```

## 🎯 Working cURL Reference

The fixes were based on this working cURL command:

```bash
curl --location --request GET 'https://pidiliteapi.psv-psv-facets-psv-qa.capillary-psv.facets.cloud/api/v1/customerget?mobile=7507772230&orgids=2274' \
--header 'API-KEY: 206a31f0-3384-4e6d-a138-b33987593237' \
--header 'source: fcc' \
--header 'Content-Type: application/json' \
--header 'customer-status: active' \
--header 'X-CAP-API-OAUTH-TOKEN: [token]' \
--header 'token: CT=[ct-token]; OID=2276' \
--header 'Authorization: Bearer [token]'
```

## ✅ Verification

### Environment Variables

```bash
npm run env:list
```

All variables are properly configured:

- ✅ `baseUrl` - API base URL
- ✅ `accessToken` - OAuth token
- ✅ `CLIENT_API_KEY` - Client API key
- ✅ `B2C_API_KEY` - B2C API key
- ✅ `B2B_API_KEY` - B2B API key
- ✅ `One_View_API_KEY` - One View API key
- ✅ `CT_Token` - CT token for One View endpoints

### Collection Structure

- ✅ All GET requests have no bodies
- ✅ All headers are properly configured
- ✅ Environment variables are correctly referenced
- ✅ No `protocolProfileBehavior` settings

## 🚀 Next Steps

1. **Test the Collection**: Run the collection to verify all requests work
2. **Verify cURL Generation**: Check that cURL commands are generated correctly
3. **Test Individual Endpoints**: Test specific endpoints that were failing

## 🔍 Testing

To test the fixes:

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Navigate to Test Run page**

3. **Run the collection** - All GET requests should now work without errors

4. **Check cURL generation** - Copy cURL commands to verify they match the working format

## 📚 Related Documentation

- [Collection Update](./COLLECTION_UPDATE.md) - Overview of the updated collection
- [Environment Structure](./ENVIRONMENT_STRUCTURE.md) - Environment variable management
- [CURL Functionality](./CURL_FUNCTIONALITY.md) - cURL command generation
