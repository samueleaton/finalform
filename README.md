# FinalForm

HTML form fields parser

## Usage

Simply pass a form object into one of two methods:

- `parse`
- `serialize`

**Parse Example**

``` javascript
import { finalform } from 'finalform';

const form = document.querySelector('#myForm');
const formObj = finalform.parse(form);
```

**Serialize Example**

``` javascript
import { finalform } from 'finalform';

const form = document.querySelector('#myForm');
const serializedForm = finalform.serialize(form);
```

See better example in `demo.html`.