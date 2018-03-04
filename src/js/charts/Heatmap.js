import BaseChart from './BaseChart';
import { makeSVGGroup, makeHeatSquare, makeText } from '../utils/draw';
import { addDays, getDdMmYyyy, getWeeksBetween } from '../utils/date-utils';
import { calcDistribution, getMaxCheckpoint } from '../utils/intervals';
import { isValidColor } from '../utils/colors';

export default class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);

		this.type = 'heatmap';

		this.domain = options.domain || '';
		this.subdomain = options.subdomain || '';
		this.data = options.data || {};
		this.discrete_domains = options.discrete_domains || 1;
		this.count_label = options.count_label || '';

		let today = new Date();
		this.start = options.start || addDays(today, 365);

		let legend_colors = (options.legend_colors || []).slice(0, 5);
		this.legend_colors = this.validate_colors(legend_colors)
			? legend_colors
			: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		// Fixed 5-color theme,
		// More colors are difficult to parse visually
		this.distribution_size = 5;

		this.translateX = 0;
		this.setup();
	}

	validate_colors(colors) {
		if(colors.length < 5) return 0;

		let valid = 1;
		colors.forEach(function(string) {
			if(!isValidColor(string)) {
				valid = 0;
				console.warn('"' + string + '" is not a valid color.');
			}
		}, this);

		return valid;
	}

	configure() {
		super.configure();
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.first_week_start = new Date(this.start.toDateString());
		this.last_week_start = new Date(this.today.toDateString());
		if(this.first_week_start.getDay() !== 7) {
			addDays(this.first_week_start, (-1) * this.first_week_start.getDay());
		}
		if(this.last_week_start.getDay() !== 7) {
			addDays(this.last_week_start, (-1) * this.last_week_start.getDay());
		}
		this.no_of_cols = getWeeksBetween(this.first_week_start + '', this.last_week_start + '') + 1;
	}

	calcWidth() {
		this.baseWidth = (this.no_of_cols + 3) * 12 ;

		if(this.discrete_domains) {
			this.baseWidth += (12 * 12);
		}
	}

	makeChartArea() {
		super.makeChartArea();
		this.domainLabelGroup = makeSVGGroup(this.drawArea,
			'domain-label-group chart-label');

		this.dataGroups = makeSVGGroup(this.drawArea,
			'data-groups',
			`translate(0, 20)`
		);
		// Array.prototype.slice.call(
		// 	this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')
		// ).map(d => {
		// 	d.style.display = 'None';
		// });
		// this.chartWrapper.style.marginTop = '0px';
		// this.chartWrapper.style.paddingTop = '0px';
	}

	calc() {

		let data_values = Object.keys(this.data).map(key => this.data[key]);
		this.distribution = calcDistribution(data_values, this.distribution_size);

		this.month_names = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
	}

	render() {
		this.renderAllWeeksAndStoreXValues(this.no_of_cols);
	}

	renderAllWeeksAndStoreXValues(no_of_weeks) {
		// renderAllWeeksAndStoreXValues
		this.domainLabelGroup.textContent = '';
		this.dataGroups.textContent = '';

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
			this.dataGroups.appendChild(data_group);
			this.week_col += 1 + parseInt(this.discrete_domains && month_change);
			this.month_weeks[this.current_month]++;
			if(month_change) {
				this.current_month = (this.current_month + 1) % 12;
				this.months.push(this.current_month + '');
				this.month_weeks[this.current_month] = 1;
			}
			addDays(current_week_sunday, 7);
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

		let data_group = makeSVGGroup(this.dataGroups, 'data-group');

		for(var y = 0, i = 0; i < no_of_weekdays; i += step, y += (square_side + cell_padding)) {
			let data_value = 0;
			let colorIndex = 0;

			let current_timestamp = current_date.getTime()/1000;
			let timestamp = Math.floor(current_timestamp - (current_timestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				data_value = this.data[timestamp];
			}

			if(this.data[Math.round(timestamp)]) {
				data_value = this.data[Math.round(timestamp)];
			}

			if(data_value) {
				colorIndex = getMaxCheckpoint(data_value, this.distribution);
			}

			let x = 13 + (index + week_col_change) * 12;

			let dataAttr = {
				'data-date': getDdMmYyyy(current_date),
				'data-value': data_value,
				'data-day': current_date.getDay()
			};

			let heatSquare = makeHeatSquare('day', x, y, square_side,
				this.legend_colors[colorIndex], dataAttr);

			data_group.appendChild(heatSquare);

			let next_date = new Date(current_date);
			addDays(next_date, 1);
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
			let text = makeText('y-value-text', start+12, 10, month_name);
			this.domainLabelGroup.appendChild(text);
		});
	}

	bindTooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let date_parts = e.target.getAttribute('data-date').split('-');

				let month = this.month_names[parseInt(date_parts[1])-1].substring(0, 3);

				let g_off = this.chartWrapper.getBoundingClientRect(), p_off = e.target.getBoundingClientRect();

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
		super.update(data);
		this.bindTooltip();
	}
}
