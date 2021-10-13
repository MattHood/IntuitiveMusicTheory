///////////////////////////v
// Initialisers & Utilities
///////////////////////////
var Enharmonic = function (name) { return ({ revealed: false, name: name }); };
var Column = function (colour, enharmonics, midiNote) {
    return ({ colour: colour, enharmonics: enharmonics, midiNote: midiNote, centreEnharmonic: 1, active: false });
};
var Row = function (coloumns) { return ({ coloumns: coloumns }); };
var Colour = function (h, s, l) { return ({ h: h, s: s, l: l }); };
var colourString = function (c) { return "hsl(" + c.h + ", " + c.s + ", " + c.l + ")"; };
var product = function (arrA, arrB, f) { return arrA.map(function (a) { return arrB.map(function (b) { return f(a, b); }); }); };
///////////////////////
// Data for Enharmonics
///////////////////////
var naturals = ["F", "C", "G", "D", "A", "E", "B"];
var accidentals = ["bb", "b", "", "#", "x"];
var archOfFifths = product(naturals, accidentals, String.prototype.concat).flat();
var cOffset = archOfFifths.findIndex(function (el) { return el == "C" + accidentals[2]; });
var arch = function (index) { return archOfFifths[cOffset + index]; };
var chromaticScaleOffsets = [0, -5, 2, -3, 4, -1, -6, 1, -4, 3, -2, 5]; // C Db D Eb E F Gb G Ab A Bb B
var enharmonicOffsets = [-12, 0, 12];
var isInArch = function (index) { return 0 <= index && index < archOfFifths.length; };
var enharmonicNames = product(chromaticScaleOffsets, enharmonicOffsets, function (c, e) { return c * e; })
    .map(function (column) { return column.filter(isInArch).map(arch); });
var enharmonics = enharmonicNames.map(function (column) { return column.map(Enharmonic); });
///////////////////
// Data for Columns
///////////////////
var indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var colours = indices
    .map(function (index) { return index * (255 / 12); })
    .map(function (hue) { return Colour(hue, 80, 50); });
var midiNotes = indices.map(function (i) { return i + 60; });
var columns = indices.map(function (i) { return Column(colours[i], enharmonics[i], midiNotes[i]); });
//////
// Row
//////
var row = Row(columns);
