<?php
require('../src/ArrayHelper.php');
header('Content-Type: application/json; charset=UTF-8');
print json_encode($_REQUEST);
?>