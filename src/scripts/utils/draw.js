import $ from './dom';

export var UnitRenderer = (function() {
	var UnitRenderer = function(total_height, zero_line, avg_unit_width) {
		this.total_height = total_height;
		this.zero_line = zero_line;
		this.avg_unit_width = avg_unit_width;
	};

	function get_bar_height_and_y_attr(y_top, zero_line, total_height) {
		let height, y;
		if (y_top <= zero_line) {
			height = zero_line - y_top;
			y = y_top;

			// In case of invisible bars
			if(height === 0) {
				height = total_height * 0.01;
				y -= height;
			}
		} else {
			height = y_top - zero_line;
			y = zero_line;

			// In case of invisible bars
			if(height === 0) {
				height = total_height * 0.01;
			}
		}

		return [height, y];
	}

	UnitRenderer.prototype = {
		draw_bar: function (x, y_top, args, color, index, dataset_index, no_of_datasets) {
			let total_width = this.avg_unit_width - args.space_width;
			let start_x = x - total_width/2;

			let width = total_width / no_of_datasets;
			let current_x = start_x + width * dataset_index;

			let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.total_height);

			return $.createSVG('rect', {
				className: `bar mini fill ${color}`,
				'data-point-index': index,
				x: current_x,
				y: y,
				width: width,
				height: height
			});
		},

		draw_dot: function(x, y, args, color, index) {
			return $.createSVG('circle', {
				className: `fill ${color}`,
				'data-point-index': index,
				cx: x,
				cy: y,
				r: args.radius
			});
		},

		animate_bar: function(bar_obj, x, y_top, index, no_of_datasets) {
			let start = x - this.avg_unit_width/4;
			let width = (this.avg_unit_width/2)/no_of_datasets;
			let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.total_height);

			x = start + (width * index);

			return [bar_obj, {width: width, height: height, x: x, y: y}, 350, "easein"];
			// bar.animate({height: args.new_height, y: y_top}, 350, mina.easein);
		},

		animate_dot: function(dot_obj, x, y_top) {
			return [dot_obj, {cx: x, cy: y_top}, 350, "easein"];
			// dot.animate({cy: y_top}, 350, mina.easein);
		}
	};

	return UnitRenderer;
})();


export function make_x_line(height, text_start_at, point, label_class, axis_line_class, x_pos) {

}

export function make_y_line() {}

export function draw_x_line() {}

export function draw_y_line() {}

export function label_x_line() {}

export function label_y_line() {}

export function get_anim_x_line() {}

export function get_anim_y_line() {}

