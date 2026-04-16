const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Grok AI API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.xai-J2SsDkcf2dksyo6XfmN1y0OrvsBrOtHv1b1BIxSl6t1DWXRiGicssVcVlMP39kAzmO1zdHmp2zi2ulOH}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are MediAssist, an AI health assistant. 
                        Respond in JSON format only:
                        {
                            "mode": "medicine" or "escalate" or "clarify",
                            "summary": "brief response",
                            "medicines": [{"name": "", "dosage": "", "duration": ""}],
                            "escalate_reason": "",
                            "clarification_question": ""
                        }`
                    },
                    ...history,
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        // Try to parse JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(botMessage);
        } catch {
            parsedResponse = { mode: "clarify", summary: botMessage };
        }
        
        res.json({ response: parsedResponse });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
