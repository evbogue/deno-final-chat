export const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host)

