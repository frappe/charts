import BaseChart from './BaseChart';
import { getComponent } from '../objects/ChartComponents';
import { makeText, heatSquare } from '../utils/draw';
import { DAY_NAMES_SHORT, addDays, areInSameMonth, getLastDateInMonth, setDayToSunday, getYyyyMmDd, getWeeksBetween, getMonthName, clone,
	NO_OF_MILLIS, NO_OF_YEAR_MONTHS, NO_OF_DAYS_IN_WEEK } from '../utils/date-utils';
import { calcDistribution, getMaxCheckpoint } from '../utils/intervals';
import { getExtraHeight, getExtraWidth, HEATMAP_DISTRIBUTION_SIZE, HEATMAP_SQUARE_SIZE,
	HEATMAP_GUTTER_SIZE } from '../utils/constants';

const COL_WIDTH = HEATMAP_SQUARE_SIZE + HEATMAP_GUTTER_SIZE;
const ROW_HEIGHT = COL_WIDTH;
// const DAY_INCR = 1;

export default class Heatmap extends BaseChart {
	constructor(parent, options) {
		super(parent, options);
		this.type = 'heatmap';

		this.countLabel = options.countLabel || '';

		let validStarts = ['Sunday', 'Monday'];
		let startSubDomain = validStarts.includes(options.startSubDomain)
			? options.startSubDomain : 'Sunday';
		this.startSubDomainIndex = validStarts.indexOf(startSubDomain);

		this.setup();
	}

	setMeasures(options) {
		let m = this.measures;
		this.discreteDomains = options.discreteDomains === 0 ? 0 : 1;

		m.paddings.top = ROW_HEIGHT * 3;
		m.paddings.bottom = 0;
		m.legendHeight = ROW_HEIGHT * 2;
		m.baseHeight = ROW_HEIGHT * NO_OF_DAYS_IN_WEEK
			+ getExtraHeight(m);

		let d = this.data;
		let spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
		this.independentWidth = (getWeeksBetween(d.start, d.end)
			+ spacing) * COL_WIDTH + getExtraWidth(m);
	}

	updateWidth() {
		let spacing = this.discreteDomains ? NO_OF_YEAR_MONTHS : 0;
		let noOfWeeks = this.state.noOfWeeks ? this.state.noOfWeeks : 52;
		this.baseWidth = (noOfWeeks + spacing) * COL_WIDTH
			+ getExtraWidth(this.measures);
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
				points[getYyyyMmDd(date)] = data.dataPoints[timestampSec];
			});
			data.dataPoints = points;
		}

		return data;
	}

	calc() {
		let s = this.state;

		s.start = clone(this.data.start);
		s.end = clone(this.data.end);

		s.firstWeekStart = clone(s.start);
		s.noOfWeeks = getWeeksBetween(s.start, s.end);
		s.distribution = calcDistribution(
			Object.values(this.data.dataPoints), HEATMAP_DISTRIBUTION_SIZE);

		s.domainConfigs = this.getDomains();
	}

	setupComponents() {
		let s = this.state;
		let lessCol = this.discreteDomains ? 0 : 1;

		let componentConfigs = s.domainConfigs.map((config, i) => [
			'heatDomain',
			{
				index: config.index,
				colWidth: COL_WIDTH,
				rowHeight: ROW_HEIGHT,
				squareSize: HEATMAP_SQUARE_SIZE,
				radius: this.rawChartArgs.radius || 0,
				xTranslate: s.domainConfigs
					.filter((config, j) => j < i)
					.map(config => config.cols.length - lessCol)
					.reduce((a, b) => a + b, 0)
					* COL_WIDTH
			},
			function() {
				return s.domainConfigs[i];
			}.bind(this)

		]);

		this.components = new Map(componentConfigs
			.map((args, i) => {
				let component = getComponent(...args);
				return [args[0] + '-' + i, component];
			})
		);

		let y = 0;
		DAY_NAMES_SHORT.forEach((dayName, i) => {
			if([1, 3, 5].includes(i)) {
				let dayText = makeText('subdomain-name', -COL_WIDTH/2, y, dayName,
					{
						fontSize: HEATMAP_SQUARE_SIZE,
						dy: 8,
						textAnchor: 'end'
					}
				);
				this.drawArea.appendChild(dayText);
			}
			y += ROW_HEIGHT;
		});
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
		this.container.addEventListener('mousemove', (e) => {
			this.components.forEach(comp => {
				let daySquares = comp.store;
				let daySquare = e.target;
				if(daySquares.includes(daySquare)) {

					let count = daySquare.getAttribute('data-value');
					let dateParts = daySquare.getAttribute('data-date').split('-');

					let month = getMonthName(parseInt(dateParts[1])-1, true);

					let gOff = this.container.getBoundingClientRect(), pOff = daySquare.getBoundingClientRect();

					let width = parseInt(e.target.getAttribute('width'));
					let x = pOff.left - gOff.left + width/2;
					let y = pOff.top - gOff.top;
					let value = count + ' ' + this.countLabel;
					let name = ' on ' + month + ' ' + dateParts[0] + ', ' + dateParts[2];

					this.tip.setValues(x, y, {name: name, value: value, valueFirst: 1}, []);
					this.tip.showTip();
				}
			});
		});
	}

	renderLegend() {
		this.legendArea.textContent = '';
		let x = 0;
		let y = ROW_HEIGHT;
		let radius = this.rawChartArgs.radius || 0;

		let lessText = makeText('subdomain-name', x, y, 'Less',
			{
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			}
		);
		x = (COL_WIDTH * 2) + COL_WIDTH/2;
		this.legendArea.appendChild(lessText);

		this.colors.slice(0, HEATMAP_DISTRIBUTION_SIZE).map((color, i) => {
			const square = heatSquare('heatmap-legend-unit', x + (COL_WIDTH + 3) * i,
				y, HEATMAP_SQUARE_SIZE, radius, color);
			this.legendArea.appendChild(square);
		});

		let moreTextX = x + HEATMAP_DISTRIBUTION_SIZE * (COL_WIDTH + 3) + COL_WIDTH/4;
		let moreText = makeText('subdomain-name', moreTextX, y, 'More',
			{
				fontSize: HEATMAP_SQUARE_SIZE + 1,
				dy: 9
			}
		);
		this.legendArea.appendChild(moreText);
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
		let startOfWeek = setDayToSunday(startDate); // TODO: Monday as well
		endDate = clone(endDate) || getLastDateInMonth(month, year);

		let domainConfig = {
			index: month,
			cols: []
		};

		addDays(endDate, 1);
		let noOfMonthWeeks = getWeeksBetween(startOfWeek, endDate);

		let cols = [], col;
		for(var i = 0; i < noOfMonthWeeks; i++) {
			col = this.getCol(startOfWeek, month);
			cols.push(col);

			startOfWeek = new Date(col[NO_OF_DAYS_IN_WEEK - 1].yyyyMmDd);
			addDays(startOfWeek, 1);
		}

		if(col[NO_OF_DAYS_IN_WEEK - 1].dataValue !== undefined) {
			addDays(startOfWeek, 1);
			cols.push(this.getCol(startOfWeek, month, true));
		}

		domainConfig.cols = cols;

		return domainConfig;
	}

	getCol(startDate, month, empty = false) {
		let s = this.state;

		// startDate is the start of week
		let currentDate = clone(startDate);
		let col = [];

		for(var i = 0; i < NO_OF_DAYS_IN_WEEK; i++, addDays(currentDate, 1)) {
			let config = {};

			// Non-generic adjustment for entire heatmap, needs state
			let currentDateWithinData = currentDate >= s.start && currentDate <= s.end;

			if(empty || currentDate.getMonth() !== month || !currentDateWithinData) {
				config.yyyyMmDd = getYyyyMmDd(currentDate);
			} else {
				config = this.getSubDomainConfig(currentDate);
			}
			col.push(config);
		}

		return col;
	}

	getSubDomainConfig(date) {
		let yyyyMmDd = getYyyyMmDd(date);
		let dataValue = this.data.dataPoints[yyyyMmDd];
		let config = {
			yyyyMmDd: yyyyMmDd,
			dataValue: dataValue || 0,
			fill: this.colors[getMaxCheckpoint(dataValue, this.state.distribution)]
		};
		return config;
	}
}
