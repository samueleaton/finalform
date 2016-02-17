import finalform from './finalform'

const form = document.querySelector('#formy');

console.log('\nfinalform.parse(form)');
console.log(finalform.parse(form));

console.log('\nfinalform.serialize(form)');
console.log(finalform.serialize(form));

window.finalform = finalform;
window.form = form;
form.addEventListener('submit', evt => {
  evt.preventDefault();

  console.log('\nfinalform.parse(form)');
  console.log(finalform.parse(evt.target));

  console.log('\nfinalform.serialize(form)');
  console.log(finalform.serialize(evt.target));

});
