const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const config = require('../config');

// Helper function to extract requests from Postman collection
function extractRequests(items) {
    let count = 0;

    for (const item of items) {
        if (item.request) {
            count++;
        } else if (item.item) {
            count += extractRequests(item.item);
        }
    }

    return count;
}

// GET /api/collection-info/:id - Get detailed collection information
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the collection file
        let filepath;
        const uploadsDir = path.join(process.cwd(), config.storage.uploadsDir, config.storage.collectionsDir);

        try {
            await fs.access(uploadsDir);
        } catch {
            return res.status(404).json({ error: 'Collections directory not found' });
        }

        const files = await fs.readdir(uploadsDir);
        const collectionFile = files.find(file => file.startsWith(id + '_'));

        if (!collectionFile) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        filepath = path.join(uploadsDir, collectionFile);

        const content = await fs.readFile(filepath, 'utf-8');
        const collection = JSON.parse(content);

        // Validate collection structure
        if (!collection.info || !collection.item || !Array.isArray(collection.item)) {
            return res.status(400).json({ error: 'Invalid collection structure' });
        }

        const totalRequests = extractRequests(collection.item);

        res.json({
            success: true,
            collection: {
                name: collection.info.name,
                totalRequests
            }
        });

    } catch (error) {
        console.error('Get collection info error:', error);
        res.status(500).json({ error: 'Failed to get collection info' });
    }
});

module.exports = router;
