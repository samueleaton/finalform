'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FinalForm = function () {
  _createClass(FinalForm, null, [{
    key: 'validateFormElement',
    value: function validateFormElement(form) {
      if (form && (!(form instanceof HTMLElement) || form.tagName && form.tagName.toUpperCase() !== 'FORM')) throw new Error('Not a valid HMTL form element.');
    }
    /* generates a key for the field value
      only runs if no 'name', 'id', and 'placeholder' attributes are found
    */

  }, {
    key: 'generateKeyName',
    value: function generateKeyName(inputsObj, element, type, index) {
      var i = index || 1;
      var typeStr = typeof type === 'string' ? '-' + type : '';

      if (typeof inputsObj[element + typeStr] === 'undefined') return element + typeStr;else if (typeof inputsObj[element + typeStr + '-' + i] === 'undefined') return element + typeStr + '-' + i;else return FinalForm.generateKeyName(inputsObj, element, type, i + 1);
    }
  }, {
    key: 'getFieldName',
    value: function getFieldName(field) {
      return field.name || field.id || field.placeholder || null;
    }
  }, {
    key: 'serialize',
    value: function serialize(parsedForm) {
      var serialized = [];

      if (!parsedForm || (typeof parsedForm === 'undefined' ? 'undefined' : _typeof(parsedForm)) !== 'object') return '';

      _lodash2.default.each(_lodash2.default.keys(parsedForm), function (key) {
        if (!parsedForm[key] || typeof parsedForm[key] === 'string' || typeof parsedForm[key] === 'number') serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(parsedForm[key]));else if (_lodash2.default.isArray(parsedForm[key])) {
          var valueStr = '';
          _lodash2.default.each(parsedForm[key], function (val) {
            valueStr += val + ',';
          });
          valueStr = valueStr.slice(0, -1);
          serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(valueStr));
        } else if (_typeof(parsedForm[key]) === 'object') {
          serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(parsedForm[key])));
        } else console.warn('could not serialize ' + parsedForm[key]);
      });
      return serialized.join('&');
    }

    /*
    */

  }]);

  function FinalForm(form, options) {
    _classCallCheck(this, FinalForm);

    this.options = options || {};
    this.form = form;

    if (this.options.modify === false) {
      this.options.trim = this.options.compress = this.options.toUpperCase = this.options.toLowerCase = this.options.checkboxesAsArray = false;
    }

    FinalForm.validateFormElement(this.form);
  }

  /* Gets all form <input> values
  */


  _createClass(FinalForm, [{
    key: 'getInputs',
    value: function getInputs() {
      var _this = this;

      var inputsObj = {};
      var elementMap = {};

      _lodash2.default.each(this.form.getElementsByTagName('input'), function (element, i) {
        var type = element.type || 'text';
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(inputsObj, 'input', type);
        var val = element.value;

        if (_this.options.trim !== false) val = val.trim();

        if (_this.options.compress !== false) val = val.replace(/ +/g, ' ');

        if (_this.options.toUpperCase === true) val = val.toUpperCase();

        if (_this.options.toLowerCase === true) val = val.toLowerCase();

        if (_this.options.escape === true) val = _lodash2.default.escape(val);

        if (type === 'checkbox') {
          if (_this.options.checkboxesAsArray) {
            if (!_lodash2.default.isArray(inputsObj[name])) inputsObj[name] = [];
            if (element.checked) inputsObj[name].push(val);
          } else {
            if (_typeof(inputsObj[name]) !== 'object') inputsObj[name] = {};
            inputsObj[name][val] = element.checked;
          }
        } else if (type === 'radio') {
          if (typeof inputsObj[name] === 'undefined') inputsObj[name] = '';
          if (element.checked) inputsObj[name] = val;
        } else inputsObj[name] = val;

        elementMap[name] = { name: name, element: element, value: inputsObj[name] };
      });
      return elementMap;
    }
  }, {
    key: 'getSelects',
    value: function getSelects(parent) {
      var elementMap = {};

      _lodash2.default.each(parent.getElementsByTagName('select'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'select');

        elementMap[name] = { name: name, element: element, value: element.value };
      });

      return elementMap;
    }
  }, {
    key: 'getTextAreas',
    value: function getTextAreas(parent) {
      var elementMap = {};
      _lodash2.default.each(parent.getElementsByTagName('textarea'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'textarea');
        elementMap[name] = { name: name, element: element, value: element.value };
      });
      return elementMap;
    }
  }, {
    key: 'getButtons',
    value: function getButtons(parent) {
      var elementMap = {};
      _lodash2.default.each(parent.getElementsByTagName('button'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'button');
        elementMap[name] = { name: name, element: element, value: element.value };
      });
      return elementMap;
    }
  }, {
    key: 'parse',
    value: function parse() {
      var args = [this.form, this.options];
      return (0, _merge2.default)(this.getInputs.apply(this, args), this.getTextAreas.apply(this, args), this.getSelects.apply(this, args), this.getButtons.apply(this, args));
    }
  }]);

  return FinalForm;
}();

exports.default = FinalForm;
;