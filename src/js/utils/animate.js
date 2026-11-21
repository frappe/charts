import { getLinePathStrs } from './draw-utils';
import { barPathStr, getBarGeometry } from './draw';

export const UNIT_ANIM_DUR = 350;
export const PATH_ANIM_DUR = 350;
export const MARKER_LINE_ANIM_DUR = UNIT_ANIM_DUR;
export const REPLACE_ALL_NEW_DUR = 250;

export const STD_EASING = 'easein';

export function translate(unit, oldCoord, newCoord, duration) {
	let old = typeof oldCoord === 'string' ? oldCoord : oldCoord.join(', ');
	return [
		unit,
		{ transform: newCoord.join(', ') },
		duration,
		STD_EASING,
		"translate",
		{ transform: old }
	];
}

export function translateVertLine(xLine, newX, oldX) {
	return translate(xLine, [oldX, 0], [newX, 0], MARKER_LINE_ANIM_DUR);
}

export function translateHoriLine(yLine, newY, oldY) {
	return translate(yLine, [0, oldY], [0, newY], MARKER_LINE_ANIM_DUR);
}

export function animateRegion(rectGroup, newY1, newY2, oldY2) {
	let newHeight = newY1 - newY2;
	let rect = rectGroup.childNodes[0];
	let width = rect.getAttribute("width");
	let rectAnim = [
		rect,
		{ height: newHeight, 'stroke-dasharray': `${width}, ${newHeight}` },
		MARKER_LINE_ANIM_DUR,
		STD_EASING
	];

	let groupAnim = translate(rectGroup, [0, oldY2], [0, newY2], MARKER_LINE_ANIM_DUR);
	return [rectAnim, groupAnim];
}

export function animateBar(bar, x, yTop, width, offset = 0, meta = {}) {
	let geometry = getBarGeometry(x, yTop, width, offset, meta);
	if (bar.nodeName === 'g') {
		let barPath = bar.childNodes[0];
		let pathAnim = [
			barPath,
			{ d: barPathStr(0, 0, geometry.width, geometry.height, meta.radius, geometry.roundBottom) },
			UNIT_ANIM_DUR,
			STD_EASING
		];

		let oldCoordStr = bar.getAttribute("transform").split("(")[1].slice(0, -1);
		let groupAnim = translate(bar, oldCoordStr, [geometry.x, geometry.y], MARKER_LINE_ANIM_DUR);
		return [pathAnim, groupAnim];
	}
	return [[
		bar,
		{ d: barPathStr(geometry.x, geometry.y, geometry.width, geometry.height, meta.radius, geometry.roundBottom) },
		UNIT_ANIM_DUR,
		STD_EASING
	]];
}

export function animateDot(dot, x, y) {
	if (dot.nodeName !== 'circle') {
		let oldCoordStr = dot.getAttribute("transform").split("(")[1].slice(0, -1);
		let groupAnim = translate(dot, oldCoordStr, [x, y], MARKER_LINE_ANIM_DUR);
		return [groupAnim];
	} else {
		return [[dot, { cx: x, cy: y }, UNIT_ANIM_DUR, STD_EASING]];
	}
	// dot.animate({cy: yTop}, UNIT_ANIM_DUR, mina.easein);
}

export function animatePath(paths, newXList, newYList, zeroLine, spline, gaps) {
	let pathComponents = [];
	let pathStrs = getLinePathStrs(newXList, newYList, { spline, gaps, zeroLine });

	const animPath = [paths.path, { d: pathStrs.line }, PATH_ANIM_DUR, STD_EASING];
	pathComponents.push(animPath);

	if (paths.region) {
		const animRegion = [
			paths.region,
			{ d: pathStrs.region },
			PATH_ANIM_DUR,
			STD_EASING
		];
		pathComponents.push(animRegion);
	}

	return pathComponents;
}

export function animatePathStr(oldPath, pathStr) {
	return [oldPath, { d: pathStr }, UNIT_ANIM_DUR, STD_EASING];
}
