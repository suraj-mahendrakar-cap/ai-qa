# Backend Migration Guide

## Overview

The application has been migrated from using local Next.js API routes to an external Node.js backend server.

## Architecture

- **Frontend**: Next.js application running on port 3000
- **Backend**: Node.js Express server running on port 3001
- **Communication**: HTTP API calls between frontend and backend

## Configuration

Create a `.env.local` file in the frontend project root:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Running the Application

1. Start the backend server on port 3001
2. Start the frontend application on port 3000
3. All API calls now go through the external backend

## Benefits

- Better separation of concerns
- Improved scalability
- Easier maintenance
- Independent deployment
