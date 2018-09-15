'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeviceMotionEvent = function DeviceMotionEvent() {
  _classCallCheck(this, DeviceMotionEvent);

  this.type = 'devicemotion';
  this.accelerationIncludingGravity = null;
};

exports.default = DeviceMotionEvent;


wx.onAccelerometerChange && wx.onAccelerometerChange(function (res) {
  var deviceMotionEvent = new DeviceMotionEvent();
  deviceMotionEvent.accelerationIncludingGravity = res;

  document.dispatchEvent(deviceMotionEvent);
});
module.exports = exports['default'];