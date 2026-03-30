export const CHANNEL_NAME = 'profilemanager-tabs';

export function broadcast(event: string, data?: any) {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ event, data });
    channel.close();
  } catch (error) {
    console.warn('BroadcastChannel no soportado:', error);
  }
}

export function listenSessionChanges(callback: (event: string, data?: any) => void) {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', (e) => {
      callback(e.data.event, e.data.data);
    });
    return () => channel.close();
  } catch (error) {
    console.warn('BroadcastChannel no soportado:', error);
    return () => {};
  }
}

