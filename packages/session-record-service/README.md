# Session Record Service

A session recording and replay service built with RRWeb, SvelteKit, and Cloudflare infrastructure.

## Overview

This service provides a complete solution for recording user sessions and replaying them for analysis. It uses RRWeb for lightweight DOM-based recording and stores data in Cloudflare R2 (for events) and KV (for metadata).

## Features

- **Session Recording**: Lightweight DOM-based recording using RRWeb
- **Cloud Storage**: Uses Cloudflare R2 for event data and KV for metadata
- **Session Replay**: Full-featured player with timeline controls
- **Dashboard UI**: View all recorded sessions with metadata
- **Privacy First**: Masks all input fields by default
- **Cross-Origin Support**: CORS enabled for integration with other services

## Technology Stack

- **Frontend**: Svelte 5, SvelteKit 2
- **UI Components**: Bits UI (headless components)
- **Styling**: Tailwind CSS v4
- **Recording**: RRWeb 2.0.0-alpha.17
- **Storage**: Cloudflare R2 + KV
- **Deployment**: Cloudflare Workers

## Installation

```bash
# From the monorepo root
npm install

# Or install for this package only
npm install --workspace session-record-service
```

## Development

```bash
# Start development server
npm run dev --workspace session-record-service

# Preview with Cloudflare Workers
npm run preview:cloudflare --workspace session-record-service
```

## Configuration

### Cloudflare Bindings

The service requires two Cloudflare bindings:

1. **SESSION_RECORDINGS** (R2 bucket): Stores full event data
2. **SESSION_METADATA** (KV namespace): Stores session metadata and list

These are configured in `wrangler.toml` for each environment (dev, ci, qa, uat, prod).

### Environment Setup

Before deploying, ensure you have:

1. Created R2 buckets for each environment:
   - `session-recordings-dev`
   - `session-recordings-ci`
   - `session-recordings-qa`
   - `session-recordings-uat`
   - `session-recordings-prod`

2. Created KV namespaces and updated their IDs in `wrangler.toml`

## API Endpoints

### POST /api/sessions

Save a new recording session.

**Request:**
```json
{
  "events": [...]  // Array of RRWeb events
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "message": "Session saved successfully"
}
```

### GET /api/sessions

List all recorded sessions.

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session_1234567890_abc123",
      "timestamp": 1234567890000,
      "duration": 45000,
      "eventCount": 250,
      "url": "https://example.com/page",
      "createdAt": "2025-01-11T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/sessions/[id]

Fetch a specific recording session.

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "events": [...],
  "metadata": {
    "sessionId": "session_1234567890_abc123",
    "timestamp": 1234567890000,
    "duration": 45000,
    "eventCount": 250,
    "url": "https://example.com/page",
    "createdAt": "2025-01-11T10:00:00.000Z"
  }
}
```

## Integration with Other Services

### dropin-service Integration

The dropin-service package includes a session recorder utility for easy integration:

```javascript
import { startRecording } from '$lib/utils/session-recorder.js';

// Start recording and send events to session-record-service
const stopRecording = startRecording('https://session-record-dev.firmly.com');

// Later, stop recording
stopRecording();
```

**Features:**
- Auto-batches events every 10 seconds
- Masks all input fields by default
- Sends final batch when stopped
- Privacy-focused configuration

## Deployment

Deploy to specific environments:

```bash
# Deploy to development
npm run deploy-dev --workspace session-record-service

# Deploy to production
npm run deploy-prod --workspace session-record-service
```

## Privacy & Security

- **Input Masking**: All input fields are masked by default
- **Block Classes**: Add `rrweb-block` class to prevent recording specific elements
- **Ignore Classes**: Add `rrweb-ignore` class to exclude elements from snapshots
- **CORS**: Configured to allow cross-origin requests (update in production)

## UI Components

### Dashboard (/)

- Lists all recorded sessions
- Shows metadata: date, duration, URL, event count
- Click to navigate to player

### Player (/player/[id])

- Full RRWeb player with controls
- Timeline scrubbing
- Play/pause, speed controls
- Session metadata display

## Architecture

```
Client (dropin-service)
  ↓ (RRWeb events via POST)
API Layer (SvelteKit)
  ↓
Storage Layer
  ├─→ R2 (event data)
  └─→ KV (metadata)
  
UI Layer (SvelteKit + Svelte 5)
  ├─→ Dashboard (list)
  └─→ Player (replay)
```

## Code Style

- JavaScript only (no TypeScript)
- Svelte 5 with runes ($state, $derived, $effect)
- Clean, readable code
- Minimal defensive programming
- Follows monorepo conventions

## License

Private - Part of the Firmly mono-app monorepo.
