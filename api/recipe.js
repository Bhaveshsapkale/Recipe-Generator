import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
        
        const response = {
            content: [
                {
                    text: completion.choices[0].message.content
                }
            ]
        };
        
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error generating recipe:', error);
        return res.status(500).json({ error: 'Failed to generate recipe' });
    }
}
