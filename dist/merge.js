'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function merge() {
  var merged = {};

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  _lodash2.default.forEach(_lodash2.default.flatten(args), function (arg) {
    if (!arg || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') return;
    _lodash2.default.forEach(_lodash2.default.keys(arg), function (key) {
      merged[key] = arg[key];
    });
  });
  return merged;
};