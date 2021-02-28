import { Music, MusicEvent, playMusic, stringToMusic } from './libintuitive/components/note-parser'
import * as Tone from 'tone'

const bassline: string = "F2,8n. Ab,16n   C3 Eb F,4n. F,16n Eb C,8n Bb2,4n. Ab Ab,16n G Eb,8n"
const melody: string = "F4,16n G Ab Bb C5 Eb Bb4 C5,4n. C,16n C# D F G Ab G F G C,2n D#4,16n E"

const Fm7: string[] = ["F3", "C4", "Eb4", "Ab4"];
const Bbm7: string[] = ["F3", "Bb3", "Db4", "Ab4"];
const Abadd9: string[] = ["C3", "Eb3", "Ab3", "Bb4"];
const chords: any = [{ note: Fm7, duration: "4n", time: "0", velocity: 0.6 },
{ note: Fm7, duration: "8n", time: "0:3", velocity: 0.6 },
{ note: Bbm7, duration: "4n", time: "1:0", velocity: 0.6 },
{ note: Abadd9, duration: "8n", time: "1:3", velocity: 0.6 }];

const kick: any = [{ note: "F1", duration: "16n", time: "0" },
{ note: "F1", duration: "16n", time: "0:0:3" },
{ note: "C3", duration: "16n", time: "0:1:0" },
{ note: "F1", duration: "16n", time: "0:1:2" },
{ note: "F1", duration: "16n", time: "0:2:2" },
{ note: "C3", duration: "16n", time: "0:3:0" },

{ note: "F1", duration: "16n", time: "1:0" },
{ note: "F1", duration: "16n", time: "1:0:3" },
{ note: "C3", duration: "16n", time: "1:1:0" },
{ note: "F1", duration: "16n", time: "1:1:2" },
{ note: "F1", duration: "16n", time: "1:2:2" },
{ note: "C3", duration: "16n", time: "1:3:0" },
{ note: "Bb2", duration: "16n", time: "1:3:3", velocity: 0.6 }
];

class FX {
  verb: Tone.Reverb;
  filter: Tone.Filter;
  distortion: Tone.Distortion;
  filterGain: Tone.Gain;
  distortionGain: Tone.Gain;
  dryGain: Tone.Gain;
  entry: Tone.Gain;
  exit: Tone.Gain;

  constructor() {
    this.exit = new Tone.Gain(1);
    this.verb = new Tone.Reverb().connect(this.exit);
    this.verb.wet.value = 0.5;

    this.filterGain = new Tone.Gain(0).connect(this.verb);
    this.distortionGain = new Tone.Gain(0).connect(this.verb);
    this.dryGain = new Tone.Gain(1).connect(this.verb);
    this.filter = new Tone.Filter(200, "lowpass", -24).connect(this.filterGain);
    this.distortion = new Tone.Distortion(0.2).connect(this.distortionGain);

    this.entry = new Tone.Gain().connect(this.filter);
    this.entry.connect(this.distortion);
    this.entry.connect(this.dryGain);
  }

  set filterAmount(f: number) {
    this.filterGain.gain.rampTo(f, 0.1);
  }

  set distortionAmount(d: number) {
    this.distortionGain.gain.rampTo(d, 0.1);
  }

  set dryAmount(d: number) {
    this.dryGain.gain.rampTo(d, 0.1);
  }

}


export default class TimbreRhythmPitch {
  fx: FX;
  melodySynth: Tone.Synth;
  bassSynth: Tone.FMSynth;
  chordSynth: Tone.PolySynth;
  kickSynth: Tone.MembraneSynth;

  melodyPart: Tone.Part;
  bassPart: Tone.Part;
  chordPart: Tone.Part;
  kickPart: Tone.Part;

  pitchShift: number;

  constructor() {


    this.fx = new FX();

    this.melodySynth = new Tone.Synth().connect(new Tone.Panner(0.8))
      .connect(this.fx.entry);
    this.bassSynth = new Tone.FMSynth()
      .connect(this.fx.entry);
    this.chordSynth = new Tone.PolySynth().connect(new Tone.Panner(-0.8))
      .connect(this.fx.entry);
    this.kickSynth = new Tone.MembraneSynth()
      .connect(this.fx.entry);

    this.fx.exit.toDestination();

    const melodyPlayer = (time, value): void => {
      let note: string = Tone.Frequency(value.note).transpose(this.pitchShift).toNote();
      this.melodySynth.triggerAttackRelease(note, value.duration, time, value.velocity);
    }

    const bassPlayer = (time, value): void => {
      let note: string = Tone.Frequency(value.note).transpose(this.pitchShift).toNote();
      this.bassSynth.triggerAttackRelease(note, value.duration, time, value.velocity);
    }

    // Handles polyphony
    const chordPlayer = (time, value): void => {
      let notes: string[] = value.note.map(
        (el) => Tone.Frequency(el).transpose(this.pitchShift).toNote());
      this.chordSynth.triggerAttackRelease(notes, value.duration, time, value.velocity);
    }

    // Invariant under transposition
    const kickPlayer = (time, value): void => {
      this.kickSynth.triggerAttackRelease(value.note, value.duration, time, value.velocity);
    }

    const toBBS = (me: MusicEvent) => {
      return { ...me, time: Tone.Time(me.time).toBarsBeatsSixteenths() };
    };
    let melodyData = stringToMusic(melody).map(toBBS);
    let bassData = stringToMusic(bassline).map(toBBS);

    this.timbre = 64;
    this.pitch = 64;
    this.rhythm = 64;

    this.melodyPart = new Tone.Part(melodyPlayer, melodyData).start(0);
    this.bassPart = new Tone.Part(bassPlayer, bassData).start(0);
    this.chordPart = new Tone.Part(chordPlayer, chords).start(0);
    this.kickPart = new Tone.Part(kickPlayer, kick).start(0);


  }

  set timbre(t: number) {
    const scale = (num: number): number => num / 64;
    this.fx.filterAmount = t > 64 ? 0 : scale(64 - t);
    this.fx.distortionAmount = t < 64 ? 0 : scale(t - 64);
    this.fx.dryAmount = t < 64 ? scale(t) : scale(128 - t);
  }

  set rhythm(r: number) {
    const scale = (num: number): number => (num / 127) * 80 + 40;
    Tone.Transport.bpm.value = scale(r);
  }

  set pitch(p: number) {
    // Take pitch from [0, 128) -> [-24, 24), two octaves
    const pitchScale = (p) => Math.round((p - 64) * (24 / 64));
    this.pitchShift = pitchScale(p);
  }

  play(): void {
    Tone.Transport.start();
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "2:0");
  }

  stop(): void {
    Tone.Transport.stop();
  }

  attachControls(playButton: HTMLElement,
    timbreSlider: HTMLElement,
    rhythmSlider: HTMLElement,
    pitchSlider: HTMLElement) {
      
    playButton.onplay = (e) => {
      this.play();
    }

    playButton.onpause = (e) => {
      this.stop();
    }

    timbreSlider.oninput = (e) => {
      this.timbre = (e.target as any).value;
    }

    pitchSlider.oninput = (e) => {
      this.pitch = (e.target as any).value;
    }

    rhythmSlider.oninput = (e) => {
      this.rhythm = (e.target as any).value;
    }

  }

}


