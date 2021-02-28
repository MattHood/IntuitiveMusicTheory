import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import "@webcomponents/webcomponentsjs/webcomponents-loader"
import "@webcomponents/custom-elements/src/native-shim"
import "construct-style-sheets-polyfill"

import RegisterComponents from './libintuitive/components/components'
import TimbreRhythmPitch from './timbre-rhythm-pitch'
import * as _ from 'lodash'

Reveal.initialize({
	  width: "100%",
	  height: "100%",
	  margin: 0,
	  minScale: 1,
	  maxScale: 1
});

RegisterComponents();

// Slide on Timbre, Rhythm and Pitch
let trp = new TimbreRhythmPitch();
trp.attachControls(document.getElementById("trp-pp"), 
                   document.getElementById("trp-t"), 
                   document.getElementById("trp-r"), 
                   document.getElementById("trp-p"));