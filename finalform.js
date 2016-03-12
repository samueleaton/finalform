/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _lodash = require('lodash.flatten');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.foreach');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.isarray');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.map');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.isplainobject');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.forown');

var _lodash12 = _interopRequireDefault(_lodash11);

var _lodash13 = require('lodash.has');

var _lodash14 = _interopRequireDefault(_lodash13);

var _lodash15 = require('lodash.includes');

var _lodash16 = _interopRequireDefault(_lodash15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function merge() {
    var obj = {};

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (0, _lodash4.default)((0, _lodash2.default)(args), function (arg) {
      if (!arg || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') return;
      (0, _lodash4.default)(Object.keys(arg), function (key) {
        obj[key] = arg[key];
      });
    });
    return obj;
  }

  var FinalForm = function () {
    _createClass(FinalForm, null, [{
      key: 'validateFormElement',
      value: function validateFormElement(form) {
        if (form && (!(form instanceof HTMLElement) || form.tagName && form.tagName.toUpperCase() !== 'FORM')) throw 'Not a valid HMTL form element.';
      }
      /* generates a key for the field value
        only runs if no 'name', 'id', and 'placeholder' attributes are found
      */

    }, {
      key: 'generateKeyName',
      value: function generateKeyName(obj, element, type, index) {
        var i = index || 1;
        var typeStr = typeof type === 'string' ? '-' + type : '';

        if (typeof obj[element + typeStr] === 'undefined') return element + typeStr;else if (typeof obj[element + typeStr + '-' + i] === 'undefined') return element + typeStr + '-' + i;else return FinalForm.generateKeyName(obj, element, type, i + 1);
      }
    }, {
      key: 'getFieldName',
      value: function getFieldName(field) {
        return field.name || field.id || field.placeholder || null;
      }
    }, {
      key: 'serialize',
      value: function serialize(obj) {
        var str = '';

        if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return str;

        (0, _lodash4.default)(Object.keys(obj), function (key) {

          if (!obj[key] || typeof obj[key] === 'string' || typeof obj[key] === 'number') str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';else if ((0, _lodash6.default)(obj[key])) {
            var valueStr = '';
            (0, _lodash4.default)(obj[key], function (a) {
              valueStr += a + ',';
            });
            valueStr = valueStr.slice(0, -1);
            str += encodeURIComponent(key) + '=' + encodeURIComponent(valueStr) + '&';
          } else if (_typeof(obj[key]) === 'object') str += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(obj[key])) + '&';else console.warn('could not serialize ' + obj[key]);
        });
        return str.slice(0, -1);
      }

      /*
      */

    }]);

    function FinalForm(form, options) {
      _classCallCheck(this, FinalForm);

      this.options = options || {};
      this.form = form;

      if (this.options.modify === false) {
        this.options.trim = this.options.compress = this.options.toUpperCase = this.options.toLowerCase = this.options.checkboxesAsArray = false;
      }

      FinalForm.validateFormElement(this.form);
    }

    /* Gets all form <input> values
    */


    _createClass(FinalForm, [{
      key: 'getInputs',
      value: function getInputs() {
        var _this = this;

        var obj = {};

        (0, _lodash4.default)(this.form.getElementsByTagName('input'), function (input, i) {

          var type = input.type || 'text';
          var name = FinalForm.getFieldName(input) || FinalForm.generateKeyName(obj, 'input', type);
          var val = input.value;

          if (_this.options.trim !== false) val = val.trim();

          if (_this.options.compress !== false) val = val.replace(/ +/g, ' ');

          if (_this.options.toUpperCase === true) val = val.toUpperCase();

          if (_this.options.toLowerCase === true) val = val.toLowerCase();

          if (type === 'checkbox') {
            if (_this.options.checkboxesAsArray) {
              if (!(0, _lodash6.default)(obj[name])) obj[name] = [];
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
    }, {
      key: 'getSelects',
      value: function getSelects(parent) {
        var obj = {};
        (0, _lodash4.default)(parent.getElementsByTagName('select'), function (select, i) {
          var name = FinalForm.getFieldName(select) || FinalForm.generateKeyName(obj, 'select');
          obj[name] = select.value;
        });
        return obj;
      }
    }, {
      key: 'getTextAreas',
      value: function getTextAreas(parent) {
        var obj = {};
        (0, _lodash4.default)(parent.getElementsByTagName('textarea'), function (ta, i) {
          var name = FinalForm.getFieldName(ta) || FinalForm.generateKeyName(obj, 'textarea');
          obj[name] = ta.value;
        });
        return obj;
      }
    }, {
      key: 'getButtons',
      value: function getButtons(parent) {
        var obj = {};
        (0, _lodash4.default)(parent.getElementsByTagName('button'), function (btn, i) {
          var name = FinalForm.getFieldName(btn) || FinalForm.generateKeyName(obj, 'button');
          obj[name] = btn.value;
        });
        return obj;
      }
    }, {
      key: 'parse',
      value: function parse() {
        var args = [this.form, this.options];
        return merge(this.getInputs.apply(this, args), this.getTextAreas.apply(this, args), this.getSelects.apply(this, args), this.getButtons.apply(this, args));
      }
    }]);

    return FinalForm;
  }();

  function createCustomFinalForm() {
    var forms = [];
    var fields = [];
    var mappedFields = {};
    var fieldsToFilter = [];
    var parseActions = [];

    var CustomFinalForm = function () {
      function CustomFinalForm() {
        _classCallCheck(this, CustomFinalForm);
      }

      _createClass(CustomFinalForm, [{
        key: 'defineField',
        value: function defineField(name, getter) {
          fields.push({ name: name, getter: getter });
          return this;
        }
      }, {
        key: 'attachForm',
        value: function attachForm(form) {
          FinalForm.validateFormElement(form);
          forms.push(new FinalForm(form));
          return this;
        }
      }, {
        key: 'mapFields',
        value: function mapFields(obj) {
          if (!(0, _lodash10.default)(obj)) {
            console.error('FinalForm Error: Must pass plain object to mapFields');
            return this;
          }
          (0, _lodash12.default)(obj, function (v, k) {
            if (typeof v !== 'string') return console.error('FinalForm Error: mapFields object values must be strings.');
            mappedFields[k] = v;
          });
          parseActions.push(function (parsedObj) {
            (0, _lodash12.default)(mappedFields, function (v, k) {
              if ((0, _lodash14.default)(parsedObj, k)) {
                parsedObj[v] = parsedObj[k];
                delete parsedObj[k];
              }
            });
          });
        }
      }, {
        key: 'filterFields',
        value: function filterFields() {
          for (var _len2 = arguments.length, _fields = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            _fields[_key2] = arguments[_key2];
          }

          (0, _lodash4.default)((0, _lodash2.default)(_fields), function (f) {
            fieldsToFilter.push(f);
          });
          parseActions.push(function (obj) {
            (0, _lodash12.default)(obj, function (v, k) {
              if (!(0, _lodash16.default)(fieldsToFilter, k)) delete obj[k];
            });
          });
        }
      }, {
        key: 'parse',
        value: function parse() {
          var obj = merge((0, _lodash8.default)(forms, function (form) {
            return form.parse();
          }));
          (0, _lodash4.default)(fields, function (fieldObj) {
            obj[fieldObj.name] = fieldObj.getter();
          });

          (0, _lodash4.default)(parseActions, function (cb) {
            cb(obj);
          });

          return obj;
        }
      }, {
        key: 'serialize',
        value: function serialize() {
          return FinalForm.serialize(this.parse());
        }
      }]);

      return CustomFinalForm;
    }();

    return new CustomFinalForm();
  }

  return {
    parse: function parse(form, options) {
      var ff = new FinalForm(form, options);
      return ff.parse();
    },
    serialize: function serialize(form, options) {
      var ff = new FinalForm(form, options);
      return FinalForm.serialize(ff.parse());
    },
    create: function create(form) {
      var customParser = createCustomFinalForm();
      if (form) customParser.attachForm(form);
      return customParser;
    }
  };
}();

