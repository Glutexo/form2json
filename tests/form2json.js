test('plain vars are captured', function() {
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