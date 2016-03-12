/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

import flatten from 'lodash.flatten';
import each from 'lodash.foreach';
import isArray from 'lodash.isarray';
import map from 'lodash.map';
import isPlainObject from 'lodash.isplainobject';
import forOwn from 'lodash.forown';
import has from 'lodash.has';
import includes from 'lodash.includes';

module.exports = (function() {
  function merge(...args) {
    const obj = {};
    each(flatten(args), arg => {
      if (!arg || typeof arg !== 'object') return;
      each(Object.keys(arg), key => {
        obj[key] = arg[key];
      });
    });
    return obj;
  }

  class FinalForm {
    static validateFormElement(form) {
      if (
        form && (
          !(form instanceof HTMLElement) || (
            form.tagName &&
            form.tagName.toUpperCase() !== 'FORM'
          )
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

      each(Object.keys(obj), key => {

        if (!obj[key] || typeof obj[key] === 'string' || typeof obj[key] === 'number')
          str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';

        else if (isArray(obj[key])) {
          let valueStr = '';
          each(obj[key], a => { valueStr += a + ','; });
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

      each(this.form.getElementsByTagName('input'), (input, i) => {

        const type = input.type || 'text';
        const name = FinalForm.getFieldName(input) || FinalForm.generateKeyName(
          obj, 'input', type
        );
        let val = input.value;

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
            if (!isArray(obj[name]))
              obj[name] = [];
            if (input.checked)
              obj[name].push(val);
          }
          else {
            if (typeof obj[name] !== 'object')
              obj[name] = {};
            obj[name][val] = input.checked;
          }
        }
        else if (type === 'radio') {
          if (typeof obj[name] === 'undefined')
            obj[name] = '';
          if (input.checked)
            obj[name] = val;
        }
        else
          obj[name] = val;
      });
      return obj;
    }

    getSelects(parent) {
      const obj = {};
      each(parent.getElementsByTagName('select'), (select, i) => {
        const name = FinalForm.getFieldName(select) || FinalForm.generateKeyName(obj, 'select');
        obj[name] = select.value;
      });
      return obj;
    }

    getTextAreas(parent) {
      const obj = {};
      each(parent.getElementsByTagName('textarea'), (ta, i) => {
        const name = FinalForm.getFieldName(ta) || FinalForm.generateKeyName(obj, 'textarea');
        obj[name] = ta.value;
      });
      return obj;
    }

    getButtons(parent) {
      const obj = {};
      each(parent.getElementsByTagName('button'), (btn, i) => {
        const name = FinalForm.getFieldName(btn) || FinalForm.generateKeyName(obj, 'button');
        obj[name] = btn.value;
      });
      return obj;
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
    const mappedFields = {};
    const fieldsToFilter = [];
    const parseActions = [];

    class CustomFinalForm {
      constructor() {
      }
      defineField(name, getter) {
        definedFields.push({ name, getter });
        return this;
      }
      attachForm(form) {
        FinalForm.validateFormElement(form);
        forms.push(new FinalForm(form));
        return this;
      }
      mapFields(obj) {
        if (!isPlainObject(obj)) {
          console.error('FinalForm Error: Must pass plain object to mapFields');
          return this;
        }
        forOwn(obj, (v, k) => {
          if (typeof v !== 'string')
            return console.error('FinalForm Error: mapFields object values must be strings.');
          mappedFields[k] = v;
        });
        parseActions.push(parsedObj => {
          forOwn(mappedFields, (v, k) => {
            if (has(parsedObj, k)) {
              parsedObj[v] = parsedObj[k];
              delete parsedObj[k];
            }
          });
        });
        return this;
      }
      filterFields(..._fields) {
        each(flatten(_fields), f => {
          fieldsToFilter.push(f);
        });
        parseActions.push(obj => {
          forOwn(obj, (v, k) => {
            if (!includes(fieldsToFilter, k))
              delete obj[k];
          });
        });
        return this;
      }
      parse() {
        const obj = merge(map(forms, form => form.parse()));
        each(definedFields,  fieldObj => {
          obj[fieldObj.name] = fieldObj.getter();
        });
        
        each(parseActions, cb => {
          cb(obj);
        });

        return obj;
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
      return ff.parse();
    },
    serialize(form, options) {
      const ff = new FinalForm(form, options);
      return FinalForm.serialize(ff.parse());
    },
    create(form) {
      const customParser = createCustomFinalForm();
      if (form)
        customParser.attachForm(form);
      return customParser;
    }
  };
})();
