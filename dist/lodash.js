'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* eslint-disable id-blacklist */
/* eslint-disable id-length */
/*
  Includes/replaces lodash methods to decrease file size
*/


var _lodash = require('lodash.concat');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.flatten');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.escape');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.isempty');

var _lodash8 = _interopRequireDefault(_lodash7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function replace(arg, regex, string) {
  if (arg && arg.replace) return arg.replace(regex, string);
}

function trim(string) {
  if (!string) return string;
  if (string.trim) return string.trim();
}

function isUndefined(arg) {
  return typeof arg === 'undefined';
}

function isString(arg) {
  return typeof arg === 'string';
}

function includes(arg, elm) {
  if (!arg || !arg.indexOf) return console.error('first param must be string or array');else if (arg.indexOf(elm) > -1) return true;else return false;
}

function isBoolean(arg) {
  return typeof arg === 'boolean' || arg === true || arg === false || false;
}

function isFunction(func) {
  return typeof func === 'function';
}

function getProto(arg) {
  return Object.getPrototypeOf(Object(arg));
}

function forOwn(arg, func) {
  for (var key in arg) {
    if (arg.hasOwnProperty(key)) {
      if (isFunction(func)) func(arg[key], key);
    }
  }
}

function pickBy(obj, func) {
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isFunction(func)) {
        if (func(obj[key], key)) result[key] = obj[key];
      } else if (obj[key]) result[key] = obj[key];
    }
  }
  return result;
}

function keyBy(arr, func) {
  if (!isArray(arr)) return console.error('keyBy takes an array');
  if (!isFunction(func)) return console.error('second param to keyBy must be a function');
  var result = {};
  forEach(arr, function (elm) {
    result[func(elm)] = elm;
  });
  return result;
}

function isPlainObject(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return false;
  if (isArray(obj)) return false;
  var proto = getProto(obj);
  if (proto === null) return true;
  var cnstcr = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  var funcToString = Function.prototype.toString;
  return typeof cnstcr === 'function' && cnstcr instanceof cnstcr && funcToString.call(cnstcr) === funcToString.call(Object);
}

function keys(obj) {
  var arr = [];
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key) && key !== 'constructor') arr.push(key);
  }
  return arr;
}

function isArray(obj) {
  return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && (Array.isArray && Array.isArray(obj) || obj.constructor === Array || obj instanceof Array);
}

function forEach(list, func) {
  if (!list || !list.length) return null;
  if (typeof func !== 'function') return console.error('2nd param to forEach must be function');
  for (var i = 0, ii = list.length; i < ii; i++) {
    func(list[i], i);
  }
}

function map(list, func) {
  if (!list || !list.length) return [];
  if (typeof func !== 'function') return console.error('2nd param to forEach must be function');
  var arr = [];
  for (var i = 0, ii = list.length; i < ii; i++) {
    arr.push(func(list[i]));
  }return arr;
}

function has(obj, path) {
  if (typeof obj === 'undefined' || obj === null) return false;
  if (typeof path === 'undefined' || path === null || path === '') return true;
  var pathArr = isArray(path) ? path : path.split('.');
  if (!pathArr.length) return true;
  if (obj[pathArr[0]]) {
    var sliced = pathArr.slice(1);
    if (sliced.length === 0) return true;
    return has(obj[pathArr[0]], sliced);
  }
  return false;
}

exports.default = {
  keys: keys,
  isPlainObject: isPlainObject,
  has: has,
  keyBy: keyBy,
  pickBy: pickBy,
  forOwn: forOwn,
  forEach: forEach,
  map: map,
  concat: _lodash2.default,
  includes: includes,
  flatten: _lodash4.default,
  trim: trim,
  replace: replace,
  escape: _lodash6.default,
  isFunction: isFunction,
  isBoolean: isBoolean,
  isUndefined: isUndefined,
  isArray: isArray,
  isEmpty: _lodash8.default,
  isString: isString
};