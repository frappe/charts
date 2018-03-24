import { fillArray } from './helpers';

export function getBarHeightAndYAttr(yTop, zeroLine) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;
	} else {
		height = yTop - zeroLine;
		y = zeroLine;
	}

	return [height, y];
}

export function equilizeNoOfElements(array1, array2,
	extraCount = array2.length - array1.length) {

	// Doesn't work if either has zero elements.
	if(extraCount > 0) {
		array1 = fillArray(array1, extraCount);
	} else {
		array2 = fillArray(array2, extraCount);
	}
	return [array1, array2];
}
