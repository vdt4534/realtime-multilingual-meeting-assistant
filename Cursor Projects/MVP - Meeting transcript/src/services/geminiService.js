const { GoogleGenAI, Modality } = require('@google/genai');

class GeminiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
        this.liveSession = null;
        this.isConnected = false;
        this.messageQueue = [];
        this.contextBuffer = [];
    }

    async startLiveSession(callbacks = {}) {
        try {
            console.log('Starting Gemini Live session...');
            
            const config = {
                responseModalities: [Modality.TEXT], // We want text transcription
                inputAudioTranscription: {}, // Enable input audio transcription
                realtimeInputConfig: {
                    automaticActivityDetection: {
                        disabled: false,
                        prefixPaddingMs: 100,
                        silenceDurationMs: 1000
                    }
                }
            };

            this.liveSession = await this.genAI.live.connect({
                model: 'gemini-2.0-flash-live-001',
                config: config,
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened');
                        this.isConnected = true;
                        if (callbacks.onopen) callbacks.onopen();
                    },
                    onmessage: (message) => {
                        console.log('Received message:', message);
                        this.handleMessage(message, callbacks);
                    },
                    onerror: (error) => {
                        console.error('Live session error:', error);
                        this.isConnected = false;
                        if (callbacks.onerror) callbacks.onerror(error);
                    },
                    onclose: (event) => {
                        console.log('Live session closed:', event.reason);
                        this.isConnected = false;
                        if (callbacks.onclose) callbacks.onclose(event);
                    }
                }
            });

            return this.liveSession;
        } catch (error) {
            console.error('Failed to start live session:', error);
            throw error;
        }
    }

    handleMessage(message, callbacks) {
        // Handle transcription from input audio
        if (message.serverContent && message.serverContent.inputTranscription) {
            const transcription = message.serverContent.inputTranscription.text;
            console.log('Transcription received:', transcription);
            
            // Add to context buffer
            this.contextBuffer.push(transcription);
            if (this.contextBuffer.length > 3) {
                this.contextBuffer.shift();
            }

            if (callbacks.onTranscription) {
                callbacks.onTranscription(transcription);
            }

            // Trigger translation if this seems like a complete sentence
            if (message.serverContent.inputTranscription.isFinal) {
                this.requestTranslation(transcription, callbacks.onTranslation);
            }
        }

        // Handle any text responses
        if (message.text) {
            console.log('Text response:', message.text);
            if (callbacks.onText) {
                callbacks.onText(message.text);
            }
        }

        // Handle turn completion
        if (message.serverContent && message.serverContent.turnComplete) {
            console.log('Turn completed');
            if (callbacks.onTurnComplete) {
                callbacks.onTurnComplete();
            }
        }
    }

    async sendAudioData(audioData, mimeType = 'audio/pcm;rate=16000') {
        if (!this.isConnected || !this.liveSession) {
            throw new Error('Live session not connected');
        }

        try {
            this.liveSession.sendRealtimeInput({
                audio: {
                    data: audioData,
                    mimeType: mimeType
                }
            });
        } catch (error) {
            console.error('Failed to send audio data:', error);
            throw error;
        }
    }

    async requestTranslation(text, onTranslation) {
        try {
            // Create context from buffer
            const context = this.contextBuffer.length > 1 
                ? `Previous context: ${this.contextBuffer.slice(0, -1).join(' ')} Current: ${text}`
                : text;

            // Use regular Gemini API for translation
            const translationModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const prompt = `Translate the following text from English to Japanese. Provide only the translation, no explanations. Consider the context for accurate translation:

Context: ${context}

Text to translate: ${text}

Translation:`;

            const result = await translationModel.generateContent(prompt);
            const translation = result.response.text().trim();
            
            console.log('Translation received:', translation);
            
            if (onTranslation) {
                onTranslation(translation);
            }
            
            return translation;
        } catch (error) {
            console.error('Translation failed:', error);
            if (onTranslation) {
                onTranslation(`[Translation failed: ${error.message}]`);
            }
        }
    }

    stopLiveSession() {
        if (this.liveSession) {
            this.liveSession.close();
            this.liveSession = null;
        }
        this.isConnected = false;
        this.messageQueue = [];
    }

    isSessionActive() {
        return this.isConnected && this.liveSession;
    }
}

module.exports = GeminiService;