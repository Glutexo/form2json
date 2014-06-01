// Based on a code by Pointy presented at http://stackoverflow.com/a/2403206/1307676
// Creates an object with form data.
function getFormData(form) {
    var paramObj = {};
    var serialized = $(form).serializeArray();

    $.each(serialized, function(_, kv) {
        var keys_match = kv.name.match(/^([^\[]+)((\[([^\[]+)\])+)$/);
        if(keys_match) {
            if(typeof paramObj[keys_match[1]] == 'undefined') {
                paramObj[keys_match[1]] = {};
            }
            var pointer = paramObj[keys_match[1]];

            var keys_match_ary = keys_match[2].match(/\[([^\[]+)\]/g);
            $.each(keys_match_ary, function(k, v) {
                var key = v.match(/\[([^\[]+)\]/)[1];
                if(k == keys_match_ary.length - 1) {
                    pointer[key] = kv.value;
                } else {
                    if(typeof pointer[key] == 'undefined') {
                        pointer[key] = {};
                    }
                    pointer = pointer[key];
                }
            });
        } else {
            paramObj[kv.name] = kv.value;
        }
    });

    return paramObj;
}
