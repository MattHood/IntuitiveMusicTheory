import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import "@webcomponents/webcomponentsjs/webcomponents-loader"
import "@webcomponents/custom-elements/src/native-shim"
import "construct-style-sheets-polyfill"


import RegisterComponents from './libintuitive/components/components'

Reveal.initialize({
    width: "100%",
    height: "100%",
    margin: 0,
    minScale: 1,
    maxScale: 1,
});

RegisterComponents();

Reveal.on( 'fragmentshown', event => {
    // event.fragment = the fragment DOM element
    if((event.fragment as HTMLParagraphElement).id == "chromanim") {
        const el = document.querySelector("intuitive-chromatic-animation");
        el.setAttribute("circular", "true");
    }
  } );
Reveal.on( 'fragmenthidden', event => {
    // event.fragment = the fragment DOM element
    if((event.fragment as HTMLParagraphElement).id == "chromanim") {
        const el = document.querySelector("intuitive-chromatic-animation");
        el.removeAttribute("circular");
    }
} );


