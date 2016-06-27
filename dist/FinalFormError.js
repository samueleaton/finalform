'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FinalFormError = function FinalFormError(msg) {
  _classCallCheck(this, FinalFormError);

  this.name = 'FinalFormError';
  this.message = msg;
  this.stack = new Error().stack;
};

FinalFormError.prototype = _lodash2.default.create(Error.prototype);
exports.default = FinalFormError;