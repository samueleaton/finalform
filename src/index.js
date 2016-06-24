/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

import _ from 'lodash';
import FinalForm from './FinalForm';
import createCustomParser from './createCustomParser';
import merge from './merge';

module.exports = (function() {
  return {
    merge: merge,
    parse(form, options) {
      const finalForm = new FinalForm(form, options);
      const parsedObj = finalForm.parse();
      _.forOwn(parsedObj, (val, key) => {
        parsedObj[key] = val.value;
      });
      return parsedObj;
    },
    serialize(form, options) {
      return FinalForm.serialize(this.parse(form, options));
    },
    create(...forms) {
      const customParser = createCustomParser();
      if (forms.length)
        customParser.forms(...forms);
      return customParser;
    }
  };
})();
