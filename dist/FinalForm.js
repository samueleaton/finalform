'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FinalForm = function () {
  _createClass(FinalForm, null, [{
    key: 'generateKeyName',

    /* generates a key for the field value
      only runs if no 'name', 'id', and 'placeholder' attributes are found
    */
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

      (0, _utils.forEach)((0, _utils.keys)(parsedForm), function (key) {
        if (!parsedForm[key] || typeof parsedForm[key] === 'string' || typeof parsedForm[key] === 'number') serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(parsedForm[key]));else if ((0, _utils.isArray)(parsedForm[key])) {
          var valueStr = '';
          (0, _utils.forEach)(parsedForm[key], function (val) {
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

  function FinalForm(form) {
    _classCallCheck(this, FinalForm);

    this.form = form;
  }

  /* Gets all form <input> values
  */


  _createClass(FinalForm, [{
    key: 'getInputs',
    value: function getInputs() {
      var inputsObj = {};
      var elementMap = {};

      (0, _utils.forEach)(this.form.getElementsByTagName('input'), function (element, i) {
        var type = element.type || 'text';
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(inputsObj, 'input', type);
        var val = element.value;

        if (type === 'checkbox') {
          if (_typeof(inputsObj[name]) !== 'object') inputsObj[name] = {};
          inputsObj[name][val] = element.checked;
        } else if (type === 'radio') {
          if (typeof inputsObj[name] === 'undefined') inputsObj[name] = '';
          if (element.checked) inputsObj[name] = val;
        } else inputsObj[name] = val;

        elementMap[name] = {
          name: name,
          element: element,
          value: inputsObj[name],
          type: type,
          msg: null
        };
      });
      return elementMap;
    }
  }, {
    key: 'getSelects',
    value: function getSelects() {
      var elementMap = {};

      (0, _utils.forEach)(this.form.getElementsByTagName('select'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'select');

        elementMap[name] = {
          name: name,
          element: element,
          value: element.value,
          type: 'select',
          msg: null
        };
      });

      return elementMap;
    }
  }, {
    key: 'getTextAreas',
    value: function getTextAreas() {
      var elementMap = {};
      (0, _utils.forEach)(this.form.getElementsByTagName('textarea'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'textarea');
        elementMap[name] = {
          name: name,
          element: element,
          value: element.value,
          type: 'textarea',
          msg: null
        };
      });
      return elementMap;
    }
  }, {
    key: 'getButtons',
    value: function getButtons() {
      var elementMap = {};
      (0, _utils.forEach)(this.form.getElementsByTagName('button'), function (element, i) {
        var name = FinalForm.getFieldName(element) || FinalForm.generateKeyName(elementMap, 'button');
        elementMap[name] = {
          name: name,
          element: element,
          value: element.value,
          type: element.type || null,
          msg: null
        };
      });
      return elementMap;
    }
  }, {
    key: 'parse',
    value: function parse() {
      return (0, _merge2.default)(this.getInputs(), this.getTextAreas(), this.getSelects(), this.getButtons());
    }
  }]);

  return FinalForm;
}();

exports.default = FinalForm;
;