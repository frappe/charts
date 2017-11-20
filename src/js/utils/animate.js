import { getBarHeightAndYAttr } from './draw-utils';

export function getAnimXLine() {}

export function getAnimYLine() {}

export var Animator = (function() {
	var Animator = function(totalHeight, totalWidth, zeroLine, avgUnitWidth) {
		// constants
		this.totalHeight = totalHeight;
		this.totalWidth = totalWidth;

		// changeables
		this.avgUnitWidth = avgUnitWidth;
		this.zeroLine = zeroLine;
	};

	Animator.prototype = {
		bar: function(barObj, x, yTop, index, noOfDatasets) {
			let start = x - this.avgUnitWidth/4;
			let width = (this.avgUnitWidth/2)/noOfDatasets;
			let [height, y] = getBarHeightAndYAttr(yTop, this.zeroLine, this.totalHeight);

			x = start + (width * index);

			return [barObj, {width: width, height: height, x: x, y: y}, 350, "easein"];
			// bar.animate({height: args.newHeight, y: yTop}, 350, mina.easein);
		},

		dot: function(dotObj, x, yTop) {
			return [dotObj, {cx: x, cy: yTop}, 350, "easein"];
			// dot.animate({cy: yTop}, 350, mina.easein);
		},

		path: function(d, pathStr) {
			let pathComponents = [];
			const animPath = [{unit: d.path, object: d, key: 'path'}, {d:"M"+pathStr}, 350, "easein"];
			pathComponents.push(animPath);

			if(d.regionPath) {
				let regStartPt = `0,${this.zeroLine}L`;
				let regEndPt = `L${this.totalWidth}, ${this.zeroLine}`;

				const animRegion = [
					{unit: d.regionPath, object: d, key: 'regionPath'},
					{d:"M" + regStartPt + pathStr + regEndPt},
					350,
					"easein"
				];
				pathComponents.push(animRegion);
			}

			return pathComponents;
		},
	};

	return Animator;
})();
