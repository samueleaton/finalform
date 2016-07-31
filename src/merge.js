import _ from 'lodash';

module.exports = function merge(...args) {
  const merged = {};
  _.forEach(_.flatten(args), arg => {
    if (!arg || typeof arg !== 'object') return;
    _.forEach(_.keys(arg), key => {
      merged[key] = arg[key];
    });
  });
  return merged;
};
