/**
 * Notification Sound System
 * Primary: HTML5 Audio element (mp3) — simple and reliable
 * Secondary: Web Speech API for voice announcements
 */

export type NotificationSoundType = 'newOrder' | 'onlineOrderVoice' | 'statusChange' | 'success' | 'alert' | 'cashierOrder';

let audioUnlocked = false;
let audioPool: HTMLAudioElement[] = [];
const POOL_SIZE = 3;

function buildAudioPool(): void {
  if (audioPool.length > 0) return;
  for (let i = 0; i < POOL_SIZE; i++) {
    const el = new Audio('/notification-sound.mp3');
    el.preload = 'auto';
    el.volume = 0.8;
    audioPool.push(el);
  }
}

function getPoolAudio(): HTMLAudioElement | null {
  for (const el of audioPool) {
    if (el.paused || el.ended || el.currentTime === 0) {
      return el;
    }
  }
  return audioPool[0] || null;
}

/**
 * Must be called on a user interaction event (click/touch/keydown)
 * Warms up the audio pipeline so future plays work without gesture
 */
export function unlockAudio(): void {
  if (audioUnlocked) return;
  try {
    buildAudioPool();
    const el = audioPool[0];
    if (!el) return;
    el.volume = 0;
    const p = el.play();
    if (p) {
      p.then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = 0.8;
        audioUnlocked = true;
        console.debug('[SOUND] Audio unlocked');
      }).catch(() => {
        audioUnlocked = true;
      });
    }
  } catch {
    audioUnlocked = true;
  }
}

function speakNewOrder(isOnline = false): void {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = isOnline
      ? 'طلب جديد أونلاين'
      : 'طلب جديد';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // silently fail
  }
}

const SOUND_VOLUMES: Record<NotificationSoundType, number> = {
  newOrder: 0.9,
  onlineOrderVoice: 1.0,
  cashierOrder: 0.9,
  success: 0.6,
  statusChange: 0.5,
  alert: 0.8,
};

const SOUND_REPEAT: Record<NotificationSoundType, number> = {
  newOrder: 2,
  onlineOrderVoice: 2,
  cashierOrder: 2,
  success: 1,
  statusChange: 1,
  alert: 1,
};

export async function playNotificationSound(type: NotificationSoundType = 'newOrder', volume?: number): Promise<void> {
  const soundAllowedPaths = [
    '/employee/orders',
    '/employee/orders-display',
    '/employee/cashier',
    '/employee/pos',
    '/employee/kitchen',
    '/employee/table-orders',
  ];
  const currentPath = window.location.pathname;
  const isAllowedPath = soundAllowedPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
  if (!isAllowedPath) return;

  if (type === 'newOrder' || type === 'onlineOrderVoice') {
    speakNewOrder(type === 'onlineOrderVoice');
  }

  buildAudioPool();

  const vol = volume ?? SOUND_VOLUMES[type];
  const repeats = SOUND_REPEAT[type];

  const playOnce = async () => {
    const el = getPoolAudio();
    if (!el) return;
    try {
      el.currentTime = 0;
      el.volume = Math.max(0.01, Math.min(1, vol));
      await el.play();
    } catch (err) {
      console.warn('[SOUND] Play failed:', err);
    }
  };

  await playOnce();
  if (repeats > 1) {
    await new Promise<void>(resolve => setTimeout(resolve, 600));
    await playOnce();
  }
}

export async function playNotificationSequence(types: NotificationSoundType[], delayMs: number = 300): Promise<void> {
  for (const type of types) {
    await playNotificationSound(type);
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }
}
