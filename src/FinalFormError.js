import _ from 'lodash';

class FinalFormError {
  constructor(msg) {
    this.name = 'FinalFormError';
    this.message = msg;
    this.stack = new Error().stack;
  }
}
FinalFormError.prototype = _.create(Error.prototype);
export default FinalFormError;
