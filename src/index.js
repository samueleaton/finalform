/*
  FinalForm
  By Sam Eaton
  MIT Licensed
*/

import { isPlainObject } from './utils';
import FinalForm from './FinalForm';
import createParser from './createParser';
import merge from './merge';

function createCustomParser(parserConfig = {}) {
  if (!isPlainObject(parserConfig))
    throw new Error('parser config must be a plain object');
  return createParser(parserConfig);
}

function parseForm(form, valuesConfig = {}) {
  if (!isPlainObject(valuesConfig))
    throw new Error('parser config must be a plain object');
  return createCustomParser({ forms: [ form ], values: valuesConfig }).parse();
}

function serializeForm(form, config = {}) {
  return FinalForm.serialize(parseForm(form, config));
}

module.exports = { merge, parseForm, serializeForm, createParser: createCustomParser };
