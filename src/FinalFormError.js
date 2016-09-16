
class FinalFormError {
  constructor(msg) {
    this.name = 'FinalFormError';
    this.message = msg;
    this.stack = new Error().stack;
  }
}
if (Object && Object.create)
  FinalFormError.prototype = Object.create(Error.prototype);
export default FinalFormError;
