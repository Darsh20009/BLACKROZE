/**
 * Notification Sound System
 * Primary: Web Audio API (AudioContext) — unlocked once on user gesture, plays anytime after
 * Fallback: Oscillator beep if mp3 fails to load
 * Secondary: Web Speech API for Arabic voice announcements
 *
 * IMPORTANT: Browsers block audio until the user has interacted with the page.
 * Call unlockAudio() inside any user click/touch/keydown handler to allow sound.
 */

export type NotificationSoundType = 'newOrder' | 'onlineOrderVoice' | 'statusChange' | 'success' | 'alert' | 'cashierOrder';

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let bufferLoadAttempted = false;
let _audioUnlocked = false;
let _soundEnabled = true;

// ─── AudioContext management ──────────────────────────────────────────────────

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
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.debug('[SOUND] Audio buffer loaded from mp3');
  } catch (e) {
    console.debug('[SOUND] mp3 load failed, will use beep fallback:', e);
    bufferLoadAttempted = true; // Don't retry on failure
  }
}

/**
 * Must be called inside a user interaction event (click/touch/keydown).
 * Resumes the AudioContext so future playbacks work without a gesture.
 * Sets _audioUnlocked = true so UI can reflect the state.
 */
export async function unlockAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    _audioUnlocked = ctx.state === 'running';
    ensureAudioBuffer();
    if (_audioUnlocked) {
      console.debug('[SOUND] AudioContext unlocked, state:', ctx.state);
    }
  } catch (e) {
    console.warn('[SOUND] unlockAudio failed:', e);
  }
}

/** Alias kept for compatibility */
export async function initAudioUnlock(): Promise<void> {
  await unlockAudio();
}

export function isAudioUnlocked(): boolean {
  // Re-check from actual AudioContext state each time
  if (audioCtx && audioCtx.state === 'running') {
    _audioUnlocked = true;
  }
  return _audioUnlocked;
}

// ─── Sound Enabled state ──────────────────────────────────────────────────────

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

// ─── Beep patterns (oscillator-based, no file dependency) ────────────────────

function playBeepPattern(ctx: AudioContext, type: NotificationSoundType): void {
  const now = ctx.currentTime;

  const beep = (startTime: number, freq: number, duration: number, vol: number) => {
    try {
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
    } catch (e) {
      console.warn('[SOUND] beep failed:', e);
    }
  };

  switch (type) {
    case 'newOrder':
    case 'cashierOrder':
      beep(now,        880, 0.18, 0.4);
      beep(now + 0.22, 660, 0.18, 0.4);
      beep(now + 0.44, 880, 0.20, 0.4);
      break;
    case 'onlineOrderVoice':
      beep(now,        1000, 0.15, 0.45);
      beep(now + 0.20, 800,  0.15, 0.45);
      beep(now + 0.40, 1000, 0.15, 0.45);
      beep(now + 0.60, 800,  0.15, 0.45);
      break;
    case 'success':
      beep(now,        600, 0.15, 0.3);
      beep(now + 0.18, 900, 0.20, 0.3);
      break;
    case 'alert':
      beep(now,        400, 0.25, 0.4);
      beep(now + 0.30, 400, 0.25, 0.4);
      break;
    case 'statusChange':
      beep(now, 700, 0.15, 0.3);
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

// ─── Speech synthesis (Arabic voice) ─────────────────────────────────────────

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
      // Speech synthesis not available, silent fail
    }
  }, 50);
}

// ─── Core playback ────────────────────────────────────────────────────────────

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

/**
 * Internal core function — actually plays the sound without any path restriction.
 * Tries to resume AudioContext if suspended.
 */
async function playCore(type: NotificationSoundType, volume: number): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) {
    console.debug('[SOUND] No AudioContext available');
    return;
  }

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
      _audioUnlocked = ctx.state === 'running';
      console.debug('[SOUND] AudioContext resumed from suspended, state:', ctx.state);
    } catch (e) {
      console.warn('[SOUND] Cannot resume AudioContext (needs user gesture first):', e);
      return;
    }
  }

  if (ctx.state !== 'running') {
    console.warn('[SOUND] AudioContext not running, state:', ctx.state);
    return;
  }

  _audioUnlocked = true;

  if (audioBuffer) {
    playFromBuffer(ctx, volume);
  } else {
    playBeepPattern(ctx, type);
    if (!bufferLoadAttempted) {
      ensureAudioBuffer();
    }
  }
}

/**
 * Play a notification sound. Checks ALLOWED_PATHS to avoid playing on unintended pages.
 * Checks _soundEnabled flag.
 */
export async function playNotificationSound(
  type: NotificationSoundType = 'newOrder',
  volume?: number
): Promise<void> {
  if (!_soundEnabled) return;

  const currentPath = window.location.pathname;
  const allowed = ALLOWED_PATHS.some(p => currentPath === p || currentPath.startsWith(p + '/'));
  if (!allowed) return;

  const vol = volume ?? SOUND_VOLUMES[type];
  await playCore(type, vol);

  if (type === 'newOrder' || type === 'onlineOrderVoice') {
    speakNewOrder(type === 'onlineOrderVoice');
  }
}

/**
 * Test a sound — bypasses ALLOWED_PATHS restriction.
 * Use this from settings/test buttons on any page.
 */
export async function testSound(type: NotificationSoundType = 'success', volume?: number): Promise<void> {
  const vol = volume ?? SOUND_VOLUMES[type];
  await playCore(type, vol);
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
