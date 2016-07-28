/* eslint-disable */
var formContainer = document.querySelector('#form-container');

var tests = {
  'it should be able to parse a form': expect => {
    formContainer.innerHTML = '<h1>Hello!</h1>';
    expect(1).toEqual(1);
    expect(1).toEqual(2);
    expect(1).toEqual(1);
  },
  'it should be able to do asyncronous validations': expect => {
    formContainer.innerHTML = '<h1>asynchronous stuff!</h1>';
    expect(1).toEqual(1);
    expect(1).toEqual(1);
    expect(1).toEqual(2);
    expect(1).toEqual(1);
  },
  'it should be able to do syncronous validations': expect => {
    formContainer.innerHTML = '<h1>synchrony!!</h1>';
    expect(1).toEqual(1);
    expect(1).toEqual(2);
    expect(1).toEqual(1);
    expect(1).toEqual(1);
  }
};

runTests(tests);
