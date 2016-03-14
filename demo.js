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
  phone: element => {
    if (element.value.trim().length)
      return true;
  },
  giant: fieldVal => fieldVal > 10
});

parser.defineField('giant', () => {
  return 11;
});
// // post parsers
window.parseConf = {
  pick: ['email', 'phone', 'giant'],
  map: { phone: 'superPhone' }
};

// const parsedForm = parser.parse();
// console.log('parsedForm: ', parsedForm);
window.parser = parser;


window.run = function () {
  const parsedForm = parser.parse(parseConf);
  if (!parsedForm.isValid) {
    parsedForm.invalidFields.forEach(f => {
      if (f.element)
        f.element.classList.add('error');
    })
  }
  else console.log('form good');
}
// {
//   isValid: true,
//   invalidFields: [{name: 'x', element: HTMLElement, value: 11}],
//   validFields: [],
//   fields: {}
// }
