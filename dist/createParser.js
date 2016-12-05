'use strict';

var _utils = require('./utils');

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
    var invalidFields = (0, _utils.keys)((0, _utils.keyBy)(validationInfo.invalidFields, function (fieldObj) {
      return fieldObj.name;
    }));
    var validFields = (0, _utils.keys)((0, _utils.keyBy)(validationInfo.validFields, function (fieldObj) {
      return fieldObj.name;
    }));
    return (0, _utils.concat)(invalidFields, validFields);
  }

  var configUtils = {
    forms: function forms() {
      if (!(0, _utils.isArray)(config.forms)) throw new _FinalFormError2.default('"forms" must be an array of forms');
      (0, _utils.forEach)(config.forms, function (form) {
        if (form instanceof HTMLElement) _forms.push(new _FinalForm2.default(form));else throw new _FinalFormError2.default('all forms must be html elements');
      });
    },
    mapNames: function mapNames() {
      if (!(0, _utils.isPlainObject)(config.mapNames)) throw new _FinalFormError2.default('"mapNames" must be a plain object');
      (0, _utils.forOwn)(config.mapNames, function (mapValue, mapKey) {
        mappedKeysAndValues[mapKey] = mapValue;
        mappedKeysAndValues[mapValue] = mapKey;
        keyMap[mapKey] = mapValue;
      });
    },
    pick: function pick() {
      if (!(0, _utils.isArray)(config.pick)) throw new _FinalFormError2.default('"pick" must be an array field names');
      (0, _utils.forEach)(config.pick, function (field) {
        if (mappedKeysAndValues[field]) keysToPick.push(mappedKeysAndValues[field]);
        keysToPick.push(field);
      });
    },
    customFields: function customFields() {
      if (!(0, _utils.isPlainObject)(config.customFields)) throw new _FinalFormError2.default('"customFields" must be a plain object');
      (0, _utils.forOwn)(config.customFields, function (func, fieldName) {
        definedFields.push({ name: fieldName, getter: func });
      });
    },
    validations: function validations() {
      if (!(0, _utils.isPlainObject)(config.validations)) throw new _FinalFormError2.default('"validations" must be a plain object');
      (0, _utils.forOwn)(config.validations, function (func, fieldName) {
        if (!(0, _utils.isFunction)(func)) throw new _FinalFormError2.default('validation must be a function');
        syncValidationCallbacks[fieldName] = func;
      });
    },
    asyncValidations: function asyncValidations() {
      if (!(0, _utils.isPlainObject)(config.asyncValidations)) throw new _FinalFormError2.default('"asyncValidations" must be a plain object');
      (0, _utils.forOwn)(config.asyncValidations, function (func, fieldName) {
        if (!(0, _utils.isFunction)(func)) throw new _FinalFormError2.default('asyncValidations must be a function');
        asyncValidationCallbacks[fieldName] = func;
      });
    },
    validationInputs: function validationInputs() {
      if (!(0, _utils.isPlainObject)(config.validationInputs)) throw new _FinalFormError2.default('"validationInputs" must be a plain object');
      (0, _utils.forOwn)(config.validationInputs, function (value, fieldName) {
        _validationInputs[fieldName] = value;
      });
    },
    values: function values() {
      if ((0, _utils.isBoolean)(config.values.trim)) valuesConfig.trim = config.values.trim;
      if ((0, _utils.isBoolean)(config.values.compress)) valuesConfig.compress = config.values.compress;
      if ((0, _utils.isBoolean)(config.values.escape)) valuesConfig.escape = config.values.escape;
      if ((0, _utils.isFunction)(config.values.map)) valuesConfig.map = config.values.map;
      if ((0, _utils.includes)(['object', 'array'], config.values.checkboxFormat)) valuesConfig.checkboxFormat = config.values.checkboxFormat;
    }
  };

  function pickKeys(formObj) {
    (0, _utils.forOwn)(formObj, function (val, key) {
      if (!(0, _utils.includes)(keysToPick, key)) delete formObj[key];
    });
  }

  function mapKeys(formObj) {
    (0, _utils.forOwn)(keyMap, function (val, key) {
      if ((0, _utils.has)(formObj, val)) {
        return console.error('FinalForm Error: cannot map "' + key + '" to "' + val + '". "' + val + '" already exists.');
      }
      if ((0, _utils.has)(formObj, key)) {
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
    if ((0, _utils.isPlainObject)(validationRes)) {
      if (!(0, _utils.isBoolean)(validationRes.isValid)) throw new _FinalFormError2.default('validation object must have property "isValid" (Boolean)');
      if (validationRes.isValid) validationInfo.validFields.push(formObj[fieldName]);
      if (validationRes.msg) formObj[fieldName].msg = validationRes.msg;
      if ((0, _utils.has)(validationRes, 'meta') && (0, _utils.isPlainObject)(validationRes.meta)) formObj[fieldName].meta = validationRes.meta;else validationInfo.invalidFields.push(formObj[fieldName]);
    } else if (validationRes) validationInfo.validFields.push(formObj[fieldName]);else if (!validationRes) validationInfo.invalidFields.push(formObj[fieldName]);
  }

  function runSyncValidations(formObj) {
    (0, _utils.forOwn)(syncValidationCallbacks, function (validationCb, fieldName) {
      if ((0, _utils.includes)(getValidatedFields(), fieldName)) throw new _FinalFormError2.default('"' + fieldName + '" cannot be validated twice');

      var objKey = void 0;
      if ((0, _utils.has)(formObj, fieldName)) objKey = fieldName;else if ((0, _utils.has)(formObj, mappedKeysAndValues[fieldName])) objKey = mappedKeysAndValues[fieldName];
      if (!(0, _utils.has)(formObj, objKey)) {
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

    (0, _utils.forOwn)(asyncValidationCallbacks, function (validationCb, fieldName) {
      if ((0, _utils.includes)(getValidatedFields(), fieldName)) throw new _FinalFormError2.default('"' + fieldName + '" cannot be validated twice');
      var objKey = void 0;
      if ((0, _utils.has)(formObj, fieldName)) objKey = fieldName;else if ((0, _utils.has)(formObj, mappedKeysAndValues[fieldName])) objKey = mappedKeysAndValues[fieldName];

      if (!(0, _utils.has)(formObj, objKey)) {
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
      (0, _utils.forOwn)(userResponses, function (userResponse, fieldName) {
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

    (0, _utils.forOwn)(value, function (val, key) {
      var cleanedVal = cleanInput({ value: val, type: null, name: name });
      if (cleanedVal === 'true') cleanedVal = true;else if (cleanedVal === 'false') cleanedVal = false;
      value[key] = cleanedVal;
    });
    if (type !== 'checkbox' || type === 'checkbox' && valuesConfig.checkboxFormat === 'object') return value;else return (0, _utils.keys)((0, _utils.pickBy)(value, function (val) {
      return val === 'true' || val === true;
    }));
  }

  function cleanArray(_ref2) {
    var value = _ref2.value;
    var type = _ref2.type;
    var name = _ref2.name;

    (0, _utils.forEach)(value, function (val, i) {
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
      if (valuesConfig.trim) cleanedVal = (0, _utils.trim)(cleanedVal);
      if (valuesConfig.compress) cleanedVal = (0, _utils.replace)(cleanedVal, / +/g, ' ');
    }
    if (valuesConfig.escape) cleanedVal = (0, _utils.escape)(cleanedVal);
    if ((0, _utils.isFunction)(valuesConfig.map)) cleanedVal = valuesConfig.map(cleanedVal, name, type);
    return cleanedVal;
  }

  function cleanInput(_ref4) {
    var value = _ref4.value;
    var type = _ref4.type;
    var name = _ref4.name;

    if (typeof value === 'undefined') throw new _FinalFormError2.default('input value cannot be undefined');else if (typeof type === 'undefined') throw new _FinalFormError2.default('input type cannot be undefined');

    if ((0, _utils.isPlainObject)(value)) return cleanObject({ value: value, type: type, name: name });else if ((0, _utils.isArray)(value)) return cleanArray({ value: value, type: type, name: name });else if ((0, _utils.isString)(value)) return cleanText({ value: value, type: type, name: name });else return value;
  }

  function cleanValues(formObj) {
    (0, _utils.forOwn)(formObj, function (val, key) {
      if (val.type === 'custom') formObj[key] = val.value;else formObj[key] = cleanInput({ value: val.value, type: val.type, name: val.name });
    });
    return formObj;
  }

  function parse() {
    var formObj = (0, _merge2.default)((0, _utils.map)(_forms, function (form) {
      return form.parse();
    }));

    (0, _utils.forEach)(definedFields, function (definedField) {
      formObj[definedField.name] = {
        value: definedField.getter(),
        name: definedField.name,
        element: null,
        type: 'custom'
      };
    });

    if (keysToPick.length) pickKeys(formObj);

    if (!(0, _utils.isEmpty)(keyMap)) mapKeys(formObj);

    addValidationProperties(formObj);

    if (!(0, _utils.isEmpty)(syncValidationCallbacks)) runSyncValidations(formObj);

    if ((0, _utils.isEmpty)(asyncValidationCallbacks)) return cleanValues(formObj);else {
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
    if ((0, _utils.isPlainObject)(config.values)) configUtils.values();
  })();

  return { parse: parse };
};