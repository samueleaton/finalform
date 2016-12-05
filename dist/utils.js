'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.toArray = toArray;
exports.split = split;
exports.replace = replace;
exports.trim = trim;
exports.escape = escape;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isEmpty = isEmpty;
exports.includes = includes;
exports.getProto = getProto;
exports.flatten = flatten;
exports.forOwn = forOwn;
exports.pickBy = pickBy;
exports.keyBy = keyBy;
exports.isPlainObject = isPlainObject;
exports.keys = keys;
exports.isArray = isArray;
exports.forEach = forEach;
exports.map = map;
exports.has = has;
exports.concat = concat;
/* eslint-disable id-blacklist */
/* eslint-disable id-length */
/* eslint-disable no-param-reassign */

function toArray(obj) {
  var arr = [];
  for (var i = 0, ii = obj.length; i < ii; i++) {
    arr.push(obj[i]);
  }return arr;
}

function split(string, dilimiter) {
  if (string && string.split) return string.split(dilimiter);else return [];
}

function replace(arg, regex, string) {
  if (arg && arg.replace) return arg.replace(regex, string);else return string;
}

function trim(string) {
  if (string && string.trim) return string.trim();else return string;
}

function escape(str) {
  if (!str) return '';
  if (typeof str !== 'string') return '';

  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isString(arg) {
  return typeof arg === 'string';
}

function isBoolean(arg) {
  return typeof arg === 'boolean' || arg === true || arg === false || false;
}

function isFunction(func) {
  return typeof func === 'function';
}

function isEmpty(obj) {
  if (!obj) return true;
  if (obj.length) return false;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

function includes(arg, elm) {
  if (!arg || !arg.indexOf) return false;else if (arg.indexOf(elm) > -1) return true;else return false;
}

function getProto(arg) {
  return Object.getPrototypeOf(Object(arg));
}

/* depends on: forEach, isArray */
function flatten(arr) {
  var result = [];
  forEach(arr, function (elm) {
    if (isArray(elm)) forEach(elm, function (elm2) {
      return result.push(elm2);
    });else result.push(elm);
  });
  return result;
}

/* depends on: isFunction */
function forOwn(arg, func) {
  for (var key in arg) {
    if (arg.hasOwnProperty(key)) {
      if (isFunction(func)) func(arg[key], key);
    }
  }
}

/* depends on: isFunction */
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

/* depends on: isArray, isFunction, forEach */
function keyBy(arr, func) {
  if (!isArray(arr)) return console.error('keyBy takes an array');
  if (!isFunction(func)) return {};
  var result = {};
  forEach(arr, function (elm) {
    result[func(elm)] = elm;
  });
  return result;
}

/* depends on: isArray, getProto */
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
  if (typeof func !== 'function') func = function func() {
    return null;
  };
  var arr = [];
  for (var i = 0, ii = list.length; i < ii; i++) {
    arr.push(func(list[i]));
  }return arr;
}

/* depends on: isArray, split */
function has(obj, path) {
  if (typeof obj === 'undefined' || obj === null) return false;
  if (typeof path === 'undefined' || path === null || path === '') return true;
  var pathArr = isArray(path) ? path : split(path, '.');
  if (!pathArr.length) return true;
  if (obj[pathArr[0]]) {
    var sliced = pathArr.slice(1);
    if (sliced.length === 0) return true;
    return has(obj[pathArr[0]], sliced);
  }
  return false;
}

/* depends on: flatten */
function concat(arr) {
  var newArr = [];
  for (var i = 0, ii = arr.length; i < ii; i++) {
    newArr.push(arr[i]);
  }
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var _i = 0, _ii = args.length; _i < _ii; _i++) {
    newArr.push(args[_i]);
  }return flatten(newArr);
}