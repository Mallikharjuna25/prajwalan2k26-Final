import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

export async function checkIfAIGenerated(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Using Hugging Face free inference API
        // Model: umm-maybe/AI-image-detector (free, open source)
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector',
            { inputs: base64Image },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            }
        );

        const results = response.data;
        // Response format: [{ label: "artificial", score: 0.95 },
        //                   { label: "human", score: 0.05 }]

        const aiScore = results.find(r =>
            r.label.toLowerCase().includes('artificial') ||
            r.label.toLowerCase().includes('fake') ||
            r.label.toLowerCase().includes('generated')
        )?.score || 0;

        const penalty =
            aiScore > 0.85 ? 40 :
                aiScore > 0.65 ? 25 :
                    aiScore > 0.45 ? 10 : 0;

        return {
            success: true,
            aiScore: parseFloat(aiScore.toFixed(3)),
            isAIGenerated: aiScore > 0.65,
            suspicionLevel:
                aiScore > 0.85 ? 'HIGH' :
                    aiScore > 0.65 ? 'MEDIUM' : 'LOW',
            penalty
        };

    } catch (error) {
        // If HF API fails (model loading/timeout), skip this layer gracefully
        console.warn('AI detection unavailable:', error.message);
        return {
            success: false,
            aiScore: 0,
            isAIGenerated: false,
            suspicionLevel: 'LOW',
            penalty: 0,
            skipped: true
        };
    }
}
