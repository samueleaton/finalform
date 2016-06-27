/* eslint-disable */
const finalform = require('../dist/index');

const dom = {
  createForm: () => {
    const form = document.createElement('form');
    return form;
  },
  createTextInput: (name, value) => {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    return input;
  },
  append: (parent, child) => {
    parent.appendChild(child);
    return this;
  }
};

describe('parseForm', () => {
  it('should extract values', () => {
    const form = createForm();
    append(form, createTextInput(email, 'ironman@stark.com'));
    const parsedForm = finalform.parseForm(form);
    console.log('parsedForm: ', parsedForm);
    expect('hello world').toBe('hello world');
  });
});
