function equalTemperament(base, steps) {
    return base * Math.pow(2, steps / 12);
}

class ContinuousMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 480;
    }

    stopToHue(stop) {
	let frac = stop / this.stops;
	return 2 * frac * 360;
    }

    stopToFrequency(stop) {
	let frac = stop / this.stops;
	let range = this.highFreq - this.lowFreq;
	return (frac * range) + this.lowFreq;
    }

    get stops() {
	return this.stops;
    }
}

class ChromaticMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 24;
    }

    stopToHue(stop) {
	let frac = stop / this.stops;
	return 2 * frac * 360;
    }

    stopToFrequency(stop) {
	return equalTemperament(this.lowFreq, stop);
    }

    get stops() {
	return this.stops;
    }
}

class ScaleMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 14;
    }

    stopToHue(stop) {
	let frac = stop / this.stops;
	return 2 * frac * 360;
    }

    stopToFrequency(stop) {
	let degrees = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
	return equalTemperament(this.lowFreq, degrees[stop]);
    }

    get stops() {
	return this.stops;
    }
}

class ChordMapper {
    constructor(lowFreq, highFreq) {
	this.lowFreq = lowFreq;
	this.highFreq = highFreq;
	this.stops = 14;
    }

    stopToHue(stop) {
	let frac = stop / this.stops;
	return 2 * frac * 360;
    }

    stopToFrequency(stop) {
	let degrees = [0, 4, 7, 12, 16, 19];
	return equalTemperament(this.lowFreq, degrees[stop]);
    }

    get stops() {
	return this.stops;
    }
}

class Mapper {
    constructor(height, tuning) {
	this.height = height;

	if(tuning == "continuous") {
	    this.mapper = ContinuousMapper;
	} else if (tuning == "chromatic") {
	    this.mapper = ChromaticMapper;
	} else if (tuning == "major scale") {
	    this.mapper = ScaleMapper;
	} else if (tuning == "major chord") {
	    this.mapper = ChordMapper;
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

    pixelToHue(pixel) {
        return this.mapper.stopToHue(this.pixelToStop(pixel));
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
    constructor() {
	this.noteSequence = [];
	this.synth = new Tone.PolySynth();
	this.synth.connect(Tone.context.destination);
    }
    
    addNote(f, t) {
        this.noteSequence.push({freq: f, time: t});
    }

    clearNotes() {
        this.noteSequence = [];
    }

    play() {
	let now = Tone.now();
        this.noteSequence.forEach(function(note) {
            this.synth.triggerAttackRelease(note.freq, 0.1, now + note.time / 100);
            console.log(note);
        });
    }
}

class Graphics {
    constructor(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.height = canvas.height;
	this.width = canvas.width;
    }

    toHSL(h, s, l) {
              return 'hsl(' + Math.round(h) + ',' + s + '%,' + l + '%)';
    }

    // Draw the canvas
    drawBackground(mapper) {
        for(let i = 0; i < height; i++) {
            this.ctx.fillStyle = this.toHSL(mapper.pixelToHue(i), 80, 60);
            this.ctx.fillRect(0, i, this.width, i + 1);
        }
    }

    drawNotehead(x, y) {
        headChar = '\uD834\uDD58'
        headSizes = this.ctx.measureText(headChar);
        topX = x - Math.abs(headSizes.actualBoundingBoxLeft);
        topY = y - Math.abs(headSizes.actualBoundingBoxAscent) + 2;
        backupFont = this.ctx.font;
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

	appendTo(this.container, [this.upperContainer, this.break1,
				  this.canvas,
				  this.break2,
				  this.lowerContainer]);
	parent.appendChild(this.container);
    }

    connectEvents() {
	this.playButton.onclick = this.sound.play();
	this.clearButton.onclick = function() {
	    this.sound.clearNotes();
	    this.graphics.drawBackground();
	}

	function resolutionChanger(tuning) {
	    return function() {
		this.mapper = new Mapper(this.height, tuning);
	    }
	}
	
	this.continuousButton.onclick = resolutionChanger("continuous");
	this.chromaticButton.onclick = resolutionChanger("chromatic");
	this.scaleButton.onclick = resolutionChanger("major scale");
	this.chordButton.onclick = resolutionChanger("major chord");

	this.canvas.mousedown = function(event) {
	    let rect = this.canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

	    freq = mapper.pixelToFrequency(y);
            time = x;
            drawY = mapper.snapPixelHeight(y);
            drawX = x;

            this.sound.addNote(freq, time);
            this.graphics.drawNotehead(ctx, drawX, drawY);
	}
	    
    }

    constructor(parent, width, height, initialTuning) {
	this.buildUI(parent, width, height);
	this.height = height;
	this.sound = new Sound();
	this.graphics = new Graphics(this.canvas);
	console.log(initialTuning);
	this.mapper = new Mapper(height, initialTuning);
	this.connectEvents();
    }
}

