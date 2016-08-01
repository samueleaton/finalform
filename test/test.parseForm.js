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

    /* trime */
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

    /* compress */
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

    /* escape */
    describe('escape', function() {
      it('should escape certain characters to escaped equivalent', function() {
        const formString = `
          <form id="form">
            <input type="text" name="div" value="<div>cool</div>" />
            <input type="text" name="script" value="<script></script>" />
            <input type="text" id="quotes" name="quotes" value="" />
            <input type="text" name="amp" value="sam & ray" />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');
        document.querySelector('#quotes').value = `"Hello" said the 'boy'`
        const parsedForm = finalform.parseForm(formElement, {
          trim: false,
          compress: false,
          escape: true
        });
        expect(parsedForm).to.eql({
          div: '&lt;div&gt;cool&lt;/div&gt;',
          script: '&lt;script&gt;&lt;/script&gt;',
          quotes: '&quot;Hello&quot; said the &#39;boy&#39;',
          amp: 'sam &amp; ray'
        });
      });
    });

    /* map */
    describe('map', function() {
      it('should map all textual values', function() {
        const formString = `
          <form id="form">
            <input type="text" id="email" value="Sam@DevMunchies.com" />
            <input type="text" id="fname" value="Sam" />
            <input type="text" id="lname" value="Eaton" />
            <input type="text" id="company" value="Qualtrics" />
            <textarea name="super-textarea">this is a TEXTAREA</textarea>
            <input type="radio" name="color" value="GREEN" />
            <input type="radio" name="color" value="ORANGE" />
            <input type="radio" name="color" value="BLUE" checked />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          map: (val, type) => _.toLower(val) + '!'
        });
        expect(parsedForm).to.eql({
          email: 'sam@devmunchies.com!',
          fname: 'sam!',
          lname: 'eaton!',
          company: 'qualtrics!',
          'super-textarea': 'this is a textarea!',
          color: 'blue!'
        });
      });

      it('should pass the type as the second parameter if is a textual type', function() {
        const formString = `
          <form id="form">
            <input type="text" id="email" value="Sam@DevMunchies.com" />
            <input id="fname" value="Sam" />
            <input type="text" id="lname" value="Eaton" />
            <input type="text" id="company" value="Qualtrics" />
            <textarea name="super-textarea">this is a TEXTAREA</textarea>
            <input type="radio" name="color" value="GREEN" />
            <input type="radio" name="color" value="ORANGE" />
            <input type="radio" name="color" value="BLUE" checked />
            <input type="checkbox" name="animal" value="cat" />
            <input type="checkbox" name="animal" value="kangaroo" checked />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');

        const parsedForm = finalform.parseForm(formElement, {
          map: (val, type) => type
        });
        expect(parsedForm).to.eql({
          email: 'text',
          fname: 'text',
          lname: 'text',
          company: 'text',
          'super-textarea': 'textarea',
          color: 'radio',
          animal: {
            cat: false,
            kangaroo: true
          }
        });
      });
    });

    /* checkboxFormat */
    describe('checkboxFormat', function() {
      it('should return an object of checkboxes with boolean values by default', function() {
        const formString = `
          <form id="form">
            <input type="checkbox" name="color" value="green" />
            <input type="checkbox" name="color" value="orange" checked />
            <input type="checkbox" name="color" value="red" />
            <input type="checkbox" name="color" value="blue" checked />
            <input type="checkbox" name="animal" value="cat" />
            <input type="checkbox" name="animal" value="kangaroo" />
            <input type="checkbox" name="animal" value="iguana" />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');
        const parsedForm = finalform.parseForm(formElement);
        expect(parsedForm).to.eql({
          color: {
            green: false,
            orange: true,
            red: false,
            blue: true
          },
          animal: {
            cat: false,
            kangaroo: false,
            iguana: false
          }
        });
      });

      it('should return an object of checkboxes with boolean values if set to "object"', function() {
        const formString = `
          <form id="form">
            <input type="checkbox" name="color" value="green" />
            <input type="checkbox" name="color" value="orange" checked />
            <input type="checkbox" name="color" value="red" />
            <input type="checkbox" name="color" value="blue" checked />
            <input type="checkbox" name="animal" value="cat" />
            <input type="checkbox" name="animal" value="kangaroo" />
            <input type="checkbox" name="animal" value="iguana" />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');
        const parsedForm = finalform.parseForm(formElement);
        expect(parsedForm).to.eql({
          color: {
            green: false,
            orange: true,
            red: false,
            blue: true
          },
          animal: {
            cat: false,
            kangaroo: false,
            iguana: false
          }
        });
      });

      it('should return an array of only checked values if set to "array"', function() {
        const formString = `
          <form id="form">
            <input type="checkbox" name="color" value="green" />
            <input type="checkbox" name="color" value="orange" checked />
            <input type="checkbox" name="color" value="red" />
            <input type="checkbox" name="color" value="blue" checked />
            <input type="checkbox" name="animal" value="cat" />
            <input type="checkbox" name="animal" value="kangaroo" />
            <input type="checkbox" name="animal" value="iguana" />
          </form>
        `;
        formContainer.innerHTML = formString;
        const formElement = document.querySelector('#form');
        const parsedForm = finalform.parseForm(formElement, { checkboxFormat: 'array' });
        expect(parsedForm).to.eql({
          color: ['orange', 'blue'],
          animal: []
        });
      });
    });

    

  });
});