import express from 'express';
import { chatWithBot, getSuggestions, getChatbotStats } from '../controllers/chatbotController.js';

const router = express.Router();

// Chat with the bot
router.post('/chat', chatWithBot);

// Get quick suggestions
router.get('/suggestions', getSuggestions);

// Get chatbot statistics
router.get('/stats', getChatbotStats);

export default router;
