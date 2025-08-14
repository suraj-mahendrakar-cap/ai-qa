const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const config = require('../config');
const axios = require('axios');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.upload.maxCollectionSize,
    },
    fileFilter: (req, file, cb) => {
        if (config.upload.allowedFileTypes.includes(file.mimetype) ||
            config.upload.allowedFileTypes.some(type => file.originalname.endsWith(type))) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'), false);
        }
    }
});

// Helper function to count total requests in collection
function countRequests(items) {
    let count = 0;

    for (const item of items) {
        if (item.request) {
            count++; // This is a request
        } else if (item.item) {
            count += countRequests(item.item); // This is a folder, recurse
        }
    }

    return count;
}

// Helper function to substitute environment variables in URLs and headers
function substituteEnvironmentVariables(text, environment) {
    // Ensure text is a string and environment exists
    if (!text || !environment) {
        console.log(`substituteEnvironmentVariables: text=${text}, environment keys=${Object.keys(environment || {}).join(', ')}`);
        return text;
    }

    // Convert to string if it's not already
    if (typeof text !== 'string') {
        console.log(`Warning: substituteEnvironmentVariables received non-string:`, text);
        return text;
    }

    console.log(`=== SUBSTITUTION DEBUG ===`);
    console.log(`Input text: "${text}"`);
    console.log(`Available environment variables:`, environment);
    console.log(`Environment keys:`, Object.keys(environment));

    // Replace {{variable}} with environment values
    const result = text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        console.log(`Looking for variable: ${variable}`);
        const value = environment[variable];
        if (value !== undefined) {
            console.log(`Found variable ${variable} = ${value}`);
            return value;
        } else {
            console.log(`No environment variable found for ${match}. Available variables: ${Object.keys(environment).join(', ')}`);
            return match; // Keep the original {{variable}} if not found
        }
    });

    if (result !== text) {
        console.log(`Substitution result: "${text}" -> "${result}"`);
    } else {
        console.log(`No substitution occurred, result: "${result}"`);
    }

    console.log(`=== END SUBSTITUTION DEBUG ===`);
    return result;
}

// Helper function to build request URL
function buildRequestUrl(urlObj, environment) {
    // Handle null/undefined cases
    if (!urlObj) {
        console.log('Warning: buildRequestUrl received null/undefined URL object');
        return '';
    }

    console.log('Building URL from:', JSON.stringify(urlObj, null, 2));

    if (typeof urlObj === 'string') {
        const result = substituteEnvironmentVariables(urlObj, environment);
        console.log(`String URL result: "${urlObj}" -> "${result}"`);
        return result;
    }

    if (urlObj.raw) {
        const result = substituteEnvironmentVariables(urlObj.raw, environment);
        console.log(`Raw URL result: "${urlObj.raw}" -> "${result}"`);
        return result;
    }

    if (urlObj.host && urlObj.path) {
        let url = urlObj.protocol ? `${urlObj.protocol}://` : 'http://';
        url += Array.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host;

        if (urlObj.port) {
            url += `:${urlObj.port}`;
        }

        url += Array.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path;

        if (urlObj.query) {
            const queryParams = urlObj.query
                .filter(q => q.key && q.value)
                .map(q => `${q.key}=${encodeURIComponent(q.value)}`)
                .join('&');
            if (queryParams) {
                url += `?${queryParams}`;
            }
        }

        const result = substituteEnvironmentVariables(url, environment);
        console.log(`Constructed URL result: "${url}" -> "${result}"`);
        return result;
    }

    // If we can't process the URL object, return a safe fallback
    console.log('Warning: Could not process URL object, returning as-is:', urlObj);
    // Convert the URL object to a string representation to prevent React rendering errors
    if (typeof urlObj === 'object' && urlObj !== null) {
        if (urlObj.raw) {
            return urlObj.raw;
        }
        if (urlObj.host && urlObj.path) {
            let fallbackUrl = urlObj.protocol ? `${urlObj.protocol}://` : 'http://';
            fallbackUrl += Array.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host;
            if (urlObj.port) {
                fallbackUrl += `:${urlObj.port}`;
            }
            fallbackUrl += Array.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path;
            return fallbackUrl;
        }
        // If we still can't construct a URL, return a descriptive string
        return `[Unprocessable URL: ${JSON.stringify(urlObj)}]`;
    }
    return String(urlObj);
}

// Helper function to process request headers
function processHeaders(headers, environment) {
    if (!headers || !Array.isArray(headers)) return {};

    const processedHeaders = {};
    headers.forEach(header => {
        if (header.key && header.value) {
            try {
                const key = substituteEnvironmentVariables(header.key, environment);
                const value = substituteEnvironmentVariables(header.value, environment);
                processedHeaders[key] = value;
            } catch (error) {
                console.error('Error processing header:', header, error);
                // Use original values if substitution fails
                processedHeaders[header.key] = header.value;
            }
        }
    });

    return processedHeaders;
}

// Helper function to process request body
function processBody(body, environment) {
    if (!body) return null;

    if (body.mode === 'raw' && body.raw) {
        try {
            const processedBody = substituteEnvironmentVariables(body.raw, environment);
            try {
                // Try to parse as JSON to validate
                JSON.parse(processedBody);
                return processedBody;
            } catch {
                // If not valid JSON, return as is
                return processedBody;
            }
        } catch (error) {
            console.error('Error processing raw body:', error);
            return body.raw;
        }
    }

    if (body.mode === 'formdata' && body.formdata) {
        const formData = {};
        body.formdata.forEach(field => {
            if (field.key && field.value) {
                const key = substituteEnvironmentVariables(field.key, environment);
                const value = substituteEnvironmentVariables(field.value, environment);
                formData[key] = value;
            }
        });
        return formData;
    }

    if (body.mode === 'urlencoded' && body.urlencoded) {
        const urlencoded = {};
        body.urlencoded.forEach(field => {
            if (field.key && field.value) {
                const key = substituteEnvironmentVariables(field.key, environment);
                const value = substituteEnvironmentVariables(field.value, environment);
                urlencoded[key] = value;
            }
        });
        return urlencoded;
    }

    return null;
}

// Helper function to execute a single HTTP request
async function executeRequest(request, environment) {
    const startTime = Date.now();

    try {
        const method = request.method || 'GET';
        const url = buildRequestUrl(request.url, environment);
        const headers = processHeaders(request.header, environment);
        const body = processBody(request.body, environment);

        console.log(`Executing request: ${method} ${url}`);

        // Set default headers if not provided
        if (!headers['Content-Type'] && body) {
            if (typeof body === 'string') {
                try {
                    JSON.parse(body);
                    headers['Content-Type'] = 'application/json';
                } catch {
                    headers['Content-Type'] = 'text/plain';
                }
            } else if (typeof body === 'object') {
                headers['Content-Type'] = 'application/json';
            }
        }

        // Execute the request
        const response = await axios({
            method: method.toLowerCase(),
            url: url,
            headers: headers,
            data: body,
            timeout: 10000, // 10 second timeout (reduced from 30)
            validateStatus: () => true, // Don't throw on non-2xx status codes
            maxRedirects: 3, // Limit redirects
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`Request completed: ${method} ${url} - Status: ${response.status} - Time: ${responseTime}ms`);

        return {
            name: request.name || request.url || 'Unnamed Request',
            method: method,
            url: typeof url === 'string' ? url : String(url),
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime,
            success: response.status >= 200 && response.status < 300,
            responseSize: JSON.stringify(response.data).length,
            responseData: typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data,
            responseHeaders: response.headers,
            originalRequest: {
                headers: request.header || [],
                body: request.body || null
            }
        };

    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.error(`Request failed: ${request.method || 'GET'} ${buildRequestUrl(request.url, environment)} - Error: ${error.message}`);

        return {
            name: request.name || request.url || 'Unnamed Request',
            method: request.method || 'GET',
            url: (() => {
                const builtUrl = buildRequestUrl(request.url, environment);
                return typeof builtUrl === 'string' ? builtUrl : String(builtUrl);
            })(),
            status: error.response?.status || 0,
            statusText: error.response?.statusText || 'Request Failed',
            responseTime: responseTime,
            success: false,
            error: error.message || 'Request execution failed',
            responseSize: 0,
            responseData: '',
            responseHeaders: error.response?.headers || {},
            originalRequest: {
                headers: request.header || [],
                body: request.body || null
            }
        };
    }
}

// Helper function to extract and execute requests from collection
async function extractAndExecuteRequests(items, environment, parentName = '') {
    console.log('=== EXTRACT AND EXECUTE REQUESTS DEBUG ===');
    console.log('Environment received:', environment);
    console.log('Environment keys received:', Object.keys(environment));
    console.log('Parent name:', parentName);

    const requests = [];

    for (const item of items) {
        try {
            if (item.request) {
                // Create a descriptive name by combining parent folder name with request name
                const fullName = parentName ? `${parentName} > ${item.name}` : item.name;

                console.log(`Processing request: ${fullName}`);
                console.log(`Environment before executeRequest:`, environment);
                console.log(`Environment keys before executeRequest:`, Object.keys(environment));

                // Update the request name before execution
                const requestWithName = { ...item.request, name: fullName };
                const result = await executeRequest(requestWithName, environment);
                requests.push(result);
            } else if (item.item) {
                // Recursively process nested items, passing the current folder name
                const nestedResults = await extractAndExecuteRequests(item.item, environment, item.name);
                requests.push(...nestedResults);

            }
        } catch (error) {
            console.error(`Error processing collection item: ${item.name || 'Unnamed item'}`, error);
            // Add a failed result entry to maintain consistency
            const fullName = parentName ? `${parentName} > ${item.name}` : item.name;
            requests.push({
                name: fullName || 'Unnamed Request',
                method: item.request?.method || 'UNKNOWN',
                url: (() => {
                    if (!item.request) return 'N/A';
                    const builtUrl = buildRequestUrl(item.request.url, environment);
                    return typeof builtUrl === 'string' ? builtUrl : String(builtUrl);
                })(),
                status: 0,
                statusText: 'Processing Failed',
                responseTime: 0,
                success: false,
                error: error.message || 'Failed to process request',
                responseSize: 0,
                responseData: '',
                responseHeaders: {},
                originalRequest: {
                    headers: item.request?.header || [],
                    body: item.request?.body || null
                }
            });
        }
    }

    console.log('=== END EXTRACT AND EXECUTE REQUESTS DEBUG ===');
    return requests;
}

// POST /api/upload-collection - Upload a new collection
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Read and validate JSON content
        const fileContent = req.file.buffer.toString();
        let jsonData;

        try {
            jsonData = JSON.parse(fileContent);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON file' });
        }

        // Validate Postman collection structure
        if (!jsonData.info || !jsonData.item) {
            return res.status(400).json({ error: 'Invalid Postman collection format' });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);
        try {
            await fs.access(uploadsDir);
        } catch {
            await fs.mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${sanitizedName}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filepath, fileContent);

        // Extract collection metadata
        const collectionInfo = {
            id: timestamp,
            name: jsonData.info.name || 'Untitled Collection',
            description: jsonData.info.description || '',
            schema: jsonData.info.schema?.schema || 'v2.1.0',
            totalRequests: countRequests(jsonData.item),
            uploadedAt: new Date().toISOString(),
            filename: filename,
            filepath: filepath,
            size: req.file.size
        };

        res.json({
            success: true,
            message: 'Collection uploaded successfully',
            collection: collectionInfo
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload collection' });
    }
});

// GET /api/upload-collection - List all collections
router.get('/', async (req, res) => {
    try {
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);

        try {
            await fs.access(uploadsDir);
        } catch {
            return res.json({ collections: [] });
        }

        const files = await fs.readdir(uploadsDir);
        const collections = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filepath = path.join(uploadsDir, file);
                    const content = await fs.readFile(filepath, 'utf-8');
                    const jsonData = JSON.parse(content);

                    const [timestamp] = file.split('_');

                    collections.push({
                        id: parseInt(timestamp),
                        name: jsonData.info?.name || 'Untitled Collection',
                        description: jsonData.info?.description || '',
                        schema: jsonData.info?.schema?.schema || 'v2.1.0',
                        totalRequests: countRequests(jsonData.item),
                        uploadedAt: new Date(parseInt(timestamp)).toISOString(),
                        filename: file,
                        filepath: filepath
                    });
                } catch (error) {
                    console.error(`Error reading file ${file}:`, error);
                }
            }
        }

        // Sort by upload date (newest first)
        collections.sort((a, b) => b.id - a.id);

        res.json({ collections });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

// GET /api/upload-collection/:id - Download a specific collection
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);

        // Find the file with the matching timestamp prefix
        const files = await fs.readdir(uploadsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const filepath = path.join(uploadsDir, targetFile);

        // Read the file content
        const content = await fs.readFile(filepath, 'utf-8');

        // Return the file as a download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${targetFile}"`);
        res.send(content);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download collection' });
    }
});

// DELETE /api/upload-collection/:id - Delete a specific collection
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);

        // Find the file with the matching timestamp prefix
        const files = await fs.readdir(uploadsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const filepath = path.join(uploadsDir, targetFile);

        // Delete the file
        await fs.unlink(filepath);

        res.json({
            success: true,
            message: 'Collection deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// GET /api/upload-collection/:id/info - Get collection information
router.get('/:id/info', async (req, res) => {
    try {
        const { id } = req.params;
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);

        // Find the file with the matching timestamp prefix
        const files = await fs.readdir(uploadsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const filepath = path.join(uploadsDir, targetFile);
        const content = await fs.readFile(filepath, 'utf-8');
        const collection = JSON.parse(content);

        // Validate collection structure
        if (!collection.info || !collection.item || !Array.isArray(collection.item)) {
            return res.status(400).json({ error: 'Invalid collection structure' });
        }

        const totalRequests = countRequests(collection.item);

        res.json({
            success: true,
            collection: {
                id: parseInt(id),
                name: collection.info.name || 'Untitled Collection',
                description: collection.info.description || '',
                schema: collection.info.schema?.schema || 'v2.1.0',
                totalRequests,
                uploadedAt: new Date(parseInt(id)).toISOString(),
                filename: targetFile
            }
        });

    } catch (error) {
        console.error('Get collection info error:', error);
        res.status(500).json({ error: 'Failed to get collection info' });
    }
});

// POST /api/upload-collection/:id/run - Run/execute a collection
router.post('/:id/run', async (req, res) => {
    try {
        const { id } = req.params;
        const { environmentId } = req.body; // Get environment ID from request body

        console.log('Collection ID:', id);
        console.log('Environment ID from request:', environmentId);
        console.log('Full request body:', req.body);

        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);
        const environmentsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.environmentsDir);

        console.log('Uploads directory:', uploadsDir);
        console.log('Environments directory:', environmentsDir);

        // Find the collection file
        const files = await fs.readdir(uploadsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const filepath = path.join(uploadsDir, targetFile);
        const content = await fs.readFile(filepath, 'utf-8');
        const collection = JSON.parse(content);

        // Validate collection structure
        if (!collection.info || !collection.item || !Array.isArray(collection.item)) {
            return res.status(400).json({ error: 'Invalid collection structure' });
        }

        // Load environment variables if environmentId is provided
        let environment = {};
        console.log('=== ENVIRONMENT LOADING DEBUG ===');
        console.log('Environment ID received:', environmentId);
        console.log('Environment ID type:', typeof environmentId);
        console.log('Request body:', req.body);

        // Use environment variables from request body if provided
        if (req.body.variables && typeof req.body.variables === 'object') {
            environment = { ...req.body.variables };
            console.log('Using environment variables from request body:', environment);
            console.log('Environment keys from request body:', Object.keys(environment));
        }

        // Also try to load from environment file if environmentId is provided (as backup)
        if (environmentId && Object.keys(environment).length === 0) {
            try {
                // First try to find environment in the collection-specific directory
                let envPath = path.join(environmentsDir, environmentId);
                let envFiles = [];

                console.log('Trying collection-specific environment path:', envPath);

                try {
                    envFiles = await fs.readdir(envPath);
                    console.log('Files found in collection-specific path:', envFiles);
                } catch (dirError) {
                    console.log('Collection-specific path not found, trying base environments directory');
                    // If collection-specific directory doesn't exist, try the base environments directory
                    envPath = environmentsDir;
                    envFiles = await fs.readdir(envPath);
                    console.log('Files found in base environments path:', envFiles);
                }

                // Look for environment files (both .postman_environment.json and .json)
                const envFile = envFiles.find(file =>
                    file.endsWith('.postman_environment.json') ||
                    file.endsWith('.json')
                );

                console.log('Selected environment file:', envFile);

                if (envFile) {
                    const fullEnvPath = path.join(envPath, envFile);
                    const envContent = await fs.readFile(fullEnvPath, 'utf-8');
                    const envData = JSON.parse(envContent);

                    console.log('Environment file content:', envData);

                    if (envData.values && Array.isArray(envData.values)) {
                        // Postman environment format
                        envData.values.forEach(item => {
                            if (item.key && item.enabled !== false) {
                                environment[item.key] = item.value || '';
                                console.log(`Added environment variable from file: ${item.key} = ${item.value}`);
                            }
                        });
                    } else if (typeof envData === 'object' && envData !== null) {
                        // Simple key-value format
                        Object.keys(envData).forEach(key => {
                            if (typeof envData[key] === 'string' || typeof envData[key] === 'number' || typeof envData[key] === 'boolean') {
                                environment[key] = String(envData[key]);
                                console.log(`Added environment variable from file: ${key} = ${envData[key]}`);
                            }
                        });
                    }

                    console.log('Environment variables loaded from file:', environment);
                    console.log('Environment file path:', fullEnvPath);
                } else {
                    console.warn(`No environment file found in ${envPath}`);
                }
            } catch (envError) {
                console.warn('Environment not found or invalid:', envError.message);
                console.error('Environment error details:', envError);
                // Continue without environment variables
            }
        }

        console.log('Final environment variables to be used:', environment);
        console.log('Final environment keys:', Object.keys(environment));
        console.log('=== END ENVIRONMENT LOADING DEBUG ===');

        // Execute all requests in the collection
        console.log(`Starting execution of collection: ${collection.info.name}`);
        console.log(`Total requests to execute: ${countRequests(collection.item)}`);

        if (!collection.item || collection.item.length === 0) {
            return res.status(400).json({ error: 'Collection has no requests to execute' });
        }

        const results = await extractAndExecuteRequests(collection.item, environment, collection.info.name);

        console.log(`Collection execution completed. Total results: ${results.length}`);
        console.log('Environment object at end of main function:', environment);
        console.log('Environment keys at end of main function:', Object.keys(environment));

        // Calculate summary statistics
        const successfulRequests = results.filter(r => r.success).length;
        const failedRequests = results.filter(r => !r.success).length;
        const totalResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0);
        const averageResponseTime = results.length > 0 ? Math.round(totalResponseTime / results.length) : 0;

        res.json({
            success: true,
            message: 'Collection execution completed',
            collection: {
                id: parseInt(id),
                name: collection.info.name || 'Untitled Collection',
                totalRequests: results.length,
                status: 'completed',
                successfulRequests: successfulRequests,
                failedRequests: failedRequests,
                averageResponseTime: averageResponseTime
            },
            results: results
        });

    } catch (error) {
        console.error('Run collection error:', error);
        res.status(500).json({ error: 'Failed to run collection' });
    }
});

module.exports = router;
