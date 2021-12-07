function hasGetUserMedia() {
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		}
		if(hasGetUserMedia()) {
		alert('TOOOOOTALLY WICKED!!!!');
		//TODO: remove this alert in final version
		}
		else{
			alert('getUserMedia() is not supported in your browser.');
		}