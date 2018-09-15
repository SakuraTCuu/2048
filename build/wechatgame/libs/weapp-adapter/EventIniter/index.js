'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceMotionEvent = exports.MouseEvent = exports.TouchEvent = undefined;

var _TouchEvent2 = require('./TouchEvent');

var _TouchEvent3 = _interopRequireDefault(_TouchEvent2);

var _MouseEvent2 = require('./MouseEvent');

var _MouseEvent3 = _interopRequireDefault(_MouseEvent2);

var _DeviceMotionEvent2 = require('./DeviceMotionEvent.js');

var _DeviceMotionEvent3 = _interopRequireDefault(_DeviceMotionEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.TouchEvent = _TouchEvent3.default;
exports.MouseEvent = _MouseEvent3.default;
exports.DeviceMotionEvent = _DeviceMotionEvent3.default;