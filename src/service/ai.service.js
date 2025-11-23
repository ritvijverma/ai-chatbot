const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateResponse(prompt) {
    if (!prompt || (typeof prompt !== 'string' && !Array.isArray(prompt))) {
        throw new Error('generateResponse: prompt is required and must be a non-empty string');
    }

    // The GenAI SDK expects `contents` to be an array of content pieces.
    // Wrap a plain string prompt into the required format.
    const contents = Array.isArray(prompt) ? prompt : [{ type: 'text', text: prompt }];

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
    });

    // Try to extract text from known response shapes; fall back to JSON string.
    if (typeof response?.text === 'string' && response.text.length) return response.text;

    if (Array.isArray(response?.outputs)) {
        // outputs -> content -> parts with text (best-effort)
        try {
            return response.outputs.map(o => {
                if (!o) return '';
                if (o.content) {
                    if (Array.isArray(o.content)) {
                        return o.content.map(c => c.text || '').join('');
                    }
                    return o.content.text || '';
                }
                return '';
            }).join('\n').trim();
        } catch (e) {
            // fall through to stringify
        }
    }

    return JSON.stringify(response);
}

module.exports = generateResponse;