class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.workletNode = null;
        this.analyserNode = null;
        this.isProcessing = false;
        this.audioChunks = [];
        this.sampleRate = 16000; // Required by Gemini Live API
        this.bufferSize = 4096;
        this.onAudioDataCallback = null;
        this.onAudioLevelCallback = null;
    }

    async initialize(deviceId = null) {
        try {
            // Check for required APIs
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('MediaDevices API not available');
            }

            if (!window.AudioContext && !window.webkitAudioContext) {
                throw new Error('Web Audio API not supported');
            }

            // Request microphone access
            const constraints = {
                audio: {
                    deviceId: deviceId || undefined,
                    channelCount: 1,
                    sampleRate: this.sampleRate,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });

            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Load the modern AudioWorklet processor
            await this.audioContext.audioWorklet.addModule('./services/audio-worklet-processor.js');

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            throw error;
        }
    }

    startProcessing(onAudioData, onAudioLevel) {
        if (!this.audioContext || !this.mediaStream) {
            throw new Error('Audio not initialized');
        }

        this.isProcessing = true;
        this.onAudioDataCallback = onAudioData;
        this.onAudioLevelCallback = onAudioLevel;
        
        try {
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            // Create analyser for audio level monitoring
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 256;
            this.analyserNode.smoothingTimeConstant = 0.8;
            source.connect(this.analyserNode);

            // Start audio level monitoring
            if (onAudioLevel) {
                this.startAudioLevelMonitoring(onAudioLevel);
            }

            // Create modern AudioWorkletNode (replaces deprecated ScriptProcessorNode)
            this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor', {
                numberOfInputs: 1,
                numberOfOutputs: 0, // No audio output needed for streaming
                channelCount: 1
            });
            
            // Handle messages from the worklet processor
            this.workletNode.port.onmessage = (event) => {
                try {
                    const { type, data, error } = event.data;
                    
                    if (type === 'audioData' && this.isProcessing) {
                        if (this.onAudioDataCallback && data && data.byteLength > 0) {
                            // Convert ArrayBuffer to base64 (btoa not available in AudioWorklet)
                            const base64Audio = this.arrayBufferToBase64(data);
                            
                            // Validate base64 data before sending (now handles null returns)
                            if (base64Audio && base64Audio.length > 0) {
                                this.onAudioDataCallback(base64Audio);
                            } else {
                                console.warn('Failed to encode audio data to base64, skipping chunk');
                            }
                        }
                    } else if (type === 'error') {
                        console.error('AudioWorklet error:', error);
                    }
                } catch (error) {
                    console.error('Audio worklet message handling error:', error);
                }
            };

            // Connect source to worklet (no destination connection needed)
            source.connect(this.workletNode);
            
        } catch (error) {
            console.error('Failed to start audio processing:', error);
            throw error;
        }
    }

    startAudioLevelMonitoring(onAudioLevel) {
        if (!onAudioLevel || !this.analyserNode) return;

        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        
        const updateLevel = () => {
            if (!this.isProcessing || !this.analyserNode) return;
            
            this.analyserNode.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            const level = (average / 255) * 100;
            
            onAudioLevel(level);
            requestAnimationFrame(updateLevel);
        };
        
        updateLevel();
    }

    stopProcessing() {
        this.isProcessing = false;
        
        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode = null;
        }
        
        if (this.analyserNode) {
            this.analyserNode.disconnect();
            this.analyserNode = null;
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.onAudioDataCallback = null;
        this.onAudioLevelCallback = null;
    }

    // Helper method for base64 encoding (moved from AudioWorklet due to btoa unavailability)
    arrayBufferToBase64(buffer) {
        // Validate buffer before encoding
        if (!buffer || buffer.byteLength === 0) {
            console.warn('Empty or invalid buffer provided for base64 encoding');
            return null;
        }
        
        // Ensure buffer size is reasonable (not too large to cause memory issues)
        if (buffer.byteLength > 1024 * 1024) { // 1MB limit
            console.warn('Buffer too large for encoding:', buffer.byteLength);
            return null;
        }
        
        try {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        } catch (error) {
            console.error('Error encoding buffer to base64:', error);
            return null;
        }
    }

    // Get available audio input devices
    static async getAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'audioinput');
        } catch (error) {
            console.error('Failed to get audio devices:', error);
            return [];
        }
    }
}

module.exports = AudioProcessor;