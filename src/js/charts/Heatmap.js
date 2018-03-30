import BaseChart from './BaseChart';
import { makeSVGGroup, makeHeatSquare, makeText } from '../utils/draw';
import { addDays, setDayToSunday, getDdMmYyyy, getWeeksBetween, getMonthName, clone,
	NO_OF_MILLIS, NO_OF_YEAR_MONTHS, NO_OF_DAYS_IN_WEEK } from '../utils/date-utils';
import { calcDistribution, getMaxCheckpoint } from '../utils/intervals';
import { HEATMAP_DISTRIBUTION_SIZE, HEATMAP_SQUARE_SIZE,
	HEATMAP_GUTTER_SIZE } from '../utils/constants';

const COL_WIDTH = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;
const ROW_HEIGHT = COL_WIDTH;
const DAY_INCR = 1;

export default class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);
		this.type = 'heatmap';

		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;
		this.countLabel = options.countLabel || '';

		this.setup();
	}

	updateWidth() {
		this.baseWidth = (this.state.noOfWeeks + 99) * COL_WIDTH;

		if(this.discreteDomains) {
			this.baseWidth += (COL_WIDTH * NO_OF_YEAR_MONTHS);
		}
	}

	makeChartArea() {
		super.makeChartArea();
		this.domainLabelGroup = makeSVGGroup(this.drawArea,
			'domain-label-group chart-label');

		this.colGroups = makeSVGGroup(this.drawArea,
			'data-groups',
			`translate(0, 20)`
		);
	}

	prepareData(data=this.data) {
		if(data.start && data.end && data.start > data.end) {
			throw new Error('Start date cannot be greater than end date.');
		}

		if(!data.start) {
			data.start = new Date();
			data.start.setFullYear( data.start.getFullYear() - 1 );
		}
		if(!data.end) { data.end = new Date(); }
		data.dataPoints = data.dataPoints || {};

		if(parseInt(Object.keys(data.dataPoints)[0]) > 100000) {
			let points = {};
			Object.keys(data.dataPoints).forEach(timestampSec => {
				let date = new Date(timestampSec * NO_OF_MILLIS);
				points[getDdMmYyyy(date)] = data.dataPoints[timestampSec];
			});
			data.dataPoints = points;
		}

		return data;
	}

	calc() {
		let s = this.state;

		s.start = this.data.start;
		s.end = this.data.end;

		s.firstWeekStart = setDayToSunday(clone(s.start));
		s.noOfWeeks = getWeeksBetween(s.firstWeekStart, s.end);
		s.distribution = calcDistribution(
			Object.values(this.data.dataPoints), HEATMAP_DISTRIBUTION_SIZE);
	}

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}
		this.data = this.prepareData(data);
		this.draw();
		this.bindTooltip();
	}

	render() {
		this.domainLabelGroup.textContent = '';
		this.colGroups.textContent = '';

		let currentWeekSunday = new Date(this.state.firstWeekStart);
		this.currentWeekCol = 0;
		this.currentMonth = currentWeekSunday.getMonth();

		this.months = [this.currentMonth + ''];
		this.monthWeeks = {},
		this.monthStartPoints = [];
		this.monthWeeks[this.currentMonth] = 0;

		for(var i = 0; i < this.state.noOfWeeks; i++) {
			let colGroup, monthChange = 0;
			let day = new Date(currentWeekSunday);

			[colGroup, monthChange] = this.getWeekSquaresGroup(day, this.currentWeekCol);
			this.colGroups.appendChild(colGroup);
			this.currentWeekCol += 1 + parseInt(this.discreteDomains && monthChange);
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

	getWeekSquaresGroup(currentDate, currentWeekCol) {
		let monthChange = 0;
		let weekColChange = 0;

		let colGroup = makeSVGGroup(this.colGroups, 'data-group');

		for(var y = 0, i = 0; i < NO_OF_DAYS_IN_WEEK; i += DAY_INCR, y += ROW_HEIGHT) {
			let ddmmyyyy = getDdMmYyyy(currentDate);
			let dataValue = this.data.dataPoints[ddmmyyyy] || 0;
			let colorIndex = getMaxCheckpoint(dataValue, this.state.distribution);

			let x = (currentWeekCol + weekColChange) * COL_WIDTH;

			let dataAttr = {
				'data-date': ddmmyyyy,
				'data-value': dataValue,
				'data-day': currentDate.getDay()
			};

			let heatSquare = makeHeatSquare('day', x, y, HEATMAP_SQUARE_SIZE,
				this.colors[colorIndex], dataAttr);

			colGroup.appendChild(heatSquare);

			let nextDate = new Date(currentDate);
			addDays(nextDate, 1);
			if(nextDate > this.state.end) break;

			if(nextDate.getMonth() - currentDate.getMonth()) {
				monthChange = 1;
				if(this.discreteDomains) {
					weekColChange = 1;
				}

				this.monthStartPoints.push((currentWeekCol + weekColChange) * COL_WIDTH);
			}
			currentDate = nextDate;
		}

		return [colGroup, monthChange];
	}

	renderMonthLabels() {
		// this.first_month_label = 1;
		// if (this.state.firstWeekStart.getDate() > 8) {
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
			let text = makeText('y-value-text', start + COL_WIDTH, HEATMAP_SQUARE_SIZE, month_name);
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
}
