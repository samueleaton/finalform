/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

'use strict';

module.exports = (function() {
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

  /* generates a key for the field value
    only runs if no 'name', 'id', and 'placeholder' attributes are found
  */
  function generateKeyName(obj, element, type, index) {
    const i = index || 1;
    const typeStr = typeof type === 'string' ? '-' + type : '';

    if (typeof obj[element + typeStr] === 'undefined')
      return element + typeStr;
    else if (typeof obj[element + typeStr + '-' + i] === 'undefined')
      return element + typeStr + '-' + i;
    else
      return generateKeyName(obj, element, type, i + 1);
  }

  /* Gets all form <input> values
  */
  function getInputs(element, options) {
    const obj = {};

    _.each(element.getElementsByTagName('input'), (input, i) => {

      const type = input.type || 'text';
      const name = input.name || input.id || input.placeholder || generateKeyName(
        obj, 'input', type
      );
      let val = input.value;

      if (options.trim !== false)
        val = val.trim();

      if (options.compress !== false)
        val = val.replace(/ +/g, ' ');

      if (options.toUpperCase === true)
        val = val.toUpperCase();

      if (options.toLowerCase === true)
        val = val.toLowerCase();

      if (type === 'checkbox') {
        if (options.checkboxesAsArray) {
          if (!_.isArray(obj[name]))
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

  function getSelects(element) {
    const obj = {};
    _.each(element.getElementsByTagName('select'), (select, i) => {
      const name = select.name || select.id || select.placeholder || generateKeyName(obj, 'select');
      obj[name] = select.value;
    });
    return obj;
  }

  function getTextAreas(element) {
    const obj = {};
    _.each(element.getElementsByTagName('textarea'), (ta, i) => {
      const name = ta.name || ta.id || ta.placeholder || generateKeyName(obj, 'textarea');
      obj[name] = ta.value;
    });
    return obj;
  }

  function getButtons(element) {
    const obj = {};
    _.each(element.getElementsByTagName('button'), (btn, i) => {
      const name = btn.name || btn.id || btn.placeholder || generateKeyName(obj, 'button');
      obj[name] = btn.value;
    });
    return obj;
  }

  function parseForm(form, options) {
    const inputs = getInputs(form, options);
    const textAreas = getTextAreas(form, options);
    const selects = getSelects(form, options);
    const buttons = getButtons(form, options);
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
    parse(form, options) {
      const opts = options || {};
      if (opts.modify === false) {
        opts.trim =
        opts.compress =
        opts.toUpperCase =
        opts.toLowerCase =
        opts.checkboxesAsArray =
        false;
      }
      if (
        form &&
        form instanceof HTMLElement &&
        form.tagName &&
        form.tagName.toUpperCase() === 'FORM'
      )
        return parseForm(form, opts);
      else
        return console.error('Not a valid HMTL form element.');
    },
    serialize(form, options) {
      const opts = options || {};
      if (opts.modify === false) {
        opts.trim =
        opts.compress =
        opts.toUpperCase =
        opts.toLowerCase =
        opts.checkboxesAsArray =
        false;
      }
      if (
        form &&
        form instanceof HTMLElement &&
        form.tagName &&
        form.tagName.toUpperCase() === 'FORM'
      )
        return serializeObject(parseForm(form, opts));
      else
        return console.error('Not a valid HMTL form element.');
    },
    merge: _.merge
  };
})();
