/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

import _ from 'lodash';

module.exports = (function() {
  function merge(...args) {
    const obj = {};
    _.each(_.flatten(args), arg => {
      if (!arg || typeof arg !== 'object') return;
      _.each(_.keys(arg), key => {
        obj[key] = arg[key];
      });
    });
    return obj;
  }

  class FinalForm {
    static validateFormElement(form) {
      if (
        form && (
          !(form instanceof HTMLElement) ||
          form.tagName &&
          form.tagName.toUpperCase() !== 'FORM'
        )
      )
        throw 'Not a valid HMTL form element.';
    }
    /* generates a key for the field value
      only runs if no 'name', 'id', and 'placeholder' attributes are found
    */
    static generateKeyName(obj, element, type, index) {
      const i = index || 1;
      const typeStr = typeof type === 'string' ? '-' + type : '';

      if (typeof obj[element + typeStr] === 'undefined')
        return element + typeStr;
      else if (typeof obj[element + typeStr + '-' + i] === 'undefined')
        return element + typeStr + '-' + i;
      else
        return FinalForm.generateKeyName(obj, element, type, i + 1);
    }

    static getFieldName(field) {
      return field.name || field.id || field.placeholder || null;
    }

    static serialize(obj) {
      let str = '';

      if (!obj || typeof obj !== 'object') return str;

      _.each(_.keys(obj), key => {

        if (!obj[key] || typeof obj[key] === 'string' || typeof obj[key] === 'number')
          str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';

        else if (_.isArray(obj[key])) {
          let valueStr = '';
          _.each(obj[key], a => { valueStr += a + ','; });
          valueStr = valueStr.slice(0, -1);
          str += encodeURIComponent(key) + '=' + encodeURIComponent(valueStr) + '&';
        }

        else if (typeof obj[key] === 'object')
          str += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(obj[key])) + '&';

        else
          console.warn('could not serialize ' + obj[key]);
      });
      return str.slice(0, -1);
    }

    /*
    */
    constructor(form, options) {
      this.options = options || {};
      this.form = form;

      if (this.options.modify === false) {
        this.options.trim =
        this.options.compress =
        this.options.toUpperCase =
        this.options.toLowerCase =
        this.options.checkboxesAsArray =
        false;
      }

      FinalForm.validateFormElement(this.form);
    }

    /* Gets all form <input> values
    */
    getInputs() {
      const obj = {};
      const elementMap = {};

      _.each(this.form.getElementsByTagName('input'), (element, i) => {

        const type = element.type || 'text';
        const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
          obj, 'input', type
        );
        let val = element.value;

        if (this.options.trim !== false)
          val = val.trim();

        if (this.options.compress !== false)
          val = val.replace(/ +/g, ' ');

        if (this.options.toUpperCase === true)
          val = val.toUpperCase();

        if (this.options.toLowerCase === true)
          val = val.toLowerCase();

        if (type === 'checkbox') {
          if (this.options.checkboxesAsArray) {
            if (!_.isArray(obj[name]))
              obj[name] = [];
            if (element.checked)
              obj[name].push(val);
          }
          else {
            if (typeof obj[name] !== 'object')
              obj[name] = {};
            obj[name][val] = element.checked;
          }
        }
        else if (type === 'radio') {
          if (typeof obj[name] === 'undefined')
            obj[name] = '';
          if (element.checked)
            obj[name] = val;
        }
        else
          obj[name] = val;

        elementMap[name] = { name, element, value: obj[name] };

      });
      return elementMap;
    }

    getSelects(parent) {
      const elementMap = {};
      _.each(parent.getElementsByTagName('select'), (element, i) => {
        const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'select');
        elementMap[name] = { name, element, value: element.value };
      });
      return elementMap;
    }

    getTextAreas(parent) {
      const elementMap = {};
      _.each(parent.getElementsByTagName('textarea'), (element, i) => {
        const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'textarea');
        elementMap[name] = { name, element, value: element.value };
      });
      return elementMap;
    }

    getButtons(parent) {
      const elementMap = {};
      _.each(parent.getElementsByTagName('button'), (element, i) => {
        const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'button');
        elementMap[name] = { name, element, value: element.value };
      });
      return elementMap;
    }

    parse() {
      const args = [this.form, this.options];
      return merge(
        this.getInputs(...args),
        this.getTextAreas(...args),
        this.getSelects(...args),
        this.getButtons(...args)
      );
    }

  }


  function createCustomFinalForm() {
    const forms = [];
    const definedFields = [];
    const parseActionQueue = [];
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

      _.forOwn(validationsCallbacks, (cb, k) => {
        let objKey;
        if (_.has(formObj, k))
          objKey = k;
        else if (_.has(formObj, mappedKeysAndValues[k]))
          objKey = mappedKeysAndValues[k];

        if (!_.has(formObj, objKey))
          return console.error('FinalForm Error: cannot validate "' + objKey + '". Not found.');
        
        const isValid = cb(formObj[objKey].element || formObj[objKey].value);
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
      _.forOwn(keyMap, (v, k) => {
        if (_.has(formObj, v))
          return console.error('FinalForm Error: cannot map "' + k + '" to "' + v + '". "' + v + '" already exists.');
        if (_.has(formObj, k)) {
          formObj[v] = formObj[k];
          formObj[v].name = v;
          delete formObj[k];
        }
      });
    }

    function pickKeys(formObj) {
      _.forOwn(formObj, (v, k) => {
        if (!_.includes(keysToPick, k))
          delete formObj[k];
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

      forms(...arr) {
        _.each(_.flatten(arr), form => {
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
        _.forOwn(validationsObj, (v, k) => {
          if (typeof v !== 'function')
            return console.error('FinalForm Error: validation must be a function');
          validationsCallbacks[k] = v;
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

        _.each(definedFields,  definedField => {
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

        _.forOwn(formObj, (v, k) => {
          formObj[k] = v.value;
        });

        return formObj;
      }
      serialize() {
        return FinalForm.serialize(this.parse());
      }
    }

    return new CustomFinalForm();
  }

  return {
    parse(form, options) {
      const ff = new FinalForm(form, options);
      const parsedObj = ff.parse();
      _.forOwn(parsedObj, (v, k) => {
        parsedObj[k] = v.value;
      });
      return parsedObj;
    },
    serialize(form, options) {
      return FinalForm.serialize(this.parse(form, options));
    },
    create(...forms) {
      const customParser = createCustomFinalForm();
      if (forms.length)
        customParser.forms(...forms);
      return customParser;
    }
  };
})();
