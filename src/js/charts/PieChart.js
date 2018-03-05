import AggregationChart from './AggregationChart';
import { $, getOffset } from '../utils/dom';
import { getPositionByAngle } from '../utils/helpers';
import { makePath, makeArcPathStr } from '../utils/draw';
import { lightenDarkenColor } from '../utils/colors';
import { transform } from '../utils/animation';
import { FULL_ANGLE } from '../utils/constants';

export default class PieChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'pie';

		this.hoverRadio = args.hoverRadio || 0.1;
		this.startAngle = args.startAngle || 0;
		this.clockWise = args.clockWise || false;

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
	}
	calc() {
		super.calc();
		this.center = {
			x: this.width / 2,
			y: this.height / 2
		}
		this.radius = (this.height > this.width ? this.center.x : this.center.y);
	}

	render(init) {
		const{radius,clockWise} = this;
		this.grand_total = this.state.sliceTotals.reduce((a, b) => a + b, 0);
		const prevSlicesProperties = this.slicesProperties || [];
		this.slices = [];
		this.elements_to_animate = [];
		this.slicesProperties = [];
		let curAngle = 180 - this.startAngle;

		this.state.sliceTotals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / this.grand_total) * FULL_ANGLE;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = getPositionByAngle(startAngle, radius);
			const endPosition = getPositionByAngle(endAngle, radius);
			const prevProperty = init && prevSlicesProperties[i];
			let curStart,curEnd;
			if(init){
				curStart = prevProperty?prevProperty.startPosition : startPosition;
				curEnd = prevProperty? prevProperty.endPosition : startPosition;
			}else{
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath = makeArcPathStr(curStart, curEnd, this.center, this.radius, this.clockWise);
			let slice = makePath(curPath, 'pie-path', 'none', this.colors[i]);
			slice.style.transition = 'transform .3s;';
			this.drawArea.appendChild(slice);

			this.slices.push(slice);
			this.slicesProperties.push({
				startPosition,
				endPosition,
				value: total,
				total: this.grand_total,
				startAngle,
				endAngle,
				angle: diffAngle
			});
			if(init){
				this.elements_to_animate.push([slice,
					{d: makeArcPathStr(startPosition, endPosition, this.center, this.radius, this.clockWise)},
					650, "easein",null,{
						d:curPath
					}]);
			}

		});
		// if(init){
		// 	runSMILAnimation(this.chartWrapper, this.svg, this.elements_to_animate);
		// }
	}

	calTranslateByAngle(property){
		const{radius,hoverRadio} = this;
		const position = getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}

	hoverSlice(path,i,flag,e){
		if(!path) return;
		const color = this.colors[i];
		if(flag) {

			transform(path, this.calTranslateByAngle(this.slicesProperties[i]));
			path.style.fill = lightenDarkenColor(color, 50);
			let g_off = getOffset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length > 0
				? this.formatted_labels[i] : this.state.labels[i]) + ': ';
			let percent = (this.state.sliceTotals[i]*100/this.grand_total).toFixed(1);
			this.tip.set_values(x, y, title, percent + "%");
			this.tip.show_tip();
		} else {
			transform(path,'translate3d(0,0,0)');
			this.tip.hide_tip();
			path.style.fill = color;
		}
	}

	mouseMove(e){
		const target = e.target;
		let prevIndex = this.curActiveSliceIndex;
		let prevAcitve = this.curActiveSlice;
		for(let i = 0; i < this.slices.length; i++){
			if(target === this.slices[i]){
				this.hoverSlice(prevAcitve,prevIndex,false);
				this.curActiveSlice = target;
				this.curActiveSliceIndex = i;
				this.hoverSlice(target,i,true,e);
				break;
			}
		}
	}
	mouseLeave(){
		this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,false);
	}
	bindTooltip() {
		// this.drawArea.addEventListener('mousemove',this.mouseMove);
		// this.drawArea.addEventListener('mouseleave',this.mouseLeave);
	}
}
