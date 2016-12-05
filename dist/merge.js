'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('./utils');

module.exports = function merge() {
  var merged = {};

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  (0, _utils.forEach)((0, _utils.flatten)(args), function (arg) {
    if (!arg || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') return;
    (0, _utils.forEach)((0, _utils.keys)(arg), function (key) {
      merged[key] = arg[key];
    });
  });
  return merged;
};