import * as Tone from 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js';
import { setMusicInitialized } from './gameData.js';

export const sfx = {};
export let normalMusicLoopInstance;
export let bossMusicLoopInstance;

export function initAudio() {
    const reverb = new Tone.Reverb(1.5).toDestination();
    sfx.shoot = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 }, volume: -22 }).toDestination();
    sfx.laser = new Tone.Synth({ oscillator: { type: 'sawtooth' }, filter: { type: 'lowpass', frequency: 3000 }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.2 }, volume: -15 }).toDestination();
    sfx.enemyShoot = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }, volume: -27 }).toDestination();
    sfx.explosion = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 }, volume: -17 }).toDestination();
    sfx.bigExplosion = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0 }, volume: -12 }).toDestination();
    sfx.playerHit = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 5, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 1 }, volume: -10 }).toDestination();
    sfx.powerup = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 }, volume: -12 }).toDestination();
    sfx.unlock = new Tone.PolySynth(Tone.Synth, { volume: -8 }).toDestination();
    sfx.buy = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 }, volume: -12 }).toDestination();
    sfx.charge = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 0.2 }, volume: -20 }).toDestination();
    sfx.blackhole = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 2, decay: 1, sustain: 1, release: 2 }, volume: -15 }).connect(reverb);
    const normalMusicSynth = new Tone.FMSynth({ modulationIndex: 10, harmonicity: 3, envelope: { attack: 2, decay: 1, sustain: 0.5, release: 4 }, volume: -25 }).connect(reverb);
    const bossMusicSynth = new Tone.AMSynth({ harmonicity: 1.5, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }, volume: -20 }).toDestination();
    normalMusicLoopInstance = new Tone.Sequence((time, note) => { normalMusicSynth.triggerAttackRelease(note, '2n', time); }, ['C2', 'G2', 'Eb2', 'Bb2'], '1m'); // Removed .start(0)
    bossMusicLoopInstance = new Tone.Sequence((time, note) => { bossMusicSynth.triggerAttackRelease(note, '16n', time); }, ['C3', null, 'C#3', 'C3', 'G2', null, 'G#2', null], '4n'); // Removed .start(0)
    normalMusicLoopInstance.humanize = bossMusicLoopInstance.humanize = true;
    setMusicInitialized(true);
}

export function startMusic(isBoss) {
    if (Tone.context.state !== 'running') return; // Ensure audio context is running
    Tone.Transport.bpm.value = isBoss ? 160 : 80;
    if (isBoss) {
        normalMusicLoopInstance.stop();
        bossMusicLoopInstance.start(0);
    } else {
        bossMusicLoopInstance.stop();
        normalMusicLoopInstance.start(0);
    }
    if (Tone.Transport.state !== 'started') Tone.Transport.start();
}

export function stopMusic() {
    if (!Tone.context.state === 'running') return; // Ensure audio context is running
    if (Tone.Transport.state !== 'stopped') {
        normalMusicLoopInstance.stop();
        bossMusicLoopInstance.stop();
        Tone.Transport.stop();
    }
}
