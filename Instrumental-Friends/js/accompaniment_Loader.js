/**
 * Created by cwenger on 11/23/2014.
 */
window.onload = init;
var context;
var PIANO;
var Bb1;
var B1;
var C2;
var Db2;
var D2;
var Eb2;
var E2;
var F2;
var Gb2;
var G2;
var Ab2;
var A2;
var Bb2;
var B2;
var C3;
var Db3;
var D3;
var Eb3;
var E3;
var F3;
var Gb3;
var G3;
var Ab3;
var A3;
var Bb3;
var B3;
var C4;
var Db4;
var D4;
var Eb4;
var E4;
var F4;
var Gb4;
var G4;
var Ab4;
var A4;
var Bb4;
var B4;
var C5;
var Db5;
var D5;
var HIPHOP;
var kick;
var kickLow;
var snare;
var clap;
var closedHat;
var openHat;


function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    var pianoLoader = new BufferLoader(
        context,
        [
            'Bb1.mp3',
            'B1.mp3',
            'C2.mp3',
            'Db2.mp3',
            'D2.mp3',
            'Eb2.mp3',
            'E2.mp3',
            'F2.mp3',
            'Gb2.mp3',
            'G2.mp3',
            'Ab2.mp3',
            'A2.mp3',
            'Bb2.mp3',
            'B2.mp3',
            'C3.mp3',
            'Db3.mp3',
            'D3.mp3',
            'Eb3.mp3',
            'E3.mp3',
            'F3.mp3',
            'Gb3.mp3',
            'G3.mp3',
            'Ab3.mp3',
            'A3.mp3',
            'Bb3.mp3',
            'B3.mp3',
            'C4.mp3',
            'Db4.mp3',
            'D4.mp3',
            'Eb4.mp3',
            'E4.mp3',
            'F4.mp3',
            'Gb4.mp3',
            'G4.mp3',
            'Ab4.mp3',
            'A4.mp3',
            'Bb4.mp3',
            'B4.mp3',
            'C5.mp3',
            'Db5.mp3',
            'D5.mp3'

        ],
        loadedPiano
    );

    pianoLoader.load();

    var hipHopLoader = new BufferLoader(
        context,
        [
            'Hard_Kick_1.wav',
            'Kick_2.wav',
            'Snare_1.wav',
            'Clap_1.wav',
            'Closed_Hat_1.wav',
            'OpenHat_1.wav'
        ],
        loadedHipHop
    );

    hipHopLoader.load();
    setTempo();
    resetPlay();

}


function loadedPiano(PIANO) {
    Bb1 = PIANO[0];
    B1 = PIANO[1];
    C2 = PIANO[2];
    Db2 = PIANO[3];
    D2 = PIANO[4];
    Eb2 = PIANO[5];
    E2 = PIANO[6];
    F2 = PIANO[7];
    Gb2 = PIANO[8];
    G2 = PIANO[9];
    Ab2 = PIANO[10];
    A2 = PIANO[11];
    Bb2 = PIANO[12];
    B2 = PIANO[13];
    C3 = PIANO[14];
    Db3 = PIANO[15];
    D3 = PIANO[16];
    Eb3 = PIANO[17];
    E3 = PIANO[18];
    F3 = PIANO[19];
    Gb3 = PIANO[20];
    G3 = PIANO[21];
    Ab3 = PIANO[22];
    A3 = PIANO[23];
    Bb3 = PIANO[24];
    B3 = PIANO[25];
    C4 = PIANO[26];
    Db4 = PIANO[27];
    D4 = PIANO[28];
    Eb4 = PIANO[29];
    E4 = PIANO[30];
    F4 = PIANO[31];
    Gb4 = PIANO[32];
    G4 = PIANO[33];
    Ab4 = PIANO[34];
    A4 = PIANO[35];
    Bb4 = PIANO[36];
    B4 = PIANO[37];
    C5 = PIANO[38];
    Db5 = PIANO[39];
    D5 = PIANO[40];

}
function loadedHipHop(HIPHOP) {
    kick = HIPHOP[0];
    kickLow = HIPHOP[1];
    snare = HIPHOP[2];
    clap = HIPHOP[3];
    closedHat = HIPHOP[4];
    openHat = HIPHOP[5];
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
//TODO:establish accPlayer Class
//TODO:transposition protocol
var Piano = {
};
var tempo;
function setTempo(){
    tempo = document.getElementById("tempoSlider").value;
    document.getElementById("tempo").value=tempo;

}

var pianoLevel = 1.0;
var quarter = 1;
var half = 2;
var eighth = 0.5;
var sixteenth = 0.25;
var whole = 4;
var numBeats = 4;
var repeat = true;
var repeatCount = {
};
if(repeat){
    repeatCount = 1;
}
else{
    repeatCount = 0;
}
var stopPlaying = 0;
function playStop(){
    stopPlaying = 1;
    document.getElementById('feedback').innerHTML = stopPlaying;
}
function resetPlay(){
    stopPlaying = 0;
    document.getElementById('feedback').innerHTML = stopPlaying;
}
//var mNum = null;
//function jumpToMeasure(){
    //if(document.getElementByID('measure').value = null{
        //mNum = 0;}
    //else{
        //mNum = document.getElementById('measure').value - 1;
    //}
//}
Piano.play = function() {
    function playSound(buffer, time, volume, length) {
        var source = context.createBufferSource();
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = volume;
        if (!source.start)
            source.start = source.noteOn;
        source.start(time);
        source.stop(time + length);
    }
    var m = 0;
    var startTime = context.currentTime;
    var pulse = (60 / tempo);
    for(repeatCount = 0; repeatCount < 2; repeatCount++) {
        var measureTime = numBeats * pulse;
        var loopTime = startTime + repeatCount * m * measureTime;
        for (m = 0; m < 4; m++) {
            var b1 = loopTime + m * numBeats * pulse;
            var b2 = b1 + pulse;
            var b3 = b2 + pulse;
            var b4 = b3 + pulse;
            if (m == 2) {
                playSound(D3, b1, pianoLevel, half);
                playSound(Gb3, b1, pianoLevel, half);
                playSound(A3, b1, pianoLevel, half);
                playSound(D4, b1, pianoLevel, half);
                playSound(D3, b2, pianoLevel, quarter);
                playSound(Gb3, b2, pianoLevel, quarter);
                playSound(A3, b2, pianoLevel, quarter);
                playSound(D4, b2, pianoLevel, quarter);
                playSound(A2, b3, pianoLevel, half);
                playSound(A3, b3, pianoLevel, half);
                playSound(Db3, b3, pianoLevel, half);
                playSound(E3, b3, pianoLevel, half);
                playSound(A2, b4, pianoLevel, quarter);
                playSound(G3, b4, pianoLevel, quarter);
                playSound(A3, b4, pianoLevel, quarter);
                playSound(Db3, b4, pianoLevel, quarter);
                playSound(E3, b4, pianoLevel, quarter);
            }
            else {
                playSound(D3, b1, pianoLevel, quarter);
                playSound(Gb3, b1, pianoLevel, quarter);
                playSound(A3, b1, pianoLevel, quarter);
                playSound(D4, b1, pianoLevel, quarter);
                playSound(A2, b2, pianoLevel, quarter);
                playSound(A3, b2, pianoLevel, quarter);
                playSound(Db3, b2, pianoLevel, quarter);
                playSound(E3, b2, pianoLevel, quarter);
                playSound(D2, b3, pianoLevel, whole + half);
                playSound(Gb3, b3, pianoLevel, whole + half);
                playSound(A3, b3, pianoLevel, whole + half);
                playSound(D4, b3, pianoLevel, whole + half);
            }
        }
    }
};

var HipHop = {
};
var kickLevel = 0.5;
var snareLevel = 0.5;
var hatLevel = 0.2;

HipHop.play = function() {
    function playSound(buffer, time, volume) {
        var source = context.createBufferSource();
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = volume;
        if (!source.start)
            source.start = source.noteOn;
        source.start(time);
    }
    var m = 0;
    var startTime = context.currentTime + .02;
    var pulse = (60 / tempo);
    for(repeatCount = 0; repeatCount < 2; repeatCount++) {
        var measureTime = numBeats * pulse;
        var loopTime = startTime + repeatCount * m * measureTime;
        for (m = 0; m < 4; m++) {
            var b1 = loopTime + m * numBeats * pulse;
            var b2 = b1 + pulse;
            var b3 = b2 + pulse;
            var b4 = b3 + pulse;
            if (m == 3) {
                playSound(kick, b1, kickLevel);
                playSound(kickLow, b1, kickLevel);
                playSound(closedHat, b1, hatLevel);
                playSound(closedHat, b1 + sixteenth * pulse, hatLevel);
                playSound(snare, b1 + eighth * pulse, snareLevel);
                playSound(clap, b1 + eighth * pulse, snareLevel);
                playSound(openHat, b1 + eighth * pulse, hatLevel);
                playSound(kick, b1 + (eighth + sixteenth) * pulse, kickLevel);
                playSound(kickLow, b1 + (eighth + sixteenth) * pulse, kickLevel);
                playSound(closedHat, b2, hatLevel);
                playSound(closedHat, b2 + sixteenth * pulse, hatLevel);
                playSound(snare, b2 + sixteenth * pulse, snareLevel);
                playSound(clap, b2 + sixteenth * pulse, snareLevel);
                playSound(kick, b2 + eighth * pulse, kickLevel);
                playSound(kickLow, b2 + eighth * pulse, kickLevel);
                playSound(openHat, b2 + (eighth + sixteenth) * pulse, hatLevel);
                playSound(snare, b3, snareLevel);
                playSound(clap, b3, snareLevel);
            }
            else{
                playSound(kick, b1, kickLevel);
                playSound(kick, b3 + eighth * pulse, kickLevel);
                playSound(kick, b4 + sixteenth * pulse, kickLevel);
                playSound(kickLow, b1, kickLevel);
                playSound(kickLow, b3 + eighth * pulse, kickLevel);
                playSound(kickLow, b4 + sixteenth * pulse, kickLevel);

                playSound(snare, b2, snareLevel);
                playSound(snare, b4, snareLevel);
                playSound(clap, b2, snareLevel);
                playSound(clap, b4, snareLevel);

                for (var i = 0; i < 16; i = i + 2) {
                    playSound(closedHat, b1 + i * sixteenth * pulse, hatLevel);
                }
                playSound(openHat, b2 + (eighth + sixteenth) * pulse, hatLevel);
                playSound(openHat, b4 + eighth * pulse, hatLevel);
            }
        }
    }
};


