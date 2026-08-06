/**
 * Generates or retrieves a persistent Device UUID and browser fingerprint.
 */
export function getDeviceId(): string {
  const STORAGE_KEY = 'kt_voter_device_uuid_v1';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}

export async function getFingerprintHash(): Promise<string> {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    
    // Canvas fingerprinting signature
    let canvasHash = '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('KarangTarunaVote2026', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('KarangTarunaVote2026', 4, 17);
        canvasHash = canvas.toDataURL().slice(-50);
      }
    } catch {
      canvasHash = 'no_canvas';
    }

    const rawData = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      `${screen.width}x${screen.height}`,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 'unknown',
      canvasHash,
    ].join('||');

    // Simple hash algorithm (FNV-1a / DJB2 string hash)
    let hash = 5381;
    for (let i = 0; i < rawData.length; i++) {
      hash = (hash * 33) ^ rawData.charCodeAt(i);
    }
    const positiveHash = (hash >>> 0).toString(16);
    return `fp_${positiveHash}_${screen.width}x${screen.height}`;
  } catch (err) {
    console.error('Error generating fingerprint hash:', err);
    return `fp_fallback_${Date.now()}`;
  }
}
