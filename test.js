var Touch = require('./');

var QuickText = require('dom-quick-text');



var containerDiv = document.createElement('div');
containerDiv.id = 'threejsContainer';
document.getElementsByTagName('body')[0].appendChild(containerDiv);
console.log(containerDiv);
containerDiv.style.position = 'absolute';
containerDiv.style.left = '25%';
containerDiv.style['background-color'] = '#00ff00';
containerDiv.style.top = '25%';
containerDiv.style.width = '50%';
containerDiv.style.height = '50%';

function prepareTouchDemo(element) {
	var touch = new Touch(element);
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
	touch.onTouchStartSignal.add(touchStart);
	touch.onTouchEndSignal.add(touchEnd);
	touch.onTouchMoveSignal.add(touchMove);
	touch.onTouchTapSignal.add(touchTap);
	touch.testStart(testCoords.x, testCoords.y, 0);
	touch.testMove(testCoords.x + 200, testCoords.y + 100, 0);
	touch.testEnd(testCoords.x + 200, testCoords.y + 100, 0);
}

prepareTouchDemo(document);
prepareTouchDemo(containerDiv);