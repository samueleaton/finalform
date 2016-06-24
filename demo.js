'use strict';

const form = document.querySelector('#formy');

window.externalTextArea = document.querySelector('#external-ta')

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
  superPhone: element => {
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
  map: { phone: 'superPhone' },
  escape: true
};


window.run = function () {
  const parsedForm = parser.parse(parseConf);
  if (!parsedForm.isValid) {
    parsedForm.invalidFields.forEach(f => {
      if (f.element)
        f.element.classList.add('error');
    })
    console.log('Look at the form errors.');
  }
  else console.log('form good');

  return parsedForm;
}

console.info('access the form using the variable `form`');
console.info('type `run()` in the console to see the custom parser go');