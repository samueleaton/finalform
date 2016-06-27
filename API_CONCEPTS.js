/***********************
This doc is just experimenting with api
***********************/


/***********************/
/* using config object */
/***********************/
const parser = finalForm.createParser({
  forms: [],
  pick: [],
  mapNames: {},
  values: {
    trim: true, // use replace(/ +/g, ' ') instead of replace(/\s+/g, ' ')
    checkboxFormat: 'object', // or 'array'
    compress: true,
    escape: true,
    toUpperCase: true,
    toLowerCase: true,
    map: value => {}
  },
  customFields: {

  },
  validations: {

  },
  asyncValidations: {

  },
  validationInputs: {

  }
}).parse();



/*****************************
//////////////////////////////
*****************************
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
*****************************
//////////////////////////////
*****************************
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
*****************************
//////////////////////////////
*****************************/


/******************************/
/* (and/or) using api methods */
/******************************/

const parser = finalForm.createParser
parser.setForms([]); // will reset any previous

// will reset any previous with same name
parser.defineCustomField('custom-field', () => {
  return 11;
});

// will reset any previous with same name
parser.setValidations({
  // text, textarea, radio, select
  email: value => {
    return Boolean;
    // or
    return { isValid: Boolean, msg: String };
  },

  // checkboxes
  animals: animalValues => {

  },

  // multi-select
  animals: animalArr => {
    // array of select fields
  }
});

// can co-exist with non-async validations.
// the validations won't all be done until the async ones are complete
parser.setAsyncValidations({// will reset any previous with same name
  email: (value, done) => {
    done(Boolean);
    // or
    done({ isValid: Boolean, msg: String });
  },
  phone: (value, done) => {

  }
});

parser.setValidationInputs({ // will reset any previous with same name
  // object, or any static value
  'custom-field': document.getElementById('my-element'),
  
  // or

  // dynamic value from function that will be evaluated and passed to validation
  'other-field': () => {}
});


// if no async
parser.parse();

// if async
parser.parse().then().catch();
