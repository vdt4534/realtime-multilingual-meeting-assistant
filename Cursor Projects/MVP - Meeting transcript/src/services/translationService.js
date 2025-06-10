class TranslationService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.contextBuffer = [];
    }

    async translateText(text, fromLang = 'English', toLang = 'Japanese') {
        try {
            // Add to context buffer
            this.contextBuffer.push(text);
            if (this.contextBuffer.length > 3) {
                this.contextBuffer.shift();
            }

            // Create context from buffer
            const context = this.contextBuffer.length > 1 
                ? `Previous context: ${this.contextBuffer.slice(0, -1).join(' ')} Current: ${text}`
                : text;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + this.apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Translate the following text from ${fromLang} to ${toLang}. Provide only the translation, no explanations. Consider the context for accurate translation:

Context: ${context}

Text to translate: ${text}

Translation:`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translation = data.candidates[0].content.parts[0].text.trim();
            
            console.log('Translation received:', translation);
            return translation;
            
        } catch (error) {
            console.error('Translation failed:', error);
            throw error;
        }
    }
}

module.exports = TranslationService;