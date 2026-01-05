// Live reload using Server-Sent Events
const events = new EventSource('/events');

events.onopen = () => {
  console.log('[Live Reload] Connected');
};

events.onmessage = (event) => {
  if (event.data === 'reload') {
    console.log('[Live Reload] Reloading page...');
    location.reload();
  }
};

events.onerror = () => {
  console.warn('[Live Reload] Connection lost, reconnecting...');
  // EventSource will automatically reconnect
};

// Cleanup on page unload to close connection gracefully
window.addEventListener('beforeunload', () => {
  events.close();
});
