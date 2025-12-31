import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['POST'],
    credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: { error: 'Too many requests, please try again later.' }
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Simple cache
const recipeCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

app.post('/api/recipe', limiter, async (req, res) => {
    try {
        // Validate content type
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(415).json({ error: 'Content-Type must be application/json' });
        }

        const { prompt } = req.body;
        
        // Validate input
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt' });
        }
        
        if (prompt.length > 2000) {
            return res.status(400).json({ error: 'Prompt too long' });
        }

        // Check cache
        const cacheKey = JSON.stringify(prompt);
        const cached = recipeCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.json(cached.data);
        }

        // Set timeout
        const timeout = setTimeout(() => {
            return res.status(408).json({ error: 'Request timeout' });
        }, 30000); // 30 seconds

        const result = await model.generateContent(prompt);
        clearTimeout(timeout);
        
        const responseText = result.response.text();
        
        const response = {
            content: [
                {
                    text: responseText
                }
            ]
        };

        // Cache the result
        recipeCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });
        
        return res.json(response);
    } catch (error) {
        console.error('Error generating recipe:', error);
        
        if (error.message?.includes('quota')) {
            return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
        }
        
        return res.status(500).json({ error: 'Failed to generate recipe' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});