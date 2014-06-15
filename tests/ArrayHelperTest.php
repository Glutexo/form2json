<?php
class ArrayHelperTest extends PHPUnit_Framework_TestCase {

	# ArrayToStdClassRecursive

	public function testEqualStdClassObjectsAreEqual() {
		$obj = new stdClass;
		$expected = new stdClass;

		$this->assertEquals($expected, $obj);
	}

	public function testEmptyArrayCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([]);
		$expected = new stdClass;

		$this->assertEquals($expected, $obj);
	}

	public function testOneDimensionalHashCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			'mammal' => 'rat',
			'bird' => 'finch',
			'reptile' => 'lizard'
		]);

		$expected = new stdClass;
		$expected->mammal = 'rat';
		$expected->bird = 'finch';
		$expected->reptile = 'lizard';

		$this->assertEquals($expected, $obj);
	}

	public function testOneDimensionalArrayCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive(['mammal','bird','reptile']);

		$expected = new stdClass;
		$expected->{0} = 'mammal';
		$expected->{1} = 'bird';
		$expected->{2} = 'reptile';

		$this->assertEquals($expected, $obj);
	}

	public function testMultiDimensionalHashCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			'mammals' => ['rodent' => 'rat', 'cat' => 'tiger', 'dog' => 'wolf'],
			'birds' => ['arctic' => 'penguin', 'winter' => 'crow'],
			'reptiles' => ['ancient' => 'dinosaur', 'contemporary' => 'lizard']
		]);

		$expected = new stdClass;
		$expected->mammals = new stdClass;
		$expected->mammals->rodent = 'rat';
		$expected->mammals->cat = 'tiger';
		$expected->mammals->dog = 'wolf';
		$expected->birds = new stdClass;
		$expected->birds->arctic = 'penguin';
		$expected->birds->winter = 'crow';
		$expected->reptiles = new stdClass;
		$expected->reptiles->ancient = 'dinosaur';
		$expected->reptiles->contemporary = 'lizard';

		$this->assertEquals($expected, $obj);
	}

	public function testMultiDimensionalArrayCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			['rat', 'tiger', 'wolf'],
			['penguin', 'crow'],
			['dinosaur', 'lizard']
		]);

		$expected = new stdClass;
		$expected->{0} = new stdClass;
		$expected->{0}->{0} = 'rat';
		$expected->{0}->{1} = 'tiger';
		$expected->{0}->{2} = 'wolf';
		$expected->{1} = new stdClass;
		$expected->{1}->{0} = 'penguin';
		$expected->{1}->{1} = 'crow';
		$expected->{2} = new stdClass;
		$expected->{2}->{0} = 'dinosaur';
		$expected->{2}->{1} = 'lizard';

		$this->assertEquals($expected, $obj);
	}

	public function testHashWithArraysCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
				'mammals' => ['rat', 'tiger', 'wolf'],
				'birds' => ['penguin', 'crow'],
				'reptiles' => ['dinosaur', 'lizard']
		]);

		$expected = new stdClass;
		$expected->mammals = new stdClass;
		$expected->mammals->{0} = 'rat';
		$expected->mammals->{1} = 'tiger';
		$expected->mammals->{2} = 'wolf';
		$expected->birds = new stdClass;
		$expected->birds->{0} = 'penguin';
		$expected->birds->{1} = 'crow';
		$expected->reptiles = new stdClass;
		$expected->reptiles->{0} = 'dinosaur';
		$expected->reptiles->{1} = 'lizard';

		$this->assertEquals($expected, $obj);
	}

	public function testArrayWithHashesCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			['mammal' => 'rat', 'bird' => 'penguin', 'reptile' => 'dinosaur'],
			['fruit' => 'apple', 'vegetable' => 'carrot']
		]);

		$expected = new stdClass;
		$expected->{0} = new stdClass;
		$expected->{0}->mammal = 'rat';
		$expected->{0}->bird = 'penguin';
		$expected->{0}->reptile = 'dinosaur';
		$expected->{1} = new stdClass;
		$expected->{1}->fruit = 'apple';
		$expected->{1}->vegetable = 'carrot';

		$this->assertEquals($expected, $obj);
	}

	public function testMixedArrayCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			'apple', 'pear', 'carrot', 'mammal' => 'rat',
			'birds' => ['penguin', 'crow', 'pet' => 'finch'],
			'reptiles' => ['ancient' => 'dinosaur', 'contemporary' => 'lizard', 'dragon']
		]);

		$expected = new stdClass;
		$expected->{0} = 'apple';
		$expected->{1} = 'pear';
		$expected->{2} = 'carrot';
		$expected->mammal = 'rat';
		$expected->birds = new stdClass;
		$expected->birds->{0} = 'penguin';
		$expected->birds->{1} = 'crow';
		$expected->birds->pet = 'finch';
		$expected->reptiles = new stdClass;
		$expected->reptiles->ancient = 'dinosaur';
		$expected->reptiles->contemporary = 'lizard';
		$expected->reptiles->{0} = 'dragon';

		$this->assertEquals($expected, $obj);
	}

	public function testDeepHashCanBeConverted() {
		$obj = ArrayHelper::ArrayToStdClassRecursive([
			'mammals' => ['cats' => ['tiger', 'lion'], 'dogs' => ['wolf', 'fox']],
			'birds' => ['pets' => ['finch', 'parrot'], 'winter' => ['crow', 'raven']],
			'reptiles' => ['ancient' => ['t-rex', 'raptor'], 'contemporary' => ['lizard', 'turtle']]
		]);

		$expected = new stdClass;
		$expected->mammals = new stdClass;
		$expected->mammals->cats = new stdClass;
		$expected->mammals->cats->{0} = 'tiger';
		$expected->mammals->cats->{1} = 'lion';
		$expected->mammals->dogs = new stdClass;
		$expected->mammals->dogs->{0} = 'wolf';
		$expected->mammals->dogs->{1} = 'fox';
		$expected->birds = new stdClass;
		$expected->birds->pets = new stdClass;
		$expected->birds->pets->{0} = 'finch';
		$expected->birds->pets->{1} = 'parrot';
		$expected->birds->winter = new stdClass;
		$expected->birds->winter->{0} = 'crow';
		$expected->birds->winter->{1} = 'raven';
		$expected->reptiles = new stdClass;
		$expected->reptiles->ancient = new stdClass;
		$expected->reptiles->ancient->{0} = 't-rex';
		$expected->reptiles->ancient->{1} = 'raptor';
		$expected->reptiles->contemporary = new stdClass;
		$expected->reptiles->contemporary ->{0} = 'lizard';
		$expected->reptiles->contemporary ->{1} = 'turtle';

		$this->assertEquals($expected, $obj);
	}

	# StdClassToArrayRecursive

	public function testEqualArraysAreEqual() {
		$ary = [];
		$expected = [];

		$this->assertEquals($expected, $ary);
	}

	public function testEmptyStdClassCanBeConverted() {
		$ary = ArrayHelper::StdClassToArrayRecursive(new stdClass);
		$expected = [];

		$this->assertEquals($expected, $ary);
	}

	public function testOneDimensionalNamedStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->mammal = 'rat';
		$obj->bird = 'finch';
		$obj->reptile = 'lizard';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			'mammal' => 'rat',
			'bird' => 'finch',
			'reptile' => 'lizard'
		];

		$this->assertEquals($expected, $ary);
	}

	public function testOneDimensionalNumberedStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->{0} = 'mammal';
		$obj->{1} = 'bird';
		$obj->{2} = 'reptile';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = ['mammal','bird','reptile'];

		$this->assertEquals($expected, $ary);
	}

	public function testMultiDimensionalNamedStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->mammals = new stdClass;
		$obj->mammals->rodent = 'rat';
		$obj->mammals->cat = 'tiger';
		$obj->mammals->dog = 'wolf';
		$obj->birds = new stdClass;
		$obj->birds->arctic = 'penguin';
		$obj->birds->winter = 'crow';
		$obj->reptiles = new stdClass;
		$obj->reptiles->ancient = 'dinosaur';
		$obj->reptiles->contemporary = 'lizard';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			'mammals' => ['rodent' => 'rat', 'cat' => 'tiger', 'dog' => 'wolf'],
			'birds' => ['arctic' => 'penguin', 'winter' => 'crow'],
			'reptiles' => ['ancient' => 'dinosaur', 'contemporary' => 'lizard']
		];

		$this->assertEquals($expected, $ary);
	}

	public function testMultiDimensionalNumberedStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->{0} = new stdClass;
		$obj->{0}->{0} = 'rat';
		$obj->{0}->{1} = 'tiger';
		$obj->{0}->{2} = 'wolf';
		$obj->{1} = new stdClass;
		$obj->{1}->{0} = 'penguin';
		$obj->{1}->{1} = 'crow';
		$obj->{2} = new stdClass;
		$obj->{2}->{0} = 'dinosaur';
		$obj->{2}->{1} = 'lizard';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			['rat', 'tiger', 'wolf'],
			['penguin', 'crow'],
			['dinosaur', 'lizard']
		];
		
		$this->assertEquals($expected, $ary);
	}

	public function testNamedStdClassWithNumberedStdClassesCanBeConverted() {
		$obj = new stdClass;
		$obj->mammals = new stdClass;
		$obj->mammals->{0} = 'rat';
		$obj->mammals->{1} = 'tiger';
		$obj->mammals->{2} = 'wolf';
		$obj->birds = new stdClass;
		$obj->birds->{0} = 'penguin';
		$obj->birds->{1} = 'crow';
		$obj->reptiles = new stdClass;
		$obj->reptiles->{0} = 'dinosaur';
		$obj->reptiles->{1} = 'lizard';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			'mammals' => ['rat', 'tiger', 'wolf'],
			'birds' => ['penguin', 'crow'],
			'reptiles' => ['dinosaur', 'lizard']
		];

		$this->assertEquals($expected, $ary);
	}

	public function testNumberedStdClassWithNamedStdClassesCanBeConverted() {
		$obj = new stdClass;
		$obj->{0} = new stdClass;
		$obj->{0}->mammal = 'rat';
		$obj->{0}->bird = 'penguin';
		$obj->{0}->reptile = 'dinosaur';
		$obj->{1} = new stdClass;
		$obj->{1}->fruit = 'apple';
		$obj->{1}->vegetable = 'carrot';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			['mammal' => 'rat', 'bird' => 'penguin', 'reptile' => 'dinosaur'],
			['fruit' => 'apple', 'vegetable' => 'carrot']
		];

		$this->assertEquals($expected, $ary);
	}

	public function testMixedStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->{0} = 'apple';
		$obj->{1} = 'pear';
		$obj->{2} = 'carrot';
		$obj->mammal = 'rat';
		$obj->birds = new stdClass;
		$obj->birds->{0} = 'penguin';
		$obj->birds->{1} = 'crow';
		$obj->birds->pet = 'finch';
		$obj->reptiles = new stdClass;
		$obj->reptiles->ancient = 'dinosaur';
		$obj->reptiles->contemporary = 'lizard';
		$obj->reptiles->{0} = 'dragon';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			'apple', 'pear', 'carrot', 'mammal' => 'rat',
			'birds' => ['penguin', 'crow', 'pet' => 'finch'],
			'reptiles' => ['ancient' => 'dinosaur', 'contemporary' => 'lizard', 'dragon']
		];

		$this->assertEquals($expected, $ary);
	}

	public function testDeepStdClassCanBeConverted() {
		$obj = new stdClass;
		$obj->mammals = new stdClass;
		$obj->mammals->cats = new stdClass;
		$obj->mammals->cats->{0} = 'tiger';
		$obj->mammals->cats->{1} = 'lion';
		$obj->mammals->dogs = new stdClass;
		$obj->mammals->dogs->{0} = 'wolf';
		$obj->mammals->dogs->{1} = 'fox';
		$obj->birds = new stdClass;
		$obj->birds->pets = new stdClass;
		$obj->birds->pets->{0} = 'finch';
		$obj->birds->pets->{1} = 'parrot';
		$obj->birds->winter = new stdClass;
		$obj->birds->winter->{0} = 'crow';
		$obj->birds->winter->{1} = 'raven';
		$obj->reptiles = new stdClass;
		$obj->reptiles->ancient = new stdClass;
		$obj->reptiles->ancient->{0} = 't-rex';
		$obj->reptiles->ancient->{1} = 'raptor';
		$obj->reptiles->contemporary = new stdClass;
		$obj->reptiles->contemporary ->{0} = 'lizard';
		$obj->reptiles->contemporary ->{1} = 'turtle';
		$ary = ArrayHelper::StdClassToArrayRecursive($obj);

		$expected = [
			'mammals' => ['cats' => ['tiger', 'lion'], 'dogs' => ['wolf', 'fox']],
			'birds' => ['pets' => ['finch', 'parrot'], 'winter' => ['crow', 'raven']],
			'reptiles' => ['ancient' => ['t-rex', 'raptor'], 'contemporary' => ['lizard', 'turtle']]
		];

		$this->assertEquals($expected, $ary);
	}
}