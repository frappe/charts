import { getBarHeightAndYAttr } from './draw-utils';

let add_and_animate_line = (value, old_pos, new_pos) => {
	if(typeof new_pos === 'string') {
		new_pos = parseInt(new_pos.substring(0, new_pos.length-1));
	}
	const x_line = makeXLine(
		height,
		text_start_at,
		value, // new value
		'x-value-text',
		axis_line_class,
		old_pos // old position
	);
	this.x_axis_group.appendChild(x_line);

	this.elements_to_animate && this.elements_to_animate.push([
		{unit: x_line, array: [0], index: 0},
		{transform: `${ new_pos }, 0`},
		350,
		"easein",
		"translate",
		{transform: `${ old_pos }, 0`}
	]);
};

export function getAnimXLine(height, text_start_at, axis_line_class) {
	// Animate X AXIS to account for more or less axis lines

	const old_pos = this.x_old_axis_positions;
	const new_pos = this.x_axis_positions;

	const old_vals = this.old_x_values;
	const new_vals = this.x;

	const last_line_pos = old_pos[old_pos.length - 1];

	this.x_axis_group.textContent = '';

	this.make_new_axis_anim_lines(
		old_pos,
		new_pos,
		old_vals,
		new_vals,
		last_line_pos,
		add_and_animate_line
	);
}

export function make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, add_and_animate_line, group) {
	let superimposed_positions, superimposed_values;
	let no_of_extras = new_vals.length - old_vals.length;
	if(no_of_extras > 0) {
		// More axis are needed
		// First make only the superimposed (same position) ones
		// Add in the extras at the end later
		superimposed_positions = new_pos.slice(0, old_pos.length);
		superimposed_values = new_vals.slice(0, old_vals.length);
	} else {
		// Axis have to be reduced
		// Fake it by moving all current extra axis to the last position
		// You'll need filler positions and values in the new arrays
		const filler_vals = new Array(Math.abs(no_of_extras)).fill("");
		superimposed_values = new_vals.concat(filler_vals);

		const filler_pos = new Array(Math.abs(no_of_extras)).fill(last_line_pos + "F");
		superimposed_positions = new_pos.concat(filler_pos);
	}

	superimposed_values.map((value, i) => {
		add_and_animate_line(value, old_pos[i], superimposed_positions[i], i, group);
	});

	if(no_of_extras > 0) {
		// Add in extra axis in the end
		// and then animate to new positions
		const extra_values = new_vals.slice(old_vals.length);
		const extra_positions = new_pos.slice(old_pos.length);

		extra_values.map((value, i) => {
			add_and_animate_line(value, last_line_pos, extra_positions[i], i, group);
		});
	}
}

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
