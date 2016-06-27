import _ from 'lodash';

module.exports = function merge(...args) {
  const merged = {};
  _.each(_.flatten(args), arg => {
    if (!arg || typeof arg !== 'object') return;
    _.each(_.keys(arg), key => {
      merged[key] = arg[key];
    });
  });
  return merged;
};
