/**
 * Created by cwenger on 4/1/2015.
 */
var context = null;
var tempo = parseInt(document.getElementById('showTempo').innerHTML); //the speed of each beat
var pianoLevel = parseInt(document.getElementById('pLevel').innerHTML)/10; // the overall level of the piano sounds
var drumsLevel = parseInt(document.getElementById('dLevel').innerHTML)/10; // the overall level of drum sounds
var lookahead = 25.0; //ms, how frequently to call scheduler
var timerWorker = null; //the Web Worker used to fire timer messages

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
var key = "C";
var stepNums = [0, 5, 7, 23, 24, 26, 28, 29, 31, 33];
var num;
var pianotoLoad = [];
var Do1, Fa1, Sol1, Ti2, Do3, Re3, Mi3, Fa3, Sol3, La3,
    kick, kickLow, snare, clap, closedHat, openHat, breakKick, breakSnare, breakOHat, breakCHat;

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

var breakbeatLevel, houseLevel, hipHopLevel, kickLevel, snareLevel, hatLevel;

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

//TODO: Convert HipHop files to mp3, load House sounds, redefine beats (as arrays?)
//TODO: enable final barlines and repeats in VexFlow/XML

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

//get the cursor values from the noteData array (from the XMl/Vexflow) to draw the cursor
var xPos = [];
function getXValues(){
    for (var i=0; i<noteData.length; i++){
        var xDiff, x, xIncr;
        var endX = window.innerWidth - 65;
        var duration = noteData[i].duration;
        var cursorDiff = 256/duration;
        if (i == 0){
            var xOffset = 50 * scale * zoom;
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            var position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else if (i < noteData.length - 1) {
            xOffset = 35 * scale * zoom;
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            var position = noteData[i].mX + noteData[i].noteX + xOffset;
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

function cursorDraw() {
    getXValues();
    var i=0;
    (function iterate() {
        if (i<xPos.length) {
            var x = (xPos[i]).toString() + "px";
            var cursorTime = (((60 / 86) * 1000) / 64);
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
            setTimeout(iterate, cursorTime);
        }
        i++;
    })();
}

var cursorDisplay;
function cursorStart() {
    cursorDisplay = setTimeout(cursorDraw, (60 / tempo) * 4 * 1000);
}







//Audio buffer loader functions
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
    var container = document.getElementById('container-fluid');
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