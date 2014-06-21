// Based on a code by Pointy presented at http://stackoverflow.com/a/2403206/1307676
// Creates an object with form data.
function getFormData(form) {
  var paramObj = {};
  var serialized = $(form).serializeArray();

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
          key = getPushKey(pointer);
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
}

function getFormDataJson(form) {
  var formData = getFormData(form);
  return { __JSON: JSON.stringify(formData) };
}

function getPushKey(obj) {
  var highest;
  $.each(obj, function(k, v) {
    var n = parseInt(k);
    if(!isNaN(n) && n >= 0 && (highest == undefined || n > highest)) {
      highest = n;
    }
  });

  return highest == undefined ? 0 : highest + 1;
}