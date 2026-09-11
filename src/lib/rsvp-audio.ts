function createAudioContext() {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Ctor) {
    throw new Error("Web Audio is not available");
  }

  try {
    return new Ctor({ latencyHint: "interactive" });
  } catch {
    return new Ctor();
  }
}

class RSVPSynth {
  private context: AudioContext;
  private unlocking: Promise<void> | null = null;

  constructor() {
    this.context = createAudioContext();
    void this.unlock();
  }

  playBeep(frequency: number) {
    if (this.context.state === "running") {
      this.emitBeep(frequency);
      return;
    }

    void this.unlock().then(() => {
      if (this.context.state === "running") {
        this.emitBeep(frequency);
      }
    });
  }

  private unlock() {
    if (this.context.state === "closed") {
      this.context = createAudioContext();
      this.unlocking = null;
    }

    if (this.context.state === "running") {
      this.unlocking = null;
      return Promise.resolve();
    }

    this.unlocking ??= this.context.resume().then(
      () => {
        this.unlocking = null;
      },
      () => {
        this.unlocking = null;
      },
    );

    return this.unlocking;
  }

  private emitBeep(frequency: number) {
    const { context } = this;

    if (context.state !== "running") {
      return;
    }

    const now = context.currentTime;
    const duration = 0.14;

    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(frequency * 0.5, 50),
      now + duration,
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, now);
    filter.Q.setValueAtTime(0.5, now);

    amp.gain.setValueAtTime(0.16, now);
    amp.gain.linearRampToValueAtTime(0.001, now + duration);

    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      amp.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}

let synth: RSVPSynth | null = null;
let soundEnabled = true;

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function initRsvpAudio() {
  if (typeof window === "undefined") {
    return;
  }

  synth ??= new RSVPSynth();
}

export function playBeep(frequency: number) {
  if (!synth || !soundEnabled) {
    return;
  }

  synth.playBeep(frequency);
}
