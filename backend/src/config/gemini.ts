import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = () => {
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export default genAI;
