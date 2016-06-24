'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _FinalForm = require('./FinalForm');

var _FinalForm2 = _interopRequireDefault(_FinalForm);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function createCustomParser() {
  var _forms = [];
  var definedFields = [];
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

    _lodash2.default.forOwn(validationsCallbacks, function (validationCb, validation) {
      var objKey = void 0;
      if (_lodash2.default.has(formObj, validation)) objKey = validation;else if (_lodash2.default.has(formObj, mappedKeysAndValues[validation])) objKey = mappedKeysAndValues[validation];

      if (!_lodash2.default.has(formObj, objKey)) return console.error('FinalForm Error: cannot validate "' + objKey + '". Not found.');

      var isValid = validationCb(formObj[objKey].element || formObj[objKey].value);
      if (!isValid) {
        invalidFields.push(formObj[objKey]);
        _lodash2.default.remove(validFieldsKeys, function (key) {
          return key === objKey;
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
    _lodash2.default.forOwn(keyMap, function (val, key) {
      if (_lodash2.default.has(formObj, val)) {
        return console.error('FinalForm Error: cannot map "' + key + '" to "' + val + '". "' + val + '" already exists.');
      }
      if (_lodash2.default.has(formObj, key)) {
        formObj[val] = formObj[key];
        formObj[val].name = val;
        delete formObj[key];
      }
    });
  }

  function pickKeys(formObj) {
    _lodash2.default.forOwn(formObj, function (val, key) {
      if (!_lodash2.default.includes(keysToPick, key)) delete formObj[key];
    });
  }

  function defineObjectValidationProperties(formObj) {
    var validationObj = {
      isValid: true,
      invalidFields: [],
      validFields: []
    };

    if (!_lodash2.default.isEmpty(validationsCallbacks)) validationObj = validateFormObj(formObj);

    Object.defineProperty(formObj, 'invalidFields', {
      get: function get() {
        return validationObj.invalidFields;
      }
    });
    Object.defineProperty(formObj, 'validFields', {
      get: function get() {
        return validationObj.validFields;
      }
    });
    Object.defineProperty(formObj, 'isValid', {
      get: function get() {
        return validationObj.isValid;
      }
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
        for (var _len = arguments.length, formsArr = Array(_len), _key = 0; _key < _len; _key++) {
          formsArr[_key] = arguments[_key];
        }

        _lodash2.default.each(_lodash2.default.flatten(formsArr), function (form) {
          _FinalForm2.default.validateFormElement(form);
          _forms.push(new _FinalForm2.default(form));
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
        _lodash2.default.forOwn(validationsObj, function (val, key) {
          if (typeof val !== 'function') return console.error('FinalForm Error: validation must be a function');
          validationsCallbacks[key] = val;
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

        var formObj = (0, _merge2.default)(_lodash2.default.map(_forms, function (form) {
          return form.parse();
        }));

        _lodash2.default.each(definedFields, function (definedField) {
          formObj[definedField.name] = {
            value: definedField.getter(),
            name: definedField.name,
            element: null
          };
        });

        if (keysToPick.length) pickKeys(formObj);

        if (!_lodash2.default.isEmpty(keyMap)) mapKeys(formObj);

        defineObjectValidationProperties(formObj);

        _lodash2.default.forOwn(formObj, function (val, key) {
          formObj[key] = val.value;
        });

        return formObj;
      }
    }, {
      key: 'serialize',
      value: function serialize() {
        return _FinalForm2.default.serialize(this.parse());
      }
    }]);

    return CustomFinalForm;
  }();

  return new CustomFinalForm();
};