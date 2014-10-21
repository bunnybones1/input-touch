var START = 'start',
	MOVE = 'move',
	END = 'end';

var eventsUtil = require('browser-event-adder');
var signals = require('signals');


var clickDistanceThreshPixels = 5;
var clickDistanceThreshPixelsSquared = clickDistanceThreshPixels * clickDistanceThreshPixels;

function testMovedSinceDown(touch) {
	var deltaX = touch.downX - touch.x;
	var deltaY = touch.downY - touch.y;
	return ((deltaX * deltaX + deltaY * deltaY) > clickDistanceThreshPixelsSquared);
}

function makeFakeTouchEvent(x, y, identifier) {
	return {
		changedTouches:[{
			clientX: x,
			clientY: y,
			identifier: identifier
		}]
	};
}

function Touch() {
	this.touches = new Array(100);
	this.testStart = this.testStart.bind(this);
	this.testMove = this.testMove.bind(this);
	this.testEnd = this.testEnd.bind(this);
	this._touchstart = this._touchstart.bind(this);
	this._touchmove = this._touchmove.bind(this);
	this._touchend = this._touchend.bind(this);
	eventsUtil.addEvent(document, "touchstart", this._touchstart);
	eventsUtil.addEvent(document, "touchmove", this._touchmove);
	eventsUtil.addEvent(document, "touchend", this._touchend);
	this.onTouchStartSignal = new signals.Signal();
	this.onTouchEndSignal = new signals.Signal();
	this.onTouchMoveSignal = new signals.Signal();
	this.onTouchTapSignal = new signals.Signal();
}

Touch.prototype = {
	testStart: function(x, y, identifier) {
		this._touchstart(makeFakeTouchEvent(x, y, identifier));
	},

	testMove: function(x, y, identifier) {
		this._touchmove(makeFakeTouchEvent(x, y, identifier));
	},

	testEnd: function(x, y, identifier) {
		this._touchend(makeFakeTouchEvent(x, y, identifier));
	},

	_processTouchEvent: function(touchEvent, state) {
		var touch = this.touches[touchEvent.identifier];
		switch(state) {
			case START:
				touch = {
					downX: touchEvent.clientX,
					downY: touchEvent.clientY,
					x: touchEvent.clientX,
					y: touchEvent.clientY
				};
				this.touches[touchEvent.identifier] = touch;
				this.onTouchStartSignal.dispatch(touch.x, touch.y, touchEvent.identifier);
				break;
			case MOVE:
				var touch = this.touches[touchEvent.identifier];
				touch.x = touchEvent.clientX;
				touch.y = touchEvent.clientY;
				this.onTouchMoveSignal.dispatch(touch.x, touch.y, touchEvent.identifier);
				break;
			case END:
				var touch = this.touches[touchEvent.identifier];
				this.touches[touchEvent.identifier] = null;
				this.onTouchEndSignal.dispatch(touch.x, touch.y, touchEvent.identifier);
				if(!testMovedSinceDown(touch)) {
					this.onTouchTapSignal.dispatch(touch.x, touch.y, touchEvent.identifier);
				}
				break;
		}
	},

	_processTouchEventList: function(touchEventList, state) {
		for (var i = touchEventList.length - 1; i >= 0; i--) {
			this._processTouchEvent(touchEventList[i], state)
		};
	},

	_touchstart: function(e) {
		this._processTouchEventList(e.changedTouches, START);
	},

	_touchmove: function(e) {
		this._processTouchEventList(e.changedTouches, MOVE);
	},

	_touchend: function(e) {
		this._processTouchEventList(e.changedTouches, END);
	}
}

module.exports = new Touch();