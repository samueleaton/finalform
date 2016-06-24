import _ from 'lodash';
import FinalForm from './FinalForm';
import merge from './merge';

module.exports = function createCustomParser() {
  const forms = [];
  const definedFields = [];
  const mappedKeysAndValues = {};
  const keysToPick = [];
  const keyMap = {};
  const validationsCallbacks = {};

  function processParseConfig(parseConfig) {
    if (parseConfig.map) {
      if (!_.isPlainObject(parseConfig.map)) {
        console.error('FinalForm Error: map must be a plain object');
        return;
      }
      _.forOwn(parseConfig.map, (mapValue, mapKey) => {
        mappedKeysAndValues[mapKey] = mapValue;
        mappedKeysAndValues[mapValue] = mapKey;
        keyMap[mapKey] = mapValue;
      });
    }

    if (parseConfig.pick) {
      if (!_.isArray(parseConfig.pick)) {
        console.error('FinalForm Error: pick must be an array');
        return;
      }
      _.each(parseConfig.pick, field => {
        if (mappedKeysAndValues[field])
          keysToPick.push(mappedKeysAndValues[field]);
        keysToPick.push(field);
      });
    }
  }

  function validateFormObj(formObj) {
    const validFieldsKeys = _.keys(formObj);
    const validFields = [];
    const invalidFields = [];

    _.forOwn(validationsCallbacks, (validationCb, validation) => {
      let objKey;
      if (_.has(formObj, validation))
        objKey = validation;
      else if (_.has(formObj, mappedKeysAndValues[validation]))
        objKey = mappedKeysAndValues[validation];

      if (!_.has(formObj, objKey))
        return console.error('FinalForm Error: cannot validate "' + objKey + '". Not found.');
      
      const isValid = validationCb(formObj[objKey].element || formObj[objKey].value);
      if (!isValid) {
        invalidFields.push(formObj[objKey]);
        _.remove(validFieldsKeys, key => key === objKey);
      }
    });
    _.each(validFieldsKeys, key => {
      validFields.push(formObj[key]);
    });
    return {
      validFields, invalidFields, isValid: invalidFields.length === 0
    };
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

  function pickKeys(formObj) {
    _.forOwn(formObj, (val, key) => {
      if (!_.includes(keysToPick, key))
        delete formObj[key];
    });
  }

  function defineObjectValidationProperties(formObj) {
    let validationObj = {
      isValid: true,
      invalidFields: [],
      validFields: []
    };

    if (!_.isEmpty(validationsCallbacks))
      validationObj = validateFormObj(formObj);

    Object.defineProperty(formObj, 'invalidFields', {
      get() {
        return validationObj.invalidFields;
      }
    });
    Object.defineProperty(formObj, 'validFields', {
      get() {
        return validationObj.validFields;
      }
    });
    Object.defineProperty(formObj, 'isValid', {
      get() {
        return validationObj.isValid;
      }
    });
  }

  class CustomFinalForm {
    defineField(name, getter) {
      definedFields.push({ name, getter });
      return this;
    }

    forms(...formsArr) {
      _.each(_.flatten(formsArr), form => {
        FinalForm.validateFormElement(form);
        forms.push(new FinalForm(form));
      });
      return this;
    }

    validations(validationsObj) {
      if (!_.isPlainObject(validationsObj)) {
        console.error('FinalForm Error: Must pass plain object to validations');
        return this;
      }
      _.forOwn(validationsObj, (val, key) => {
        if (typeof val !== 'function')
          return console.error('FinalForm Error: validation must be a function');
        validationsCallbacks[key] = val;
      });
    }

    parse(parseConfig) {
      if (parseConfig) {
        if (!_.isPlainObject(parseConfig)) {
          console.error('FinalForm Error: Must pass plain object or undefined to parse');
          return this;
        }
        processParseConfig(parseConfig);
      }

      const formObj = merge(
        _.map(forms, form => form.parse())
      );

      _.each(definedFields, definedField => {
        formObj[definedField.name] = {
          value: definedField.getter(),
          name: definedField.name,
          element: null
        };
      });

      if (keysToPick.length)
        pickKeys(formObj);

      if (!_.isEmpty(keyMap))
        mapKeys(formObj);

      defineObjectValidationProperties(formObj);

      _.forOwn(formObj, (val, key) => {
        formObj[key] = val.value;
      });

      return formObj;
    }
    serialize() {
      return FinalForm.serialize(this.parse());
    }
  }

  return new CustomFinalForm();
};
