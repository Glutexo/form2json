/**
 * Creates a jQuery object with a form element. The formTransform function
 * argument can be used to fill the form with input fields.
 *
 * Example: create$form(function($form) {
 *   $hidden = create$hidden('fruit', 'apple');
 *   $form.append($hidden);
 * });
 *
 * @param formTransform
 * @returns {*|jQuery|HTMLElement}
 */
function create$form(formTransform) {
  $form = $(document.createElement('form'));
  $form.attr('action', 'dump.php');
  $form.attr('method', 'POST');

  if(typeof formTransform == 'function') {
    formTransform($form);
  }

  return $form;
}

/**
 * Creates a jQuery object with a hidden form field.
 *
 * @param name
 * @param value
 * @returns {*|jQuery|HTMLElement}
 */
function create$hidden(name, value) {
  var $input =  $(document.createElement('input'));
  $input.attr('name', name);
  $input.val(value);
  return $input;
}

/**
 * Performs an AJAX request as if the given form was submitted.
 * Options:
 *   callback: Function run on success. Goes into success option of
 *             the performed $.ajax call.
 *   jsonVar: If given, all form data is packed into a single JSON-
 *            -encoded variable.
 *
 * @param form
 * @param options
 */
function ajaxSendForm(form, options) {
  var $form = form instanceof jQuery ? form : $(form);
  var options = $.extend({}, ajaxSendForm.defaults, options);

  $.ajax({
    url: $form.attr('action'),
    type: $form.attr('method'),
    success: options.callback,
    data: options.json ? Form2Json._getFormDataJson($form) : Form2Json._getFormData($form)
  });
}
ajaxSendForm.defaults = {
  json: false,
  callback: undefined
};

/**
 * Performs an asyncTest sending a form via AJAX to the dump
 * script that returns a JSON object with all request variables.
 * It compares the send data with the received data, which
 * must be equal.
 * If the json switch is on, all the form data is sent packed
 * into a single json variable named __JSON.
 *
 * @param title
 * @param expected
 * @param formTransform
 * @param json
 */
function formAsyncTest(title, expected, formTransform, json) {
  var suffix = 'AJAX';
  if(json) {
    suffix += ', JSON';
  }
  suffix = ' (' + suffix + ')';

  asyncTest(title + suffix, function() {
    expect(1);

    var $form = create$form(formTransform);
    var callback = function(data) {
      deepEqual(data, expected);
      start();
    };

    ajaxSendForm($form, {
      callback: callback,
      json: json
    });
  });
}

/**
 * Runs a series of tests to check whether the form data
 * is collected, send and unpacked correctly.
 *
 * Firstly, the expected argument is compared to a result
 * of a _getFormData call on the formTransform form. This
 * tests the _getFormData function.
 *
 * Secondly, the form is sent via AJAX to a dump script
 * that returns a JSON object just with all the request
 * parameters it gets. This tests that the form is sent
 * correctly as well as dumped correctly.
 *
 * Thirdly, the form is sent to the dump script again,
 * but this time with all its data packed into a single
 * JSON variable. This tests the transparent JSON
 * unpacking on the server side.
 *
 * @param title
 * @param expected
 * @param formTransform
 */
function formAsyncTests(title, expected, formTransform) {
  test(title + ' (_getFormData)', function() {
    var $form = create$form(formTransform);

    deepEqual(Form2Json._getFormData($form), expected);
  });

  formAsyncTest(title, expected, formTransform, false);
  formAsyncTest(title, expected, formTransform, true);
}

/* *** *** HELPER FUNCTIONS END HERE *** *** */

/* *** *** TESTS START HERE *** *** */
module('_getPushKey');

test('Empty object push key is found', function() {
  var obj = {};
  equal(Form2Json._getPushKey(obj), 0);
});

test('Sequential numeric push key is found', function() {
  var obj = { 0: 'fruit', 1: 'vegetable' };
  equal(Form2Json._getPushKey(obj), 2);
});

test('Non-sequential numeric push key is found', function() {
  var obj = { 0: 'fruit', 5: 'vegetable', 2: 'nut' };
  equal(Form2Json._getPushKey(obj), 6);
});

test('First push key in named object is found', function() {
  var obj = { fruit: 'apple' };
  equal(Form2Json._getPushKey(obj), 0);
});

test('Another push key in named object is found', function() {
  var obj = { fruit: 'apple', 5: 'vegetable', nut: 'chestnut', 2: 'unknown' };
  equal(Form2Json._getPushKey(obj), 6);
});

module('_getFormData');

formAsyncTests('Empty form is submitted.', {});

formAsyncTests(
  'Form with single value is submitted.',
  { fruit: 'apple' },
  function($form) {
    $form.append(create$hidden('fruit', 'apple'));
  }
);

formAsyncTests(
  'Form with multiple values is submitted.',
  { fruit: 'apple', vegetable: 'carrot', nut: 'cashew' },
  function($form) {
    $form.append(create$hidden('fruit', 'apple'));
    $form.append(create$hidden('vegetable', 'carrot'));
    $form.append(create$hidden('nut', 'cashew'));
  }
);

formAsyncTests(
  'Form with named arrays is submitted.',
  {
    fruit: { red: 'apple', orange: 'orange' },
    vegetables: { orange: 'carrot', green: 'broccoli' }
  },
  function($form) {
    $form.append(create$hidden('fruit[red]', 'apple'));
    $form.append(create$hidden('fruit[orange]', 'orange'));
    $form.append(create$hidden('vegetables[orange]', 'carrot'));
    $form.append(create$hidden('vegetables[green]', 'broccoli'));
  }
);

formAsyncTests(
  'Form with numbered arrays is submitted.',
  {
    fruit: { 0: 'apple', 2: 'orange' },
    vegetables: { 1: 'broccoli', 3: 'carrot' }
  },
  function($form) {
    $form.append(create$hidden('fruit[0]', 'apple'));
    $form.append(create$hidden('fruit[2]', 'orange'));
    $form.append(create$hidden('vegetables[3]', 'carrot'));
    $form.append(create$hidden('vegetables[1]', 'broccoli'));
  }
);

formAsyncTests(
  'Form with one implicitly numbered array is submitted.',
  {
    fruit: { 0: 'apple', 1: 'orange', 2: 'pear' }
  },
  function($form) {
    $form.append(create$hidden('fruit[]', 'apple'));
    $form.append(create$hidden('fruit[]', 'orange'));
    $form.append(create$hidden('fruit[]', 'pear'));
  }
);

formAsyncTests(
  'Form with more implicitly numbered arrays is submitted.',
  {
    fruit: { 0: 'apple', 1: 'orange' },
    vegetables: { 0: 'carrot', 1: 'broccoli' },
    nuts: { 0: 'chestnut', 1: 'walnut' }
  },
  function($form) {
    $form.append(create$hidden('fruit[]', 'apple'));
    $form.append(create$hidden('fruit[]', 'orange'));
    $form.append(create$hidden('vegetables[]', 'carrot'));
    $form.append(create$hidden('vegetables[]', 'broccoli'));
    $form.append(create$hidden('nuts[]', 'chestnut'));
    $form.append(create$hidden('nuts[]', 'walnut'));
  }
);

formAsyncTests(
  'Form with multi-dimensional named arrays is submitted.',
  {
    fruit: {
      apple: { color: 'red', taste: 'sweet' },
      lemon: { color: 'yellow', taste: 'sour' }
    },
    vegetables: {
      carrot: { color: 'orange', taste: 'sweet' },
      broccoli: { color: 'green', taste: 'bitter' }
    }
  },
  function($form) {
    $form.append(create$hidden('fruit[apple][color]', 'red'));
    $form.append(create$hidden('fruit[apple][taste]', 'sweet'));
    $form.append(create$hidden('fruit[lemon][color]', 'yellow'));
    $form.append(create$hidden('fruit[lemon][taste]', 'sour'));
    $form.append(create$hidden('vegetables[carrot][color]', 'orange'));
    $form.append(create$hidden('vegetables[carrot][taste]', 'sweet'));
    $form.append(create$hidden('vegetables[broccoli][color]', 'green'));
    $form.append(create$hidden('vegetables[broccoli][taste]', 'bitter'));
  }
);

formAsyncTests(
  'Form with multi-dimensional mixed arrays is submitted.',
  {
    fruit: {
      apple: {
        colors: {
          0: 'red',
          1: 'green',
          2: 'yellow'
        },
        taste: 'sweet'
      },
      lemon: { color: 'yellow', taste: 'sour' }
    },
    vegetables: {
      carrot: { color: 'orange', taste: 'sweet' },
      broccoli: {
        color: 'green',
        tastes: {
          0: 'bitter',
          1: 'sweet',
          common: 'sweet'
        }
      }
    },
    nuts: {
      0: 'chestnut',
      5: 'walnut',
      6: 'cashew',
      big: 'coconut',
      again: {
        0: 'chestnut',
        5: 'walnut',
        6: 'cashew',
        big: 'coconut'
      }
    }
  },
  function($form) {
    $form.append(create$hidden('fruit[apple][colors][]', 'red'));
    $form.append(create$hidden('fruit[apple][colors][]', 'green'));
    $form.append(create$hidden('fruit[apple][colors][]', 'yellow'));
    $form.append(create$hidden('fruit[apple][taste]', 'sweet'));
    $form.append(create$hidden('fruit[lemon][color]', 'yellow'));
    $form.append(create$hidden('fruit[lemon][taste]', 'sour'));
    $form.append(create$hidden('vegetables[carrot][color]', 'orange'));
    $form.append(create$hidden('vegetables[carrot][taste]', 'sweet'));
    $form.append(create$hidden('vegetables[broccoli][color]', 'green'));
    $form.append(create$hidden('vegetables[broccoli][tastes][]', 'bitter'));
    $form.append(create$hidden('vegetables[broccoli][tastes][]', 'sweet'));
    $form.append(create$hidden('vegetables[broccoli][tastes][common]', 'sweet'));
    $form.append(create$hidden('nuts[]', 'chestnut'));
    $form.append(create$hidden('nuts[5]', 'walnut'));
    $form.append(create$hidden('nuts[]', 'cashew'));
    $form.append(create$hidden('nuts[big]', 'coconut'));
    $form.append(create$hidden('nuts[again][]', 'chestnut'));
    $form.append(create$hidden('nuts[again][5]', 'walnut'));
    $form.append(create$hidden('nuts[again][]', 'cashew'));
    $form.append(create$hidden('nuts[again][big]', 'coconut'));
  }
);

formAsyncTests(
  'Form with multi-dimensional implicit arrays is submitted.',
  {
    fruit: {
      0: {
        0: 'red apple'
      },
      1: {
        0: 'yellow lemon'
      }
    },
    vegetables: {
      carrot: {
        0: {
          0: 'orange and sweet'
        },
        1: {
          0: 'brown and rotten'
        }
      }
    }
  },
  function($form) {
    $form.append(create$hidden('fruit[][]', 'red apple'));
    $form.append(create$hidden('fruit[][]', 'yellow lemon'));
    $form.append(create$hidden('vegetables[carrot][][]', 'orange and sweet'));
    $form.append(create$hidden('vegetables[carrot][][]', 'brown and rotten'));
  }
);

module('_getFormFromOptions');

test('Form got when directly supplied.', function() {
  var form = document.createElement('form');

  var options = { form: form };
  strictEqual(form, Form2Json._getFormFromOptions(options));
});

asyncTest('Form got from the directly supplied key even if event with another form is supplied too.', function() {
  expect(3);

  var form = document.createElement('form');
  var anotherForm = document.createElement('form');
  notEqual(form, anotherForm);

  $(anotherForm).on('submit', function(event) {
    event.preventDefault();

    var options = {
      form: form,
      event: event
    };

    var gotForm = Form2Json._getFormFromOptions(options);

    strictEqual(form, gotForm);
    notEqual(anotherForm, gotForm); // notStrictEqual would do too
    start();
  }).trigger('submit');
});

asyncTest('Form got from submit event.', function() {
  expect(1);

  var form = document.createElement('form');

  $(form).on('submit', function(event) {
    event.preventDefault();

    var options = { event: event };
    strictEqual(form, Form2Json._getFormFromOptions(options));
    start();
  }).trigger('submit');
});

asyncTest('Form got from button click event.', function() {
  expect(1);

  var form = document.createElement('form');
  var button = document.createElement('input');
  button.type = 'submit';
  $(form).append(button);

  $(button).on('click', function(event) {
    event.preventDefault();

    var options = { event: event };
    strictEqual(form, Form2Json._getFormFromOptions(options));
    start();
  }).trigger('click');
});