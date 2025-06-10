const TranslationService = require('./translationService');

class SpeechService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.translationService = new TranslationService(apiKey);
        this.recognition = null;
        this.isListening = false;
        this.currentSentence = '';
        this.sentenceBuffer = [];
    }

    async startListening(callbacks = {}) {
        try {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Speech recognition not supported in this browser');
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.isListening = true;
                if (callbacks.onStart) callbacks.onStart();
            };

            this.recognition.onresult = async (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show interim results
                if (interimTranscript && callbacks.onInterimResult) {
                    callbacks.onInterimResult(interimTranscript);
                }

                // Process final results
                if (finalTranscript) {
                    console.log('Final transcript:', finalTranscript);
                    
                    if (callbacks.onFinalResult) {
                        callbacks.onFinalResult(finalTranscript);
                    }

                    // Trigger translation for complete sentences
                    this.processTranscription(finalTranscript, callbacks.onTranslation);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (callbacks.onError) {
                    callbacks.onError(new Error(`Speech recognition error: ${event.error}`));
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.isListening = false;
                if (callbacks.onEnd) callbacks.onEnd();
                
                // Auto-restart if still supposed to be listening
                if (this.shouldRestart) {
                    setTimeout(() => {
                        if (this.shouldRestart) {
                            this.recognition.start();
                        }
                    }, 1000);
                }
            };

            this.shouldRestart = true;
            this.recognition.start();
            
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            throw error;
        }
    }

    async processTranscription(transcript, onTranslation) {
        try {
            // Clean up the transcript
            const cleanTranscript = transcript.trim();
            if (!cleanTranscript) return;

            // Add to sentence buffer
            this.sentenceBuffer.push(cleanTranscript);
            if (this.sentenceBuffer.length > 3) {
                this.sentenceBuffer.shift();
            }

            // Check if this looks like a complete sentence
            const isCompleteSentence = /[.!?]$/.test(cleanTranscript) || cleanTranscript.length > 20;
            
            if (isCompleteSentence || this.sentenceBuffer.length >= 2) {
                // Translate the transcript
                const translation = await this.translationService.translateText(cleanTranscript);
                
                if (onTranslation) {
                    onTranslation(translation);
                }
            }
            
        } catch (error) {
            console.error('Translation processing failed:', error);
            if (onTranslation) {
                onTranslation(`[Translation error: ${error.message}]`);
            }
        }
    }

    stopListening() {
        this.shouldRestart = false;
        this.isListening = false;
        
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
    }

    isActive() {
        return this.isListening;
    }
}

module.exports = SpeechService;