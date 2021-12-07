/**
 * Created by cwenger on 12/6/2014.
 */
var context = null;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote;        // What note is currently last scheduled?
var tempo = parseInt(document.getElementById('showTempo').innerHTML);          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
// This is calculated from lookahead, and overlaps
// with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength;      // length of "beep" (in seconds)
//var canvas = document.createElement('canvas');
                    // the canvas element
var cursorCanvas;
//var canvasContext = cursor.getContext('2d');          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages
var piano = [
    'audio/piano/mp3/Bb1.mp3',
    'audio/piano/mp3/B1.mp3',
    'audio/piano/mp3/C2.mp3',
    'audio/piano/mp3/Db2.mp3',
    'audio/piano/mp3/D2.mp3',
    'audio/piano/mp3/Eb2.mp3',
    'audio/piano/mp3/E2.mp3',
    'audio/piano/mp3/F2.mp3',
    'audio/piano/mp3/Gb2.mp3',
    'audio/piano/mp3/G2.mp3',
    'audio/piano/mp3/Ab2.mp3',
    'audio/piano/mp3/A2.mp3',
    'audio/piano/mp3/Bb2.mp3',
    'audio/piano/mp3/B2.mp3',
    'audio/piano/mp3/C3.mp3',
    'audio/piano/mp3/Db3.mp3',
    'audio/piano/mp3/D3.mp3',
    'audio/piano/mp3/Eb3.mp3',
    'audio/piano/mp3/E3.mp3',
    'audio/piano/mp3/F3.mp3',
    'audio/piano/mp3/Gb3.mp3',
    'audio/piano/mp3/G3.mp3',
    'audio/piano/mp3/Ab3.mp3',
    'audio/piano/mp3/A3.mp3',
    'audio/piano/mp3/Bb3.mp3',
    'audio/piano/mp3/B3.mp3',
    'audio/piano/mp3/C4.mp3',
    'audio/piano/mp3/Db4.mp3',
    'audio/piano/mp3/D4.mp3',
    'audio/piano/mp3/Eb4.mp3',
    'audio/piano/mp3/E4.mp3',
    'audio/piano/mp3/F4.mp3',
    'audio/piano/mp3/Gb4.mp3',
    'audio/piano/mp3/G4.mp3',
    'audio/piano/mp3/Ab4.mp3',
    'audio/piano/mp3/A4.mp3',
    'audio/piano/mp3/Bb4.mp3',
    'audio/piano/mp3/B4.mp3',
    'audio/piano/mp3/C5.mp3',
    'audio/piano/mp3/Db5.mp3',
    'audio/piano/mp3/D5.mp3'
];
var key = keySig;
var Do, Re, Mi, Fa, Sol, La, Ti;
var stepNums = [0, 5, 7, 23, 24, 26, 28, 29, 31, 33];
var num;
var oct;


var pianotoLoad = [];
function getPianoArray(){
    switch(key) {
        case "C":
            num = 2;
            break;
        case "Db":
            num = 3;
            break;
        case "D":
            num = 4;
            break;
        case "Eb":
            num = 5;
            break;
        case "E":
            num = 6;
            break;
        case "F":
            num = 7;
            break;
        case "Gb":
            num = 8;
            break;
        case "G":
            num = 9;
            break;
        case "Ab":
            num = 10;
            break;
        case "A":
            num = 11;
            break;
        case "Bb":
            num = 0;
            break;
        case "B":
            num = 1;
            break;
    }
    for (var i=0; i < stepNums.length; i++){
        pianotoLoad.push(piano[num + stepNums[i]]);
    }
}

var Do1, Fa1, Sol1, Ti2, Do3, Re3, Mi3, Fa3, Sol3, La3,
    kick,
    kickLow,
    snare,
    clap,
    closedHat,
    openHat,
    breakKick,
    breakSnare,
    breakOHat,
    breakCHat;

var PIANO;
var pianoLevel = parseInt(document.getElementById('pLevel').innerHTML)/10;
var HIPHOP;
var drumsLevel = parseInt(document.getElementById('dLevel').innerHTML)/10;
var BREAKBEAT;
var breakbeatLevel;
var houseLevel;
var HOUSE;
function setDrumVolume() {
    if(tempo <= 92){
        hipHopLevel = drumsLevel;
        breakbeatLevel = 0;
        houseLevel = 0;
    }
    else if((tempo > 92) && (tempo < 120)){
        breakbeatLevel = drumsLevel;
        hipHopLevel = 0;
        houseLevel = 0;
    }
    else if (tempo >= 120) {
        houseLevel = drumsLevel;
        hipHopLevel = 0;
        breakbeatLevel = 0;
    }
}
var hipHopLevel;
var kickLevel;
var snareLevel;
var hatLevel;


var quarter = 0,
    half,
    whole,
    eighth;
var numBeats = meter;
var measureTime = numBeats * quarter;
var measureCount = num_Measures;
var viewer = document.getElementById('viewer');


    // First, let's shim the requestAnimationFrame API, with a setTimeout fallback
    window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function nextNote() {
    // Advance current note and time by a 16th note...
    quarter = 60.0 / tempo;    // Notice this picks up the CURRENT
                                          // tempo value to calculate beat length.
    half = 2 * quarter;
    whole = 4 * quarter;
    eighth = 0.5 * quarter;
    nextNoteTime += 0.25 * quarter;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if ((current16thNote == (16 * measureCount) + (preRoll)) && (repeatCount)) {
        current16thNote = preRoll;
        repeatCount = (!repeatCount);

    }

}
var repeatCount = true;
var preRoll = numBeats * 4;
var buffer;
var countOffDisplay = null;


function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push({note: beatNumber, time: time});

    setDrumVolume();
    kickLevel = .5 * hipHopLevel;
    snareLevel = .5 * hipHopLevel;
    hatLevel = .2 * hipHopLevel;

    if (beatNumber < preRoll) {
        document.getElementById('countOff').style.display = 'inline-block';
    }
    else {
        document.getElementById('countOff').style.display = 'none';
        draw();
    }

    // create an oscillator
    var osc = context.createOscillator();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    osc.connect(gainNode);
    gainNode.connect( context.destination );
    gainNode.gain.value = .75;
    osc.frequency.value = 960.00;
    //if (beatNumber % 16 === 0)    // beat 0 == low pitch
    //osc.frequency.value = 880.0;
    //else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
    //osc.frequency.value = 440.0;
    //else                        // other 16th notes = high pitch
    //osc.frequency.value = 220.0;

    //osc.start( time );
    //osc.stop( time + noteLength );
    if (beatNumber  == 0) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML = "One";
    }
    else if (beatNumber == 4) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Two";
    }
    else if (beatNumber == 8) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Ready";
    }
    else if (beatNumber == 12) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Play";
    }


    //create an audioSourceBuffer
    function playSound(buffer, length, level) {
        var source = context.createBufferSource();
        source.buffer = buffer;
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        context.currentTime = time;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = level;
        if (!source.start)
            source.start = source.noteOn;
        source.start(time);
        source.stop(time + length);

    }
    //function playAcc(sequence) {
        //for (var b = 0; b < sequence.length; b++){
            //playAcc(sequence[b]);
        //}
    //}
    //function playAcc(beat, sounds, duration, level){
        //this.sounds = sounds;
        //this.duration = duration;
        //this.level = level;
        //if (beatNumber === this.beat){
        //for (var a = 0; a < sounds.length; a++){
            //playSound(sounds[a], duration, level);
            //}
        //}
        //else{
            //play();
        //}

    function playChord(chord, duration, level){
        this.chord = chord;
        this.duration = duration;
        this.level = level;
        for (var n = 0; n < chord.length; n++) {
            playSound(chord[n], duration, level);
        }
    }

    var I = [Do1, Do3, Mi3, Sol3];
    var V = [Sol1, Ti2, Re3, Sol3];
    var V7 = [Sol1, Ti2, Re3, Fa3, Sol3];
    var IV = [Fa1, Do3, Fa3, La3];
    var vi = [Do1, Do3, Mi3, La3];

    accompaniment();
        function accompaniment() {
            if (beatNumber === 0 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 1 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 2 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 3 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 4 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 5 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 6 + preRoll){
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 8 + preRoll) {
                playChord(I, half, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 10 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 12 + preRoll) {
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 13 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if(beatNumber === 14 + preRoll) {
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 16 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 18 + preRoll){
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 20 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 22 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 23 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 24 + preRoll) {
                playChord(I, half, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 26 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 28 + preRoll) {
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 29 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if(beatNumber === 30 + preRoll){
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 32 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 34 + preRoll) {
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 36 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 38 + preRoll) {
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 40 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 42 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 44 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 46 + preRoll) {
                playSound(breakOHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 48 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 49 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
            }
            else if (beatNumber === 50 + preRoll) {
                playSound(openHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 51 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 52 + preRoll) {
                playChord(V7, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 53 + preRoll) {
                playSound(openHat, quarter, hatLevel);
            }
            else if (beatNumber === 54 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 55 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
            }
            else if (beatNumber === 56 + preRoll) {
                playChord(I, whole, pianoLevel);
                playSound(openHat, quarter, hatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 57 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 58 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
            }
            else if (beatNumber === 59 + preRoll) {
                playSound(openHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 60 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 62 + preRoll) {
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if((beatNumber > preRoll) && (beatNumber < preRoll + 16 * measureCount)) {
                playSound(closedHat, quarter, hatLevel);
            }

        }
    function draw() {
        if (beatNumber - preRoll < xPos.length) {
        var x = (xPos[beatNumber - preRoll]).toString() + "px";
        }
        else{x = window.innerWidth.toString() + "px"};
        var cursorCanvas = document.getElementById('positionMarker');
        if (cursorCanvas) {
            cursorCanvas.parentNode.removeChild(cursorCanvas);
        }
        var cursor = document.createElement('canvas');
        cursor.id = 'positionMarker';
        cursor.height = 100 * scale * zoom;
        cursor.width = 4;
        document.getElementById('viewer').appendChild(cursor);
        document.getElementById('positionMarker').style.left = x;
        document.getElementById('positionMarker').style.top = "10%";
    }
}

var xPos = [];
function getXValues(){
    for (var i=0; i<noteData.length; i++){
        var xDiff, x, xIncr;
        var endX = window.innerWidth - 65;
        var duration = noteData[i].duration;
        var cursorDiff = 16/duration;
        if (i == 0){
            var xOffset = 50 * scale * zoom;
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            var position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else if (i < noteData.length - 1) {
            xOffset = 35 * scale * zoom;
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else if (i == noteData.length - 1) {
            xOffset = 30 * scale * zoom;
            xDiff = endX - (noteData[i].mX + noteData[i].noteX);
            position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else {
            xOffset = 30 * scale * zoom;
            position = endX;
            xDiff = 0;
        }
        for (var j=0; j<cursorDiff; j++){
            xIncr = xDiff/cursorDiff;
            x = (position + (xIncr * j)).toString();
            xPos.push(x);
        }
    }
}
getXValues();

function scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTime < context.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }

}

function play() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = context.currentTime;
                timerWorker.postMessage("start");
        return "stop";
    } else {
                timerWorker.postMessage("stop");
        return "play";
    }
}

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    //cursorCanvas.width = window.innerWidth;
    //cursorCanvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0);
}

//TODO: Convert HipHop files to mp3, load House sounds, redefine beats (as arrays?)

function loadedPiano(PIANO) {
    Do1 = PIANO[0];
    Fa1 = PIANO[1];
    Sol1 = PIANO[2];
    Ti2 = PIANO[3];
    Do3 = PIANO[4];
    Re3 = PIANO[5];
    Mi3 = PIANO[6];
    Fa3 = PIANO[7];
    Sol3 = PIANO[8];
    La3 = PIANO[9];
}
function loadedHipHop(HIPHOP) {
    kick = HIPHOP[0];
    kickLow = HIPHOP[1];
    snare = HIPHOP[2];
    clap = HIPHOP[3];
    closedHat = HIPHOP[4];
    openHat = HIPHOP[5];
}
function loadedBreakBeat(BREAKBEAT) {
    breakKick = BREAKBEAT[0];
    breakSnare = BREAKBEAT[1];
    breakCHat = BREAKBEAT[2];
    breakOHat = BREAKBEAT[3];
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
};

function init(){
    var container = document.getElementById( 'container-fluid' );
    //canvasContext = canvas.getContext( '2d' );
    /*container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild( container );
    container.appendChild(canvas);
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;
    */

    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    context = new AudioContext();
    getPianoArray();
    // if we wanted to load audio files, etc., this is where we should do it.
    var pianoLoader = new BufferLoader(
        context,
        pianotoLoad,
        loadedPiano
    );

    pianoLoader.load();

    var hipHopLoader = new BufferLoader(
        context,
        [
            'audio/hiphop/Hard_Kick_1.wav',
            'audio/hiphop/Kick_2.wav',
            'audio/hiphop/Snare_1.wav',
            'audio/hiphop/Clap_1.wav',
            'audio/hiphop/Closed_Hat_1.wav',
            'audio/hiphop/OpenHat_1.wav'
        ],
        loadedHipHop
    );

    hipHopLoader.load();

    var breakbeatLoader = new BufferLoader(
        context,
        [
            'audio/breakbeat/breakbeat_kick.mp3',
            'audio/breakbeat/breakbeat_snare.mp3',
            'audio/breakbeat/breakbeat_closedHat2.mp3',
            'audio/breakbeat/breakbeat_openHat2.mp3'
        ],
        loadedBreakBeat
    );
    breakbeatLoader.load();

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    //requestAnimFrame(draw);    // start the drawing loop.

            timerWorker = new Worker("js/audioPlayerWorker.js");

            timerWorker.onmessage = function(e) {
                if (e.data == "tick") {
                        // console.log("tick!");
                            scheduler();
                    }
                else
                    console.log("message: " + e.data);
            };
        timerWorker.postMessage({"interval":lookahead});

}
window.addEventListener("load", init() );
