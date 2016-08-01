# FinalForm Backlog

Checklist for getting to v1.0.0:

- [x] stabilize feature set
- [x] stabilize/normalize api
- [x] add asynchronous parse/validation
- [x] add ability to return error message in validation
- [x] make validation for non-text fields standardized
- [x] remove form element restriction

Checklist for getting to v2.0.0:

- [ ] Remove toUpperCase/toLowerCase
- [ ] add `asyncCustomFields` api (where the value of field is async)
- [ ] ~~add `validationInputs` api (for custom field source when validating)~~ 
- [ ] add lots of comments
- [ ] add APIs for setting/overwriting config values after creating parser
- [ ] extract only used lodash methods to make bundle smaller
