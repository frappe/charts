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

export function equilizeNoOfPositions(old_x, old_y, new_x, new_y) {
	let extra_count = new_x.length - old_x.length;
	if(extra_count >= 0) {
		// Substitute current unit set with a squiggled one (more units at end)
		// in order to animate to stretch it later to new points
		old_x = fillArray(old_x, extra_count);
		old_y = fillArray(old_y, extra_count);
	} else {
		// Modify the new points to have extra points
		// with the same position at end, old positions will squeeze in
		new_x = fillArray(new_x, extra_count);
		new_y = fillArray(new_y, extra_count);
	}
	return [old_x, old_y, new_x, new_y];
}
