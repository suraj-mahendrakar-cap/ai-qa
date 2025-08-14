// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File too large',
            details: err.message
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Unexpected file field',
            details: err.message
        });
    }

    // Handle OpenAI errors
    if (err.type === 'openai_error') {
        return res.status(500).json({
            error: 'OpenAI API error',
            details: err.message
        });
    }

    // Handle file system errors
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            error: 'File not found',
            details: err.message
        });
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON format',
            details: err.message
        });
    }

    // Default error
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler;
