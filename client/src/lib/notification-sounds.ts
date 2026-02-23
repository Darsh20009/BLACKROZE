/**
 * Notification Sound System
 * Generates distinct notification sounds using Web Audio API oscillators
 */

export type NotificationSoundType = 'newOrder' | 'onlineOrderVoice' | 'statusChange' | 'success' | 'alert';

/**
 * Create and play a single oscillator tone
 * @param frequency - Frequency in Hz
 * @param duration - Duration in milliseconds
 * @param volume - Volume level (0-1)
 * @param type - Oscillator type (sine, square, sawtooth, triangle)
 */
function createOscillatorTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;

      // Smooth fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);

      oscillator.onended = () => {
        audioCtx.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Play a sequence of tones
 * @param tones - Array of tone specifications with frequency, duration, and optional type
 * @param volume - Volume level (0-1)
 * @param gapMs - Gap between tones in milliseconds
 */
async function playToneSequence(
  tones: Array<{ freq: number; dur: number; type?: OscillatorType }>,
  volume: number,
  gapMs: number = 50
): Promise<void> {
  for (const tone of tones) {
    await createOscillatorTone(tone.freq, tone.dur, volume, tone.type || 'sine');
    if (gapMs > 0) {
      await new Promise(r => setTimeout(r, gapMs));
    }
  }
}

/**
 * Sound sequences for different notification types
 * Each sequence defines the frequency (Hz), duration (ms), and optional oscillator type
 */
const SOUND_SEQUENCES: Record<NotificationSoundType, Array<{ freq: number; dur: number; type?: OscillatorType }>> = {
  // Pleasant two-tone chime: C5 then E5 (200ms each)
  newOrder: [
    { freq: 523, dur: 200 },  // C5
    { freq: 659, dur: 200 },  // E5
  ],

  // Urgent three-tone ascending chime: C5, E5, G5 (150ms each with G5 extended)
  onlineOrderVoice: [
    { freq: 523, dur: 150 },  // C5
    { freq: 659, dur: 150 },  // E5
    { freq: 784, dur: 250 },  // G5
  ],

  // Short upward arpeggio: C5 then E5 (100ms and 150ms)
  success: [
    { freq: 523, dur: 100 },  // C5
    { freq: 659, dur: 150 },  // E5
  ],

  // Single gentle tone: A4 (300ms)
  statusChange: [
    { freq: 440, dur: 300 },  // A4
  ],

  // Rapid alternating tone pattern: A5, E5, A5 (100ms each, last one extended)
  alert: [
    { freq: 880, dur: 100 },  // A5
    { freq: 659, dur: 100 },  // E5
    { freq: 880, dur: 150 },  // A5
  ],
};

/**
 * Play a notification sound
 * @param type - Type of notification sound to play
 * @param volume - Volume level (0-1), default is 0.5
 */
export async function playNotificationSound(type: NotificationSoundType = 'newOrder', volume: number = 0.5): Promise<void> {
  // Only play sound if in employee/manager/admin path
  const employeePaths = ['/employee', '/manager', '/kitchen', '/pos', '/cashier', '/admin', '/owner', '/executive', '/0'];
  const currentPath = window.location.pathname;
  const isEmployeePath = employeePaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

  // CUSTOMER PATHS - No sound as per user request
  if (!isEmployeePath) {
    return;
  }

  try {
    // Check if Web Audio API is available
    if (typeof (window.AudioContext || (window as any).webkitAudioContext) === 'undefined') {
      console.debug('[SOUND] Web Audio API not available');
      return;
    }

    const sequence = SOUND_SEQUENCES[type];
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    // For onlineOrderVoice, play once
    if (type === 'onlineOrderVoice') {
      await playToneSequence(sequence, normalizedVolume);
      return;
    }

    // For newOrder, play twice with 500ms gap (ton ton effect)
    if (type === 'newOrder') {
      await playToneSequence(sequence, normalizedVolume);
      await new Promise(r => setTimeout(r, 500));
      await playToneSequence(sequence, normalizedVolume);
      return;
    }

    // For all other types, play once
    await playToneSequence(sequence, normalizedVolume);
  } catch (error) {
    console.debug('[SOUND] Failed to play notification sound:', error);
  }
}

/**
 * Play multiple notification sounds in sequence
 * @param types - Array of sound types to play
 * @param delayMs - Delay between sounds in milliseconds
 */
export async function playNotificationSequence(
  types: NotificationSoundType[],
  delayMs: number = 300
): Promise<void> {
  for (const type of types) {
    await playNotificationSound(type);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
