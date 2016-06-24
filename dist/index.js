'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _FinalForm = require('./FinalForm');

var _FinalForm2 = _interopRequireDefault(_FinalForm);

var _createCustomParser = require('./createCustomParser');

var _createCustomParser2 = _interopRequireDefault(_createCustomParser);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

module.exports = function () {
  return {
    merge: _merge2.default,
    parse: function parse(form, options) {
      var finalForm = new _FinalForm2.default(form, options);
      var parsedObj = finalForm.parse();
      _lodash2.default.forOwn(parsedObj, function (val, key) {
        parsedObj[key] = val.value;
      });
      return parsedObj;
    },
    serialize: function serialize(form, options) {
      return _FinalForm2.default.serialize(this.parse(form, options));
    },
    create: function create() {
      var customParser = (0, _createCustomParser2.default)();
      if (arguments.length) customParser.forms.apply(customParser, arguments);
      return customParser;
    }
  };
}();