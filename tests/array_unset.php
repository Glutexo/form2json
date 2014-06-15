#!/usr/bin/php
<?php
# Demo script of a bug #66137 (https://bugs.php.net/bug.php?id=66173)
# Converting an object with properties that have numeric names results
# in having an array with inaccessible keys.

$ary = [];
$ary["0"] = 'string';
var_dump($ary);

# The string "0" gets converted to an integer:
# array(1) {
# 	[0]=>
#   string(6) "string"
# }

$obj = new stdClass;
$obj->{0} = 'string';
$converted_ary = (array) $obj;
var_dump($converted_ary);

# The property name "0" is not converted to an integer:
# array(1) {
# 	["0"]=>
#   string(6) "string"
# }

# The queried key is converted to an integer. The integer key
# doesn’t exist. Thus, NULL is returned and a notice is raised.
var_dump($converted_ary["0"]);
# NULL

$converted_ary["0"] = 'another string';

var_dump($converted_ary);
# Now we have an array with both "0" and 0 keys.
# array(2) {
# ["0"]=>
#   string(6) "string"
# [0]=>
#   string(14) "another string"
# }

var_dump($converted_ary["0"]);
var_dump($converted_ary[0]);
# Both queries address the integer key.
# string(14) "another string"

unset($converted_ary["0"]);
var_dump($converted_ary);
# The integer key is removed, the string one remains.
# array(1) {
# ["0"]=>
#  string(6) "string"
# }
?>
