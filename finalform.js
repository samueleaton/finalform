/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function merge() {
    var obj = {};

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _lodash2.default.each(_lodash2.default.flatten(args), function (arg) {
      if (!arg || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') return;
      _lodash2.default.each(_lodash2.default.keys(arg), function (key) {
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

        _lodash2.default.each(_lodash2.default.keys(obj), function (key) {

          if (!obj[key] || typeof obj[key] === 'string' || typeof obj[key] === 'number') str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';else if (_lodash2.default.isArray(obj[key])) {
            var valueStr = '';
            _lodash2.default.each(obj[key], function (a) {
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
        var elementMap = {};

        _lodash2.default.each(this.form.getElementsByTagName('input'), function (element, i) {

          var type = element.type || 'text';
          var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(obj, 'input', type);
          var val = element.value;

          if (_this.options.trim !== false) val = val.trim();

          if (_this.options.compress !== false) val = val.replace(/ +/g, ' ');

          if (_this.options.toUpperCase === true) val = val.toUpperCase();

          if (_this.options.toLowerCase === true) val = val.toLowerCase();

          if (type === 'checkbox') {
            if (_this.options.checkboxesAsArray) {
              if (!_lodash2.default.isArray(obj[name])) obj[name] = [];
              if (element.checked) obj[name].push(val);
            } else {
              if (_typeof(obj[name]) !== 'object') obj[name] = {};
              obj[name][val] = element.checked;
            }
          } else if (type === 'radio') {
            if (typeof obj[name] === 'undefined') obj[name] = '';
            if (element.checked) obj[name] = val;
          } else obj[name] = val;

          elementMap[name] = { name: name, element: element, value: obj[name] };
        });
        return elementMap;
      }
    }, {
      key: 'getSelects',
      value: function getSelects(parent) {
        var elementMap = {};
        _lodash2.default.each(parent.getElementsByTagName('select'), function (element, i) {
          var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'select');
          elementMap[name] = { name: name, element: element, value: element.value };
        });
        return elementMap;
      }
    }, {
      key: 'getTextAreas',
      value: function getTextAreas(parent) {
        var elementMap = {};
        _lodash2.default.each(parent.getElementsByTagName('textarea'), function (element, i) {
          var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'textarea');
          elementMap[name] = { name: name, element: element, value: element.value };
        });
        return elementMap;
      }
    }, {
      key: 'getButtons',
      value: function getButtons(parent) {
        var elementMap = {};
        _lodash2.default.each(parent.getElementsByTagName('button'), function (element, i) {
          var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'button');
          elementMap[name] = { name: name, element: element, value: element.value };
        });
        return elementMap;
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
    var _forms = [];
    var definedFields = [];
    var parseActionQueue = [];
    var mappedKeysAndValues = {};
    var keysToPick = [];
    var keyMap = {};
    var validationsCallbacks = {};

    function processParseConfig(parseConfig) {
      if (parseConfig.map) {
        if (!_lodash2.default.isPlainObject(parseConfig.map)) {
          console.error('FinalForm Error: map must be a plain object');
          return;
        }
        _lodash2.default.forOwn(parseConfig.map, function (mapValue, mapKey) {
          mappedKeysAndValues[mapKey] = mapValue;
          mappedKeysAndValues[mapValue] = mapKey;
          keyMap[mapKey] = mapValue;
        });
      }

      if (parseConfig.pick) {
        if (!_lodash2.default.isArray(parseConfig.pick)) {
          console.error('FinalForm Error: pick must be an array');
          return;
        }
        _lodash2.default.each(parseConfig.pick, function (field) {
          if (mappedKeysAndValues[field]) keysToPick.push(mappedKeysAndValues[field]);
          keysToPick.push(field);
        });
      }
    }

    function validateFormObj(formObj) {
      var validFieldsKeys = _lodash2.default.keys(formObj);
      var validFields = [];
      var invalidFields = [];

      _lodash2.default.forOwn(validationsCallbacks, function (cb, k) {
        if (!_lodash2.default.has(formObj, k)) return console.error('FinalForm Error: cannot validate "' + k + '". Not found.');
        var isValid = cb(formObj[k].element || formObj[k].value);
        if (!isValid) {
          invalidFields.push(formObj[k]);
          _lodash2.default.remove(validFieldsKeys, function (key) {
            return key === k;
          });
        }
      });
      _lodash2.default.each(validFieldsKeys, function (key) {
        validFields.push(formObj[key]);
      });
      return {
        validFields: validFields, invalidFields: invalidFields, isValid: invalidFields.length === 0
      };
    }

    function mapKeys(formObj) {
      _lodash2.default.forOwn(keyMap, function (v, k) {
        if (_lodash2.default.has(formObj, k)) {
          formObj[v] = formObj[k];
          delete formObj[k];
        }
      });
    }

    function pickKeys(formObj) {
      _lodash2.default.forOwn(formObj, function (v, k) {
        if (!_lodash2.default.includes(keysToPick, k)) delete formObj[k];
      });
    }

    var CustomFinalForm = function () {
      function CustomFinalForm() {
        _classCallCheck(this, CustomFinalForm);
      }

      _createClass(CustomFinalForm, [{
        key: 'defineField',
        value: function defineField(name, getter) {
          definedFields.push({ name: name, getter: getter });
          return this;
        }
      }, {
        key: 'forms',
        value: function forms() {
          for (var _len2 = arguments.length, arr = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            arr[_key2] = arguments[_key2];
          }

          _lodash2.default.each(_lodash2.default.flatten(arr), function (form) {
            FinalForm.validateFormElement(form);
            _forms.push(new FinalForm(form));
          });
          return this;
        }
      }, {
        key: 'validations',
        value: function validations(validationsObj) {
          if (!_lodash2.default.isPlainObject(validationsObj)) {
            console.error('FinalForm Error: Must pass plain object to validations');
            return this;
          }
          _lodash2.default.forOwn(validationsObj, function (v, k) {
            if (typeof v !== 'function') return console.error('FinalForm Error: validation must be a function');
            validationsCallbacks[k] = v;
          });
        }
      }, {
        key: 'parse',
        value: function parse(parseConfig) {
          if (parseConfig) {
            if (!_lodash2.default.isPlainObject(parseConfig)) {
              console.error('FinalForm Error: Must pass plain object or undefined to parse');
              return this;
            }
            processParseConfig(parseConfig);
          }

          var formObj = merge(_lodash2.default.map(_forms, function (form) {
            return form.parse();
          }));

          _lodash2.default.each(definedFields, function (definedField) {
            formObj[definedField.name] = {
              value: definedField.getter(),
              name: definedField.name,
              element: null
            };
          });

          var resObj = {
            isValid: true,
            invalidFields: [],
            validFields: [],
            fields: {}
          };

          if (!_lodash2.default.isEmpty(validationsCallbacks)) {
            var validationResObj = validateFormObj(formObj);
            resObj.isValid = validationResObj.isValid;
            resObj.invalidFields = validationResObj.invalidFields;
            resObj.validFields = validationResObj.validFields;
          }

          if (keysToPick.length) pickKeys(formObj);

          if (!_lodash2.default.isEmpty(keyMap)) mapKeys(formObj);

          _lodash2.default.forOwn(formObj, function (v, k) {
            resObj.fields[k] = v.value;
          });

          return resObj;
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
      var parsedObj = ff.parse();
      _lodash2.default.forOwn(parsedObj, function (v, k) {
        parsedObj[k] = v.value;
      });
      return parsedObj;
    },
    serialize: function serialize(form, options) {
      return FinalForm.serialize(this.parse(form, options));
    },
    create: function create() {
      var customParser = createCustomFinalForm();
      if (arguments.length) customParser.forms.apply(customParser, arguments);
      return customParser;
    }
  };
}();

