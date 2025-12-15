# @firmly/session-recorder

Lightweight, GDPR-compliant session recorder based on [rrweb](https://github.com/rrweb-io/rrweb).

**Simple**: Minimal core code, focused on essentials  
**Privacy-First**: All inputs masked by default  
**Smart Batching**: Automatic batching with intelligent chunking

## Installation

```bash
npm install @firmly/session-recorder
```

## Quick Start

```javascript
import { SessionRecorder } from '@firmly/session-recorder';

const recorder = new SessionRecorder({
  serviceUrl: 'https://dvr.firmly-dev.workers.dev'
});

recorder.start();
await recorder.stop();
```

## Configuration

```javascript
const recorder = new SessionRecorder({
  serviceUrl: 'https://dvr.firmly-dev.workers.dev',  // Required
  enabled: true,                                       // Default: true
  
  // Batching (defaults shown)
  batchInterval: 10000,    // Flush every 10 seconds
  maxBatchSize: 512000,    // Max 500KB per batch
  maxEvents: 500,          // Max 500 events per batch
  
  // Privacy (defaults: all inputs masked)
  maskAllInputs: true,
  
  // Sampling (defaults shown)
  sampling: {
    mousemove: false,      // Disabled (saves 60-80% events!)
    scroll: 150,           // Throttle to 150ms
    input: 'last'          // Only capture final value
  },
  
  // Callbacks
  onError: (error) => console.error(error),
  onBatchSent: (sessionId, eventCount, bytes) => {}
});
```

## API

### `recorder.start()`
Starts recording, returns session ID.

### `recorder.stop()`
Stops recording and sends final batch (async).

### `recorder.getStatus()`
Returns `{ isRecording, sessionId, batchStats }`.

## SvelteKit Example

```svelte
<script>
  import { onMount } from 'svelte';
  import { SessionRecorder } from '@firmly/session-recorder';

  let recorder;

  onMount(() => {
    recorder = new SessionRecorder({
      serviceUrl: import.meta.env.PUBLIC_DVR_SERVICE_URL,
      enabled: import.meta.env.PROD
    });
    recorder.start();
    return () => recorder?.stop();
  });
</script>
```

## How It Works

### Batching Strategy
Events are flushed when **any** condition is met:
- **Time**: 10 seconds elapsed
- **Size**: 500KB reached
- **Count**: 500 events accumulated

### Page Unload Handling
When the user closes the tab or navigates away:
- All pending events are flushed immediately
- Events are automatically split into multiple chunks (each < 64KB)
- Each chunk is sent via `sendBeacon` for reliable delivery
- Only the last chunk is marked with `finalize: true`
- **No data loss** even with large accumulated buffers

The recorder listens to both `visibilitychange` and `pagehide` events to catch all scenarios where the page might be closed.

## Payload Format

```json
{
  "sessionId": "session_1234567890_abc",
  "events": [...],
  "finalize": true  // Only on last batch/chunk
}
```

## Debug Mode

```javascript
window.__FIRMLY_SESSION_RECORDER_DEBUG__ = true;
```

## License

UNLICENSED - Proprietary to Firmly
