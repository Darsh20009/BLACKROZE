/**
 * Notification Sound System
 * Uses Web Speech API for voice announcements + Web Audio API as fallback
 * Requires user interaction before first sound plays
 */

export type NotificationSoundType = 'newOrder' | 'onlineOrderVoice' | 'statusChange' | 'success' | 'alert';

// Shared AudioContext singleton - browsers block new contexts until user interaction
let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      sharedAudioCtx = new AudioCtxClass();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Must be called on a user interaction event (click/touch/keydown)
 * Unlocks audio playback in the browser
 */
export function unlockAudio(): void {
  if (audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      audioUnlocked = true;
      console.debug('[SOUND] Audio context unlocked');
    }).catch(() => {});
  } else {
    audioUnlocked = true;
  }
}

async function ensureAudioReady(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
      audioUnlocked = true;
    } catch {
      return null;
    }
  }

  if (ctx.state !== 'running') return null;
  return ctx;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

const SEQUENCES: Record<NotificationSoundType, Array<{ freq: number; dur: number; gap?: number; type?: OscillatorType }>> = {
  onlineOrderVoice: [
    { freq: 523, dur: 0.18 },
    { freq: 659, dur: 0.18, gap: 0.05 },
    { freq: 784, dur: 0.30, gap: 0.05 },
  ],
  newOrder: [
    { freq: 523, dur: 0.20 },
    { freq: 659, dur: 0.20, gap: 0.05 },
  ],
  success: [
    { freq: 523, dur: 0.12 },
    { freq: 659, dur: 0.18, gap: 0.04 },
  ],
  statusChange: [
    { freq: 440, dur: 0.30 },
  ],
  alert: [
    { freq: 880, dur: 0.12 },
    { freq: 659, dur: 0.12, gap: 0.03 },
    { freq: 880, dur: 0.20, gap: 0.03 },
  ],
};

function scheduleSequence(ctx: AudioContext, tones: typeof SEQUENCES[NotificationSoundType], volume: number, startAt: number): number {
  let t = startAt;
  for (const tone of tones) {
    playTone(ctx, tone.freq, t, tone.dur, volume, tone.type || 'sine');
    t += tone.dur + (tone.gap ?? 0.04);
  }
  return t;
}

/**
 * Speak "طلب جديد - new order" using Web Speech API
 */
function speakNewOrder(isOnline = false): void {
  try {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const text = isOnline
      ? 'طلب جديد أونلاين - new online order'
      : 'طلب جديد - new order';

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
    // Silently fail if speech synthesis not available
  }
}

/**
 * Play a notification sound
 */
export async function playNotificationSound(type: NotificationSoundType = 'newOrder', volume: number = 0.8): Promise<void> {
  const employeePaths = ['/employee', '/manager', '/kitchen', '/pos', '/cashier', '/admin', '/owner', '/executive', '/0'];
  const currentPath = window.location.pathname;
  const isEmployeePath = employeePaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
  if (!isEmployeePath) return;

  // Use speech synthesis for new order notifications
  if (type === 'newOrder' || type === 'onlineOrderVoice') {
    speakNewOrder(type === 'onlineOrderVoice');
  }

  // Also play the beep chime as audio cue
  const ctx = await ensureAudioReady();
  if (!ctx) {
    console.debug('[SOUND] Audio context not ready - user must interact with page first');
    return;
  }

  const sequence = SEQUENCES[type];
  const vol = Math.max(0.01, Math.min(1, volume));
  const now = ctx.currentTime + 0.05;

  if (type === 'onlineOrderVoice' || type === 'newOrder') {
    const end1 = scheduleSequence(ctx, sequence, vol, now);
    scheduleSequence(ctx, sequence, vol, end1 + 0.3);
  } else {
    scheduleSequence(ctx, sequence, vol, now);
  }
}

export async function playNotificationSequence(types: NotificationSoundType[], delayMs: number = 300): Promise<void> {
  for (const type of types) {
    await playNotificationSound(type);
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }
}
