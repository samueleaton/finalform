import _ from 'lodash';
import merge from './merge';

export default class FinalForm {
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
  constructor(form) {
    this.form = form;
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
      const val = element.value;

      if (type === 'checkbox') {
        if (typeof inputsObj[name] !== 'object')
          inputsObj[name] = {};
        inputsObj[name][val] = element.checked;
      }
      else if (type === 'radio') {
        if (typeof inputsObj[name] === 'undefined')
          inputsObj[name] = '';
        if (element.checked)
          inputsObj[name] = val;
      }
      else
        inputsObj[name] = val;

      elementMap[name] = {
        name: name,
        element: element,
        value: inputsObj[name],
        type: type,
        msg: null
      };
    });
    return elementMap;
  }

  getSelects() {
    const elementMap = {};
    
    _.each(this.form.getElementsByTagName('select'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'select'
      );
      
      elementMap[name] = {
        name: name,
        element: element,
        value: element.value,
        type: 'select',
        msg: null
      };
    });

    return elementMap;
  }

  getTextAreas() {
    const elementMap = {};
    _.each(this.form.getElementsByTagName('textarea'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'textarea'
      );
      elementMap[name] = {
        name: name,
        element: element,
        value: element.value,
        type: 'textarea',
        msg: null
      };
    });
    return elementMap;
  }

  getButtons() {
    const elementMap = {};
    _.each(this.form.getElementsByTagName('button'), (element, i) => {
      const name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(
        elementMap, 'button'
      );
      elementMap[name] = {
        name: name,
        element: element,
        value: element.value,
        type: element.type || null,
        msg: null
      };
    });
    return elementMap;
  }

  parse() {
    return merge(
      this.getInputs(),
      this.getTextAreas(),
      this.getSelects(),
      this.getButtons()
    );
  }
};
