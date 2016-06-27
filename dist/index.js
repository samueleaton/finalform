'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _FinalForm = require('./FinalForm');

var _FinalForm2 = _interopRequireDefault(_FinalForm);

var _createParser = require('./createParser');

var _createParser2 = _interopRequireDefault(_createParser);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

function createCustomParser() {
  var parserConfig = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (!_lodash2.default.isPlainObject(parserConfig)) throw new Error('parser config must be a plain object');
  return (0, _createParser2.default)(parserConfig);
}

function parseForm(form) {
  var valuesConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (!_lodash2.default.isPlainObject(valuesConfig)) throw new Error('parser config must be a plain object');
  return createCustomParser({ forms: [form], values: valuesConfig }).parse();
}

function serializeForm(form) {
  var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return _FinalForm2.default.serialize(parseForm(form, config));
}

module.exports = { merge: _merge2.default, parseForm: parseForm, serializeForm: serializeForm, createParser: createCustomParser };