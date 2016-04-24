# FinalForm

HTML form fields parser

<img src="https://img.shields.io/badge/license-MIT-blue.svg">

## Usage

There are two ways to use FinalForm:

1) A static form parser
2) A custom form parser

### Static Form Parser

Simply pass a form object into one of two methods:

- `parse`
- `serialize`

**Parse Example**

``` javascript
import finalform from 'finalform';

const form = document.querySelector('#myForm');
const formObj = finalform.parse(form);
```

**Serialize Example**

``` javascript
import finalform from 'finalform';

const form = document.querySelector('#myForm');
const serializedForm = finalform.serialize(form);
```

See better example in `demo.html` and `demo.js`.


#### Passing Options

Pass an object of options as the second parameter to the `parse` or `serialize`methods. The options **only** effect `<input>` elements (meaning they don't modify values for `<select>`, `<textarea>`, etc...).

All options take boolean values `{trim: false, compress: true}`

Available Options:

- **`trim`** - removes all spaces from beginning and end of string (defaults to `true`)
- **`compress`** - compress multiple sequential blank spaces to a single space (defaults to `true`)
- **`checkboxesAsArray`** - store check boxes as an array of selected boxes rather than an object of `true`/`false` value. (defaults to `false`)
- **`toUpperCase`** - convert values to uppercase (defaults to `false`)
- **`toLowerCase`** - convert values to lowercase (defaults to `false`)
- **`modify`** - a `false` value turns all other options to `false` (defaults to `true`)

Example

``` javascript
import finalform from 'finalform';

const form = document.querySelector('#myForm');
const formObj = finalform.parse(form, {
    trim: false, compress: false, toUpperCase: true
});
```

### Custom Form Parser

#### Creating a Custom Parser

Create a custom parser using the `create` method.

``` javascript
const customParser = finalform.create();
```

#### Adding Forms to Custom Parser

You can add as many forms as you want to the custom parser using the `forms` method, it will parse them all at one.

``` javascript
const customParser = finalform.create();
customParser.forms(myForm1, myForm2);
```

#### Adding Custom Fields to the Parser

You can attach custom fields to the parser. This allows you to pull in additional data that is not associated with any form. Use the `defineField(fieldName, getter)` method.

``` javascript
const customParser = finalform.create();
customParser.defineField('my-timestamp', () => {
  return Date.now();
});
```


#### Running the Custom Parser

Run the Custom Parser with the `parse` method.

``` javascript
const customParser = finalform.create();
customParser.parse();
```

The format of the parser is an `Object` with the following properties:

- fields - an object of all of the parsed fields and their values
- isValid - is `true` if there are no invalid fields, otherwise is false
- invalidFields - array of invalid fields (see `validations` method below)
- validFields - array of valid fields (see `validations` method below)

**Filtering the Parsed Result**

You can define the `pick` property (inspired by lodash) to choose which field to return from the parser.

``` javascript
const customParser = finalform.create();
customParser.parse({
  pick: ['email', 'phone']
});
```

*Note:* If using in combination with `map`, you can use the field name before or after is was mapped. `pick` will remember both field names. 

**Changing Key Names of the Parsed Result**

You can define the `map` property to change the name of the key for the field.

``` javascript
const customParser = finalform.create();
customParser.parse({
  map: {email: 'user-email', phone: 'home-phone-number']
});
```

### Custom Field Validations

To set custom validations, use the `validations` method before `parse`. Pass an object of key value pairs where the value is a function whose first paramter is the html form element where the field gets it value from.

``` javascript
parser.validations({
  email: element => {
    if (element.value.trim().length)
      return true;
  },
  phone: element => {
    if (element.value.trim().length)
      return true;
  }
});
```
