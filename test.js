var Touch = require('./');

var QuickText = require('dom-quick-text');

var totalTouchLabels = 10;
var touchLabels = [];
for (var i = 0; i < totalTouchLabels; i++) {
	var touchLabel = new QuickText('[touch ' + i + ']');
	touchLabels.push(touchLabel);
};

var tapCount = 0;
var tapCounterLabel = new QuickText('Taps: 0');

function processTouch(id, state, x, y) {
	var label = touchLabels[id];
	if(label) {
		var status = [
			'[touch ' + id + '] ' + state,
			'x: ' + x,
			'y: ' + y
		].join(', ');
		label.update(status)
	} else {
		console.warn('not enough labels for this many touches');
	}
}

function processTap(id, x, y){
	tapCount++;
	tapCounterLabel.update('Taps: ' + tapCount);
}

function touchStart(x, y, id){
	processTouch(id, 'start', x, y);
}
function touchMove(x, y, id){
	processTouch(id, 'move', x, y);
}
function touchEnd(x, y, id){
	processTouch(id, 'end', x, y);
}
function touchTap(x, y, id){
	processTap(id, x, y);
}

var testCoords = {
	x: window.innerWidth * .5, 
	y: window.innerHeight * .5
}
Touch.onTouchStartSignal.add(touchStart);
Touch.onTouchEndSignal.add(touchEnd);
Touch.onTouchMoveSignal.add(touchMove);
Touch.onTouchTapSignal.add(touchTap);
Touch.testStart(testCoords.x, testCoords.y, 0);
Touch.testMove(testCoords.x + 200, testCoords.y + 100, 0);
Touch.testEnd(testCoords.x + 200, testCoords.y + 100, 0);
