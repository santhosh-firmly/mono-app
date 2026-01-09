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

// Start with auto-generated session ID
recorder.start();

// Or provide your own session ID for correlation
recorder.start('your-custom-session-id');

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
  appName: 'my-app',                                   // Optional: Application name for metadata
  
  // Batching (defaults shown)
  batchInterval: 10000,    // Flush every 10 seconds
  maxBatchSize: 512000,    // Max 500KB per batch
  maxEvents: 500,          // Max 500 events per batch
  
  // Privacy options
  maskAll: false,          // Mask ALL content (inputs, text, divs, everything)
  maskAllInputs: true,     // Mask all input fields by default (passwords, credit cards, etc.)
  maskSelector: '[data-sensitive], [data-sensitive] *',  // Single selector for both text and inputs
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

### Privacy Options Explained

- **`maskAll`**: When `true`, masks ALL content on the page (overrides all other masking options)
- **`maskAllInputs`**: When `true`, masks all `<input>`, `<textarea>`, and `<select>` elements by default
- **`maskSelector`**: CSS selector that masks both text content AND input values (applied to both `maskTextSelector` and `maskInputSelector` in rrweb)
- **`blockSelector`**: CSS selector for elements to completely exclude from recording (they appear as blank spaces)

## API

### `recorder.start([sessionId])`
Starts recording and returns the session ID.

**Parameters:**
- `sessionId` (optional): Custom session ID for correlation with your backend systems. If not provided, a unique ID is auto-generated.

**Returns:** `string | null` - The session ID if recording started, `null` if disabled.

**Example:**
```javascript
// Auto-generated session ID
const sessionId = recorder.start();

// Custom session ID (useful for correlating with your application's session)
const sessionId = recorder.start(window.firmly?.sessionId);
```

### `recorder.stop()`
Stops recording and sends final batch (async).

**Returns:** `Promise<void>`

## SvelteKit Example

```svelte
<script>
  import { onMount } from 'svelte';
  import { SessionRecorder } from '@firmly/session-recorder';

  let recorder;

  onMount(() => {
    recorder = new SessionRecorder({
      serviceUrl: import.meta.env.PUBLIC_DVR_SERVICE_URL,
      appName: 'dropin-service',
      enabled: import.meta.env.PROD,
      maskAllInputs: true,
      maskSelector: '[data-sensitive], [data-sensitive] *'
    });
    
    // Use your application's session ID for correlation
    recorder.start(window.firmly?.sessionId);
    
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
  "appName": "dropin-service",
  "events": [...],
  "finalize": true  // Only on last batch/chunk
}
```

**Payload Fields:**
- `sessionId`: Unique session identifier (auto-generated or custom)
- `appName`: Optional application name for backend identification
- `events`: Array of rrweb events
- `finalize`: Boolean flag indicating the final batch (only present when `true`)

## Debug Mode

```javascript
window.__FIRMLY_SESSION_RECORDER_DEBUG__ = true;
```

## License

UNLICENSED - Proprietary to Firmly
