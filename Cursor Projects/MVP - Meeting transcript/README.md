# Meeting Assistant MVP

Real-time multilingual meeting assistant with transcription and translation between English and Japanese.

## Features

- 🎤 Real-time audio transcription using Google Gemini Live API
- 🌐 Contextual translation (English ↔ Japanese)
- 🎯 Voice Activity Detection for sentence boundaries
- 💾 Local session storage and export
- 🖥️ Native desktop app for macOS

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get Google API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Enable Gemini API access

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Setup and test:**
   - Select your microphone
   - Enter your Google API key
   - Click "Start Session"
   - Speak naturally to see transcription and translation

## Development Phases

### ✅ Phase 1: Basic Structure (Current)
- Electron app setup
- UI with microphone access
- Audio level monitoring
- Simulated transcription for testing

### 🔄 Phase 2: Live API Integration (Next)
- Google Gemini Live API connection
- Real-time transcription
- Voice Activity Detection

### 📋 Phase 3: Translation Service
- Contextual translation with sentence buffer
- English ↔ Japanese language pair
- Context management

### 🎨 Phase 4: Polish & Features
- Session management
- Export functionality
- Error handling & recovery

## Testing

Currently in Phase 1 with simulated data. Run the app to test:
- UI responsiveness
- Microphone selection
- Audio level detection
- Message display and formatting

## API Requirements

- Google Gemini API key
- Enabled Gemini Live API access
- Internet connection for real-time processing

## Architecture

```
Frontend: Electron + HTML/CSS/JavaScript
Audio: Web Audio API for microphone capture
APIs: Google Gemini Live API + REST API
Storage: Local JSON files
```