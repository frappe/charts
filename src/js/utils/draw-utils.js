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

export function truncateString(txt, len) {
	if (!txt) {
		return;
	}
	if (txt.length > len) {
		return txt.slice(0, len-3) + '...';
	} else {
		return txt;
	}
}

export function shortenLargeNumber(label) {
	let number;
	if (typeof label === 'number') number = label;
	else if (typeof label === 'string') {
		number = Number(label);
		if (Number.isNaN(number)) return label;
	}

	// Using absolute since log wont work for negative numbers
	let p = Math.floor(Math.log10(Math.abs(number)));
	if (p <= 2) return number; // Return as is for a 3 digit number of less
	let	l = Math.floor(p / 3);
	let shortened = (Math.pow(10, p - l * 3) * +(number / Math.pow(10, p)).toFixed(1));

	// Correct for floating point error upto 2 decimal places
	return Math.round(shortened*100)/100 + ' ' + ['', 'K', 'M', 'B', 'T'][l];
}

export function getPath(xList, yList, realValues, spline = false, interpolate = false)
{
    // spline, cubic bezier curve calculation (from example by François Romain)
	function bezierCommand(point, i, a) {
		function line(pointA, pointB) {
			let lengthX = pointB[0] - pointA[0];
			let lengthY = pointB[1] - pointA[1];
			return {
				length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
				angle: Math.atan2(lengthY, lengthX)
			};
		}
		function controlPoint(current, previous, next, reverse) {
			let p = previous || current;
			let n = next || current;
			let o = line(p, n);
			let angle = o.angle + (reverse ? Math.PI : 0);
			let length = o.length * 0.2; // 0.2 smoothing
			let x = current[0] + Math.cos(angle) * length;
			let y = current[1] + Math.sin(angle) * length;
			return [x, y];
		}
		let cps = controlPoint(a[i - 1], a[i - 2], point);
		let cpe = controlPoint(point, a[i - 1], a[i + 1], true);
		return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
	}

	// line
	function lineCommand(point) { 
		return `L ${point[0]},${point[1]}`;
	}

	// convert points
	let points=[];
	for(let i=0;i<xList.length;i++){
		points.push(realValues[i] == null ? null : [xList[i], yList[i]]);
	}

	// make path, curve line skip interpolate
	let nonNullPoints = points.filter(x => x != null);
	let path = '';
	points.forEach((p, i) => {
		if (p != null) {
			let coord = `${p[0]},${p[1]}`;
			if (i == 0 || (points[i-1] == null && i-1 == 0))
				path += coord;
			else if (points[i-1] == null) {
				let pointInNullAr = nonNullPoints.filter((x) => {  return x[0] == xList[i]; })[0];
				let indx = nonNullPoints.indexOf(pointInNullAr);
				path += (path == '') ? coord : (interpolate ? (spline ? bezierCommand(p, indx, nonNullPoints) : lineCommand(p)) : 'M ' + coord);
			}
			else
				path += spline ? bezierCommand(p, i, points) : lineCommand(p);
		}

		if (i == points.length - 1 && path == '' && points.length < realValues.length) // last point fix
			path += xList[i] + ',' + yList[i]; 
	});
	return path;
}

export function getRegionPath(pointsStr, zero) {
    let pathStr = '';
    pointsStr.split('M').forEach((part, i) => {
        let s = part.split(/[LC]/)[0].trim();
        let sx = s.split(',')[0];
        let e = part.substr(part.lastIndexOf(' ')).trim();
        let ex = e.split(',')[0];
        pathStr += `M${sx},${zero}L${s} ` + part + ((e.includes(',')) ? `L${e}L${ex},${zero}` : `L${sx},${zero}L${s}`);
    });
    return pathStr;
}
