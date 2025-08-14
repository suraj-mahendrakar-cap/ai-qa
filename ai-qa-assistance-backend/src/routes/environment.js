const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const config = require('../config');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.upload.maxEnvironmentSize,
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

// POST /api/environment - Upload a new environment file
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const collectionId = req.body.collectionId;

        // Read and validate JSON content
        const fileContent = req.file.buffer.toString();
        let jsonData;

        try {
            jsonData = JSON.parse(fileContent);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON file' });
        }

        // Validate environment file structure (Postman format or simple key-value pairs)
        if (typeof jsonData !== 'object' || jsonData === null) {
            return res.status(400).json({ error: 'Environment file should contain key-value pairs' });
        }

        // Check if it's a Postman environment file
        const isPostmanEnvironment = jsonData.values && Array.isArray(jsonData.values) && jsonData._postman_variable_scope === 'environment';

        // Check if it's a simple key-value JSON
        const isSimpleKeyValue = Object.keys(jsonData).every(key =>
            typeof jsonData[key] === 'string' ||
            typeof jsonData[key] === 'number' ||
            typeof jsonData[key] === 'boolean'
        );

        // Check if it's NOT a Postman collection file
        const isPostmanCollection = jsonData.info && jsonData.item && Array.isArray(jsonData.item);

        if (!isPostmanEnvironment && !isSimpleKeyValue) {
            return res.status(400).json({
                error: 'Invalid environment file format. Must be a Postman environment JSON or a simple key-value JSON.'
            });
        }

        if (isPostmanCollection) {
            return res.status(400).json({
                error: 'This appears to be a Postman collection file, not an environment file. Please upload a valid environment file.'
            });
        }

        // Convert Postman environment format to simple key-value pairs
        let environmentVariables = {};

        if (jsonData.values && Array.isArray(jsonData.values)) {
            // Postman environment format
            jsonData.values.forEach((item) => {
                if (item.key && item.enabled !== false) {
                    environmentVariables[item.key] = item.value || '';
                }
            });
        } else {
            // Simple key-value format
            environmentVariables = jsonData;
        }

        // Create environments directory if it doesn't exist
        const baseEnvironmentsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.environmentsDir);
        try {
            await fs.access(baseEnvironmentsDir);
        } catch {
            await fs.mkdir(baseEnvironmentsDir, { recursive: true });
        }

        // Create collection-specific directory if collectionId is provided
        const environmentsDir = collectionId
            ? path.join(baseEnvironmentsDir, collectionId)
            : baseEnvironmentsDir;

        try {
            await fs.access(environmentsDir);
        } catch {
            await fs.mkdir(environmentsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${sanitizedName}`;
        const filepath = path.join(environmentsDir, filename);

        // Save file
        await fs.writeFile(filepath, fileContent);

        // Extract environment metadata - handle both string and object names
        let environmentName = req.file.originalname.replace('.json', '').replace('.env', '');

        if (jsonData.name) {
            if (typeof jsonData.name === 'string') {
                environmentName = jsonData.name;
            } else if (jsonData.name.name && typeof jsonData.name.name === 'string') {
                // Handle Postman collection format where name is an object
                environmentName = jsonData.name.name;
            }
        }

        const envInfo = {
            id: timestamp.toString(),
            name: environmentName,
            filename: filename,
            filepath: filepath,
            uploadedAt: new Date().toISOString(),
            size: req.file.size,
            variables: environmentVariables
        };

        res.json({
            success: true,
            message: 'Environment file uploaded successfully',
            environment: envInfo
        });

    } catch (error) {
        console.error('Environment upload error:', error);
        res.status(500).json({ error: 'Failed to upload environment file' });
    }
});

// GET /api/environment - List all environment files
router.get('/', async (req, res) => {
    try {
        const collectionId = req.query.collectionId;

        const baseEnvironmentsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.environmentsDir);
        const environmentsDir = collectionId
            ? path.join(baseEnvironmentsDir, collectionId)
            : baseEnvironmentsDir;

        try {
            await fs.access(environmentsDir);
        } catch {
            return res.json({ environments: [] });
        }

        const files = await fs.readdir(environmentsDir);
        const environments = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filepath = path.join(environmentsDir, file);
                    const content = await fs.readFile(filepath, 'utf-8');
                    const jsonData = JSON.parse(content);

                    // Validate that this is actually an environment file, not a collection
                    const isPostmanCollection = jsonData.info && jsonData.item && Array.isArray(jsonData.item);
                    if (isPostmanCollection) {
                        console.warn(`Skipping collection file ${file} in environment directory`);
                        continue; // Skip this file as it's not an environment
                    }

                    const [timestamp] = file.split('_');

                    // Convert Postman environment format to simple key-value pairs
                    let environmentVariables = {};

                    if (jsonData.values && Array.isArray(jsonData.values)) {
                        // Postman environment format
                        jsonData.values.forEach((item) => {
                            if (item.key && item.enabled !== false) {
                                environmentVariables[item.key] = item.value || '';
                            }
                        });
                    } else {
                        // Simple key-value format
                        environmentVariables = jsonData;
                    }

                    // Handle both string and object names
                    let environmentName = file.replace('.json', '').replace(/^\d+_/, '');

                    if (jsonData.name) {
                        if (typeof jsonData.name === 'string') {
                            environmentName = jsonData.name;
                        } else if (jsonData.name.name && typeof jsonData.name.name === 'string') {
                            // Handle Postman collection format where name is an object
                            environmentName = jsonData.name.name;
                        }
                    }

                    environments.push({
                        id: timestamp,
                        name: environmentName,
                        filename: file,
                        filepath: filepath,
                        uploadedAt: new Date(parseInt(timestamp)).toISOString(),
                        size: content.length,
                        variables: environmentVariables
                    });
                } catch (error) {
                    console.error(`Error reading environment file ${file}:`, error);
                    // Continue to next file instead of failing the entire request
                    continue;
                }
            }
        }

        // Sort by upload date (newest first)
        environments.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        res.json({ environments });
    } catch (error) {
        console.error('Error fetching environments:', error);
        res.status(500).json({ error: 'Failed to fetch environments' });
    }
});

// GET /api/environment/:id - Get a specific environment file
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const collectionId = req.query.collectionId;

        const baseEnvironmentsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.environmentsDir);
        const environmentsDir = collectionId
            ? path.join(baseEnvironmentsDir, collectionId)
            : baseEnvironmentsDir;

        try {
            await fs.access(environmentsDir);
        } catch {
            return res.status(404).json({ error: 'Environment not found' });
        }

        // Find the file with the matching timestamp prefix
        const files = await fs.readdir(environmentsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Environment not found' });
        }

        const filepath = path.join(environmentsDir, targetFile);

        // Read the file content
        const content = await fs.readFile(filepath, 'utf-8');
        const jsonData = JSON.parse(content);

        // Validate that this is actually an environment file, not a collection
        const isPostmanCollection = jsonData.info && jsonData.item && Array.isArray(jsonData.item);
        if (isPostmanCollection) {
            return res.status(400).json({
                error: 'This file appears to be a Postman collection, not an environment file. Please check your uploads.'
            });
        }

        // Convert Postman environment format to simple key-value pairs
        let environmentVariables = {};

        if (jsonData.values && Array.isArray(jsonData.values)) {
            // Postman environment format
            jsonData.values.forEach((item) => {
                if (item.key && item.enabled !== false) {
                    environmentVariables[item.key] = item.value || '';
                }
            });
        } else {
            // Simple key-value format
            environmentVariables = jsonData;
        }

        // Handle both string and object names
        let environmentName = targetFile.replace('.json', '').replace(/^\d+_/, '');

        if (jsonData.name) {
            if (typeof jsonData.name === 'string') {
                environmentName = jsonData.name;
            } else if (jsonData.name.name && typeof jsonData.name.name === 'string') {
                // Handle Postman collection format where name is an object
                environmentName = jsonData.name.name;
            }
        }

        res.json({
            id: id,
            name: environmentName,
            filename: targetFile,
            filepath: filepath,
            uploadedAt: new Date(parseInt(id)).toISOString(),
            size: content.length,
            variables: environmentVariables
        });

    } catch (error) {
        console.error('Environment fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch environment' });
    }
});

// DELETE /api/environment/:id - Delete a specific environment file
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const collectionId = req.query.collectionId;

        const baseEnvironmentsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.environmentsDir);
        const environmentsDir = collectionId
            ? path.join(baseEnvironmentsDir, collectionId)
            : baseEnvironmentsDir;

        try {
            await fs.access(environmentsDir);
        } catch {
            return res.status(404).json({ error: 'Environment not found' });
        }

        // Find the file with the matching timestamp prefix
        const files = await fs.readdir(environmentsDir);
        const targetFile = files.find(file => file.startsWith(id + '_'));

        if (!targetFile) {
            return res.status(404).json({ error: 'Environment not found' });
        }

        const filepath = path.join(environmentsDir, targetFile);

        // Delete the file
        await fs.unlink(filepath);

        res.json({
            success: true,
            message: 'Environment deleted successfully'
        });

    } catch (error) {
        console.error('Environment delete error:', error);
        res.status(500).json({ error: 'Failed to delete environment' });
    }
});

module.exports = router;
