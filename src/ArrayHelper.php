<?php
class ArrayHelper {
	/**
	 * @param $std
	 * @param bool $integer_keys If true, integer keys are casted as integers. If false, they are left as strings.
	 * @return array
	 */
	static function StdClassToArrayRecursive(stdClass $std, $integer_keys = true) {
		$converted_array = (array) $std;
		$new_array = array();
		foreach($converted_array as $k => $v) {
			if(is_object($v) && is_a($v,'stdClass')) {
				$new_array[$k] = self::StdClassToArrayRecursive($v);
			} else {
				$new_array[$k] = $v;
			}
		}
		return $new_array;
	}

	static function ArrayToStdClassRecursive($array) {
		foreach($array as $k => $v) {
			if(is_array($v)) {
				$array[$k] = self::ArrayToStdClassRecursive($v);
			}
		}
		return (object) $array;
	}
}
?>