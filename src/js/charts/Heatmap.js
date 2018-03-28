import BaseChart from './BaseChart';
import { makeSVGGroup, makeHeatSquare, makeText } from '../utils/draw';
import { addDays, getDdMmYyyy, getWeeksBetween, getMonthName, clone,
	NO_OF_MILLIS, NO_OF_YEAR_MONTHS, NO_OF_DAYS_IN_WEEK } from '../utils/date-utils';
import { calcDistribution, getMaxCheckpoint } from '../utils/intervals';
import { HEATMAP_DISTRIBUTION_SIZE, HEATMAP_SQUARE_SIZE,
	HEATMAP_GUTTER_SIZE } from '../utils/constants';

const COL_SIZE = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;

export default class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);
		this.type = 'heatmap';

		this.dataPoints = options.data.dataPoints || {};
		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;
		this.countLabel = options.countLabel || '';

		this.setup();
	}

	configure(args) {
		super.configure(args);

		this.start = args.data.start;

		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.firstWeekStart = new Date(this.start.toDateString());
		this.lastWeekStart = new Date(this.today.toDateString());
		if(this.firstWeekStart.getDay() !== NO_OF_DAYS_IN_WEEK) {
			addDays(this.firstWeekStart, (-1) * this.firstWeekStart.getDay());
		}
		if(this.lastWeekStart.getDay() !== NO_OF_DAYS_IN_WEEK) {
			addDays(this.lastWeekStart, (-1) * this.lastWeekStart.getDay());
		}
		this.no_of_cols = getWeeksBetween(this.firstWeekStart + '', this.lastWeekStart + '') + 1;
	}

	updateWidth() {
		this.baseWidth = (this.no_of_cols + 99) * COL_SIZE;

		if(this.discreteDomains) {
			this.baseWidth += (COL_SIZE * NO_OF_YEAR_MONTHS);
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
	}

	calc() {
		this.distribution = calcDistribution(
			Object.values(this.dataPoints), HEATMAP_DISTRIBUTION_SIZE);
	}

	update(data=this.data) {
		this.data = this.prepareData(data);
		this.draw();
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
		this.monthWeeks = {},
		this.monthStartPoints = [];
		this.monthWeeks[this.currentMonth] = 0;

		for(var i = 0; i < no_of_weeks; i++) {
			let dataGroup, monthChange = 0;
			let day = new Date(currentWeekSunday);

			[dataGroup, monthChange] = this.getWeekSquaresGroup(day, this.weekCol);
			this.dataGroups.appendChild(dataGroup);
			this.weekCol += 1 + parseInt(this.discreteDomains && monthChange);
			this.monthWeeks[this.currentMonth]++;
			if(monthChange) {
				this.currentMonth = (this.currentMonth + 1) % NO_OF_YEAR_MONTHS;
				this.months.push(this.currentMonth + '');
				this.monthWeeks[this.currentMonth] = 1;
			}
			addDays(currentWeekSunday, NO_OF_DAYS_IN_WEEK);
		}
		this.renderMonthLabels();
	}

	getWeekSquaresGroup(currentDate, index) {
		const step = 1;
		const todayTime = this.today.getTime();

		let monthChange = 0;
		let weekColChange = 0;

		let dataGroup = makeSVGGroup(this.dataGroups, 'data-group');

		for(var y = 0, i = 0; i < NO_OF_DAYS_IN_WEEK; i += step, y += COL_SIZE) {
			let dataValue = 0;
			let colorIndex = 0;

			let currentTimestamp = currentDate.getTime()/NO_OF_MILLIS;
			let timestamp = Math.floor(currentTimestamp - (currentTimestamp % 86400)).toFixed(1);

			if(this.dataPoints[timestamp]) {
				dataValue = this.dataPoints[timestamp];
			}

			if(this.dataPoints[Math.round(timestamp)]) {
				dataValue = this.dataPoints[Math.round(timestamp)];
			}

			if(dataValue) {
				colorIndex = getMaxCheckpoint(dataValue, this.distribution);
			}

			let x = (index + weekColChange) * COL_SIZE;

			let dataAttr = {
				'data-date': getDdMmYyyy(currentDate),
				'data-value': dataValue,
				'data-day': currentDate.getDay()
			};

			let heatSquare = makeHeatSquare('day', x, y, HEATMAP_SQUARE_SIZE,
				this.colors[colorIndex], dataAttr);

			dataGroup.appendChild(heatSquare);

			let nextDate = new Date(currentDate);
			addDays(nextDate, 1);
			if(nextDate.getTime() > todayTime) break;


			if(nextDate.getMonth() - currentDate.getMonth()) {
				monthChange = 1;
				if(this.discreteDomains) {
					weekColChange = 1;
				}

				this.monthStartPoints.push((index + weekColChange) * COL_SIZE);
			}
			currentDate = nextDate;
		}

		return [dataGroup, monthChange];
	}

	renderMonthLabels() {
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
			let month_name = getMonthName(this.months[i], true);
			let text = makeText('y-value-text', start + COL_SIZE, HEATMAP_SQUARE_SIZE, month_name);
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

				let month = getMonthName(parseInt(dateParts[1])-1, true);

				let gOff = this.container.getBoundingClientRect(), pOff = e.target.getBoundingClientRect();

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
