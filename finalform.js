/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function () {
  var _ = {
    isArray: function isArray(obj) {
      return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && (Array.isArray && Array.isArray(obj) || obj.constructor === Array || obj instanceof Array);
    },

    // loop array
    each: function each(list, func) {
      if (!list || !list.length) return null;
      for (var i = 0, ii = list.length; i < ii; i++) {
        func(list[i], i);
      }
    },


    // map array
    map: function map(list, func) {
      if (!list || !list.length) return [];
      var arr = [];
      for (var i = 0, ii = list.length; i < ii; i++) {
        arr.push(func(list[i]));
      }return arr;
    },


    // filter array
    filter: function filter(list, func) {
      if (!list || !list.length) return [];
      var arr = [];
      for (var i = 0, ii = list.length; i < ii; i++) {
        if (func(list[i])) arr.push(list[i]);
      }
      return arr;
    },


    // merge objects
    merge: function merge() {
      var obj = {};

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _.each(args, function (arg) {
        if (!arg || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') return;

        _.each(Object.keys(arg), function (key) {
          obj[key] = arg[key];
        });
      });
      return obj;
    },
    toArray: function toArray(list) {
      var _this = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (args && args.length) {
        var _ret = function () {
          var arr = [];
          arr = arr.concat(list);
          _this.each(args, function (arg) {
            arr = arr.concat(arg);
          });
          return {
            v: arr
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else if (!list || !list.length) return [list];else if (this.isArray(list)) return list;
      var arr = [];
      for (var i = 0, ii = list.length; i < ii; i++) {
        arr.push(list[i]);
      }return arr;
    }
  };

  function getInputs(element) {
    var obj = {};
    _.each(element.getElementsByTagName('input'), function (input, i) {

      var type = input.type || 'text';
      var name = input.name || input.id || input.placeholder || 'input-' + type + '-' + i;

      if (type === 'checkbox') {
        if (!_.isArray(obj[name])) obj[name] = [];
        if (input.checked) obj[name].push(input.value);
      } else if (type === 'radio') {
        if (typeof obj[name] === 'undefined') obj[name] = '';
        if (input.checked) obj[name] = input.value;
      } else obj[name] = input.value;
    });
    return obj;
  }

  function getSelects(element) {
    var obj = {};
    _.each(element.getElementsByTagName('select'), function (select, i) {
      var name = select.name || select.id || select.placeholder || 'select-' + i;
      obj[name] = select.value;
    });
    return obj;
  }

  function getTextAreas(element) {
    var obj = {};
    _.each(element.getElementsByTagName('textarea'), function (ta, i) {
      var name = ta.name || ta.id || ta.placeholder || 'textarea-' + i;
      obj[name] = ta.value;
    });
    return obj;
  }

  function getButtons(element) {
    var obj = {};
    _.each(element.getElementsByTagName('button'), function (btn, i) {
      var name = btn.name || btn.id || btn.placeholder || 'button-' + i;
      obj[name] = btn.value;
    });
    return obj;
  }

  function parseForm(form) {
    var inputs = getInputs(form);
    var textAreas = getTextAreas(form);
    var selects = getSelects(form);
    var buttons = getButtons(form);
    return _.merge(inputs, textAreas, selects, buttons);
  }

  function serializeObject(obj) {
    var str = '';
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return str;

    _.each(Object.keys(obj), function (key) {

      if (!obj[key] || typeof obj[key] === 'string' || typeof obj[key] === 'number') str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';else if (_.isArray(obj[key])) {
        var valueStr = '';
        _.each(obj[key], function (a) {
          valueStr += a + ',';
        });
        valueStr = valueStr.slice(0, -1);
        str += encodeURIComponent(key) + '=' + encodeURIComponent(valueStr) + '&';
      } else if (_typeof(obj[key]) === 'object') str += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(obj[key])) + '&';else console.warn('could not serialize ' + obj[key]);
    });
    return str.slice(0, -1);
  }

  return {
    parse: function parse(form) {
      if (form && form instanceof HTMLElement && form.tagName && form.tagName.toUpperCase() === 'FORM') return parseForm(form);else return console.error('Not a valid HMTL form element.');
    },
    serialize: function serialize(form) {
      if (form && form instanceof HTMLElement && form.tagName && form.tagName.toUpperCase() === 'FORM') return serializeObject(parseForm(form));else return console.error('Not a valid HMTL form element.');
    }
  };
}();

