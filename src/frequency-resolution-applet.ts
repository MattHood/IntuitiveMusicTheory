const PIXEL_RATE = 100;

function equalTemperament(base, steps) {
    return base * Math.pow(2, steps / 12);
}

class ContinuousMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 480;
    }

    stopToHSL(stop) {
	let frac = stop / this.stops;
	let hue = 2 * frac * 360;
	let lightness = stop < this.stops / 2 ? 45 : 60;
	return {h: hue, s: 80, l: lightness};
    }

    stopToFrequency(stop) {
	let frac = stop / this.stops;
	let range = this.highFreq - this.lowFreq;
	return (frac * range) + this.lowFreq;
    }
}

class ChromaticMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 24;
    }

    stopToHSL(stop) {
	let frac = stop / this.stops;
	let hue = 2 * frac * 360;
	let lightness = stop < this.stops / 2 ? 45 : 60;
	return {h: hue, s: 80, l: lightness};
    }

    stopToFrequency(stop) {
	return equalTemperament(this.lowFreq, stop);
    }
}

class ScaleMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 14;
    }

    stopToHSL(stop) {
	let frac = stop / this.stops;
	let hue = 2 * frac * 360;
	let lightness = stop < this.stops / 2 ? 45 : 60;
	return {h: hue, s: 80, l: lightness};
    }

    stopToFrequency(stop) {
	let degrees = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
	return equalTemperament(this.lowFreq, degrees[stop]);
    }
}

class ChordMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 6;
    }

    stopToHSL(stop) {
	let frac = (stop + 0.3) / this.stops;
	let hue = 2 * frac * 360;
	let lightness = stop < this.stops / 2 ? 45 : 60;
	return {h: hue, s: 80, l: lightness};
    }

    stopToFrequency(stop) {
	let degrees = [0, 4, 7, 12, 16, 19];
	return equalTemperament(this.lowFreq, degrees[stop]);
    }
}

class Mapper {
    constructor(height, tuning) {
	this.height = height;

	let lowFreq = 400;
	let highFreq = lowFreq * 4;

	if(tuning == "continuous") {
	    this.mapper = new ContinuousMapper(lowFreq, highFreq);
	} else if (tuning == "chromatic") {
	    this.mapper = new ChromaticMapper(lowFreq, highFreq);
	} else if (tuning == "major scale") {
	    this.mapper = new ScaleMapper(lowFreq, highFreq);
	} else if (tuning == "major chord") {
	    this.mapper = new ChordMapper(lowFreq, highFreq);
	} else {
	    throw new TypeError("Undefined Tuning: '" + tuning + "'");
	}
    }

    pixelToStop(pixel) {
        // Ascend from the bottom
        let level = this.height - pixel;
        let stopWidth = this.height / this.mapper.stops;
        let stop = Math.floor(level / stopWidth);
        return stop;
    }

    pixelToHSL(pixel) {
        return this.mapper.stopToHSL(this.pixelToStop(pixel));
    }

    pixelToFrequency(pixel) {
        return this.mapper.stopToFrequency(this.pixelToStop(pixel));
    }

    snapPixelHeight(pixel) {
        let stops = this.mapper.stops;
        let halfHeight = this.height / stops / 2;
        let lowerHeight = Math.floor(pixel * (stops / this.height)) * (this.height / stops);
        let snapped = lowerHeight + halfHeight;
        return snapped;
    }	
}

class Sound {
    constructor(width) {
	this.noteSequence = [];
	this.synth = new Tone.PolySynth();
	this.synth.connect(Tone.context.destination);
	this.width = width;
    }

    quantizeTime(unquantized) {
	let pixelRate = 100;
	let subdivision = 4;
	let unit = pixelRate / subdivision;

	return Math.round(unquantized / unit) * unit;
    }
    
    addNote(f, t) {
	let quantized = this.quantizeTime(t);
        this.noteSequence.push({freq: f, time: quantized});
	this.noteSequence.sort(function(a, b) {
	    return a.time - b.time;
	});
	console.log(this.noteSequence);
    }

    clearNotes() {
        this.noteSequence = [];
    }

    

    play() {
	let now = Tone.now();
        this.noteSequence.forEach((function(note) {
            this.synth.triggerAttackRelease(note.freq, 0.1, now + note.time / 100);
        }).bind(this));
    }
}

class Graphics {
    constructor(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.height = canvas.height;
	this.width = canvas.width;
    }

    toHSLString(x) {
              return 'hsl(' + Math.round(x.h) + ',' + x.s + '%,' + x.l + '%)';
    }

    // Draw the canvas
    drawBackground(mapper) {
        for(let i = 0; i < this.height; i++) {
            this.ctx.fillStyle = this.toHSLString(mapper.pixelToHSL(i));
            this.ctx.fillRect(0, i, this.width, i + 1);
        }
    }

    drawNotehead(x, y) {
        let headChar = '\uD834\uDD58'
        let headSizes = this.ctx.measureText(headChar);
        let topX = x - Math.abs(headSizes.actualBoundingBoxLeft);
        let topY = y - Math.abs(headSizes.actualBoundingBoxAscent) + 2;
        let backupFont = this.ctx.font;
        this.ctx.font = '72px serif';
        this.ctx.fillStyle = 'hsl(0, 100%, 0%)'
        this.ctx.fillText(headChar, topX, topY);
        this.ctx.font = backupFont;
    }
    
}

class FrequencyResolutionApplet {
    buildUI(parent, width, height) {
	function button(text) {
	    let t = document.createElement("button");
	    t.innerHTML = text;
	    return t;
	}

	function appendTo(parent, children) {
	    children.forEach( (el) => parent.appendChild(el) );
	}
	
	this.container = document.createElement("div");

	this.canvas = document.createElement("canvas");
	this.canvas.width = width;
	this.canvas.height = height;

	this.upperContainer = document.createElement("div");
	this.playButton = button("Play");
	this.clearButton = button("Clear");
	appendTo(this.upperContainer, [this.playButton,
				       this.clearButton]);

	this.lowerContainer = document.createElement("div");
	this.continuousButton = button("Continuous");
	this.chromaticButton = button("Chromatic");
	this.scaleButton = button("Scale");
	this.chordButton = button("Chord");
	appendTo(this.lowerContainer, [this.continuousButton,
				       this.chromaticButton,
				       this.scaleButton,
				       this.chordButton]);

	this.break1 = document.createElement("br");
	this.break2 = document.createElement("br");

	appendTo(this.container, [this.upperContainer,
				  this.break1,
				  this.canvas,
				  this.break2,
				  this.lowerContainer]);
	parent.appendChild(this.container);
    }

    clearCanvas() {
	this.sound.clearNotes();
	this.graphics.drawBackground(this.mapper);
    }

    connectEvents() {
	// TODO Fix scope issues that require bind()
	this.playButton.onclick = (function() {
	    this.sound.play();
	}).bind(this);
	this.clearButton.onclick = (function() {
	    this.sound.clearNotes();
	    this.graphics.drawBackground(this.mapper);
	}).bind(this);

	function resolutionChanger(tuning, caller) {
	    return function() {
		caller.mapper = new Mapper(caller.height, tuning);
		caller.clearCanvas();
		
	    };
	}
	
	this.continuousButton.onclick = resolutionChanger("continuous", this);
	this.chromaticButton.onclick = resolutionChanger("chromatic", this);
	this.scaleButton.onclick = resolutionChanger("major scale", this);
	this.chordButton.onclick = resolutionChanger("major chord", this);

	let handleClick = (function(event) {
	    let rect = this.canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

	    

	    let freq = this.mapper.pixelToFrequency(y);
            let time = x;
            let drawY = this.mapper.snapPixelHeight(y);
            let drawX = this.sound.quantizeTime(x); // TODO: Move quantize function to better location

            this.sound.addNote(freq, time);
            this.graphics.drawNotehead(drawX, drawY);
	}).bind(this);
	this.canvas.addEventListener("mousedown", handleClick);

	
	    
    }

    constructor(parent, width, height, initialTuning) {
	this.buildUI(parent, width, height);
	this.height = height;
	this.sound = new Sound(width);
	this.graphics = new Graphics(this.canvas);
	this.mapper = new Mapper(height, initialTuning);
	this.clearCanvas(this.mapper);
	this.connectEvents();
    }
}

