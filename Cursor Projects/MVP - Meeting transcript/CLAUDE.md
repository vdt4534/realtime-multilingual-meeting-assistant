# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a Real-Time Multilingual Meeting Assistant desktop application built with Electron that provides seamless real-time transcription and contextual translation during bilingual meetings.

**Current State:** Phase 2 implementation with Gemini Live API for real-time transcription and contextual translation between English and Japanese.

**Important API Details:**
- Uses the correct Gemini Live API format with `audio` parameter (not `media`) for sendRealtimeInput calls
- Audio format: 16-bit PCM, 16kHz, mono, little-endian
- MIME type: "audio/pcm;rate=16000"

## Development Commands

```bash
# Development
npm run dev          # Start Electron app with DevTools
npm start           # Start Electron app in production mode

# Building
npm run build       # Build distributable packages
npm install         # Install dependencies

# Testing
npm test           # Currently returns placeholder - no tests implemented yet
```

## Architecture

**Electron App Structure:**
- `src/main.js` - Electron main process with IPC handlers for API key management
- `src/renderer.js` - Main application logic and UI controller (MeetingAssistant class)
- `src/index.html` - UI layout with microphone selection, API key input, and conversation display

**Core Services (src/services/):**
- `audioProcessor.js` - Web Audio API processing optimized for Gemini Live API (16-bit PCM, 16kHz)
- `geminiLiveService.js` - Google Gemini Live API WebSocket integration for real-time transcription and translation
- `translationService.js` - Legacy Gemini 1.5 Flash API (kept for reference)
- `speechService.js` - Legacy Web Speech API (kept for reference)

**Audio Pipeline:**
- AudioProcessor captures microphone audio and converts to 16-bit PCM format
- Real-time audio streaming to Gemini Live API via WebSocket
- Gemini Live handles both transcription and contextual translation
- Context buffer maintains conversation history for better translation accuracy

**Data Flow:**
- Local-first: conversations stored in memory and exportable as JSON
- No persistent storage - sessions cleared on app restart
- API key can be stored in .env file and loaded via IPC

## Current Implementation Details

**Phase 2 Status (Current):**
- ✅ Gemini Live API WebSocket integration
- ✅ Real-time audio streaming (16-bit PCM, 16kHz)
- ✅ Input audio transcription via Gemini Live
- ✅ Contextual translation with conversation buffer
- ✅ Audio level monitoring and microphone selection
- ✅ Session export functionality
- ✅ Real-time UI updates

**Speech Recognition:**
- Uses Google Gemini Live API for real-time transcription
- WebSocket connection for low-latency streaming
- Automatic voice activity detection
- Superior accuracy compared to Web Speech API

**Translation Logic:**
- Automatic translation trigger on sentence completion
- Maintains 3-sentence context buffer for accuracy
- Uses same Gemini Live session for both transcription and translation
- Contextual awareness for better translation quality

## API Configuration

**Required Environment Variables:**
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

**API Endpoints Used:**
- Google Gemini Live API: WebSocket connection via `@google/genai` package
- Model: `gemini-2.0-flash-live-001`
- Get API key from: https://makersuite.google.com/app/apikey

## Future Development Phases

**Phase 3 - Enhanced Translation:**
- Bidirectional language detection and translation
- Additional language pairs beyond English ↔ Japanese
- Language auto-detection

**Phase 4 - Polish & Features:**
- Persistent session management
- Advanced export formats (PDF, DOCX, SRT)
- Enhanced error handling and recovery
- Speaker identification
- Meeting templates and customization