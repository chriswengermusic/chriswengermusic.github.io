/**
 * Created by cwenger on 3/20/2015.
 */
var tempo, pianoLevel, drumsLevel;
var setTempo = function(){
    tempo = parseInt(document.getElementById('showTempo').innerHTML);
};
var setPianoLevel = function(){
    pianoLevel = parseInt(document.getElementById('pLevel').innerHTML)/10;
};
var setDrumLevel = function(){
    drumsLevel = parseInt(document.getElementById('dLevel').innerHTML)/10;
};
var increaseTempo = document.getElementById('plusTempo');
increaseTempo.onclick = function() {
    var tempo = document.getElementById('showTempo').innerHTML;
    var newTempo = parseInt(tempo) + 1;
    document.getElementById('showTempo').innerHTML = newTempo;
    setTempo();
};

var decreaseTempo = document.getElementById('minusTempo');
decreaseTempo.onclick = function() {
    var tempo = document.getElementById('showTempo').innerHTML;
    var newTempo = parseInt(tempo) - 1;
    document.getElementById('showTempo').innerHTML = newTempo;
    setTempo();
};

var decreaseDrums = document.getElementById("minusDrums");
decreaseDrums.onclick = function() {
    var volume = document.getElementById('dLevel').innerHTML;
    var newVolume = parseInt(volume) - 1;
    document.getElementById('dLevel').innerHTML = newVolume;
    setDrumLevel();
};

var increaseDrums = document.getElementById("plusDrums");
increaseDrums.onclick = function() {
    var volume = document.getElementById('dLevel').innerHTML;
    var newVolume = parseInt(volume) + 1;
    document.getElementById('dLevel').innerHTML = newVolume;
    setDrumLevel()
};

var increasePiano = document.getElementById("plusPiano");
increasePiano.onclick = function() {
    var volume = document.getElementById('pLevel').innerHTML;
    var newVolume = parseInt(volume) + 1;
    document.getElementById('pLevel').innerHTML = newVolume;
    setPianoLevel();
};
var decreasePiano = document.getElementById("minusPiano");
decreasePiano.onclick = function() {
    var volume = document.getElementById('pLevel').innerHTML;
    var newVolume = parseInt(volume) - 1;
    document.getElementById('pLevel').innerHTML = newVolume;
    setPianoLevel();
};