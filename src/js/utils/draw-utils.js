import { fillArray } from '../utils/helpers';

export function getBarHeightAndYAttr(yTop, zeroLine, totalHeight) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * 0.01;
			y -= height;
		}
	} else {
		height = yTop - zeroLine;
		y = zeroLine;

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * 0.01;
		}
	}

	return [height, y];
}

export function equilizeNoOfPositions(oldPos, newPos,
	extra_count=newPos.length - oldPos.length) {

	if(extra_count > 0) {
		oldPos = fillArray(oldPos, extra_count);
	} else {
		newPos = fillArray(newPos, extra_count);
	}
	return [oldPos, newPos];
}
