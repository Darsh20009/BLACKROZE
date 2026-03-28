/**
 * Notification Sound System
 * Primary: Web Audio API (AudioContext) — unlocked once, plays anytime after
 * Fallback: Oscillator beep if mp3 fails to load
 * Secondary: Web Speech API for Arabic voice announcements
 */

export type NotificationSoundType = 'newOrder' | 'onlineOrderVoice' | 'statusChange' | 'success' | 'alert' | 'cashierOrder';

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let bufferLoadAttempted = false;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

async function ensureAudioBuffer(): Promise<void> {
  if (bufferLoadAttempted) return;
  bufferLoadAttempted = true;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const response = await fetch('/notification-sound.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.debug('[SOUND] Audio buffer loaded from mp3');
  } catch (e) {
    console.debug('[SOUND] mp3 load failed, will use beep fallback:', e);
  }
}

/**
 * Must be called on a user interaction event (click/touch/keydown).
 * Unlocks the AudioContext so future plays work without gesture.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const resume = () => {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    ensureAudioBuffer();
  };
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      ensureAudioBuffer();
      console.debug('[SOUND] AudioContext unlocked');
    }).catch(resume);
  } else {
    ensureAudioBuffer();
    console.debug('[SOUND] AudioContext already running');
  }
}

function playBeepPattern(ctx: AudioContext, type: NotificationSoundType): void {
  const now = ctx.currentTime;

  const beep = (startTime: number, freq: number, duration: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  switch (type) {
    case 'newOrder':
    case 'cashierOrder':
      beep(now,       880, 0.18, 0.35);
      beep(now + 0.22, 660, 0.18, 0.35);
      beep(now + 0.44, 880, 0.18, 0.35);
      break;
    case 'onlineOrderVoice':
      beep(now,       1000, 0.15, 0.40);
      beep(now + 0.20, 800,  0.15, 0.40);
      beep(now + 0.40, 1000, 0.15, 0.40);
      beep(now + 0.60, 800,  0.15, 0.40);
      break;
    case 'success':
      beep(now,       600, 0.15, 0.25);
      beep(now + 0.18, 900, 0.20, 0.25);
      break;
    case 'alert':
      beep(now,       400, 0.25, 0.35);
      beep(now + 0.30, 400, 0.25, 0.35);
      break;
    case 'statusChange':
      beep(now, 700, 0.15, 0.25);
      break;
  }
}

function playFromBuffer(ctx: AudioContext, volume: number): void {
  if (!audioBuffer) return;
  try {
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    source.buffer = audioBuffer;
    gainNode.gain.value = Math.max(0.01, Math.min(1, volume));
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.warn('[SOUND] Buffer play failed:', e);
  }
}

function speakNewOrder(isOnline = false): void {
  setTimeout(() => {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const text = isOnline ? 'طلب جديد أونلاين' : 'طلب جديد';
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
    }
  }, 50);
}

const ALLOWED_PATHS = [
  '/employee/orders',
  '/employee/orders-display',
  '/employee/cashier',
  '/employee/pos',
  '/employee/kitchen',
  '/employee/table-orders',
];

const SOUND_VOLUMES: Record<NotificationSoundType, number> = {
  newOrder: 0.9,
  onlineOrderVoice: 1.0,
  cashierOrder: 0.9,
  success: 0.6,
  statusChange: 0.5,
  alert: 0.8,
};

export async function playNotificationSound(
  type: NotificationSoundType = 'newOrder',
  volume?: number
): Promise<void> {
  const currentPath = window.location.pathname;
  const allowed = ALLOWED_PATHS.some(p => currentPath === p || currentPath.startsWith(p + '/'));
  if (!allowed) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  const vol = volume ?? SOUND_VOLUMES[type];

  if (audioBuffer) {
    playFromBuffer(ctx, vol);
  } else {
    playBeepPattern(ctx, type);
    if (!bufferLoadAttempted) {
      ensureAudioBuffer();
    }
  }

  if (type === 'newOrder' || type === 'onlineOrderVoice') {
    speakNewOrder(type === 'onlineOrderVoice');
  }
}

export async function playNotificationSequence(
  types: NotificationSoundType[],
  delayMs = 300
): Promise<void> {
  for (const type of types) {
    await playNotificationSound(type);
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }
}

let _soundEnabled = true;
let _audioUnlocked = false;

export function isAudioUnlocked(): boolean {
  return _audioUnlocked;
}

export async function initAudioUnlock(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx) {
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      _audioUnlocked = true;
    } catch { _audioUnlocked = false; }
  }
}

export function getSoundEnabled(): boolean {
  return _soundEnabled;
}

export function setSoundEnabled(keyOrEnabled: string | boolean, value?: boolean): void {
  if (typeof keyOrEnabled === 'boolean') {
    _soundEnabled = keyOrEnabled;
  } else if (typeof value === 'boolean') {
    _soundEnabled = value;
  }
}

export async function testSound(type: NotificationSoundType = 'success', volume?: number): Promise<void> {
  await playNotificationSound(type, volume);
}
