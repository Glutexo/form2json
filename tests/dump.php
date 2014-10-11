<?php
require('../src/ArrayHelper.php');
require('../src/Form2Json.php');
var_dump(ArrayHelper::ArrayToStdClassRecursive($_REQUEST));
header('Content-Type: application/json; charset=UTF-8');
Form2Json::Json2Request();
print json_encode(ArrayHelper::ArrayToStdClassRecursive($_REQUEST));
?>