import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import "@webcomponents/webcomponentsjs/webcomponents-loader"
import "@webcomponents/custom-elements/src/native-shim"
import * as Tone from 'tone'

import ResponsiveFRA from './libintuitive/components/frequency-resolution-applet'
import Aural from './libintuitive/components/aural-object';
import * as NP from './libintuitive/components/note-parser'

import TimbreRhythmPitch from './timbre-rhythm-pitch'

Reveal.initialize({
	  width: "100%",
	  height: "100%",
	  margin: 0,
	  minScale: 1,
	  maxScale: 1
});

ResponsiveFRA.register();
Aural.register();



// Slide 4
let play = document.getElementById("aha");
let stop = document.getElementById("stopaha");
let timbre: HTMLElement = document.getElementById("taha");
let pitch = document.getElementById("paha");
let rhythm = document.getElementById("raha");
let t = new TimbreRhythmPitch();

play.onclick = (e) => {
  t.play();
}

stop.onclick = (e) => {
  t.stop();
}

timbre.oninput = (e) => {
  t.timbre = e.target.value;
}

pitch.oninput = (e) => {
  t.pitch = e.target.value;
}

rhythm.oninput = (e) => {
  t.rhythm = e.target.value;
}

