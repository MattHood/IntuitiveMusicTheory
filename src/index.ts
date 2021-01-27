import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import * as Tone from 'tone'

import { FrequencyResolutionApplet } from './frequency-resolution-applet'
import * as Aural from './aural-object';

Reveal.initialize({
	  width: "100%",
	  height: "100%",
	  margin: 0,
	  minScale: 1,
	  maxScale: 1
});

// Slide 1



// Slide 2
let parent = document.getElementById("applet");
let FRA = new FrequencyResolutionApplet(700, 500, "major scale");
parent.appendChild(FRA.getApplet());

// Slide 3
Aural.fillSpans();

