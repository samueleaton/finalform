import { forEach, flatten, keys } from './utils';

module.exports = function merge(...args) {
  const merged = {};
  forEach(flatten(args), arg => {
    if (!arg || typeof arg !== 'object') return;
    forEach(keys(arg), key => {
      merged[key] = arg[key];
    });
  });
  return merged;
};
