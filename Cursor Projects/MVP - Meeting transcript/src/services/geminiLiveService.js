const { GoogleGenAI, Modality } = require('@google/genai');

class GeminiLiveService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        this.model = 'gemini-2.0-flash-live-001';
        this.session = null;
        this.isConnected = false;
        this.callbacks = {};
        this.responseQueue = [];
        this.contextBuffer = [];
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize(callbacks = {}) {
        this.callbacks = callbacks;
        
        const attemptConnection = async () => {
            try {
                const config = {
                    responseModalities: [Modality.TEXT],
                    inputAudioTranscription: {},
                    systemInstruction: {
                        parts: [{
                            text: `You are a real-time meeting transcription assistant. Your primary role is to:
1. Provide accurate real-time transcription of spoken English
2. Provide contextual translation to Japanese when requested
3. Maintain conversation context for better translation accuracy
4. Be responsive and efficient with low latency

Language pairs: English ↔ Japanese`
                        }]
                    }
                };

                this.session = await this.ai.live.connect({
                    model: this.model,
                    callbacks: {
                        onopen: () => {
                            console.log('Gemini Live session opened');
                            this.isConnected = true;
                            this.retryAttempts = 0; // Reset retry counter on success
                            if (this.callbacks.onConnect) {
                                this.callbacks.onConnect();
                            }
                        },
                        onmessage: (message) => {
                            this.responseQueue.push(message);
                            this.processMessage(message);
                        },
                        onerror: (error) => {
                            console.error('Gemini Live error:', error);
                            if (this.callbacks.onError) {
                                this.callbacks.onError(error);
                            }
                        },
                        onclose: (event) => {
                            console.log('Gemini Live session closed:', event.reason);
                            this.isConnected = false;
                            if (this.callbacks.onDisconnect) {
                                this.callbacks.onDisconnect(event.reason);
                            }
                        }
                    },
                    config: config
                });

                return true;
            } catch (error) {
                console.error(`Failed to initialize Gemini Live (attempt ${this.retryAttempts + 1}):`, error);
                
                if (this.retryAttempts < this.maxRetries) {
                    this.retryAttempts++;
                    console.log(`Retrying connection in ${this.retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    this.retryDelay *= 2; // Exponential backoff
                    return attemptConnection();
                } else {
                    throw new Error(`Failed to connect after ${this.maxRetries} attempts: ${error.message}`);
                }
            }
        };
        
        return attemptConnection();
    }

    processMessage(message) {
        try {
            // Handle input transcription (real-time speech-to-text)
            if (message.serverContent?.inputTranscription?.text) {
                const transcriptionText = message.serverContent.inputTranscription.text;
                console.log('Received transcription:', transcriptionText);
                
                if (this.callbacks.onTranscription) {
                    this.callbacks.onTranscription(transcriptionText);
                }
                
                // Add to context buffer and trigger translation if complete sentence
                this.processTranscriptionForTranslation(transcriptionText);
            }

            // Handle model responses (translations)
            if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                    if (part.text) {
                        console.log('Received model response:', part.text);
                        if (this.callbacks.onTranslation) {
                            this.callbacks.onTranslation(part.text);
                        }
                    }
                }
            }

            // Handle turn completion
            if (message.serverContent?.turnComplete) {
                console.log('Turn completed');
            }

            // Handle errors
            if (message.serverContent?.error) {
                console.error('Server content error:', message.serverContent.error);
                if (this.callbacks.onError) {
                    this.callbacks.onError(new Error(message.serverContent.error.message));
                }
            }

        } catch (error) {
            console.error('Error processing message:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    async processTranscriptionForTranslation(transcriptionText) {
        try {
            // Clean and validate transcription
            const cleanText = transcriptionText.trim();
            if (!cleanText || cleanText.length < 3) return;

            // Add to context buffer
            this.contextBuffer.push(cleanText);
            if (this.contextBuffer.length > 3) {
                this.contextBuffer.shift();
            }

            // Check if this looks like a complete sentence or significant chunk
            const isCompleteSentence = /[.!?]$/.test(cleanText) || cleanText.length > 15;
            
            if (isCompleteSentence) {
                // Create context for translation
                const context = this.contextBuffer.length > 1 
                    ? `Previous context: ${this.contextBuffer.slice(0, -1).join(' ')}\n\nCurrent text to translate: ${cleanText}`
                    : cleanText;

                // Request translation from the model
                const translationPrompt = `Please translate the following English text to Japanese. Provide only the Japanese translation, no explanations:

${context}`;

                this.session.sendClientContent({ 
                    turns: [{ 
                        role: "user", 
                        parts: [{ text: translationPrompt }] 
                    }],
                    turnComplete: true 
                });
            }
        } catch (error) {
            console.error('Translation processing error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    sendAudioData(base64AudioData) {
        if (!this.isConnected || !this.session) {
            console.warn('Session not connected, cannot send audio data');
            return;
        }

        // Enhanced validation for audio data
        if (!base64AudioData || typeof base64AudioData !== 'string' || base64AudioData.length === 0) {
            console.warn('Invalid audio data provided, skipping send');
            return;
        }

        // Validate base64 format and reasonable size
        try {
            // Test if it's valid base64 by attempting to decode
            const decodedData = atob(base64AudioData);
            
            // Check if decoded data has reasonable size (not empty, not too large)
            if (decodedData.length === 0) {
                console.warn('Empty audio data after decoding, skipping send');
                return;
            }
            
            if (decodedData.length > 1024 * 1024) { // 1MB limit
                console.warn('Audio data too large, skipping send:', decodedData.length);
                return;
            }
        } catch (e) {
            console.warn('Invalid base64 audio data, skipping send:', e.message);
            return;
        }

        try {
            // Correct format for Gemini Live API
            // Use audio parameter (not media)
            this.session.sendRealtimeInput({
                audio: {
                    data: base64AudioData,
                    mimeType: "audio/pcm;rate=16000"
                }
            });
        } catch (error) {
            console.error('Error sending audio data:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    sendAudioStreamEnd() {
        if (!this.isConnected || !this.session) {
            return;
        }

        try {
            // Only send audioStreamEnd if we have an active session
            if (this.session && typeof this.session.sendRealtimeInput === 'function') {
                // Correct format for Gemini Live API
                this.session.sendRealtimeInput({ 
                    audioStreamEnd: true 
                });
            }
        } catch (error) {
            // Suppress this error as it's often due to session already being closed
            console.warn('Audio stream end signal not sent (session may already be closed):', error.message);
        }
    }

    disconnect() {
        this.isConnected = false;
        
        if (this.session) {
            try {
                this.session.close();
            } catch (error) {
                console.error('Error closing session:', error);
            } finally {
                this.session = null;
            }
        }
        
        this.responseQueue = [];
        this.contextBuffer = [];
    }

    isActive() {
        return this.isConnected && this.session !== null;
    }

    // Enhanced session state management
    getSessionState() {
        return {
            isConnected: this.isConnected,
            hasSession: this.session !== null,
            retryAttempts: this.retryAttempts,
            contextBufferSize: this.contextBuffer.length,
            responseQueueSize: this.responseQueue.length
        };
    }

    // Method to check if session needs reconnection
    needsReconnection() {
        return !this.isConnected || this.session === null;
    }

    // Method to safely reconnect
    async reconnect() {
        if (this.isConnected && this.session) {
            console.log('Session already connected, skipping reconnection');
            return true;
        }
        
        console.log('Attempting to reconnect session...');
        this.disconnect(); // Clean up any existing state
        return this.initialize(this.callbacks);
    }
}

module.exports = GeminiLiveService;