test('Plain vars are captured.', function() {
    var html = '<form>\n';
    html += '   <input type="hidden" name="fruit" value="apple" />\n'
    html += '   <input type="hidden" name="vegetable" value="carrot" />\n'
    html += '   <input type="hidden" name="unknown" value="watermelon" />\n'
    html += '</form>\n';

    var $form = $(html);
    var formData = getFormData($form);

    deepEqual(formData, {
        fruit: 'apple',
        vegetable: 'carrot',
        unknown: 'watermelon'
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
    html += '   <input type="hidden" name="animal[bird]" value="finch" />\n'
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
            bird: 'finch'
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