import { Music, playMusic, stringToMusic } from './libintuitive/components/note-parser'
import * as Tone from 'tone'

const bassline: string = "F2,8n. Ab,16n   C3 Eb F,4n. F,16n Eb C,8n Bb2,4n. Ab Ab,16n G Eb,8n"
const melody: string = "F4,16n G Ab Bb C5 Eb Bb4 C5,4n. C,16n C# D F G Ab G F G C,2n D#4,16n E"

const Fm7: string[] = ["F3", "C4", "Eb4", "Ab4"];
const Bbm7: string[] = ["F3", "Bb3", "Db4", "Ab4"];
const Abadd9: string[] = ["C3", "Eb3", "Ab3", "Bb4"]; 
const chords: any = [{note: Fm7, duration: "4n", time: "0", velocity: 0.6},
		     {note: Fm7, duration: "8n", time: "0:3", velocity: 0.6},
		     {note: Bbm7, duration: "4n", time: "1:0", velocity: 0.6},
		     {note: Abadd9, duration: "8n", time: "1:3", velocity: 0.6}];
const kick: any = [{note: "F1", duration: "16n", time: "0"},
		   {note: "F1", duration: "16n", time: "0:0:3"},
		   {note: "C3", duration: "16n", time: "0:1:0"},
		   {note: "F1", duration: "16n", time: "0:1:2"},
		   {note: "F1", duration: "16n", time: "0:2:2"},
		   {note: "C3", duration: "16n", time: "0:3:0"},
		   
		   {note: "F1", duration: "16n", time: "1:0"},
		   {note: "F1", duration: "16n", time: "1:0:3"},
		   {note: "C3", duration: "16n", time: "1:1:0"},
		   {note: "F1", duration: "16n", time: "1:1:2"},
		   {note: "F1", duration: "16n", time: "1:2:2"},
		   {note: "C3", duration: "16n", time: "1:3:0"},
		   {note: "Bb2", duration: "16n", time: "1:3:3", velocity: 0.6}
		  ];


		     

export default class TimbreRhythmPitch {
  melodySynth: Tone.Synth;
  bassSynth: Tone.FMSynth;
  chordSynth: Tone.PolySynth;
  kickSynth: Tone.MembraneSynth;
  verb: Tone.Reverb;
  filter: Tone.Filter;
  distortion: Tone.Distortion;
  filterGain: Tone.Gain;
  distortionGain: Tone.Gain;
  dryGain: Tone.Gain;
  fx: Tone.Gain;

  melodyPart: Tone.Part;
  bassPart: Tone.Part;
  chordPart: Tone.Part;
  kickPart: Tone.Part;

  pitchShift: number;
  


  constructor() {
    this.verb = new Tone.Reverb().toDestination();
    this.verb.wet.value = 0.5;

    this.filterGain = new Tone.Gain(0).connect(this.verb);
    this.distortionGain = new Tone.Gain(0).connect(this.verb);
    this.dryGain = new Tone.Gain(1).connect(this.verb);
    this.filter = new Tone.Filter(200, "lowpass", -24).connect(this.filterGain);
    this.distortion = new Tone.Distortion(0.2).connect(this.distortionGain);
    this.fx = new Tone.Gain().connect(this.filter);
    this.fx.connect(this.distortion);
    this.fx.connect(this.dryGain);

    this.timbre = 64;
    this.pitchShift = 0;
    
    this.melodySynth = new Tone.Synth()
      .connect(new Tone.Panner(0.8))
      .connect(this.fx);
    this.bassSynth = new Tone.FMSynth()
      .connect(this.fx);
    this.chordSynth = new Tone.PolySynth()
      .connect(new Tone.Panner(-0.8))
      .connect(this.fx);
    this.kickSynth = new Tone.MembraneSynth()
      .connect(this.fx);


    function playFunc(synth: any, ref: TimbreRhythmPitch): (time, value) => void {
      return function(time, value) {
	      if(Array.isArray(value.note)) {
	        let notes: string[] =
            value.note
	      .map(
		(el) => Tone.Frequency(el)
		  .transpose(ref.pitchShift)
		  .toNote()
	      );
	  synth.triggerAttackRelease(notes, value.duration, time, value.velocity);
	}
	else {
	  let note: string =
	    Tone.Frequency(value.note)
	      .transpose(ref.pitchShift)
	      .toNote();
	  synth.triggerAttackRelease(note, value.duration, time, value.velocity);
	}
      };
    }
    
    this.melodyPart = new Tone.Part(playFunc(this.melodySynth, this), stringToMusic(melody)).start(0);
    this.bassPart = new Tone.Part(playFunc(this.bassSynth, this), stringToMusic(bassline)).start(0);  
    this.chordPart = new Tone.Part(playFunc(this.chordSynth, this), chords).start(0);
    this.kickPart = new Tone.Part(playFunc(this.kickSynth, this), kick).start(0);
    
    
  }
  
  set timbre(t: number) {
    //this.timbre = t;
    
    const scale = (num: number): number =>  num / 64;
    let freqComponent = t > 64 ? 0 : scale(64 - t);
    let distComponent = t < 64 ? 0 : scale(t - 64);
    let dryComponent  = t < 64 ? scale(t) : scale(128 - t);

    this.filterGain.gain.rampTo(freqComponent, 0.1);
    this.distortionGain.gain.rampTo(distComponent, 0.1);
    this.dryGain.gain.rampTo(dryComponent, 0.1);
  }

  // get timbre(): number {
  //   return this.timbre;
  // }

  set rhythm(r: number) {
    const scale = (num: number): number =>  (num / 127) * 80 + 40;
    Tone.Transport.bpm.rampTo(scale(r));
  }

  // get rhythm(): number {
  //   return this.rhythm;
  // }

  set pitch(p: number) {
    // Take pitch from [0, 128) -> [-24, 24), two octaves
    const pitchScale = (p) => Math.round((p - 64) * (24 / 64));
    this.pitchShift = pitchScale(p);
  }

  get pitch(): number {
    return this.pitchShift;
  }

  

  play(): void {
    this.rhythm = 64;
    Tone.Transport.start();
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "2:0");
  }

  stop(): void {
    Tone.Transport.stop();
  }

}
