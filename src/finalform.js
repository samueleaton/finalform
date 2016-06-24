import _ from 'lodash';
import merge from './merge';

export default class FinalForm {
  static validateFormElement(form) {
    if (
      form && (
        !(form instanceof HTMLElement) ||
        form.tagName &&
        form.tagName.toUpperCase() !== 'FORM'
      )
    )
      throw new Error('Not a valid HMTL form element.');
  }
  /* generates a key for the field value
    only runs if no 'name', 'id', and 'placeholder' attributes are found
  */
  static generateKeyName(inputsObj, element, type, index) {
    const i = index || 1;
    const typeStr = typeof type === 'string' ? '-' + type : '';

    if (typeof inputsObj[element + typeStr] === 'undefined')
      return element + typeStr;
    else if (typeof inputsObj[element + typeStr + '-' + i] === 'undefined')
      return element + typeStr + '-' + i;
    else
      return FinalForm.generateKeyName(inputsObj, element, type, i + 1);
  }

  static getFieldName(field) {
    return field.name || field.id || field.placeholder || null;
  }

  static serialize(parsedForm) {
    const serialized = [];

    if (!parsedForm || typeof parsedForm !== 'object') return '';

    _.each(_.keys(parsedForm), key => {
      if (
        !parsedForm[key] ||
        typeof parsedForm[key] === 'string' ||
        typeof parsedForm[key] === 'number'
      )
        serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(parsedForm[key]));

      else if (_.isArray(parsedForm[key])) {
        let valueStr = '';
        _.each(parsedForm[key], val => { valueStr += val + ','; });
        valueStr = valueStr.slice(0, -1);
        serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(valueStr));
      }

      else if (typeof parsedForm[key] === 'object') {
        serialized.push(
          encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(parsedForm[key]))
        );
      }

      else
        console.warn('could not serialize ' + parsedForm[key]);
    });
    return serialized.join('&');
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
    const inputsObj = {};
    const elementMap = {};

    _.each(this.form.getElementsByTagName('input'), (element, i) => {
      const type = element.type || 'text';
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        inputsObj, 'input', type
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

      if (this.options.escape === true)
        val = _.escape(val);

      if (type === 'checkbox') {
        if (this.options.checkboxesAsArray) {
          if (!_.isArray(inputsObj[name]))
            inputsObj[name] = [];
          if (element.checked)
            inputsObj[name].push(val);
        }
        else {
          if (typeof inputsObj[name] !== 'object')
            inputsObj[name] = {};
          inputsObj[name][val] = element.checked;
        }
      }
      else if (type === 'radio') {
        if (typeof inputsObj[name] === 'undefined')
          inputsObj[name] = '';
        if (element.checked)
          inputsObj[name] = val;
      }
      else
        inputsObj[name] = val;

      elementMap[name] = { name, element, value: inputsObj[name] };
    });
    return elementMap;
  }

  getSelects(parent) {
    const elementMap = {};
    
    _.each(parent.getElementsByTagName('select'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'select'
      );
      
      elementMap[name] = { name, element, value: element.value };
    });

    return elementMap;
  }

  getTextAreas(parent) {
    const elementMap = {};
    _.each(parent.getElementsByTagName('textarea'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'textarea'
      );
      elementMap[name] = { name, element, value: element.value };
    });
    return elementMap;
  }

  getButtons(parent) {
    const elementMap = {};
    _.each(parent.getElementsByTagName('button'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'button'
      );
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
};
