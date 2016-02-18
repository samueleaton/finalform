# FinalForm

HTML form fields parser

<img src="https://img.shields.io/badge/license-MIT-blue.svg">

## Usage

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