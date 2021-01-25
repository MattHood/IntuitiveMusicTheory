import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

import { FrequencyResolutionApplet } from './frequency-resolution-applet'

Reveal.initialize({
	  width: "100%",
	  height: "100%",
	  margin: 0,
	  minScale: 1,
	  maxScale: 1
});
      
let parent = document.getElementById("applet");
let fra = new FrequencyResolutionApplet(parent, 700, 500, "major scale");