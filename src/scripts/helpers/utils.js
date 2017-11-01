export function float_2(d) {
	return parseFloat(d.toFixed(2));
}

export function arrays_equal(arr1, arr2) {
	if(arr1.length !== arr2.length) return false;
	let are_equal = true;
	arr1.forEach((d, i) => {
		if(arr2[i] !== d) are_equal = false;
	});
	return are_equal;
}

export function shuffle(array) {
	// https://stackoverflow.com/a/2450976/6495043
	// Awesomeness: https://bost.ocks.org/mike/shuffle/

	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
