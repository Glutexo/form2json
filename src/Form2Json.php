<?php
class Form2Json {
	/**
	 * The main and configurable publicly callable method that takes a single
	 * request value with all submitted form data encoded into a JSON object.
	 * Unpacks the JSON object into the request super-globals ($_GET, $_POST,
	 * $_REQUEST) as if the form was submitted with read form fields and not
	 * just with the JSON proxy-field. Optionally the JSON object is removed
	 * from the super-globals for the translation to be more transparent.
	 *
	 * @param string $json_var_name
	 * @param bool $unset
	 */
	public static function Json2Request($json_var_name = '__JSON', $unset = true) {
		$super_globals = self::GetSuperGlobalsInOrder();
		self::PropagateJsonToSuperGlobals($super_globals, $json_var_name);
		if($unset) {
			self::UnsetJsonVarFromSuperGlobals($super_globals, $json_var_name);
		}
	}

	private static function GetSuperGlobalsInOrder() {
		$ini_value = ini_get('variables_order');
		$super_globals = array();

		for($i = 0, $len = strlen($ini_value); $i < $len; $i++) {
			switch($ini_value[$i]) {
				case 'G':
					$super_globals[] =& $_GET;
					break;
				case 'P':
					$super_globals[] =& $_POST;
					break;
			}
		}

		return $super_globals;
	}

	private static function PropagateJsonToSuperGlobals($super_globals, $json_var_name) {
		foreach($super_globals as &$super_global) {
			if(isset($super_global[$json_var_name])) {
				$json = json_decode($super_global[$json_var_name]);
				$array = ArrayHelper::StdClassToArrayRecursive($json);
				foreach($array as $k => $v) {
					$super_global[$k] = $v;
					$_REQUEST[$k] = $v;
				}
			}
		}
	}

	private static function UnsetJsonVarFromSuperGlobals($super_globals, $json_var_name) {
		foreach($super_globals as &$super_global) {
			if(isset($super_global[$json_var_name])) {
				unset($super_global[$json_var_name]);
			}
		}
		unset($_REQUEST[$json_var_name]);
	}
}