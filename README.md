<br />  
<br />  
<p align="center">
<img width="250" title="finalform" alt="finalform" src="https://raw.githubusercontent.com/samueleaton/design/master/finalform2.png">  
</p>
<br />  
<br />  

# FinalForm

HTML form fields parser

<img src="https://img.shields.io/badge/license-MIT-blue.svg">

## Installation

Using npm:

```
npm i -S finalform
```

## Usage

There are two ways to use FinalForm:

1) A quick form parser  
2) A more advanced custom form parser

### Quick Form Parser

Simply pass a form element into the `parseForm` method. 

``` javascript
finalform.parseForm(HTMLElement[, {/* values options */}]);
```

**Example**

``` javascript
import finalform from 'finalform';

const form = document.querySelector('#myForm');
const formObj = finalform.parseForm(form);
```

#### Values Config

Pass an object of options as the second parameter to modify the values.

Available Options:

| Option         | Type          | Description                    | Default Value |
| -------------- | ------------- | ------------------------------ | ------------- |
|`trim`|Boolean|removes spaces from beginning/end of string|`true`|
|`compress`|Boolean|compress multiple sequential blank spaces to a single space|`true`|
|`escape`|Boolean|Converts certain characters to corresponding HTML entities|`false`|
|`checkboxFormat`|String (`'object'`, `'array'`)|whether checkbox result should be an object of `true`, `false` or an array of just the true values|`'object'`|
|`map`|Function <br />`@param inputValue`<br />`@return newValue`| map all of the parsed values to new value|`null`|

Example

``` javascript
import finalform from 'finalform';

const form = document.querySelector('#myForm');
const formObj = finalform.parseForm(form, {
    trim: false,
    compress: false,
    escape: true,
    toUpperCase: true,
    checkboxFormat: 'object'
    map: (value) => value // do something to value
});
```

### Custom Form Parser

#### Creating a Custom Parser

Create a custom parser using the `createParser` method.

``` javascript
const customParser = finalform.createParser({ /* parser options */ });
```

#### Running the Parser

``` javascript
const customParser = finalform.createParser({ /* parser options */ });
customParser.parse();
```

#### Custom Parser Options

There are a handful of options to specify in the custom parser. Here is an example of all of the available properties (a description of each is given after the example):  

| Option         | Type          | Description                    | Default Value |
| -------------- | ------------- | ------------------------------ | ------------- |
|`forms`|Array|array of HTML elements to parse|`[]`|
|`mapNames`|Object|map the html element names to new name|`{}`|
|`pick`|Array|filter fields in parsed output|`{}`|
|`customFields`|Object|define custom fields that may not be derived from any HTML element|`{}`|
|`validations`|Object|synchronous validations to run on specified fields|`{}`|
|`asyncValidations`|Object|asynchronous validations to run on specified fields|`{}`|
|`values`|Object|(See `Values Config` section)|


``` javascript
{
  forms: [],
  mapNames: {},
  pick: [],
  customFields: {},
  validations: {},
  asyncValidations: {},
  values: {
    trim: Boolean,
    compress: Boolean,
    escape: Boolean,
    toUpperCase: Boolean,
    toLowerCase: Boolean,
    checkboxFormat: String,
    map: Function,
  }
}
```


##### Adding Forms to Custom Parser

You can add as many forms as you want to the custom parser using the `forms` array, it will parse them all at one.

``` javascript
const customParser = finalform.createParser({ forms: [HTMLElement, /*etc*/] });
parser.parse();
```

##### Changing Field Names in the Output

If you want to take the output of the parser and plug it into another API, you will probably want to change the name of some of the fields.

``` html
<input type="text" name="user-email" value="ironman@stark.com" />
<input type="text" name="user-company" value="Stark Industries" />
```

``` javascript
const customParser = finalform.createParser({
  /*other options...*/
  mapNames: {
    'user-email': 'Email',
    'user-company': 'Company'
  }
});
const parsedForm = parser.parse();

console.log(parsedForm.Email); // ironman@stark.com
console.log(parsedForm.Company); // Stark Industries
```

##### Picking Specified Fields

If you want to take the output of the parser and plug it into another API, you will probably want to only pick a few fields from the output.

(This feature is based off of Lodash's [pick](https://lodash.com/docs#pick))

``` html
<input type="text" name="email" value="ironman@stark.com" />
<input type="text" name="company" value="Stark Industries" />
```

``` javascript
const customParser = finalform.createParser({
  /*other options...*/
  pick: ['email']
});
const parsedForm = parser.parse();

console.log(parsedForm.email); // ironman@stark.com
console.log(parsedForm.company); // undefined
```

##### Adding Custom Fields to the Parser

You can attach custom fields to the parser. This allows you to pull in additional data that may not be associated with any form.

``` html
<input type="text" name="email" value="ironman@stark.com" />
<input type="text" name="company" value="Stark Industries" />
```

``` javascript
const customParser = finalform.createParser({
  /* other options... */
  customFields: {
    location: () => {
      // do some calculations
      return 'Manhattan';
    }
  }
});
const parsedForm = parser.parse();

console.log(parsedForm.email); // ironman@stark.com
console.log(parsedForm.location); // Manhattan
```

##### Syncronous Validations

You can specify validations to run against all of the values and return whether it is valid or not.

You can return a boolean or an object with the format `{ isValid: Boolean, msg: String }` for easy error messages.

``` html
<input type="text" name="email" value="" />
<input type="text" name="company" value="Stark Industries" />
```

``` javascript
const customParser = finalform.createParser({
  /* other options... */
  validations: {
    email: value => {
      if (email.trim().length)
        return true;
      else
        return { isValid: false, msg: 'Field is required' }
    }
  }
});
const parsedForm = parser.parse();

console.log(parsedForm.email); // ''
console.log(parsedForm.isValid); // false
console.log(parsedForm.invalidFields); // [ Object ]
```

##### Asyncronous Validations

Asynchronous validations are good if you need to hit up a server before validating some fields.

You can return a boolean or an object with the format `{ isValid: Boolean, msg: String }` for easy error messages.

*When using asynchronous validations the `parse` method will return a promise.*

``` html
<input type="text" name="email" value="ironman@stark.com" />
<input type="text" name="company" value="Stark Industries" />
```

``` javascript
const customParser = finalform.createParser({
  /* other options... */
  asyncValidations: {
    email: (value, done) => {
      // query the server to see if email is taken
      // ...
      const emailAvailable = isEmailAvailable(value); 
      // ...

      if (emailAvailable)
        return done(true);
      else
        return done({ isValid: false, msg: 'Email already used' });
    }
  }
});

parser.parse().then(parsedForm => {
  console.log(parsedForm.email); // ironman@stark.com
  console.log(parsedForm.isValid); // false
  console.log(parsedForm.invalidFields); // [ Object ]
});
```
