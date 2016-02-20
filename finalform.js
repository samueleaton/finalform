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

  /* generates a key for the field value
    only runs if no 'name', 'id', and 'placeholder' attributes are found
  */
  function generateKeyName(obj, element, type, index) {
    var i = index || 1;
    var typeStr = typeof type === 'string' ? '-' + type : '';

    if (typeof obj[element + typeStr] === 'undefined') return element + typeStr;else if (typeof obj[element + typeStr + '-' + i] === 'undefined') return element + typeStr + '-' + i;else return generateKeyName(obj, element, type, i + 1);
  }

  /* Gets all form <input> values
  */
  function getInputs(element, options) {
    var obj = {};

    _.each(element.getElementsByTagName('input'), function (input, i) {

      var type = input.type || 'text';
      var name = input.name || input.id || input.placeholder || generateKeyName(obj, 'input', type);
      var val = input.value;

      if (options.trim !== false) val = val.trim();

      if (options.compress !== false) val = val.replace(/ +/g, ' ');

      if (options.toUpperCase === true) val = val.toUpperCase();

      if (options.toLowerCase === true) val = val.toLowerCase();

      if (type === 'checkbox') {
        if (options.checkboxesAsArray) {
          if (!_.isArray(obj[name])) obj[name] = [];
          if (input.checked) obj[name].push(val);
        } else {
          if (_typeof(obj[name]) !== 'object') obj[name] = {};
          obj[name][val] = input.checked;
        }
      } else if (type === 'radio') {
        if (typeof obj[name] === 'undefined') obj[name] = '';
        if (input.checked) obj[name] = val;
      } else obj[name] = val;
    });
    return obj;
  }

  function getSelects(element) {
    var obj = {};
    _.each(element.getElementsByTagName('select'), function (select, i) {
      var name = select.name || select.id || select.placeholder || generateKeyName(obj, 'select');
      obj[name] = select.value;
    });
    return obj;
  }

  function getTextAreas(element) {
    var obj = {};
    _.each(element.getElementsByTagName('textarea'), function (ta, i) {
      var name = ta.name || ta.id || ta.placeholder || generateKeyName(obj, 'textarea');
      obj[name] = ta.value;
    });
    return obj;
  }

  function getButtons(element) {
    var obj = {};
    _.each(element.getElementsByTagName('button'), function (btn, i) {
      var name = btn.name || btn.id || btn.placeholder || generateKeyName(obj, 'button');
      obj[name] = btn.value;
    });
    return obj;
  }

  function parseForm(form, options) {
    var inputs = getInputs(form, options);
    var textAreas = getTextAreas(form, options);
    var selects = getSelects(form, options);
    var buttons = getButtons(form, options);
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
    parse: function parse(form, options) {
      var opts = options || {};
      if (opts.modify === false) {
        opts.trim = opts.compress = opts.toUpperCase = opts.toLowerCase = opts.checkboxesAsArray = false;
      }
      if (form && form instanceof HTMLElement && form.tagName && form.tagName.toUpperCase() === 'FORM') return parseForm(form, opts);else return console.error('Not a valid HMTL form element.');
    },
    serialize: function serialize(form, options) {
      var opts = options || {};
      if (opts.modify === false) {
        opts.trim = opts.compress = opts.toUpperCase = opts.toLowerCase = opts.checkboxesAsArray = false;
      }
      if (form && form instanceof HTMLElement && form.tagName && form.tagName.toUpperCase() === 'FORM') return serializeObject(parseForm(form, opts));else return console.error('Not a valid HMTL form element.');
    },

    merge: _.merge
  };
}();

