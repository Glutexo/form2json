function create$form(formTransform) {
  $form = $(document.createElement('form'));
  $form.attr('action', 'dump.php');
  $form.attr('method', 'POST');

  if(typeof formTransform == 'function') {
    formTransform($form);
  }

  return $form;
}

function create$hidden(name, value) {
  var $input =  $(document.createElement('input'));
  $input.attr('name', name);
  $input.val(value);
  return $input;
}

function formAsyncTest(title, expected, formTransform) {
  test(title + ' (getFormData)', function() {
    var $form = create$form(formTransform);

    deepEqual(getFormData($form), expected);
  })

  asyncTest(title + ' (AJAX)', function() {
    expect(1);

    var $form = create$form(formTransform);

    $.ajax({
      url: $form.attr('action'),
      type: $form.attr('method'),
      data: getFormData($form),
      success: function(data) {
        deepEqual(data, expected);
        start();
      }
    });
  });
}

module('getPushKey helper');

test('Empty object push key is found', function() {
  var obj = {};
  equal(getPushKey(obj), 0);
});

test('Sequential numeric push key is found', function() {
  var obj = { 0: 'fruit', 1: 'vegetable' };
  equal(getPushKey(obj), 2);
});

test('Non-sequential numeric push key is found', function() {
  var obj = { 0: 'fruit', 5: 'vegetable', 2: 'nut' };
  equal(getPushKey(obj), 6);
});

test('First push key in named object is found', function() {
  var obj = { fruit: 'apple' };
  equal(getPushKey(obj), 0);
});

test('Another push key in named object is found', function() {
  var obj = { fruit: 'apple', 5: 'vegetable', nut: 'chestnut', 2: 'unknown' };
  equal(getPushKey(obj), 6);
});

module('Form submit environment');

formAsyncTest('Empty form is submitted.', {});

formAsyncTest(
  'Form with single value is submitted.',
  { fruit: 'apple' },
  function($form) {
    $form.append(create$hidden('fruit', 'apple'));
  }
);

formAsyncTest(
  'Form with multiple values is submitted.',
  { fruit: 'apple', vegetable: 'carrot', nut: 'cashew' },
  function($form) {
    $form.append(create$hidden('fruit', 'apple'));
    $form.append(create$hidden('vegetable', 'carrot'));
    $form.append(create$hidden('nut', 'cashew'));
  }
);

formAsyncTest(
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

formAsyncTest(
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

formAsyncTest(
  'Form with one implicitly numbered array is submitted.',
  {
    fruit: { 0: 'apple', 1: 'orange', 2: 'pear' },
  },
  function($form) {
    $form.append(create$hidden('fruit[]', 'apple'));
    $form.append(create$hidden('fruit[]', 'orange'));
    $form.append(create$hidden('fruit[]', 'pear'));
  }
);

formAsyncTest(
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

formAsyncTest(
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

formAsyncTest(
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

formAsyncTest(
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

/*module('Submit as JSON.');

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
*/
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