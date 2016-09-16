'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FinalFormError = function FinalFormError(msg) {
  _classCallCheck(this, FinalFormError);

  this.name = 'FinalFormError';
  this.message = msg;
  this.stack = new Error().stack;
};

if (Object && Object.create) FinalFormError.prototype = Object.create(Error.prototype);
exports.default = FinalFormError;