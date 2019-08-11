import AggregationChart from './AggregationChart';
import { getComponent } from '../objects/ChartComponents';
import { getOffset } from '../utils/dom';
import { getPositionByAngle } from '../utils/helpers';
import { makeArcStrokePathStr, makeStrokeCircleStr } from '../utils/draw';
import { lightenDarkenColor } from '../utils/colors';
import { transform } from '../utils/animation';
import { FULL_ANGLE } from '../utils/constants';

export default class DonutChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'donut';
		this.initTimeout = 0;
		this.init = 1;

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);

		this.hoverRadio = args.hoverRadio || 0.1;
		this.config.startAngle = args.startAngle || 0;

		this.clockWise = args.clockWise || false;
		this.strokeWidth = args.strokeWidth || 30;
	}

	calc() {
		super.calc();
		let s = this.state;
		this.radius =
			this.height > this.width
				? this.center.x - this.strokeWidth / 2
				: this.center.y - this.strokeWidth / 2;

		const { radius, clockWise } = this;

		const prevSlicesProperties = s.slicesProperties || [];
		s.sliceStrings = [];
		s.slicesProperties = [];
		let curAngle = 180 - this.config.startAngle;

		s.sliceTotals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / s.grandTotal) * FULL_ANGLE;
			const largeArc = originDiffAngle > 180 ? 1: 0;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = getPositionByAngle(startAngle, radius);
			const endPosition = getPositionByAngle(endAngle, radius);

			const prevProperty = this.init && prevSlicesProperties[i];

			let curStart,curEnd;
			if(this.init) {
				curStart = prevProperty ? prevProperty.startPosition : startPosition;
				curEnd = prevProperty ? prevProperty.endPosition : startPosition;
			} else {
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath =
				originDiffAngle === 360
					? makeStrokeCircleStr(curStart, curEnd, this.center, this.radius, this.clockWise, largeArc)
					: makeArcStrokePathStr(curStart, curEnd, this.center, this.radius, this.clockWise, largeArc);

			s.sliceStrings.push(curPath);
			s.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: s.grandTotal,
				startAngle,
				endAngle,
				angle: diffAngle
			});

		});
		this.init = 0;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'donutSlices',
				{ },
				function() {
					return {
						sliceStrings: s.sliceStrings,
						colors: this.colors,
						strokeWidth: this.strokeWidth,
					};
				}.bind(this)
			]
		];

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	calTranslateByAngle(property){
		const{ radius, hoverRadio } = this;
		const position = getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}

	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag) {
			transform(path, this.calTranslateByAngle(this.state.slicesProperties[i]));
			path.style.stroke = lightenDarkenColor(color, 50);
			let g_off = getOffset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length > 0
				? this.formatted_labels[i] : this.state.labels[i]) + ': ';
			let percent = (this.state.sliceTotals[i] * 100 / this.state.grandTotal).toFixed(1);
			this.tip.setValues(x, y, {name: title, value: percent + "%"});
			this.tip.showTip();
		} else {
			transform(path,'translate3d(0,0,0)');
			this.tip.hideTip();
			path.style.stroke = color;
		}
	}

	bindTooltip() {
		this.container.addEventListener('mousemove', this.mouseMove);
		this.container.addEventListener('mouseleave', this.mouseLeave);
	}

	mouseMove(e){
		const target = e.target;
		let slices = this.components.get('donutSlices').store;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		if(slices.includes(target)) {
			let i = slices.indexOf(target);
			this.hoverSlice(prevAcitve, prevIndex,false);
			this.curActiveSlice = target;
			this.curActiveSliceIndex = i;
			this.hoverSlice(target, i, true, e);
		} else {
			this.mouseLeave();
		}
	}

	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
}
