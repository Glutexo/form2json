<?php
class ArrayHelper {
	/**
	 * @param $std
	 * @param bool $integer_keys If true, integer keys are casted as integers. If false, they are left as strings.
	 * @return array
	 */
	static function StdClassToArrayRecursive(stdClass $std, $integer_keys = true) {
		// Because of a bug in PHP #66137 (https://bugs.php.net/bug.php?id=66173),
		// it’s not possible to use the converted array directly. A new array must
		// be created, because if the stdClass object contains properties with nu-
		// meric names, in the converted array they would be stored under string
		// keys with numeric value. But because PHP converts numeric keys from
		// string to integer/floats instead, those numeric-string-keyed elements
		// would be inaccessible. It is possible to iterate over such array
		// though.
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