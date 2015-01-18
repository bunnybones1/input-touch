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
		}],
		preventDefault: function() {}
	};
}

function Touch(targetElement) {
	this.targetElement = targetElement;
	this.isDocument = this.targetElement === document;
	this.touches = new Array(100);
	this.testStart = this.testStart.bind(this);
	this.testMove = this.testMove.bind(this);
	this.testEnd = this.testEnd.bind(this);
	this._touchstart = this._touchstart.bind(this);
	this._touchmove = this._touchmove.bind(this);
	this._touchend = this._touchend.bind(this);
	eventsUtil.addEvent(targetElement, "touchstart", this._touchstart);
	eventsUtil.addEvent(targetElement, "touchmove", this._touchmove);
	eventsUtil.addEvent(targetElement, "touchend", this._touchend);
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
		if(this.isDocument) {
			touchEvent.offsetX = touchEvent.clientX;
			touchEvent.offsetY = touchEvent.clientY;
		} else {
			touchEvent.offsetX = touchEvent.clientX - this.targetElement.offsetLeft;
			touchEvent.offsetY = touchEvent.clientY - this.targetElement.offsetTop;
		}
		var identifier = touchEvent.identifier|0;
		var touch = this.touches[identifier];
		switch(state) {
			case START:
				touch = {
					downX: touchEvent.offsetX,
					downY: touchEvent.offsetY,
					x: touchEvent.offsetX,
					y: touchEvent.offsetY
				};
				this.touches[identifier] = touch;
				this.onTouchStartSignal.dispatch(touch.x, touch.y, identifier);
				break;
			case MOVE:
				var touch = this.touches[identifier];
				if(!touch) return;
				touch.x = touchEvent.offsetX;
				touch.y = touchEvent.offsetY;
				this.onTouchMoveSignal.dispatch(touch.x, touch.y, identifier);
				break;
			case END:
				var touch = this.touches[identifier];
				this.touches[identifier] = null;
				this.onTouchEndSignal.dispatch(touch.x, touch.y, identifier);
				if(!testMovedSinceDown(touch)) {
					this.onTouchTapSignal.dispatch(touch.x, touch.y, identifier);
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
		e.preventDefault();
		this._processTouchEventList(e.changedTouches, START);
	},

	_touchmove: function(e) {
		e.preventDefault();
		this._processTouchEventList(e.changedTouches, MOVE);
	},

	_touchend: function(e) {
		e.preventDefault();
		this._processTouchEventList(e.changedTouches, END);
	}
}

module.exports = Touch;
