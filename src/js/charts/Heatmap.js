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
		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;
		this.countLabel = options.countLabel || '';

		let today = new Date();
		this.start = options.start || addDays(today, 365);

		let legendColors = (options.legendColors || []).slice(0, 5);
		this.legendColors = this.validate_colors(legendColors)
			? legendColors
			: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		// Fixed 5-color theme,
		// More colors are difficult to parse visually
		this.distribution_size = 5;

		this.translateX = 0;
		this.setup();
	}

	setMargins() {
		super.setMargins();
		this.leftMargin = 10;
		this.translateY = 10;
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
		this.firstWeekStart = new Date(this.start.toDateString());
		this.lastWeekStart = new Date(this.today.toDateString());
		if(this.firstWeekStart.getDay() !== 7) {
			addDays(this.firstWeekStart, (-1) * this.firstWeekStart.getDay());
		}
		if(this.lastWeekStart.getDay() !== 7) {
			addDays(this.lastWeekStart, (-1) * this.lastWeekStart.getDay());
		}
		this.no_of_cols = getWeeksBetween(this.firstWeekStart + '', this.lastWeekStart + '') + 1;
	}

	calcWidth() {
		this.baseWidth = (this.no_of_cols + 3) * 12 ;

		if(this.discreteDomains) {
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

		this.container.querySelector('.title').style.display = 'None';
		this.container.querySelector('.sub-title').style.display = 'None';
		this.container.querySelector('.graph-stats-container').style.display = 'None';
		this.chartWrapper.style.marginTop = '0px';
		this.chartWrapper.style.paddingTop = '0px';
	}

	calc() {

		let dataValues = Object.keys(this.data).map(key => this.data[key]);
		this.distribution = calcDistribution(dataValues, this.distribution_size);

		this.monthNames = ["January", "February", "March", "April", "May", "June",
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

		let currentWeekSunday = new Date(this.firstWeekStart);
		this.weekCol = 0;
		this.currentMonth = currentWeekSunday.getMonth();

		this.months = [this.currentMonth + ''];
		this.monthWeeks = {}, this.monthStartPoints = [];
		this.monthWeeks[this.currentMonth] = 0;
		this.monthStartPoints.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let dataGroup, monthChange = 0;
			let day = new Date(currentWeekSunday);

			[dataGroup, monthChange] = this.get_week_squares_group(day, this.weekCol);
			this.dataGroups.appendChild(dataGroup);
			this.weekCol += 1 + parseInt(this.discreteDomains && monthChange);
			this.monthWeeks[this.currentMonth]++;
			if(monthChange) {
				this.currentMonth = (this.currentMonth + 1) % 12;
				this.months.push(this.currentMonth + '');
				this.monthWeeks[this.currentMonth] = 1;
			}
			addDays(currentWeekSunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(currentDate, index) {
		const noOfWeekdays = 7;
		const squareSide = 10;
		const cellPadding = 2;
		const step = 1;
		const todayTime = this.today.getTime();

		let monthChange = 0;
		let weekColChange = 0;

		let dataGroup = makeSVGGroup(this.dataGroups, 'data-group');

		for(var y = 0, i = 0; i < noOfWeekdays; i += step, y += (squareSide + cellPadding)) {
			let dataValue = 0;
			let colorIndex = 0;

			let currentTimestamp = currentDate.getTime()/1000;
			let timestamp = Math.floor(currentTimestamp - (currentTimestamp % 86400)).toFixed(1);

			if(this.data[timestamp]) {
				dataValue = this.data[timestamp];
			}

			if(this.data[Math.round(timestamp)]) {
				dataValue = this.data[Math.round(timestamp)];
			}

			if(dataValue) {
				colorIndex = getMaxCheckpoint(dataValue, this.distribution);
			}

			let x = 13 + (index + weekColChange) * 12;

			let dataAttr = {
				'data-date': getDdMmYyyy(currentDate),
				'data-value': dataValue,
				'data-day': currentDate.getDay()
			};

			let heatSquare = makeHeatSquare('day', x, y, squareSide,
				this.legendColors[colorIndex], dataAttr);

			dataGroup.appendChild(heatSquare);

			let nextDate = new Date(currentDate);
			addDays(nextDate, 1);
			if(nextDate.getTime() > todayTime) break;


			if(nextDate.getMonth() - currentDate.getMonth()) {
				monthChange = 1;
				if(this.discreteDomains) {
					weekColChange = 1;
				}

				this.monthStartPoints.push(13 + (index + weekColChange) * 12);
			}
			currentDate = nextDate;
		}

		return [dataGroup, monthChange];
	}

	render_month_labels() {
		// this.first_month_label = 1;
		// if (this.firstWeekStart.getDate() > 8) {
		// 	this.first_month_label = 0;
		// }
		// this.last_month_label = 1;

		// let first_month = this.months.shift();
		// let first_month_start = this.monthStartPoints.shift();
		// render first month if

		// let last_month = this.months.pop();
		// let last_month_start = this.monthStartPoints.pop();
		// render last month if

		this.months.shift();
		this.monthStartPoints.shift();
		this.months.pop();
		this.monthStartPoints.pop();

		this.monthStartPoints.map((start, i) => {
			let month_name =  this.monthNames[this.months[i]].substring(0, 3);
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
				let dateParts = e.target.getAttribute('data-date').split('-');

				let month = this.monthNames[parseInt(dateParts[1])-1].substring(0, 3);

				let gOff = this.chartWrapper.getBoundingClientRect(), pOff = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = pOff.left - gOff.left + (width+2)/2;
				let y = pOff.top - gOff.top - (width+2)/2;
				let value = count + ' ' + this.countLabel;
				let name = ' on ' + month + ' ' + dateParts[0] + ', ' + dateParts[2];

				this.tip.setValues(x, y, {name: name, value: value, valueFirst: 1}, []);
				this.tip.showTip();
			});
		});
	}

	update(data) {
		super.update(data);
		this.bindTooltip();
	}
}
