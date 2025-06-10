const { ipcRenderer } = require('electron');
const GeminiLiveService = require('./services/geminiLiveService');
const AudioProcessor = require('./services/audioProcessor');

class MeetingAssistant {
    constructor() {
        this.isRecording = false;
        this.conversationHistory = [];
        this.contextBuffer = [];
        this.geminiLiveService = null;
        this.audioProcessor = new AudioProcessor();
        this.currentTranscript = '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadMicrophones();
        this.loadApiKey();
    }

    initializeElements() {
        this.microphoneSelect = document.getElementById('microphone-select');
        this.apiKeyInput = document.getElementById('api-key');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.statusText = document.getElementById('status-text');
        this.conversation = document.getElementById('conversation');
        this.exportBtn = document.getElementById('export-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.audioLevel = document.querySelector('.level-bar');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startSession());
        this.stopBtn.addEventListener('click', () => this.stopSession());
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.exportBtn.addEventListener('click', () => this.exportSession());
        
        this.microphoneSelect.addEventListener('change', () => this.validateInputs());
        this.apiKeyInput.addEventListener('input', () => this.validateInputs());
    }

    async loadMicrophones() {
        try {
            const devices = await AudioProcessor.getAudioDevices();
            
            this.microphoneSelect.innerHTML = '<option value="">Select microphone...</option>';
            
            devices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Microphone ${index + 1}`;
                this.microphoneSelect.appendChild(option);
            });

            if (devices.length > 0) {
                this.microphoneSelect.value = devices[0].deviceId;
            }
            
            this.validateInputs();
        } catch (error) {
            this.showError('Failed to load microphones. Please check permissions.');
        }
    }

    async loadApiKey() {
        try {
            const apiKey = await ipcRenderer.invoke('get-api-key');
            if (apiKey) {
                this.apiKeyInput.value = apiKey;
                this.validateInputs();
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    validateInputs() {
        const hasMicrophone = this.microphoneSelect.value !== '';
        const hasApiKey = this.apiKeyInput.value.trim() !== '';
        
        this.startBtn.disabled = !hasMicrophone || !hasApiKey || this.isRecording;
        
        if (hasMicrophone && hasApiKey) {
            this.statusText.textContent = 'Ready to start';
        } else if (!hasMicrophone) {
            this.statusText.textContent = 'Please select a microphone';
        } else if (!hasApiKey) {
            this.statusText.textContent = 'Please enter API key';
        }
    }

    async startSession() {
        try {
            this.isRecording = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.statusText.textContent = 'Connecting to Gemini Live...';

            // Clear welcome message
            this.conversation.innerHTML = '';

            // Initialize Gemini Live service
            const apiKey = this.apiKeyInput.value.trim();
            this.geminiLiveService = new GeminiLiveService(apiKey);

            // Initialize audio processor
            await this.audioProcessor.initialize(this.microphoneSelect.value);

            // Initialize Gemini Live connection
            await this.geminiLiveService.initialize({
                onConnect: () => {
                    this.statusText.textContent = 'Connected - Starting audio stream...';
                    
                    // Start audio processing and streaming
                    this.audioProcessor.startProcessing(
                        (base64AudioData) => {
                            // Stream audio data to Gemini Live API
                            this.geminiLiveService.sendAudioData(base64AudioData);
                        },
                        (level) => {
                            // Update audio level indicator
                            this.audioLevel.style.width = `${level}%`;
                        }
                    );

                    this.statusText.textContent = 'Listening - Speak naturally';
                    this.showSuccess('Session started! Speak naturally for real-time transcription and translation.');
                },
                onTranscription: (text) => {
                    console.log('Transcription received:', text);
                    // Add transcription to conversation
                    this.addMessage('transcription', text, 'English');
                },
                onTranslation: (text) => {
                    console.log('Translation received:', text);
                    // Add translation to conversation
                    this.addMessage('translation', text, '日本語');
                },
                onError: (error) => {
                    console.error('Gemini Live error:', error);
                    this.showError(`Connection error: ${error.message}`);
                    this.stopSession();
                },
                onDisconnect: (reason) => {
                    console.log('Gemini Live disconnected:', reason);
                    if (this.isRecording) {
                        this.showError('Connection lost. Please restart the session.');
                        this.stopSession();
                    }
                }
            });
            
        } catch (error) {
            console.error('Failed to start session:', error);
            this.showError(`Failed to start session: ${error.message}`);
            this.stopSession();
        }
    }


    stopSession() {
        this.isRecording = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.statusText.textContent = 'Stopping session...';

        // Stop audio processor
        if (this.audioProcessor) {
            this.audioProcessor.stopProcessing();
        }

        // Disconnect from Gemini Live service
        if (this.geminiLiveService) {
            this.geminiLiveService.sendAudioStreamEnd();
            this.geminiLiveService.disconnect();
            this.geminiLiveService = null;
        }

        this.audioLevel.style.width = '0%';
        this.exportBtn.disabled = this.conversationHistory.length === 0;
        this.statusText.textContent = 'Session stopped';
        
        this.validateInputs();
    }


    addMessage(type, text, language) {
        // Skip empty or very short messages
        if (!text || text.trim().length < 2) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">${language} • ${timestamp}</div>
            <div class="message-text">${text}</div>
        `;

        this.conversation.appendChild(messageDiv);
        this.conversation.scrollTop = this.conversation.scrollHeight;

        // Store in history
        this.conversationHistory.push({
            type,
            text,
            language,
            timestamp: new Date().toISOString()
        });

        // Update context buffer for transcriptions
        if (type === 'transcription') {
            this.contextBuffer.push(text);
            if (this.contextBuffer.length > 3) {
                this.contextBuffer.shift();
            }
        }
    }

    clearConversation() {
        this.conversation.innerHTML = `
            <div class="welcome-message">
                <h3>Conversation cleared</h3>
                <p>Start a new session to begin transcription and translation</p>
            </div>
        `;
        this.conversationHistory = [];
        this.contextBuffer = [];
        this.exportBtn.disabled = true;
    }

    exportSession() {
        if (this.conversationHistory.length === 0) return;

        const sessionData = {
            timestamp: new Date().toISOString(),
            languagePair: 'English ↔ Japanese',
            messages: this.conversationHistory
        };

        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meeting-transcript-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Session exported successfully!');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        this.conversation.insertBefore(errorDiv, this.conversation.firstChild);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        this.conversation.insertBefore(successDiv, this.conversation.firstChild);
        
        setTimeout(() => successDiv.remove(), 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MeetingAssistant();
});