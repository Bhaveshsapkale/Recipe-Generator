import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/recipe', async (req, res) => {
    try {
        const result = await model.generateContent(req.body.prompt);
        const responseText = result.response.text();
        
        const response = {
            content: [
                {
                    text: responseText
                }
            ]
        };
        
        return res.json(response);
    } catch (error) {
        console.error('Error generating recipe:', error);
        return res.status(500).json({ error: 'Failed to generate recipe' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend on :${PORT}`));
