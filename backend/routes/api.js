const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

// Playground endpoint: runs both Raw and Optimized concurrently
router.post('/playground', llmController.runPlaygroundComparison);

// Chat endpoint: simple chat interface for the model
router.post('/chat', llmController.chat);

module.exports = router;
