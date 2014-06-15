<?php
spl_autoload_register(function($class_name) {
	if(strpos($class_name, 'PHPUnit_') === 0 || strpos($class_name, 'Composer\\') === 0) {
		return;
	}
	require_once('src/'.$class_name.'.php');
});
?>