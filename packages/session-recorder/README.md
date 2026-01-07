# @firmly/session-recorder

Lightweight, privacy-first session recorder based on [rrweb](https://github.com/rrweb-io/rrweb).

**Simple**: Minimal core code, focused on essentials  
**Privacy-First**: Attribute-based masking with `data-sensitive`  
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

## Privacy-First Design

You have two options for masking sensitive data:

### Option 1: Mask Everything (maximum privacy)

Set `maskAll: true` to mask ALL content on the page (inputs, text, divs, paragraphs, buttons, everything):

```javascript
const recorder = new SessionRecorder({
  serviceUrl: 'https://dvr.firmly-dev.workers.dev',
  maskAll: true  // All content replaced with asterisks
});
```

### Option 2: Selective Masking with `data-sensitive`

Use the `data-sensitive` attribute to mask specific elements:

```html
<!-- Input will be masked -->
<input type="text" data-sensitive />

<!-- Entire div and all children will be masked -->
<div data-sensitive>
  <p>This text will be masked</p>
  <input type="email" />
</div>

<!-- Regular elements are NOT masked (unless maskAll: true) -->
<input type="text" />
<p>This text is visible in recordings</p>
```

### Combining Both Options

You can combine `maskAll` with `data-sensitive` (though `maskAll` already masks everything):

```javascript
const recorder = new SessionRecorder({
  serviceUrl: 'https://dvr.firmly-dev.workers.dev',
  maskAll: true  // Masks everything (inputs, text, all content)
});
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
  
  // Privacy options
  maskAll: false,          // Mask ALL content (inputs, text, divs, everything)
  maskTextSelector: '[data-sensitive], [data-sensitive] *',  // Mask specific elements
  blockSelector: null,     // Optional: completely block elements from recording
  
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
