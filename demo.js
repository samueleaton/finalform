import finalform from './finalform'

const form = document.querySelector('#formy');

// console.log('\nfinalform.parse(form)');
// console.log(finalform.parse(form));

// console.log('\nfinalform.serialize(form)');
// console.log(finalform.serialize(form));

window.finalform = finalform;
window.form = form;
window.externalTa = document.querySelector('#external-ta')

form.addEventListener('submit', evt => {
  evt.preventDefault();

  console.log('\nfinalform.parse(form)');
  console.log(finalform.parse(evt.target));

  console.log('\nfinalform.serialize(form)');
  console.log(finalform.serialize(evt.target));

});

// configs
const parser = finalform.create();
parser.forms(form);
parser.validations({
  email: element => {
    if (element.value.trim().length)
      return true;
  },
  giant: fieldVal => fieldVal > 10
})
parser.defineField('giant', () => {
  return 11;
})
// // post parsers
const parsedForm = parser.parse({
  pick: ['email', 'phone', 'giant'],
  map: { phone: 'superPhone' }
});
console.log('parsedForm: ', parsedForm);
window.parser = parser;

// {
//   isValid: true,
//   invalidFields: [{name: 'x', element: HTMLElement, value: 11}],
//   validFields: [],
//   fields: {}
// }
