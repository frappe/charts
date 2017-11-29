import { fillArray } from '../utils/helpers';

const AXIS_TICK_LENGTH = 6;
const LABEL_MARGIN = 4;
const MIN_BAR_PERCENT_HEIGHT = 0.01;

export function verticalLineProps(start, height, label='down') {
	//
}

export function getXLineProps(totalHeight, mode) {
	let startAt = totalHeight + 6, height, textStartAt, axisLineClass = '';
	if(mode === 'span') {		// long spanning lines
		startAt = -7;
		height = totalHeight + 15;
		textStartAt = totalHeight + 25;
	} else if(mode === 'tick'){	// short label lines
		startAt = totalHeight;
		height = 6;
		textStartAt = 9;
		axisLineClass = 'x-axis-label';
	}

	return [startAt, height, textStartAt, axisLineClass];
}

// export function getYLineProps(totalWidth, mode, specific=false) {
export function getYLineProps(totalWidth, mode) {
	// if(specific) {
	// 	return[totalWidth, totalWidth + 5, 'specific-value', 0];
	// }
	let width, text_end_at = -9, axisLineClass = '', startAt = 0;
	if(mode === 'span') {		// long spanning lines
		width = totalWidth + 6;
		startAt = -6;
	} else if(mode === 'tick'){	// short label lines
		width = -6;
		axisLineClass = 'y-axis-label';
	}

	return [width, text_end_at, axisLineClass, startAt];
}

// let char_width = 8;
// let allowed_space = avg_unit_width * 1.5;
// let allowed_letters = allowed_space / 8;

// return values.map((value, i) => {
// 	let space_taken = getStringWidth(value, char_width) + 2;
// 	if(space_taken > allowed_space) {
// 		if(is_series) {
// 			// Skip some axis lines if X axis is a series
// 			let skips = 1;
// 			while((space_taken/skips)*2 > allowed_space) {
// 				skips++;
// 			}
// 			if(i % skips !== 0) {
// 				return;
// 			}
// 		} else {
// 			value = value.slice(0, allowed_letters-3) + " ...";
// 		}
// 	}

export function getBarHeightAndYAttr(yTop, zeroLine, totalHeight) {
	let height, y;
	if (yTop <= zeroLine) {
		height = zeroLine - yTop;
		y = yTop;

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * MIN_BAR_PERCENT_HEIGHT;
			y -= height;
		}
	} else {
		height = yTop - zeroLine;
		y = zeroLine;

		// In case of invisible bars
		if(height === 0) {
			height = totalHeight * MIN_BAR_PERCENT_HEIGHT;
		}
	}

	return [height, y];
}

export function equilizeNoOfElements(array1, array2,
	extra_count=array2.length - array1.length) {

	if(extra_count > 0) {
		array1 = fillArray(array1, extra_count);
	} else {
		array2 = fillArray(array2, extra_count);
	}
	return [array1, array2];
}
