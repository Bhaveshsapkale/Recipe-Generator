import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/recipe', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: req.body.prompt
                }
            ],
            max_tokens: 1000
        });
        
        // Format response to match Anthropic's structure for frontend compatibility
        const response = {
            content: [
                {
                    text: completion.choices[0].message.content
                }
            ]
        };
        
        return res.json(response);
    } catch (error) {
        console.error('Error generating recipe:', error);
        return res.status(500).json({ error: 'Failed to generate recipe' });
    }
});

app.listen(3001, () => console.log('Backend on :3001'));