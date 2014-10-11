# Submit a HTML form as a single JSON #

This library’s purpose is to serialize a whole HTML form to a single variable containing a JSON object. Upon decoding this object, the obtained variables should have the same structure and values as if the from was submitted normally. Using this library it is possible to transparently submit forms with many fields that would normally exceed a limit (e.g. 1,000 which is a default for some PHP installations). This is particularly useful if the limit can’t be set to infinite and you don’t know how many fields your form would have.

It consists of two parts:

1. The encoding client part (JavaScript) which binds to the submit event of a form, serializes its variables and submits them packed in a single JSON field.
2. The decoding server part (PHP) which captures the serialized object and unserializes it to the super-globals.

## Requirements ##

The only requirement is the [jQuery library](http://jquery.com/). The closer to the version 2.1.1, the higher probability that this program will work.

## Usage ##

### Client side – JavaScript ###

Include jQuery and [src/form2json.js] in your HTML file.

```html
<script src="js/jquery.js" type="text/javascript"></script>
<script src="js/form2json.js" type="text/javascript"></script>
```

Hook form2json onto your form for it to be sent as JSON.

```js
$(function(event) {
  $('#my_form').form2json();
});
```

### Server side – PHP ###

Include [src/ArrayHelper.php](https://github.com/Glutexo/form2json/blob/master/src/ArrayHelper.php) and [src/Form2Json.php](https://github.com/Glutexo/form2json/blob/master/src/Form2Json.php) in your application initialization script as soon as possible. Then run its _Json2Request_ static method.

```
require('vendor/glutexo/form2json/ArrayHelper.php');
require('vendor/glutexo/form2json/Form2Json.php');
Form2Json::Json2Request();
```

### Configuration ###

It is possible to change the JSON variable name. On the JavaScript side, provide a _varName_ option like `$('#my_form').form2json({ varName: '_MyJsonVar_' });`. On the PHP side, call the Json2Request method like `Form2Json::Json2Request('_MyJsonVar_');`.

A callback can be run right before submitting the JSON form. Use a `callback` option like `$('#my_form').form2json({ callback: function(formData) { /* this = form element */ } });`. `this` points to the DOM object of the cloned form that has only one field with the serialized JSON object.

If you want to leave the JSON variable in the super-globals (_$_GET_, _$_POST_ and _$_REQUEST_) after unpacking, provide the Json2Request method with a second argument being false: `Form2Json::Json2Request('__JSON', false);`.

## Note ##

If decimal numbers are used as array keys, the result of _getFormData_ will be different from what will be stored in the PHP variables. This is because PHP converts such array keys from floats to integers. This can solved by patching the _getFormData_ to translate the numeric array keys the same way as PHP does. I just didn’t do it (yet), since it is a very unlikely situation.

## TODO / next steps: ##

* Move the Form2json object from window to jQuery.
* Add a method to unbind the event.
* Intercept other submit buttons than `<input type="submit" />`