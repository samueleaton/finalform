/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

export default (function() {
  const _ = {
    isArray: obj => {
      return typeof obj === 'object' &&
      (Array.isArray && Array.isArray(obj) || obj.constructor === Array || obj instanceof Array);
    },

    // loop array
    each(list, func) {
      if (!list || !list.length)
        return null;
      for (let i = 0, ii = list.length; i < ii; i++)
        func(list[i], i);
    },

    // map array
    map(list, func) {
      if (!list || !list.length)
        return [];
      const arr = [];
      for (let i = 0, ii = list.length; i < ii; i++)
        arr.push(func(list[i]));
      return arr;
    },

    // filter array
    filter(list, func) {
      if (!list || !list.length)
        return [];
      const arr = [];
      for (let i = 0, ii = list.length; i < ii; i++) {
        if (func(list[i]))
          arr.push(list[i]);
      }
      return arr;
    },

    // merge objects
    merge(...args) {
      const obj = {};
      _.each(args, arg => {
        if (!arg || typeof arg !== 'object') return;

        _.each(Object.keys(arg), key => {
          obj[key] = arg[key];
        });
      });
      return obj;
    },

    toArray(list, ...args) {
      if (args && args.length) {
        let arr = [];
        arr = arr.concat(list);
        this.each(args, arg => {
          arr = arr.concat(arg);
        });
        return arr;
      }
      else if (!list || !list.length)
        return [list];
      else if (this.isArray(list))
        return list;
      const arr = [];
      for (let i = 0, ii = list.length; i < ii; i++)
        arr.push(list[i]);
      return arr;
    }
  };

  function getInputs(element) {
    const obj = {};
    _.each(element.getElementsByTagName('input'), (input, i) => {

      const type = input.type || 'text';
      const name = input.name || input.id || input.placeholder || 'input-' + type + '-' + i;

      if (type === 'checkbox') {
        if (!_.isArray(obj[name]))
          obj[name] = [];
        if (input.checked)
          obj[name].push(input.value);
      }
      else if (type === 'radio') {
        if (typeof obj[name] === 'undefined')
          obj[name] = '';
        if (input.checked)
          obj[name] = input.value;
      }
      else
        obj[name] = input.value;
    });
    return obj;
  }

  function getSelects(element) {
    const obj = {};
    _.each(element.getElementsByTagName('select'), (select, i) => {
      const name = select.name || select.id || select.placeholder || 'select-' + i;
      obj[name] = select.value;
    });
    return obj;
  }

  function getTextAreas(element) {
    const obj = {};
    _.each(element.getElementsByTagName('textarea'), (ta, i) => {
      const name = ta.name || ta.id || ta.placeholder || 'textarea-' + i;
      obj[name] = ta.value;
    });
    return obj;
  }

  function getButtons(element) {
    const obj = {};
    _.each(element.getElementsByTagName('button'), (btn, i) => {
      const name = btn.name || btn.id || btn.placeholder || 'button-' + i;
      obj[name] = btn.value;
    });
    return obj;
  }

  function parseForm(form) {
    const inputs = getInputs(form);
    const textAreas = getTextAreas(form);
    const selects = getSelects(form);
    const buttons = getButtons(form);
    return _.merge(inputs, textAreas, selects, buttons);
  }

  function serializeObject(obj) {
    let str = '';
    if (!obj || typeof obj !== 'object') return str;

    _.each(Object.keys(obj), key => {

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

  return {
    parse(form) {
      if (
        form &&
        form instanceof HTMLElement &&
        form.tagName &&
        form.tagName.toUpperCase() === 'FORM'
      )
        return parseForm(form);
      else
        return console.error('Not a valid HMTL form element.');
    },
    serialize(form) {
      if (
        form &&
        form instanceof HTMLElement &&
        form.tagName &&
        form.tagName.toUpperCase() === 'FORM'
      )
        return serializeObject(parseForm(form));
      else
        return console.error('Not a valid HMTL form element.');
    }
  };
})();