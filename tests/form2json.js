function create$form() {
  $form = $(document.createElement('form'));
  $form.attr('action', 'dump.php');
  $form.attr('method', 'POST');

  return $form;
}

function create$hidden(name, value) {
  var $input =  $(document.createElement('input'));
  $input.attr('name', name);
  $input.val(value);
  return $input;
}

module('Submit as JSON.');

asyncTest('Empty form is submitted.', function() {
  expect(1);

  var $form = create$form();

  $.ajax({
    url: $form.attr('action'),
    type: $form.attr('method'),
    data: getFormDataJson($form),
    success: function(data) {
      deepEqual(data, {});
      start();
    }
  });
});

/* module("Vars", {
  setup: function() {
    this.action = "dump.php"
  }
});

test('Plain vars are captured.', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="fruit" value="apple" />\n'
  html += '   <input type="hidden" name="vegetable" value="carrot" />\n'
  html += '   <input type="hidden" name="unknown" value="watermelon" />\n'
  html += '</form>\n';

  var $form = $(html);
  $form.attr('action', this.action);
  var formData = getFormData($form);

  deepEqual(formData, {
    fruit: 'apple',
    vegetable: 'carrot',
    unknown: 'watermelon'
  });

  $.ajax({
    url: $form.attr('action'),
    type: 'POST',
    data: formData,
    success: function(data) {
    }
  });
});

test('Empty vars are captured.', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="nothing" value="" />\n'
  html += '   <input type="hidden" name="nihilism" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    nothing: '',
    nihilism: ''
  });
});

test('Vars with a same name are overwritten.', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="fruit" value="apple" />\n'
  html += '   <input type="hidden" name="vegetable" value="carrot" />\n'
  html += '   <input type="hidden" name="fruit" value="pear" />\n'
  html += '   <input type="hidden" name="vegetable" value="broccoli" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    fruit: 'pear',
    vegetable: 'broccoli'
  });
});

test('One-dimensional hashes are captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="food[fruit]" value="apple" />\n'
  html += '   <input type="hidden" name="food[vegetable]" value="carrot" />\n'
  html += '   <input type="hidden" name="animal[mammal]" value="rat" />\n'
  html += '   <input type="hidden" name="animal[bird]" value="blackbird" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    food: {
      fruit: 'apple',
      vegetable: 'carrot'
    },
    animal: {
      mammal: 'rat',
      bird: 'blackbird'
    }
  });
});

test('Multi-dimensional hashes are captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="food[fruit][apple]" value="red" />\n'
  html += '   <input type="hidden" name="food[fruit][pear]" value="yellow" />\n'
  html += '   <input type="hidden" name="food[vegetable][carrot]" value="orange" />\n'
  html += '   <input type="hidden" name="food[vegetable][broccoli]" value="green" />\n'
  html += '   <input type="hidden" name="animal[mammal][rat]" value="brown" />\n'
  html += '   <input type="hidden" name="animal[mammal][elephant]" value="grey" />\n'
  html += '   <input type="hidden" name="animal[bird][blackbird]" value="black" />\n'
  html += '   <input type="hidden" name="animal[bird][dove]" value="white" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    food: {
      fruit: {
        apple: 'red',
        pear: 'yellow'
      },
      vegetable: {
        carrot: 'orange',
        broccoli: 'green'
      }
    },
    animal: {
      mammal: {
        rat: 'brown',
        elephant: 'grey'
      },
      bird: {
        blackbird: 'black',
        dove: 'white'
      }
    }
  });
});


test('One array with one element is captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="fruit[]" value="apple" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    fruit: ['apple']
  });
});

test('One array with more elements is captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="fruit[]" value="apple" />\n'
  html += '   <input type="hidden" name="fruit[]" value="pear" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    fruit: ['apple', 'pear']
  });
});

test('Arrays are captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="fruit[]" value="apple" />\n'
  html += '   <input type="hidden" name="fruit[]" value="pear" />\n'
  html += '   <input type="hidden" name="vegetable[]" value="carrot" />\n'
  html += '   <input type="hidden" name="vegetable[]" value="broccoli" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    fruit: ['apple', 'pear'],
    vegetable: ['carrot', 'broccoli']
  });
});

test('Hash with array is captured', function() {
  var html = '<form>\n';
  html += '   <input type="hidden" name="food[fruit][]" value="apple" />\n'
  html += '   <input type="hidden" name="food[fruit][]" value="pear" />\n'
  html += '</form>\n';

  var $form = $(html);
  var formData = getFormData($form);

  deepEqual(formData, {
    food: {
      fruit: ['apple', 'pear']
    }
  });
});

test('Hashes with arrays are captured', function() {
 var html = '<form>\n';
 html += '   <input type="hidden" name="food[fruit][]" value="apple" />\n'
 html += '   <input type="hidden" name="food[fruit][]" value="pear" />\n'
 html += '   <input type="hidden" name="food[vegetable][]" value="carrot" />\n'
 html += '   <input type="hidden" name="food[vegetable][]" value="broccoli" />\n'
 html += '   <input type="hidden" name="animal[mammal][]" value="rat" />\n'
 html += '   <input type="hidden" name="animal[mammal][]" value="elephant" />\n'
 html += '   <input type="hidden" name="animal[bird][]" value="blackbird" />\n'
 html += '   <input type="hidden" name="animal[bird][]" value="dove" />\n'
 html += '</form>\n';

 var $form = $(html);
 var formData = getFormData($form);

 deepEqual(formData, {
 food: {
 fruit: ['apple', 'pear'],
 vegetable: ['carrot', 'broccoli']
 },
 animal: {
 mammal: ['rat', 'elephant'],
 bird: ['blackbird', 'dove']
 }
 });
 }); */