$(function(event) {
  var $form = $('#submit_form_as_json_test_form');

  function send_json_click(event) {
    event.preventDefault();

    Form2Json.submitFormAsJson($form);
  }

  $form.on('click', 'input[name=send_json]', send_json_click);
});