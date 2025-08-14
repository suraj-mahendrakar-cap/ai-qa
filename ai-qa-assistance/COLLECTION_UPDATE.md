# Collection Update Documentation

## 🎯 Overview

The Postman collection has been updated to "Sea Pidilite v2.0" with a new structure and additional API endpoints. This document outlines the changes and how to work with the updated collection.

## 📋 Collection Structure

### Updated Collection: "Sea Pidilite v2.0"

The collection now includes the following main sections:

1. **Common**

   - `oauth/token/generate` - Generate OAuth tokens
   - `barcode/status-summary` - Get barcode status summary

2. **B2C (Business to Consumer)**

   - `B2C_customerget` - Get customer information
   - `B2C_orgdetailsget` - Get organization details
   - `B2C_Customer/transactions` - Get customer transactions
   - `B2C_Customer/redemptions` - Get customer redemptions
   - `B2C_Customer/Lookup` - Customer lookup
   - `B2C_Points/isredeemable` - Check if points are redeemable
   - `B2C_Points/redeem` - Redeem points
   - `B2C_Points/reverse` - Reverse points
   - `B2C_Transaction/add` - Add transaction
   - `B2C_Transaction/update` - Update transaction

3. **B2B (Business to Business)**

   - `B2B_Customerget` - Get B2B customer information
   - `B2B_Orgdetailsget` - Get B2B organization details
   - `B2B_transactions` - Get B2B transactions
   - `B2B_Customer/redemptions` - Get B2B customer redemptions
   - `B2B_Customer/Lookup` - B2B customer lookup
   - `B2B_Points/isredeemable` - Check if B2B points are redeemable
   - `B2B_points/redeem` - Redeem B2B points
   - `B2B_points/reverse` - Reverse B2B points
   - `B2B_Transaction/add` - Add B2B transaction
   - `B2B_Transaction/update` - Update B2B transaction

4. **One View**

   - `One_View_customerget` - Get One View customer information
   - `One_View_orgdetailsget` - Get One View organization details
   - `One_View_customer/transactions` - Get One View customer transactions
   - `One_View_customer/redemptions` - Get One View customer redemptions
   - `One_View_Customer/Lookup` - One View customer lookup
   - `One_View_points/isredeemable` - Check if One View points are redeemable
   - `One_View_points/redeem` - Redeem One View points
   - `One_View_points/reverse` - Reverse One View points
   - `One_View_Transaction/add` - Add One View transaction
   - `One_View_transaction/update` - Update One View transaction

5. **Additional Endpoints**
   - `barcode/status` - Get barcode status
   - `Test Cron Jobs` - Test cron job functionality
   - `/api/csv-data` - CSV data endpoint

## 🔧 Environment Variables

### Updated Environment Variables

The environment file now includes all necessary variables for the updated collection:

```json
{
  "baseUrl": "https://pidiliteapi.psv-psv-facets-psv-qa.capillary-psv.facets.cloud",
  "accessToken": "eyJraWQiOiJjb21tb24iLCJhbGciOiJSUzI1NiJ9...",
  "CLIENT_API_KEY": "f19a64b9-d74e-4308-9181-26562b9e412f",
  "B2C_API_KEY": "206a31f0-3384-4e6d-a138-b33987593237",
  "One_View_API_KEY": "f2dd8af1-38bf-4f51-b9cb-58ba691f8ac5",
  "B2B_API_KEY": "82318c13-f7ef-46a2-92a8-91881c436a83",
  "CT_Token": "your-actual-ct-token-value"
}
```

### Variable Usage by Section

- **Common**: Uses `baseUrl`, `CLIENT_API_KEY`
- **B2C**: Uses `baseUrl`, `B2C_API_KEY`, `accessToken`
- **B2B**: Uses `baseUrl`, `B2B_API_KEY`, `accessToken`
- **One View**: Uses `baseUrl`, `One_View_API_KEY`, `CT_Token`

## 🚀 Key Features

### 1. OAuth Token Generation

The collection includes an OAuth token generation endpoint that automatically sets the `accessToken` variable for subsequent requests.

### 2. Multiple API Keys

Different sections use different API keys:

- `CLIENT_API_KEY` for common endpoints
- `B2C_API_KEY` for B2C endpoints
- `B2B_API_KEY` for B2B endpoints
- `One_View_API_KEY` for One View endpoints

### 3. CT Token Support

One View endpoints use a special `CT_Token` for authentication in the format: `CT={{CT_Token}}; OID=2190`

## 🛠️ Management Commands

### View All Variables

```bash
npm run env:list
```

### Update CT Token

```bash
npm run env:update CT_Token "your-actual-ct-token-value"
```

### Add New Variable

```bash
npm run env:add NEW_VARIABLE "value"
```

### Remove Variable

```bash
npm run env:remove VARIABLE_NAME
```

### Create Backup

```bash
npm run env:backup
```

## 📊 API Categories

### Customer Management

- Customer information retrieval
- Customer lookup
- Organization details

### Transaction Management

- Transaction addition
- Transaction updates
- Transaction history

### Points Management

- Points redeemability check
- Points redemption
- Points reversal

### Redemption Management

- Redemption history
- Redemption processing

## 🔍 Testing Scenarios

### 1. OAuth Flow

1. Run `oauth/token/generate` to get access token
2. Token is automatically set in environment
3. Subsequent requests use the generated token

### 2. Customer Operations

1. Get customer information
2. Check customer transactions
3. Look up customer details
4. Manage customer redemptions

### 3. Points Operations

1. Check if points are redeemable
2. Redeem points
3. Reverse points if needed

### 4. Transaction Operations

1. Add new transactions
2. Update existing transactions
3. View transaction history

## 🎯 Usage Examples

### Running the Collection

```bash
# Start the application
npm run dev

# Navigate to Test Run page
# Click "Run Collection"
# All environment variables are automatically loaded
```

### Testing Specific Endpoints

1. **OAuth Token Generation**:

   - Run `oauth/token/generate` first
   - Verify access token is generated

2. **Customer Lookup**:

   - Use `B2C_Customer/Lookup` or `B2B_Customer/Lookup`
   - Check response for customer details

3. **Points Redemption**:
   - First check `B2C_Points/isredeemable`
   - Then run `B2C_Points/redeem` if eligible

## 🔧 Configuration

### Required Setup

1. **CT Token**: Update the `CT_Token` variable with your actual token
2. **API Keys**: Verify all API keys are correct for your environment
3. **Base URL**: Confirm the base URL is correct for your environment

### Environment-Specific Configuration

- **UAT**: Current configuration
- **Production**: Update `baseUrl` and API keys for production environment
- **Development**: Create separate environment file for development

## 📈 Benefits

1. **Comprehensive Coverage**: All major API endpoints included
2. **Organized Structure**: Clear separation by business function
3. **Automated Token Management**: OAuth token generation and usage
4. **Multiple Authentication Methods**: Support for different auth types
5. **Easy Testing**: Structured for systematic API testing

## 🔮 Future Enhancements

1. **Environment-Specific Collections**: Separate collections for UAT, PROD, DEV
2. **Automated Testing**: Scripts for automated collection execution
3. **Response Validation**: Built-in response validation
4. **Performance Testing**: Load testing capabilities
5. **Documentation Integration**: Auto-generated API documentation
