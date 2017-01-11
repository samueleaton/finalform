'use strict';

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _FinalForm = require('./FinalForm');

var _FinalForm2 = _interopRequireDefault(_FinalForm);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

var _sparallel = require('sparallel');

var _sparallel2 = _interopRequireDefault(_sparallel);

var _FinalFormError = require('./FinalFormError');

var _FinalFormError2 = _interopRequireDefault(_FinalFormError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function createParser(config) {
  var _forms = [];
  var keysToPick = [];
  var definedFields = [];
  var mappedKeysAndValues = {};
  var keyMap = {};
  var valuesConfig = {
    trim: true,
    compress: true,
    escape: false,
    map: null,
    checkboxFormat: 'object'
  };
  var syncValidationCallbacks = {};
  var asyncValidationCallbacks = {};
  var _validationInputs = {};
  var validationInfo = {
    isValid: true,
    invalidFields: [],
    validFields: []
  };

  /*
    returns field that have gone through the validation process.
    whether they are valid or invalid is another question
  */
  function getValidatedFields() {
    var invalidFields = _utils2.default.keys(_utils2.default.keyBy(validationInfo.invalidFields, function (fieldObj) {
      return fieldObj.name;
    }));
    var validFields = _utils2.default.keys(_utils2.default.keyBy(validationInfo.validFields, function (fieldObj) {
      return fieldObj.name;
    }));
    return _utils2.default.concat(invalidFields, validFields);
  }

  var configUtils = {
    forms: function forms() {
      if (!_utils2.default.isArray(config.forms)) throw new _FinalFormError2.default('"forms" must be an array of forms');
      _utils2.default.forEach(config.forms, function (form) {
        if (form instanceof HTMLElement) _forms.push(new _FinalForm2.default(form));else throw new _FinalFormError2.default('all forms must be html elements');
      });
    },
    mapNames: function mapNames() {
      if (!_utils2.default.isPlainObject(config.mapNames)) throw new _FinalFormError2.default('"mapNames" must be a plain object');
      _utils2.default.forOwn(config.mapNames, function (mapValue, mapKey) {
        mappedKeysAndValues[mapKey] = mapValue;
        mappedKeysAndValues[mapValue] = mapKey;
        keyMap[mapKey] = mapValue;
      });
    },
    pick: function pick() {
      if (!_utils2.default.isArray(config.pick)) throw new _FinalFormError2.default('"pick" must be an array field names');
      _utils2.default.forEach(config.pick, function (field) {
        if (mappedKeysAndValues[field]) keysToPick.push(mappedKeysAndValues[field]);
        keysToPick.push(field);
      });
    },
    customFields: function customFields() {
      if (!_utils2.default.isPlainObject(config.customFields)) throw new _FinalFormError2.default('"customFields" must be a plain object');
      _utils2.default.forOwn(config.customFields, function (func, fieldName) {
        definedFields.push({ name: fieldName, getter: func });
      });
    },
    validations: function validations() {
      if (!_utils2.default.isPlainObject(config.validations)) throw new _FinalFormError2.default('"validations" must be a plain object');
      _utils2.default.forOwn(config.validations, function (func, fieldName) {
        if (!_utils2.default.isFunction(func)) throw new _FinalFormError2.default('validation must be a function');
        syncValidationCallbacks[fieldName] = func;
      });
    },
    asyncValidations: function asyncValidations() {
      if (!_utils2.default.isPlainObject(config.asyncValidations)) throw new _FinalFormError2.default('"asyncValidations" must be a plain object');
      _utils2.default.forOwn(config.asyncValidations, function (func, fieldName) {
        if (!_utils2.default.isFunction(func)) throw new _FinalFormError2.default('asyncValidations must be a function');
        asyncValidationCallbacks[fieldName] = func;
      });
    },
    validationInputs: function validationInputs() {
      if (!_utils2.default.isPlainObject(config.validationInputs)) throw new _FinalFormError2.default('"validationInputs" must be a plain object');
      _utils2.default.forOwn(config.validationInputs, function (value, fieldName) {
        _validationInputs[fieldName] = value;
      });
    },
    values: function values() {
      if (_utils2.default.isBoolean(config.values.trim)) valuesConfig.trim = config.values.trim;
      if (_utils2.default.isBoolean(config.values.compress)) valuesConfig.compress = config.values.compress;
      if (_utils2.default.isBoolean(config.values.escape)) valuesConfig.escape = config.values.escape;
      if (_utils2.default.isFunction(config.values.map)) valuesConfig.map = config.values.map;
      if (_utils2.default.includes(['object', 'array'], config.values.checkboxFormat)) valuesConfig.checkboxFormat = config.values.checkboxFormat;
    }
  };

  function pickKeys(formObj) {
    _utils2.default.forOwn(formObj, function (val, key) {
      if (!_utils2.default.includes(keysToPick, key)) delete formObj[key];
    });
  }

  function mapKeys(formObj) {
    _utils2.default.forOwn(keyMap, function (val, key) {
      if (_utils2.default.has(formObj, val)) {
        return console.error('FinalForm Error: cannot map "' + key + '" to "' + val + '". "' + val + '" already exists.');
      }
      if (_utils2.default.has(formObj, key)) {
        formObj[val] = formObj[key];
        formObj[val].name = val;
        delete formObj[key];
      }
    });
  }

  function addValidationProperties(formObj) {
    Object.defineProperty(formObj, 'invalidFields', {
      get: function get() {
        return validationInfo.invalidFields;
      }
    });
    Object.defineProperty(formObj, 'validFields', {
      get: function get() {
        return validationInfo.validFields;
      }
    });
    Object.defineProperty(formObj, 'isValid', {
      get: function get() {
        return validationInfo.isValid;
      }
    });
  }

  function processUserValidationResponse(formObj, fieldName, validationRes) {
    if (_utils2.default.isPlainObject(validationRes)) {
      if (!_utils2.default.isBoolean(validationRes.isValid)) throw new _FinalFormError2.default('validation object must have property "isValid" (Boolean)');
      if (validationRes.isValid) validationInfo.validFields.push(formObj[fieldName]);
      if (validationRes.msg) formObj[fieldName].msg = validationRes.msg;
      if (_utils2.default.has(validationRes, 'meta') && _utils2.default.isPlainObject(validationRes.meta)) formObj[fieldName].meta = validationRes.meta;else validationInfo.invalidFields.push(formObj[fieldName]);
    } else if (validationRes) validationInfo.validFields.push(formObj[fieldName]);else if (!validationRes) validationInfo.invalidFields.push(formObj[fieldName]);
  }

  function runSyncValidations(formObj) {
    _utils2.default.forOwn(syncValidationCallbacks, function (validationCb, fieldName) {
      if (_utils2.default.includes(getValidatedFields(), fieldName)) throw new _FinalFormError2.default('"' + fieldName + '" cannot be validated twice');

      var objKey = void 0;
      if (_utils2.default.has(formObj, fieldName)) objKey = fieldName;else if (_utils2.default.has(formObj, mappedKeysAndValues[fieldName])) objKey = mappedKeysAndValues[fieldName];

      if (!objKey) {
        return console.warn('FinalForm: cannot validate "' + fieldName + '". Field Not found.');
      } else if (!_utils2.default.has(formObj, objKey)) {
        return console.warn('FinalForm: cannot validate "' + objKey + '". Field Not found.');
      }

      // check if boolean or object with validation status and msg
      var validationRes = validationCb(formObj[objKey].value);
      processUserValidationResponse(formObj, objKey, validationRes);
    });

    validationInfo.isValid = validationInfo.invalidFields.length === 0;
  }

  function runAsyncValidations(formObj, asyncValidationsCb) {
    var asyncValidationsArray = [];

    _utils2.default.forOwn(asyncValidationCallbacks, function (validationCb, fieldName) {
      if (_utils2.default.includes(getValidatedFields(), fieldName)) throw new _FinalFormError2.default('"' + fieldName + '" cannot be validated twice');
      var objKey = void 0;
      if (_utils2.default.has(formObj, fieldName)) objKey = fieldName;else if (_utils2.default.has(formObj, mappedKeysAndValues[fieldName])) objKey = mappedKeysAndValues[fieldName];

      if (!_utils2.default.has(formObj, objKey)) {
        return console.warn('FinalForm: cannot validate "' + objKey + '". Field Not found.');
      }

      asyncValidationsArray.push(function (done) {
        function onDone(userResponse) {
          var asyncResponse = {};
          asyncResponse[fieldName] = userResponse;
          done(asyncResponse);
        };
        validationCb(formObj[objKey].value, onDone);
      });
    });

    (0, _sparallel2.default)(asyncValidationsArray).then(function (userResponses) {
      _utils2.default.forOwn(userResponses, function (userResponse, fieldName) {
        processUserValidationResponse(formObj, fieldName, userResponse);
      });
      validationInfo.isValid = validationInfo.invalidFields.length === 0;
      asyncValidationsCb();
    });
  }

  function cleanObject(_ref) {
    var value = _ref.value;
    var type = _ref.type;
    var name = _ref.name;

    _utils2.default.forOwn(value, function (val, key) {
      var cleanedVal = cleanInput({ value: val, type: null, name: name });
      if (cleanedVal === 'true') cleanedVal = true;else if (cleanedVal === 'false') cleanedVal = false;
      value[key] = cleanedVal;
    });
    if (type !== 'checkbox' || type === 'checkbox' && valuesConfig.checkboxFormat === 'object') return value;else return _utils2.default.keys(_utils2.default.pickBy(value, function (val) {
      return val === 'true' || val === true;
    }));
  }

  function cleanArray(_ref2) {
    var value = _ref2.value;
    var type = _ref2.type;
    var name = _ref2.name;

    _utils2.default.forEach(value, function (val, i) {
      value[i] = cleanInput({ value: val, type: null, name: name });
    });
    return value;
  }

  function cleanText(_ref3) {
    var value = _ref3.value;
    var type = _ref3.type;
    var name = _ref3.name;

    var cleanedVal = value;
    if (type !== 'textarea') {
      if (valuesConfig.trim) cleanedVal = _utils2.default.trim(cleanedVal);
      if (valuesConfig.compress) cleanedVal = _utils2.default.replace(cleanedVal, / +/g, ' ');
    }
    if (valuesConfig.escape) cleanedVal = _utils2.default.escape(cleanedVal);
    if (_utils2.default.isFunction(valuesConfig.map)) cleanedVal = valuesConfig.map(cleanedVal, name, type);
    return cleanedVal;
  }

  function cleanInput(_ref4) {
    var value = _ref4.value;
    var type = _ref4.type;
    var name = _ref4.name;

    if (typeof value === 'undefined') throw new _FinalFormError2.default('input value cannot be undefined');else if (typeof type === 'undefined') throw new _FinalFormError2.default('input type cannot be undefined');

    if (_utils2.default.isPlainObject(value)) return cleanObject({ value: value, type: type, name: name });else if (_utils2.default.isArray(value)) return cleanArray({ value: value, type: type, name: name });else if (_utils2.default.isString(value)) return cleanText({ value: value, type: type, name: name });else return value;
  }

  function cleanValues(formObj) {
    _utils2.default.forOwn(formObj, function (val, key) {
      if (val.type === 'custom') formObj[key] = val.value;else formObj[key] = cleanInput({ value: val.value, type: val.type, name: val.name });
    });
    return formObj;
  }

  function parse() {
    var formObj = (0, _merge2.default)(_utils2.default.map(_forms, function (form) {
      return form.parse();
    }));

    _utils2.default.forEach(definedFields, function (definedField) {
      formObj[definedField.name] = {
        value: definedField.getter(formObj),
        name: definedField.name,
        element: null,
        type: 'custom'
      };
    });

    if (keysToPick.length) pickKeys(formObj);

    if (!_utils2.default.isEmpty(keyMap)) mapKeys(formObj);

    addValidationProperties(formObj);

    if (!_utils2.default.isEmpty(syncValidationCallbacks)) runSyncValidations(formObj);

    if (_utils2.default.isEmpty(asyncValidationCallbacks)) return cleanValues(formObj);else {
      return new Promise(function (resolve, reject) {
        runAsyncValidations(formObj, function () {
          resolve(cleanValues(formObj));
        });
      });
    }
  }

  (function processConfig() {
    if (config.forms) configUtils.forms();
    if (config.mapNames) configUtils.mapNames();
    if (config.pick) configUtils.pick();
    if (config.customFields) configUtils.customFields();
    if (config.validations) configUtils.validations();
    if (config.asyncValidations) configUtils.asyncValidations();
    if (config.validationInputs) configUtils.validationInputs();
    if (_utils2.default.isPlainObject(config.values)) configUtils.values();
  })();

  return { parse: parse };
};