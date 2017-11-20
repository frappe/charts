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

export function equilizeNoOfElements(array1, array2,
	extra_count=array2.length - array1.length) {

	if(extra_count > 0) {
		array1 = fillArray(array1, extra_count);
	} else {
		array2 = fillArray(array2, extra_count);
	}
	return [array1, array2];
}

export function getXLineProps(total_height, mode) {
	let start_at, height, text_start_at, axis_line_class = '';
	if(mode === 'span') {		// long spanning lines
		start_at = -7;
		height = total_height + 15;
		text_start_at = total_height + 25;
	} else if(mode === 'tick'){	// short label lines
		start_at = total_height;
		height = 6;
		text_start_at = 9;
		axis_line_class = 'x-axis-label';
	}

	return [start_at, height, text_start_at, axis_line_class];
}

export function getYLineProps(total_width, mode, specific=false) {
	if(specific) {
		return[total_width, total_width + 5, 'specific-value', 0];
	}
	let width, text_end_at = -9, axis_line_class = '', start_at = 0;
	if(mode === 'span') {		// long spanning lines
		width = total_width + 6;
		start_at = -6;
	} else if(mode === 'tick'){	// short label lines
		width = -6;
		axis_line_class = 'y-axis-label';
	}

	return [width, text_end_at, axis_line_class, start_at];
}
