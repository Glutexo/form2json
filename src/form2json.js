(function($) {
  Form2Json = {
    /**
     * Submits a form, but all its values are packed into a single field
     * containing a stringified JSON object.
     *
     * @param callOptions
     */
    submitFormAsJson: function(callOptions) {
      var options = $.extend({}, Form2Json.submitFormAsJson.defaults, callOptions);

      var originalForm = Form2Json._getFormFromOptions(options);

      // TODO: Another ways to submit a form? Possibly another button types?
      var submittedBySubmitButton = options.event != undefined && options.event.target.tagName == 'INPUT' && options.event.target.type.toLowerCase() == 'submit';
      if(submittedBySubmitButton) {
        var $inputHidden = $(document.createElement('input'));
        $inputHidden.attr('type', 'hidden');
        $inputHidden.attr('name', options.event.target.name);
        $inputHidden.val(options.event.target.value);
        $(originalForm).append($inputHidden);
      }

      var formData = Form2Json._getFormData(originalForm);

      if(submittedBySubmitButton) {
        $inputHidden.remove();
      }

      var jsonForm = Form2Json._cloneForm(originalForm);
      try {
        // If the original form is in the DOM, attach the
        // new one too, so it can be interceptable.
        Form2Json._afterInvisible(originalForm, jsonForm, 'form2json');
      } catch(error) {
        // Nothing, not attaching is ok too.
      }

      var jsonHidden = Form2Json._createHidden(options.varName, JSON.stringify(formData));
      var $jsonForm = $(jsonForm);
      $jsonForm.append(jsonHidden);

      // Perform the callback before submitting. This can be used e.g. for
      // performing an AJAX request without need to bind 'submit' event
      // using .on() on the form’s parent.
      if(typeof options.callback == 'function') {
        options.callback.call(jsonForm, formData);
      }

      $jsonForm.trigger('submit')
        .remove();
    },

    /**
     * Finds the highest numeric key and returns the next one. If the
     * object has no numeric keys, 0 is returned. This mimics PHP’s
     * array[] operator.
     *
     * @param obj
     * @returns {number}
     * @private
     */
    _getPushKey: function(obj) {
      var highest;
      $.each(obj, function(k, v) {
        var n = parseInt(k);
        if(!isNaN(n) && n >= 0 && (highest == undefined || n > highest)) {
          highest = n;
        }
      });

      return highest == undefined ? 0 : highest + 1;
    },

    /**
     * Gets data from a given form using .getFormData and packs them
     * into a single field containing a stringified JSON object of a
     * given name.
     *
     * @param form
     * @param jsonVar
     * @returns {object}
     * @private
     */
    _getFormDataJson: function(form, jsonVar) {
      if(jsonVar == undefined) {
        jsonVar = Form2Json.submitFormAsJson.defaults.varName;
      }

      var formData = Form2Json._getFormData(form);
      var packedFormData = {}
      packedFormData[jsonVar] = JSON.stringify(formData);

      return packedFormData;
    },

    /**
     * Gets data from the given form as an object with keys being
     * field names and values their values. It tries to mimic the
     * way how PHP handles arrays/hashes. Arrays are treated as
     * objects with numeric keys. String keys containing integers
     * are converted to integers.
     *
     * Based on a code by Pointy at http://stackoverflow.com/a/2403206/1307676
     *
     * TODO: Convert float keys to integers.
     *
     * @param form
     * @returns {object}
     * @private
     */
    _getFormData: function(form) {
      var $form = form instanceof jQuery ? form : $(form);

      var paramObj = {};
      var serialized = $form.serializeArray();

      // serialized is an array of simple objects. These objects have
      // attributes name and value as they are in the html attributes
      // of the input elements. E.g.:
      // [
      //   { name: 'fruit', value: 'apple' },
      //   { name: 'vegetable[orange]', value: 'carrot' }
      //   { name: 'nut[]', value: 'chestnut' }
      // ]
      $.each(serialized, function (_, kv) {
        // 1) Determine, whether the variable is an array. If so, the
        // magic begins. Otherwise let’s simply add it to the result
        // object.
        var keys_match = kv.name.match(/^([^\[]+)((\[([^\[]*)\])+)$/);
        if(keys_match) {
          // keys_match[1] contains the name of the root item, e.g. 'fruit'
          // keys_match[2] contain all those brackets and their contents,
          //   e.g. '[orange][color]' or '[carrot][]' or '[]'

          // 2) Initialize the item as an empty object, if it doesn’t
          // exist yes, so it will be possible to assign properties
          // to it.
          if(typeof paramObj[keys_match[1]] == 'undefined') {
            paramObj[keys_match[1]] = {};
          }

          // 3) Set pointer to the root element. If this is the first
          // appearance of this element, it is the one just created.
          var pointer = paramObj[keys_match[1]];

          var keys_match_ary = keys_match[2].match(/\[([^\[]*)\]/g);
          $.each(keys_match_ary, function (k, v) {
            // keys_match_ary is an array of all the array keys down
            // its structure, e. g.: ['[orange]', '[color]'] or ['[]']
            var key = v.match(/\[([^\[]*)\]/)[1];
            // key is just stripped of the brackets.
            if(key == '') {
              // If there is no specified key (e.g. fruit[]),
              // find the next available numeric key.
              key = Form2Json._getPushKey(pointer);
            }

            if(k == keys_match_ary.length - 1) {
              // This is the last key, the pointer finally
              // points to an object, where it is possible
              // to store the value.
              pointer[key] = kv.value;
            } else {
              // This is not the last piece of the path.
              // Move the pointer deeper and create an
              // empty object if it doesn’t exist yet.
              if (typeof pointer[key] == 'undefined') {
                pointer[key] = {};
              }
              pointer = pointer[key];
            }
          });
        } else {
          // 1b) The object is simple value, not an array.
          paramObj[kv.name] = kv.value;
        }
      });

      return paramObj;
    },

    /**
     * Figures out the FORM element from the given options. It can be
     * contained directly in the ‘form’ key, but when it isn’t, it is
     * obtained from the ‘event’ property. Event’s target can be
     * either the form itself (event is a form submit), or a submit
     * button (event is a form click) – in such case the form can be
     * found among the button’s parents.
     *
     * @param options
     * @returns {HTMLFormElement}
     * @private
     */
    _getFormFromOptions: function(options) {
      var form = options.form;
      if(form == undefined) {
        if(options.event == undefined) {
          throw '\'form\' or \'event\' option must be defined.';
        }

        if(options.event.target.tagName == 'FORM') {
          form = options.event.target;
        } else {
          form = $(options.event.target).parents('form')[0];
        }
      }
      return form;
    },

    /**
     * Creates an empty form DOM element with the same attributes as the
     * original form has. The created FORM element contains no elements
     * inside, only its attributes are copied.
     *
     * @param originalForm
     * @returns {HTMLElement}
     * @private
     */
    _cloneForm: function(originalForm) {
      var originalFormAttributes;
      if(originalForm instanceof jQuery) {
        originalFormAttributes = originalForm[0].attributes;
      } else {
        originalFormAttributes = originalForm.attributes;
      }

      var $jsonForm = $(document.createElement('form'));
      for(var i = 0, length = originalFormAttributes.length; i < length; i++){
        var attribute = originalFormAttributes.item(i)
        $jsonForm.attr(attribute.nodeName, attribute.nodeValue);
      }

      return $jsonForm[0];
    },

    /**
     * Creates a hidden form input field DOM element with given name and value.
     *
     * @param name
     * @param value
     * @returns {HTMLElement}
     * @private
     */
    _createHidden: function(name, value) {
      var hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = name;
      hidden.value = value;
      return hidden;
    },

    /**
     * Adds an alement right after another and makes
     * it invisible.
     *
     * @param before
     * @param after
     * @private
     */
    _afterInvisible: function(before, after, className) {
      var $before = $(before);
      if(!$before.parents('body').length) {
        throw 'Element is not in the document’s <body>.'
      }
      $before.after(after);
      after.style.display = 'none';
      after.className = className;
    },

    eventHandler: function(callOptions) {
      var callback = function(event) {
        event.preventDefault();
        var defaultOptions = { event: event };
        var options = $.extend({}, defaultOptions, callOptions);
        Form2Json.submitFormAsJson(options);
      };

      // Thanks to this, it is testable where the function came from.
      callback.origin = Form2Json.eventHandler;
      return callback;
    }
  }

  Form2Json.submitFormAsJson.defaults = {
    form: undefined,
    event: undefined,
    varName: '__JSON',
    callback: undefined
  };

  $.fn.extend({
    form2json: function(callOptions) {
      // When the variable’s name is “options”, it is not
      // accesible in the submit function. Why?
      var submit = Form2Json.eventHandler(callOptions);
      // TODO: Another ways to submit a form? Possibly another button types?
      this
        .on('submit', submit)
        .on('click', 'input[type=submit]', submit);

      return this;
    }
  });
})(jQuery);