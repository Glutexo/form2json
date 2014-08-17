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
  var $form = $(document.createElement('form'));
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

module('_cloneForm');

test('Plain empty form is cloned.', function() {
  var form = document.createElement('form');
  var clonedForm = Form2Json._cloneForm(form);

  notEqual(form, clonedForm);
  deepEqual(form, clonedForm);
});

test('Simple empty form is cloned.', function() {
  var form = document.createElement('form');
  form.action = 'http://www.example.com/form?action=submmit#hash';
  form.method = 'POST';
  form.enctype = 'multipart/form-data';
  var clonedForm = Form2Json._cloneForm(form);

  notEqual(form, clonedForm);
  deepEqual(form, clonedForm);
});

test('Non-empty form is cloned as empty.', function() {
  var form = document.createElement('form');
  form.action = 'http://www.example.com/form?action=submmit#hash';
  form.method = 'POST';
  form.enctype = 'multipart/form-data';
  var $form = $(form);

  var input = document.createElement('input');
  var $input = $(input);
  $(form).append(input);

  var clonedForm = Form2Json._cloneForm(form);
  var $clonedForm = $(clonedForm);

  // There really is the input element.
  equal($form.find('input').length, 1);

  // The new form is empty, the old one isn’t.
  notEqual(form, clonedForm);
  notDeepEqual(form, clonedForm);

  equal($clonedForm.find('input').length, 0);

  // Remove the input element from the old form to check
  // deep equality.
  $input.remove();
  // It is really removed.
  equal($form.find('input').length, 0);

  // Both forms are now empty – they are not identical,
  // but they have same attributes.
  notEqual(form, clonedForm);
  deepEqual(form, clonedForm);
});

module('_afterInvisible');

test('Element not in DOM raises an error.', function() {
  var before = document.createElement('form');
  var after = document.createElement('form');

  throws(function() {
    Form2Json._afterInvisible(before, after);
  }, 'Element is not in the document’s <body>.');
});

test('Element not in body raises an error.', function() {
  var before = document.createElement('form');
  $('head').append(before);
  var after = document.createElement('form');

  throws(function() {
    Form2Json._afterInvisible(before, after);
  }, 'Element is not in the document’s <body>.');
});

test('The new element is inserted after the original one.', function() {
  var $body = $('body');
  var before = document.createElement('form');
  $body.append(before);
  var after = document.createElement('form');

  Form2Json._afterInvisible(before, after);

  strictEqual($(before).next()[0], after);

  // Teardown.
  $(before).add(after).remove();
});

test('The new element is invisible.', function() {
  var $body = $('body');
  var before = document.createElement('form');
  $body.append(before);
  var after = document.createElement('form');

  Form2Json._afterInvisible(before, after);

  equal($(before).filter(':visible').length, 1);
  equal($(after).filter(':visible').length, 0);

  // Teardown.
  $(before).add(after).remove();
});

module('submitFormAsJson');

function submitFormAsJsonTest(name, expectCount, modifyOptions, callback) {
  asyncTest(name, function() {
    expect(expectCount);

    var submit = function(event) {
      event.preventDefault();
      if(typeof callback == 'function') {
        callback.call(this, event);
      }
      start();
    };

    // Attaching to a body for the cloned form to has interceptable submit event.
    var $body = $('body');
    var $form = create$form(function($form) {
      $form.append(create$hidden('fruit', 'apple'));
      $form.append(create$hidden('vegetable', 'carrot'));
    });
    $body.append($form);

    $body.on('submit', 'form.form2json', submit);

    var options = { form: $form[0] };
    modifyOptions(options);

    Form2Json.submitFormAsJson(options);

    // Teardown.
    $form.remove();
    $body.off('submit', 'form.form2json', submit);
  });
}

submitFormAsJsonTest(
  'Form is submitted with right values.',
  2,
  function(options) {},
  function(event) {
    var val = $(this).find('input').val();
    var data = {
      fruit: 'apple',
      vegetable: 'carrot'
    };

    equal(val, JSON.stringify(data));
    deepEqual(JSON.parse(val), data);
  }
);

submitFormAsJsonTest(
  'Form is packed into a field with a default name.',
  2,
  function(options) {},
  function(event) {
    var $input = $(this).find('input');

    equal($input.length, 1);
    equal($input.attr('name'), Form2Json.submitFormAsJson.defaults.varName);
  }
);

submitFormAsJsonTest(
  'Form can be packed into a field with a custom name.',
  2,
  function(options) {
    options.varName = '_JSON_'
  },
  function(event) {
    var $input = $(this).find('input');

    equal($input.length, 1);
    equal($input.attr('name'), '_JSON_');
  }
);

submitFormAsJsonTest(
  'Callback is called right before submit in the context of the form.',
  2,
  function(options) {
    options.callback = function() {
      var $input = $(this).find('input');

      // The hidden fields is there with the right name.
      // The form is ready to be submitted.
      equal(1, $input.length);
      equal(Form2Json.submitFormAsJson.defaults.varName, $input.attr('name'));
    }
  }
);

module('jQuery');

test('jQuery object has form2json method callable on collection.', function() {
  var $form = create$form();
  equal('function', typeof $form.form2json);
});

test('jQuery form2json method returns the collection (allows chaining).', function() {
  var $form = create$form();
  strictEqual($form, $form.form2json());
});

// If the submit isn’t intercepted, the page would be redirected.
// Is it sufficent to test nothing assuming that if we are still
// here seeing the test results, it means that the tess passed?
// Is there a way to test whether a form has been submitted and
// its submitment intercepted?
asyncTest('Form has its submit method intercepted.', function() {
  expect(1);

  var options = {
    callback: function() {
      $(this).on('submit', function(event) {
        // Intercepting the original form isn’t enough. Even though
        // this callback call isn’t covered by this test, it has to
        // be used to prevent redirect.
        event.preventDefault();
      });
    }
  };

  var $form = create$form().form2json(options);
  $form.on('submit', function(event) {
    // Don’t prevent default here! It’s form2json’s job.
    equal(true, event.isDefaultPrevented());
    start();
  });
  $form.trigger('submit');
});

test('The OnSubmit method is attached to the form submit event.', function() {
  expect(1);
  var $form = create$form().form2json();
  var events = $._data($form[0], 'events').submit;
  $.each(events, function() {
    if(typeof this.handler.origin == 'function' && this.handler.origin === Form2Json.onSubmit) {
      ok(true);
    }
  })
});

asyncTest('The submitFormAsJson method is called, callback being handled.', function() {
  expect(0);

  var options = {
    callback: function() {
      $(this).on('submit', function(event) {
        event.preventDefault();
        // Test just the call itself.
        // Almost identical to the last test, but this time this callback
        // right before submitting the JSON form is tested. Thanks to the
        // last test it can be already assumed that the submitment of the
        // original form is intercepted.
        start();
      });
    }
  };
  var $form = create$form().form2json(options);
  $form.trigger('submit');
});

