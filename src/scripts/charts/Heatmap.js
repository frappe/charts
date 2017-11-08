import BaseChart from './BaseChart';
import $ from '../utils/dom';

export default class Heatmap extends BaseChart {
	constructor({
		start = '',
		domain = '',
		subdomain = '',
		data = {},
		discrete_domains = 0,
		count_label = ''
	}) {
		super(arguments[0]);

		this.type = 'heatmap';

		this.domain = domain;
		this.subdomain = subdomain;
		this.data = data;
		this.discrete_domains = discrete_domains;
		this.count_label = count_label;

		let today = new Date();
		this.start = start || this.add_days(today, 365);

		this.legend_colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		this.translate_x = 0;
		this.setup();
	}

	setup_base_values() {
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.first_week_start = new Date(this.start.toDateString());
		this.last_week_start = new Date(this.today.toDateString());
		if(this.first_week_start.getDay() !== 7) {
			this.add_days(this.first_week_start, (-1) * this.first_week_start.getDay());
		}
		if(this.last_week_start.getDay() !== 7) {
			this.add_days(this.last_week_start, (-1) * this.last_week_start.getDay());
		}
		this.no_of_cols = this.get_weeks_between(this.first_week_start + '', this.last_week_start + '') + 1;
	}

	set_width() {
		this.base_width = (this.no_of_cols + 3) * 12 ;

		if(this.discrete_domains) {
			this.base_width += (12 * 12);
		}
	}

	setup_components() {
		this.domain_label_group = $.createSVG("g", {
			className: "domain-label-group chart-label",
			inside: this.draw_area
		});
		this.data_groups = $.createSVG("g", {
			className: "data-groups",
			inside: this.draw_area,
			transform: `translate(0, 20)`
		});
	}

	setup_values() {
		this.domain_label_group.textContent = '';
		this.data_groups.textContent = '';
		this.distribution = this.get_distribution(this.data, this.legend_colors);
		this.month_names = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];

		this.render_all_weeks_and_store_x_values(this.no_of_cols);
	}

	render_all_weeks_and_store_x_values(no_of_weeks) {
		let current_week_sunday = new Date(this.first_week_start);
		this.week_col = 0;
		this.current_month = current_week_sunday.getMonth();

		this.months = [this.current_month + ''];
		this.month_weeks = {}, this.month_start_points = [];
		this.month_weeks[this.current_month] = 0;
		this.month_start_points.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let data_group, month_change = 0;
			let day = new Date(current_week_sunday);

			[data_group, month_change] = this.get_week_squares_group(day, this.week_col);
			this.data_groups.appendChild(data_group);
			this.week_col += 1 + parseInt(this.discrete_domains && month_change);
			this.month_weeks[this.current_month]++;
			if(month_change) {
				this.current_month = (this.current_month + 1) % 12;
				this.months.push(this.current_month + '');
				this.month_weeks[this.current_month] = 1;
			}
			this.add_days(current_week_sunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(current_date, index) {
		const no_of_weekdays = 7;
		const square_side = 10;
		const cell_padding = 2;
		const step = 1;
		const today_time = this.today.getTime();

		let month_change = 0;
		let week_col_change = 0;

		let data_group = $.createSVG("g", {
			className: "data-group",
			inside: this.data_groups
		});

		for(var y = 0, i = 0; i < no_of_weekdays; i += step, y += (square_side + cell_padding)) {
			let data_value = 0;
			let color_index = 0;

			let current_timestamp = current_date.getTime()/1000;
			let timestamp = Math.floor(current_timestamp - (current_timestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				data_value = this.data[timestamp];
				color_index = this.get_max_checkpoint(data_value, this.distribution);
			}

			if(this.data[Math.round(timestamp)]) {
				data_value = this.data[Math.round(timestamp)];
				color_index = this.get_max_checkpoint(data_value, this.distribution);
			}

			let x = 13 + (index + week_col_change) * 12;

			$.createSVG("rect", {
				className: 'day',
				inside: data_group,
				x: x,
				y: y,
				width: square_side,
				height: square_side,
				fill:  this.legend_colors[color_index],
				'data-date': this.get_dd_mm_yyyy(current_date),
				'data-value': data_value,
				'data-day': current_date.getDay()
			});

			let next_date = new Date(current_date);
			this.add_days(next_date, 1);
			if(next_date.getTime() > today_time) break;


			if(next_date.getMonth() - current_date.getMonth()) {
				month_change = 1;
				if(this.discrete_domains) {
					week_col_change = 1;
				}

				this.month_start_points.push(13 + (index + week_col_change) * 12);
			}
			current_date = next_date;
		}

		return [data_group, month_change];
	}

	render_month_labels() {
		// this.first_month_label = 1;
		// if (this.first_week_start.getDate() > 8) {
		// 	this.first_month_label = 0;
		// }
		// this.last_month_label = 1;

		// let first_month = this.months.shift();
		// let first_month_start = this.month_start_points.shift();
		// render first month if

		// let last_month = this.months.pop();
		// let last_month_start = this.month_start_points.pop();
		// render last month if

		this.months.shift();
		this.month_start_points.shift();
		this.months.pop();
		this.month_start_points.pop();

		this.month_start_points.map((start, i) => {
			let month_name =  this.month_names[this.months[i]].substring(0, 3);

			$.createSVG('text', {
				className: 'y-value-text',
				inside: this.domain_label_group,
				x: start + 12,
				y: 10,
				dy: '.32em',
				innerHTML: month_name
			});

		});
	}

	make_graph_components() {
		Array.prototype.slice.call(
			this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')
		).map(d => {
			d.style.display = 'None';
		});
		this.chart_wrapper.style.marginTop = '0px';
		this.chart_wrapper.style.paddingTop = '0px';
	}

	bind_tooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let date_parts = e.target.getAttribute('data-date').split('-');

				let month = this.month_names[parseInt(date_parts[1])-1].substring(0, 3);

				let g_off = this.chart_wrapper.getBoundingClientRect(), p_off = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = p_off.left - g_off.left + (width+2)/2;
				let y = p_off.top - g_off.top - (width+2)/2;
				let value = count + ' ' + this.count_label;
				let name = ' on ' + month + ' ' + date_parts[0] + ', ' + date_parts[2];

				this.tip.set_values(x, y, name, value, [], 1);
				this.tip.show_tip();
			});
		});
	}

	update(data) {
		this.data = data;
		this.setup_values();
		this.bind_tooltip();
	}

	get_distribution(data={}, mapper_array) {
		let data_values = Object.keys(data).map(key => data[key]);
		let data_max_value = Math.max(...data_values);

		let distribution_step = 1 / (mapper_array.length - 1);
		let distribution = [];

		mapper_array.map((color, i) => {
			let checkpoint = data_max_value * (distribution_step * i);
			distribution.push(checkpoint);
		});

		return distribution;
	}

	get_max_checkpoint(value, distribution) {
		return distribution.filter((d, i) => {
			if(i === 1) {
				return distribution[0] < value;
			}
			return d <= value;
		}).length - 1;
	}

	// TODO: date utils, move these out

	// https://stackoverflow.com/a/11252167/6495043
	treat_as_utc(date_str) {
		let result = new Date(date_str);
		result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
		return result;
	}

	get_dd_mm_yyyy(date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1; // getMonth() is zero-based
		return [
			(dd>9 ? '' : '0') + dd,
			(mm>9 ? '' : '0') + mm,
			date.getFullYear()
		].join('-');
	}

	get_weeks_between(start_date_str, end_date_str) {
		return Math.ceil(this.get_days_between(start_date_str, end_date_str) / 7);
	}

	get_days_between(start_date_str, end_date_str) {
		let milliseconds_per_day = 24 * 60 * 60 * 1000;
		return (this.treat_as_utc(end_date_str) - this.treat_as_utc(start_date_str)) / milliseconds_per_day;
	}

	// mutates
	add_days(date, number_of_days) {
		date.setDate(date.getDate() + number_of_days);
	}

	get_month_name() {}
}
