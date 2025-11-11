# Session Recording Integration Guide

This guide shows how to integrate session recording into your application.

## Quick Start

### 1. Add RRWeb to Your Package

The `dropin-service` package already has `rrweb` installed. For other packages, add:

```bash
npm install rrweb@^2.0.0-alpha.17 --workspace your-package-name
```

### 2. Use the Session Recorder Utility

```javascript
import { startRecording, isRecording } from '$lib/utils/session-recorder.js';

// Start recording
const stopRecording = startRecording('https://session-record-dev.firmly.com');

// Stop recording when needed
stopRecording();

// Check if currently recording
if (isRecording()) {
  console.log('Recording in progress');
}
```

## Configuration Options

The session recorder is pre-configured with sensible defaults:

- **Auto-batching**: Events are sent every 10 seconds
- **Privacy First**: All input fields are masked
- **Checkpoint Snapshots**: Full snapshot every 100 events
- **Block Classes**: Use `rrweb-block` to prevent recording
- **Ignore Classes**: Use `rrweb-ignore` to exclude elements

## Example: Basic Integration

```svelte
<script>
  import { startRecording } from '$lib/utils/session-recorder.js';
  
  let stopFn = null;
  
  function startSession() {
    stopFn = startRecording('https://session-record-dev.firmly.com');
  }
  
  function endSession() {
    if (stopFn) {
      stopFn();
      stopFn = null;
    }
  }
</script>

<button onclick={startSession}>Start Recording</button>
<button onclick={endSession}>Stop Recording</button>
```

## Example: Automatic Recording

Record sessions automatically when users perform specific actions:

```javascript
import { startRecording } from '$lib/utils/session-recorder.js';

// Start recording on page load
let stopRecording = null;

if (typeof window !== 'undefined') {
  stopRecording = startRecording('https://session-record-dev.firmly.com');
  
  // Stop on page unload
  window.addEventListener('beforeunload', () => {
    if (stopRecording) {
      stopRecording();
    }
  });
}
```

## Example: Conditional Recording

Only record sessions for specific users or conditions:

```javascript
import { startRecording } from '$lib/utils/session-recorder.js';

function initRecording(user) {
  if (user.enableRecording || user.isTestUser) {
    const stopFn = startRecording('https://session-record-dev.firmly.com');
    return stopFn;
  }
  return null;
}
```

## Privacy Best Practices

### 1. Mask Sensitive Fields

All inputs are masked by default, but you can add extra protection:

```html
<!-- This input will be masked -->
<input type="text" placeholder="Email" />

<!-- Extra protection with ignore class -->
<input type="password" class="rrweb-ignore" placeholder="Password" />
```

### 2. Block Entire Sections

Prevent recording of sensitive areas:

```html
<div class="rrweb-block">
  <!-- Nothing in this div will be recorded -->
  <p>Credit card: 1234-5678-9012-3456</p>
</div>
```

### 3. Disable Recording for Specific Pages

```javascript
import { isRecording } from '$lib/utils/session-recorder.js';

// In your layout or page component
$effect(() => {
  if ($page.url.pathname.includes('/admin') && isRecording()) {
    // Stop recording on admin pages
    stopRecording?.();
  }
});
```

## Environment-Specific URLs

Use different service URLs per environment:

```javascript
const SESSION_SERVICE_URLS = {
  dev: 'https://session-record-dev.firmly.com',
  ci: 'https://session-record-ci.firmly.com',
  qa: 'https://session-record-qa.firmly.com',
  uat: 'https://session-record-uat.firmly.com',
  prod: 'https://session-record.firmly.com'
};

const serviceUrl = SESSION_SERVICE_URLS[import.meta.env.MODE] || SESSION_SERVICE_URLS.dev;
const stopFn = startRecording(serviceUrl);
```

## Viewing Recordings

1. Navigate to the session-record-service dashboard:
   - Dev: https://session-record-dev.firmly.com
   - Prod: https://session-record.firmly.com

2. Browse the session list with metadata

3. Click any session to view the replay

## API Reference

### startRecording(serviceUrl)

Starts recording the current session.

**Parameters:**
- `serviceUrl` (string): The base URL of the session-record-service

**Returns:**
- Function: Call this function to stop recording

**Example:**
```javascript
const stopFn = startRecording('https://session-record-dev.firmly.com');
// Later...
stopFn();
```

### isRecording()

Check if a recording is currently in progress.

**Returns:**
- Boolean: `true` if recording, `false` otherwise

**Example:**
```javascript
if (isRecording()) {
  console.log('Session is being recorded');
}
```

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify the service URL is correct
3. Ensure CORS is enabled (it should be by default)
4. Check network tab for failed POST requests

### Recording Performance Issues

1. Reduce checkpoint frequency (default: 100 events)
2. Increase batch send interval (default: 10 seconds)
3. Use block/ignore classes for heavy DOM elements

### Storage Limits

- Each recording is stored in R2 (no practical size limit)
- Metadata is stored in KV (keep session list under 1000 items)
- Oldest sessions are automatically removed from the list

## Advanced Configuration

### Custom Recording Options

Modify `session-recorder.js` to customize:

```javascript
stopRecording = record({
  emit(event) {
    events.push(event);
  },
  checkoutEveryNth: 200,        // Full snapshot every 200 events
  maskAllInputs: true,          // Privacy protection
  maskTextSelector: '.sensitive', // Extra masking
  blockClass: 'rrweb-block',    // Block class
  ignoreClass: 'rrweb-ignore',  // Ignore class
  sampling: {
    mousemove: false,           // Don't record mouse movements
    mouseInteraction: true,     // Record clicks
    scroll: 150,                // Throttle scroll events
    input: 'last'               // Only record last input
  }
});
```

## Support

For issues or questions, refer to:
- [RRWeb Documentation](https://github.com/rrweb-io/rrweb/blob/master/guide.md)
- Package README: `packages/session-record-service/README.md`
- Monorepo Documentation: `CLAUDE.md`
