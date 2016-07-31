/* eslint-disable */
describe('finalform.parseForm', function() {

  it('should throw an error if no form is given', function() {
    try {
      finalform.parseForm()
    }
    catch(e) {
      expect(e).to.be.an.instanceOf(Error);
    }
  });

  it('should throw an error no HTMLElement is given', function() {
    try {
      finalform.parseForm({})
    }
    catch(e) {
      expect(e).to.be.an.instanceOf(Error);
    }
  });

  it('should parse an empty form', function() {
    const formString = `
      <form id="form"></form>
    `;
    formContainer.innerHTML = formString;
    const formElement = document.querySelector('#form');

    const parsedForm = finalform.parseForm(formElement);
    expect(parsedForm).to.eql({});
    expect(parsedForm.invalidFields.length).to.eql(0);
    expect(parsedForm.validFields.length).to.eql(0);
  });

  describe('config', function() {
    // all configs together
    // ...

    describe('trim', function() {
      it('should do nothing if disabled', function() {
        const formString = `
          <form id="form">
            <input type="text" id="fname" value="  sam  ray " />
            <input type="text" id="lname" value="   eaton" />
            <input type="text" id="company" value="qualtrics    " />
            <input type="text" id="other" value=" " />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          trim: false,
          compress: false
        });
        expect(parsedForm).to.eql({
          fname: '  sam  ray ',
          lname: '   eaton',
          company: 'qualtrics    ',
          other: ' '
        });
      });

      it('should remove leading and trailing spaces from text inputs', function() {
        const formString = `
          <form id="form">
            <input type="text" id="fname" value="  sam  ray " />
            <input type="text" id="lname" value="   eaton" />
            <input type="text" id="company" value="qualtrics    " />
            <input type="text" id="other" value=" " />
            <input type="text" id="at" value=" @ " />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          trim: true,
          compress: false
        });
        expect(parsedForm).to.eql({
          fname: 'sam  ray',
          lname: 'eaton',
          company: 'qualtrics',
          other: '',
          at: '@'
        });
      });
    });

    describe('compress', function() {
      it('should do nothing if disabled', function() {
        const formString = `
          <form id="form">
            <input type="text" id="email" value="  sam    eaton @   gmail.co     m " />
            <input type="text" id="fname" value="   sam   ray " />
            <input type="text" id="lname" value="   eaton" />
            <input type="text" id="company" value="qualtrics    " />
            <input type="text" id="other" value="  " />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          trim: false,
          compress: false
        });
        expect(parsedForm).to.eql({
          email: '  sam    eaton @   gmail.co     m ',
          fname: '   sam   ray ',
          lname: '   eaton',
          company: 'qualtrics    ',
          other: '  '
        });
      });

      it('should compress all consecutive spaces to a single space', function() {
        const formString = `
          <form id="form">
            <input type="text" name="email" value="  sam    eaton @   gmail.co     m " />
            <input type="text" name="fname" value="   sam   ray " />
            <input type="text" name="lname" value="   eaton" />
            <input type="text" name="company" value="qualtrics    " />
            <input type="text" name="other" value="  " />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          trim: false,
          compress: true
        });
        expect(parsedForm).to.eql({
          email: ' sam eaton @ gmail.co m ',
          fname: ' sam ray ',
          lname: ' eaton',
          company: 'qualtrics ',
          other: ' '
        });
      });
    });

  });
});