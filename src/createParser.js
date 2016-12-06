import {
  isPlainObject,
  forOwn,
  forEach,
  has,
  map,
  keys,
  keyBy,
  pickBy,
  concat,
  isArray,
  isBoolean,
  isFunction,
  isString,
  isEmpty,
  includes,
  trim,
  replace,
  escape
} from './utils';
import FinalForm from './FinalForm';
import merge from './merge';
import sparallel from 'sparallel';
import FinalFormError from './FinalFormError';

module.exports = function createParser(config) {
  const forms = [];
  const keysToPick = [];
  const definedFields = [];
  const mappedKeysAndValues = {};
  const keyMap = {};
  const valuesConfig = {
    trim: true,
    compress: true,
    escape: false,
    map: null,
    checkboxFormat: 'object'
  };
  const syncValidationCallbacks = {};
  const asyncValidationCallbacks = {};
  const validationInputs = {};
  const validationInfo = {
    isValid: true,
    invalidFields: [],
    validFields: []
  };

  /*
    returns field that have gone through the validation process.
    whether they are valid or invalid is another question
  */
  function getValidatedFields() {
    const invalidFields = keys(
      keyBy(validationInfo.invalidFields, fieldObj => fieldObj.name)
    );
    const validFields = keys(
      keyBy(validationInfo.validFields, fieldObj => fieldObj.name)
    );
    return concat(invalidFields, validFields);
  }

  const configUtils = {
    forms() {
      if (!isArray(config.forms))
        throw new FinalFormError('"forms" must be an array of forms');
      forEach(config.forms, form => {
        if (form instanceof HTMLElement)
          forms.push(new FinalForm(form));
        else
          throw new FinalFormError('all forms must be html elements');
      });
    },
    mapNames() {
      if (!isPlainObject(config.mapNames))
        throw new FinalFormError('"mapNames" must be a plain object');
      forOwn(config.mapNames, (mapValue, mapKey) => {
        mappedKeysAndValues[mapKey] = mapValue;
        mappedKeysAndValues[mapValue] = mapKey;
        keyMap[mapKey] = mapValue;
      });
    },
    pick() {
      if (!isArray(config.pick))
        throw new FinalFormError('"pick" must be an array field names');
      forEach(config.pick, field => {
        if (mappedKeysAndValues[field])
          keysToPick.push(mappedKeysAndValues[field]);
        keysToPick.push(field);
      });
    },
    customFields() {
      if (!isPlainObject(config.customFields))
        throw new FinalFormError('"customFields" must be a plain object');
      forOwn(config.customFields, (func, fieldName) => {
        definedFields.push({ name: fieldName, getter: func });
      });
    },
    validations() {
      if (!isPlainObject(config.validations))
        throw new FinalFormError('"validations" must be a plain object');
      forOwn(config.validations, (func, fieldName) => {
        if (!isFunction(func))
          throw new FinalFormError('validation must be a function');
        syncValidationCallbacks[fieldName] = func;
      });
    },
    asyncValidations() {
      if (!isPlainObject(config.asyncValidations))
        throw new FinalFormError('"asyncValidations" must be a plain object');
      forOwn(config.asyncValidations, (func, fieldName) => {
        if (!isFunction(func))
          throw new FinalFormError('asyncValidations must be a function');
        asyncValidationCallbacks[fieldName] = func;
      });
    },
    validationInputs() {
      if (!isPlainObject(config.validationInputs))
        throw new FinalFormError('"validationInputs" must be a plain object');
      forOwn(config.validationInputs, (value, fieldName) => {
        validationInputs[fieldName] = value;
      });
    },
    values() {
      if (isBoolean(config.values.trim))
        valuesConfig.trim = config.values.trim;
      if (isBoolean(config.values.compress))
        valuesConfig.compress = config.values.compress;
      if (isBoolean(config.values.escape))
        valuesConfig.escape = config.values.escape;
      if (isFunction(config.values.map))
        valuesConfig.map = config.values.map;
      if (includes(['object', 'array'], config.values.checkboxFormat))
        valuesConfig.checkboxFormat = config.values.checkboxFormat;
    }
  };

  function pickKeys(formObj) {
    forOwn(formObj, (val, key) => {
      if (!includes(keysToPick, key))
        delete formObj[key];
    });
  }

  function mapKeys(formObj) {
    forOwn(keyMap, (val, key) => {
      if (has(formObj, val)) {
        return console.error(
          'FinalForm Error: cannot map "' + key + '" to "' + val + '". "' +
          val + '" already exists.'
        );
      }
      if (has(formObj, key)) {
        formObj[val] = formObj[key];
        formObj[val].name = val;
        delete formObj[key];
      }
    });
  }

  function addValidationProperties(formObj) {
    Object.defineProperty(formObj, 'invalidFields', {
      get() {
        return validationInfo.invalidFields;
      }
    });
    Object.defineProperty(formObj, 'validFields', {
      get() {
        return validationInfo.validFields;
      }
    });
    Object.defineProperty(formObj, 'isValid', {
      get() {
        return validationInfo.isValid;
      }
    });
  }

  function processUserValidationResponse(formObj, fieldName, validationRes) {
    if (isPlainObject(validationRes)) {
      if (!isBoolean(validationRes.isValid))
        throw new FinalFormError('validation object must have property "isValid" (Boolean)');
      if (validationRes.isValid)
        validationInfo.validFields.push(formObj[fieldName]);
      if (validationRes.msg)
        formObj[fieldName].msg = validationRes.msg;
      if (has(validationRes, 'meta') && isPlainObject(validationRes.meta))
        formObj[fieldName].meta = validationRes.meta;
      else
        validationInfo.invalidFields.push(formObj[fieldName]);
    }
    else if (validationRes)
      validationInfo.validFields.push(formObj[fieldName]);
    else if (!validationRes)
      validationInfo.invalidFields.push(formObj[fieldName]);
  }

  function runSyncValidations(formObj) {
    forOwn(syncValidationCallbacks, (validationCb, fieldName) => {
      if (includes(getValidatedFields(), fieldName))
        throw new FinalFormError(`"${fieldName}" cannot be validated twice`);

      let objKey;
      if (has(formObj, fieldName))
        objKey = fieldName;
      else if (has(formObj, mappedKeysAndValues[fieldName]))
        objKey = mappedKeysAndValues[fieldName];

      if (!objKey) {
        return console.warn(
          'FinalForm: cannot validate "' + fieldName + '". Field Not found.'
        );
      }
      else if (!has(formObj, objKey)) {
        return console.warn(
          'FinalForm: cannot validate "' + objKey + '". Field Not found.'
        );
      }
      
      // check if boolean or object with validation status and msg
      const validationRes = validationCb(formObj[objKey].value);
      processUserValidationResponse(formObj, objKey, validationRes);
    });

    validationInfo.isValid = validationInfo.invalidFields.length === 0;
  }

  function runAsyncValidations(formObj, asyncValidationsCb) {
    const asyncValidationsArray = [];

    forOwn(asyncValidationCallbacks, (validationCb, fieldName) => {
      if (includes(getValidatedFields(), fieldName))
        throw new FinalFormError(`"${fieldName}" cannot be validated twice`);
      let objKey;
      if (has(formObj, fieldName))
        objKey = fieldName;
      else if (has(formObj, mappedKeysAndValues[fieldName]))
        objKey = mappedKeysAndValues[fieldName];

      if (!has(formObj, objKey)) {
        return console.warn(
          'FinalForm: cannot validate "' + objKey + '". Field Not found.'
        );
      }
      
      asyncValidationsArray.push(done => {
        function onDone(userResponse) {
          const asyncResponse = {};
          asyncResponse[fieldName] = userResponse;
          done(asyncResponse);
        };
        validationCb(formObj[objKey].value, onDone);
      });
    });

    sparallel(asyncValidationsArray).then(userResponses => {
      forOwn(userResponses, (userResponse, fieldName) => {
        processUserValidationResponse(formObj, fieldName, userResponse);
      });
      validationInfo.isValid = validationInfo.invalidFields.length === 0;
      asyncValidationsCb();
    });
  }

  function cleanObject({ value, type, name }) {
    forOwn(value, (val, key) => {
      let cleanedVal = cleanInput({ value: val, type: null, name: name });
      if (cleanedVal === 'true')
        cleanedVal = true;
      else if (cleanedVal === 'false')
        cleanedVal = false;
      value[key] = cleanedVal;
    });
    if (type !== 'checkbox' || (type === 'checkbox' && valuesConfig.checkboxFormat === 'object'))
      return value;
    else
      return keys(pickBy(value, val => val === 'true' || val === true));
  }

  function cleanArray({ value, type, name }) {
    forEach(value, (val, i) => {
      value[i] = cleanInput({ value: val, type: null, name: name });
    });
    return value;
  }

  function cleanText({ value, type, name }) {
    let cleanedVal = value;
    if (type !== 'textarea') {
      if (valuesConfig.trim)
        cleanedVal = trim(cleanedVal);
      if (valuesConfig.compress)
        cleanedVal = replace(cleanedVal, / +/g, ' ');
    }
    if (valuesConfig.escape)
      cleanedVal = escape(cleanedVal);
    if (isFunction(valuesConfig.map))
      cleanedVal = valuesConfig.map(cleanedVal, name, type);
    return cleanedVal;
  }

  function cleanInput({ value, type, name }) {
    if (typeof value === 'undefined')
      throw new FinalFormError('input value cannot be undefined');
    else if (typeof type === 'undefined')
      throw new FinalFormError('input type cannot be undefined');

    if (isPlainObject(value))
      return cleanObject({ value, type, name });
    else if (isArray(value))
      return cleanArray({ value, type, name });
    else if (isString(value))
      return cleanText({ value, type, name });
    else
      return value;
  }

  function cleanValues(formObj) {
    forOwn(formObj, (val, key) => {
      if (val.type === 'custom')
        formObj[key] = val.value;
      else
        formObj[key] = cleanInput({ value: val.value, type: val.type, name: val.name });
    });
    return formObj;
  }

  function parse() {
    const formObj = merge(
      map(forms, form => form.parse())
    );

    forEach(definedFields, definedField => {
      formObj[definedField.name] = {
        value: definedField.getter(),
        name: definedField.name,
        element: null,
        type: 'custom'
      };
    });

    if (keysToPick.length)
      pickKeys(formObj);

    if (!isEmpty(keyMap))
      mapKeys(formObj);
    
    addValidationProperties(formObj);
    
    if (!isEmpty(syncValidationCallbacks))
      runSyncValidations(formObj);

    if (isEmpty(asyncValidationCallbacks))
      return cleanValues(formObj);
    else {
      return new Promise((resolve, reject) => {
        runAsyncValidations(formObj, () => {
          resolve(cleanValues(formObj));
        });
      });
    }
  }

  (function processConfig() {
    if (config.forms)
      configUtils.forms();
    if (config.mapNames)
      configUtils.mapNames();
    if (config.pick)
      configUtils.pick();
    if (config.customFields)
      configUtils.customFields();
    if (config.validations)
      configUtils.validations();
    if (config.asyncValidations)
      configUtils.asyncValidations();
    if (config.validationInputs)
      configUtils.validationInputs();
    if (isPlainObject(config.values))
      configUtils.values();
  })();

  return { parse };
};
