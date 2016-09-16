/* eslint-disable id-blacklist */
/* eslint-disable id-length */
/*
  Includes/replaces lodash methods to decrease file size
*/
import concat from 'lodash.concat';
import flatten from 'lodash.flatten';
import escape from 'lodash.escape';
import isEmpty from 'lodash.isempty';

function replace(arg, regex, string) {
  if (arg && arg.replace)
    return arg.replace(regex, string);
}

function trim(string) {
  if (!string)
    return string;
  if (string.trim)
    return string.trim();
}

function isUndefined(arg) {
  return typeof arg === 'undefined';
}

function isString(arg) {
  return typeof arg === 'string';
}

function includes(arg, elm) {
  if (!arg || !arg.indexOf)
    return console.error('first param must be string or array');
  else if (arg.indexOf(elm) > -1)
    return true;
  else
    return false;
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
  for (const key in arg) {
    if (arg.hasOwnProperty(key)) {
      if (isFunction(func))
        func(arg[key], key);
    }
  }
}

function pickBy(obj, func) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isFunction(func)) {
        if (func(obj[key], key))
          result[key] = obj[key];
      }
      else if (obj[key])
        result[key] = obj[key];
    }
  }
  return result;
}

function keyBy(arr, func) {
  if (!isArray(arr))
    return console.error('keyBy takes an array');
  if (!isFunction(func))
    return console.error('second param to keyBy must be a function');
  const result = {};
  forEach(arr, elm => {
    result[func(elm)] = elm;
  });
  return result;
}

function isPlainObject(obj) {
  if (typeof obj !== 'object')
    return false;
  if (isArray(obj))
    return false;
  const proto = getProto(obj);
  if (proto === null)
    return true;
  const cnstcr = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  const funcToString = Function.prototype.toString;
  return (
    typeof cnstcr === 'function' &&
    cnstcr instanceof cnstcr &&
    funcToString.call(cnstcr) === funcToString.call(Object));
}

function keys(obj) {
  const arr = [];
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key) && key !== 'constructor')
      arr.push(key);
  }
  return arr;
}

function isArray(obj) {
  return (
    typeof obj === 'object' &&
    (
      (Array.isArray && Array.isArray(obj)) ||
      obj.constructor === Array ||
      obj instanceof Array
    )
  );
}

function forEach(list, func) {
  if (!list || !list.length)
    return null;
  if (typeof func !== 'function')
    return console.error('2nd param to forEach must be function');
  for (let i = 0, ii = list.length; i < ii; i++)
    func(list[i], i);
}

function map(list, func) {
  if (!list || !list.length)
    return [];
  if (typeof func !== 'function')
    return console.error('2nd param to forEach must be function');
  const arr = [];
  for (let i = 0, ii = list.length; i < ii; i++)
    arr.push(func(list[i]));
  return arr;
}

function has(obj, path) {
  if (typeof obj === 'undefined' || obj === null)
    return false;
  if (typeof path === 'undefined' || path === null || path === '')
    return true;
  const pathArr = isArray(path) ? path : path.split('.');
  if (!pathArr.length)
    return true;
  if (obj[pathArr[0]]) {
    const sliced = pathArr.slice(1);
    if (sliced.length === 0)
      return true;
    return has(obj[pathArr[0]], sliced);
  }
  return false;
}

export default {
  keys,
  isPlainObject,
  has,
  keyBy,
  pickBy,
  forOwn,
  forEach,
  map,
  concat,
  includes,
  flatten,
  trim,
  replace,
  escape,
  isFunction,
  isBoolean,
  isUndefined,
  isArray,
  isEmpty,
  isString
};
