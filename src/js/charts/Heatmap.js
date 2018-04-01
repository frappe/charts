import BaseChart from './BaseChart';
import { makeSVGGroup, makeText } from '../utils/draw';
import { getComponent } from '../objects/ChartComponents';
import { addDays, areInSameMonth, getLastDateInMonth, setDayToSunday, getYyyyMmDd, getWeeksBetween, getMonthName, clone,
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

		let validStarts = ['Sunday', 'Monday'];
		let startSubDomain = validStarts.includes(options.startSubDomain)
			? options.startSubDomain : 'Sunday';
		this.startSubDomainIndex = validStarts.indexOf(startSubDomain);

		this.setup();
	}

	updateWidth() {
		this.baseWidth = (this.state.noOfWeeks + 99) * COL_WIDTH;

		if(this.discreteDomains) {
			this.baseWidth += (COL_WIDTH * NO_OF_YEAR_MONTHS);
		}
	}

	prepareData(data=this.data) {
		if(data.start && data.end && data.start > data.end) {
			throw new Error('Start date cannot be greater than end date.');
		}

		if(!data.start) {
			data.start = new Date();
			data.start.setFullYear( data.start.getFullYear() - 1 );
		}
		console.log(data.start);
		if(!data.end) { data.end = new Date(); }
		data.dataPoints = data.dataPoints || {};

		if(parseInt(Object.keys(data.dataPoints)[0]) > 100000) {
			let points = {};
			Object.keys(data.dataPoints).forEach(timestampSec => {
				let date = new Date(timestampSec * NO_OF_MILLIS);
				points[getYyyyMmDd(date)] = data.dataPoints[timestampSec];
			});
			data.dataPoints = points;
		}

		return data;
	}

	calc() {
		let s = this.state;

		s.start = this.data.start;
		s.end = this.data.end;

		s.firstWeekStart = setDayToSunday(s.start);
		s.noOfWeeks = getWeeksBetween(s.start, s.end);
		s.distribution = calcDistribution(
			Object.values(this.data.dataPoints), HEATMAP_DISTRIBUTION_SIZE);

		s.domainConfigs = this.getDomains();
	}

	setupComponents() {
		let s = this.state;

		console.log(s.domainConfigs);

		let componentConfigs = s.domainConfigs.map((config, i) => [
			'heatDomain',
			{
				index: i,
				colWidth: COL_WIDTH,
				rowHeight: ROW_HEIGHT,
				squareSize: HEATMAP_SQUARE_SIZE,
				xTranslate: s.domainConfigs
					.filter((config, j) => j < i)
					.map(config => config.cols.length)
					.reduce((a, b) => a + b, 0)
					* COL_WIDTH
			},
			function() {
				return s.domainConfigs[i];
			}.bind(this)
		])

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}
		this.data = this.prepareData(data);
		this.draw();
		this.bindTooltip();
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

	getDomains() {
		let s = this.state;
		const [startMonth, startYear] = [s.start.getMonth(), s.start.getFullYear()];
		const [endMonth, endYear] = [s.end.getMonth(), s.end.getFullYear()];

		const noOfMonths = (endMonth - startMonth + 1) + (endYear - startYear) * 12;

		let domainConfigs = [];

		let startOfMonth = clone(s.start);
		for(var i = 0; i < noOfMonths; i++) {
			let endDate = s.end;
			if(!areInSameMonth(startOfMonth, s.end)) {
				let [month, year] = [startOfMonth.getMonth(), startOfMonth.getFullYear()];
				endDate = getLastDateInMonth(month, year);
			}
			domainConfigs.push(this.getDomainConfig(startOfMonth, endDate));

			addDays(endDate, 1);
			startOfMonth = endDate;
		}

		return domainConfigs;
	}

	getDomainConfig(startDate, endDate='') {
		let [month, year] = [startDate.getMonth(), startDate.getFullYear()];
		let startOfWeek = setDayToSunday(startDate);
		endDate = clone(endDate) || getLastDateInMonth(month, year);

		let s = this.state;
		let domainConfig = {
			index: month,
			cols: []
		};

		let noOfMonthWeeks = getWeeksBetween(startOfWeek, endDate);

		let cols = [];
		for(var i = 0; i < noOfMonthWeeks; i++) {
			const col = this.getCol(startOfWeek, month);
			cols.push(col);

			startOfWeek = new Date(col[NO_OF_DAYS_IN_WEEK - 1].dateStr);
			addDays(startOfWeek, 1);
		}

		if(startOfWeek.getDay() === this.startSubDomainIndex) {
			cols.push(new Array(NO_OF_DAYS_IN_WEEK).fill(0));
		}

		domainConfig.cols = cols;

		return domainConfig;
	}

	getCol(startDate, month) {
		// startDate is the start of week
		let currentDate = clone(startDate);
		let col = [];

		for(var i = 0; i < NO_OF_DAYS_IN_WEEK; i++, addDays(currentDate, 1)) {
			let config = 0;
			if(currentDate.getMonth() === month) {
				config = this.getSubDomainConfig(currentDate);
			}
			col.push(config);
		}

		return col;
	}

	getSubDomainConfig(date) {
		let YyyyMmDd = getYyyyMmDd(date);
		let dataValue = this.data.dataPoints[YyyyMmDd];
		let config = {
			YyyyMmDd: YyyyMmDd,
			dataValue: dataValue || 0,
			fill: this.colors[getMaxCheckpoint(dataValue, this.state.distribution)]
		}
		return config;
	}
}
