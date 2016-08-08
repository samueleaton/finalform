import _ from 'lodash';
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
    const invalidFields = _.keys(
      _.keyBy(validationInfo.invalidFields, fieldObj => fieldObj.name)
    );
    const validFields = _.keys(
      _.keyBy(validationInfo.validFields, fieldObj => fieldObj.name)
    );
    return _.concat(invalidFields, validFields);
  }

  const configUtils = {
    forms() {
      if (!_.isArray(config.forms))
        throw new FinalFormError('"forms" must be an array of forms');
      _.forEach(config.forms, form => {
        if (form instanceof HTMLElement)
          forms.push(new FinalForm(form));
        else
          throw new FinalFormError('all forms must be html elements');
      });
    },
    mapNames() {
      if (!_.isPlainObject(config.mapNames))
        throw new FinalFormError('"mapNames" must be a plain object');
      _.forOwn(config.mapNames, (mapValue, mapKey) => {
        mappedKeysAndValues[mapKey] = mapValue;
        mappedKeysAndValues[mapValue] = mapKey;
        keyMap[mapKey] = mapValue;
      });
    },
    pick() {
      if (!_.isArray(config.pick))
        throw new FinalFormError('"pick" must be an array field names');
      _.each(config.pick, field => {
        if (mappedKeysAndValues[field])
          keysToPick.push(mappedKeysAndValues[field]);
        keysToPick.push(field);
      });
    },
    customFields() {
      if (!_.isPlainObject(config.customFields))
        throw new FinalFormError('"customFields" must be a plain object');
      _.forOwn(config.customFields, (func, fieldName) => {
        definedFields.push({ name: fieldName, getter: func });
      });
    },
    validations() {
      if (!_.isPlainObject(config.validations))
        throw new FinalFormError('"validations" must be a plain object');
      _.forOwn(config.validations, (func, fieldName) => {
        if (!_.isFunction(func))
          throw new FinalFormError('validation must be a function');
        syncValidationCallbacks[fieldName] = func;
      });
    },
    asyncValidations() {
      if (!_.isPlainObject(config.asyncValidations))
        throw new FinalFormError('"asyncValidations" must be a plain object');
      _.forOwn(config.asyncValidations, (func, fieldName) => {
        if (!_.isFunction(func))
          throw new FinalFormError('asyncValidations must be a function');
        asyncValidationCallbacks[fieldName] = func;
      });
    },
    validationInputs() {
      if (!_.isPlainObject(config.validationInputs))
        throw new FinalFormError('"validationInputs" must be a plain object');
      _.forOwn(config.validationInputs, (value, fieldName) => {
        validationInputs[fieldName] = value;
      });
    },
    values() {
      if (_.isBoolean(config.values.trim))
        valuesConfig.trim = config.values.trim;
      if (_.isBoolean(config.values.compress))
        valuesConfig.compress = config.values.compress;
      if (_.isBoolean(config.values.escape))
        valuesConfig.escape = config.values.escape;
      if (_.isFunction(config.values.map))
        valuesConfig.map = config.values.map;
      if (_.includes(['object', 'array'], config.values.checkboxFormat))
        valuesConfig.checkboxFormat = config.values.checkboxFormat;
    }
  };

  function pickKeys(formObj) {
    _.forOwn(formObj, (val, key) => {
      if (!_.includes(keysToPick, key))
        delete formObj[key];
    });
  }

  function mapKeys(formObj) {
    _.forOwn(keyMap, (val, key) => {
      if (_.has(formObj, val)) {
        return console.error(
          'FinalForm Error: cannot map "' + key + '" to "' + val + '". "' +
          val + '" already exists.'
        );
      }
      if (_.has(formObj, key)) {
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
    if (_.isPlainObject(validationRes)) {
      if (!_.isBoolean(validationRes.isValid))
        throw new FinalFormError('validation object must have property "isValid" (Boolean)');
      if (validationRes.msg)
        formObj[fieldName].msg = validationRes.msg;
      if (validationRes.isValid)
        validationInfo.validFields.push(formObj[fieldName]);
      else
        validationInfo.invalidFields.push(formObj[fieldName]);
    }
    else if (!validationRes)
      validationInfo.invalidFields.push(formObj[fieldName]);
  }

  function runSyncValidations(formObj) {
    _.forOwn(syncValidationCallbacks, (validationCb, fieldName) => {
      if (_.includes(getValidatedFields(), fieldName))
        throw new FinalFormError(`"${fieldName}" cannot be validated twice`);

      let objKey;
      if (_.has(formObj, fieldName))
        objKey = fieldName;
      else if (_.has(formObj, mappedKeysAndValues[fieldName]))
        objKey = mappedKeysAndValues[fieldName];
      if (!_.has(formObj, objKey)) {
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

    _.forOwn(asyncValidationCallbacks, (validationCb, fieldName) => {
      if (_.includes(getValidatedFields(), fieldName))
        throw new FinalFormError(`"${fieldName}" cannot be validated twice`);
      let objKey;
      if (_.has(formObj, fieldName))
        objKey = fieldName;
      else if (_.has(formObj, mappedKeysAndValues[fieldName]))
        objKey = mappedKeysAndValues[fieldName];

      if (!_.has(formObj, objKey)) {
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
      _.forOwn(userResponses, (userResponse, fieldName) => {
        processUserValidationResponse(formObj, fieldName, userResponse);
      });
      validationInfo.isValid = validationInfo.invalidFields.length === 0;
      asyncValidationsCb();
    });
  }

  function cleanObject({ value, type, name }) {
    _.forOwn(value, (val, key) => {
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
      return _.keys(_.pickBy(value, val => val === 'true' || val === true));
  }

  function cleanArray({ value, type, name }) {
    _.forEach(value, (val, i) => {
      value[i] = cleanInput({ value: val, type: null, name: name });
    });
    return value;
  }

  function cleanText({ value, type, name }) {
    let cleanedVal = value;
    if (type !== 'textarea') {
      if (valuesConfig.trim)
        cleanedVal = _.trim(cleanedVal);
      if (valuesConfig.compress)
        cleanedVal = _.replace(cleanedVal, / +/g, ' ');
    }
    if (valuesConfig.escape)
      cleanedVal = _.escape(cleanedVal);
    if (_.isFunction(valuesConfig.map))
      cleanedVal = valuesConfig.map(cleanedVal, name, type);
    return cleanedVal;
  }

  function cleanInput({ value, type, name }) {
    if (_.isUndefined(value))
      throw new FinalFormError('input value cannot be undefined');
    else if (_.isUndefined(type))
      throw new FinalFormError('input type cannot be undefined');

    if (_.isPlainObject(value))
      return cleanObject({ value, type, name });
    else if (_.isArray(value))
      return cleanArray({ value, type, name });
    else if (_.isString(value))
      return cleanText({ value, type, name });
    else
      return value;
  }

  function cleanValues(formObj) {
    _.forOwn(formObj, (val, key) => {
      if (val.type === 'custom')
        formObj[key] = val.value;
      else
        formObj[key] = cleanInput({ value: val.value, type: val.type, name: val.name });
    });
    return formObj;
  }

  function parse() {
    const formObj = merge(
      _.map(forms, form => form.parse())
    );

    _.each(definedFields, definedField => {
      formObj[definedField.name] = {
        value: definedField.getter(),
        name: definedField.name,
        element: null,
        type: 'custom'
      };
    });

    if (keysToPick.length)
      pickKeys(formObj);

    if (!_.isEmpty(keyMap))
      mapKeys(formObj);
    
    addValidationProperties(formObj);

    if (!_.isEmpty(syncValidationCallbacks))
      runSyncValidations(formObj);

    if (_.isEmpty(asyncValidationCallbacks))
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
    if (_.isPlainObject(config.values))
      configUtils.values();
  })();

  return { parse };
};
