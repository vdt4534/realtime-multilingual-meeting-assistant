// Modern AudioWorkletProcessor for real-time audio processing
// Replaces deprecated ScriptProcessorNode

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.sampleRate = 16000;
        this.audioBuffer = [];
        this.bufferThreshold = 2048; // Minimum samples before sending
        this.silenceThreshold = 0.01; // Minimum audio level to consider non-silent
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        
        if (input && input[0] && input[0].length > 0) {
            const inputData = input[0]; // First channel
            
            try {
                // Check if audio has meaningful content (not just silence)
                let hasAudio = false;
                for (let i = 0; i < inputData.length; i++) {
                    if (Math.abs(inputData[i]) > this.silenceThreshold) {
                        hasAudio = true;
                        break;
                    }
                }

                // Convert float32 to int16 PCM (required by Gemini Live API)
                const int16Array = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // Clamp and scale to 16-bit range
                    const sample = Math.max(-1, Math.min(1, inputData[i]));
                    int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                }

                // Add to buffer
                this.audioBuffer.push(...int16Array);

                // Send buffer when it reaches threshold OR when there's meaningful audio
                if (this.audioBuffer.length >= this.bufferThreshold || (hasAudio && this.audioBuffer.length >= 512)) {
                    // Create ArrayBuffer from accumulated samples\n                    // Ensure proper 16-bit PCM format for Gemini Live API
                    const combinedArray = new Int16Array(this.audioBuffer);
                    const buffer = new ArrayBuffer(combinedArray.length * 2);
                    const view = new DataView(buffer);
                    
                    for (let i = 0; i < combinedArray.length; i++) {
                        view.setInt16(i * 2, combinedArray[i], true); // little endian
                    }

                    // Only send if buffer has meaningful size
                    if (buffer.byteLength > 0) {
                        this.port.postMessage({
                            type: 'audioData',
                            data: buffer
                        });
                    }

                    // Clear buffer
                    this.audioBuffer = [];
                }
                
            } catch (error) {
                this.port.postMessage({
                    type: 'error',
                    error: error.message
                });
            }
        }

        return true; // Keep the processor alive
    }
}

registerProcessor('audio-processor', AudioProcessor);