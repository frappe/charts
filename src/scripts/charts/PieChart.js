import BaseChart from './BaseChart';
import $ from '../utils/dom';
import { lighten_darken_color } from '../utils/colors';
import { runSVGAnimation, transform } from '../utils/animate';
const ANGLE_RATIO = Math.PI / 180;
const FULL_ANGLE = 360;

export default class PieChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'pie';
		this.get_y_label = this.format_lambdas.y_label;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;
		this.elements_to_animate = null;
		this.hoverRadio = args.hoverRadio || 0.1;
		this.max_slices = 10;
		this.max_legend_points = 6;
		this.isAnimate = false;
		this.colors = args.colors;
		this.startAngle = args.startAngle || 0;
		this.clockWise = args.clockWise || false;
		if(!this.colors || this.colors.length < this.data.labels.length) {
			this.colors = ['#7cd6fd', '#5e64ff', '#743ee2', '#ff5858', '#ffa00a',
				'#FEEF72', '#28a745', '#98d85b', '#b554ff', '#ffa3ef'];
		}
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		this.setup();
	}
	setup_values() {
		this.centerX = this.width / 2;
		this.centerY = this.height / 2;
		this.radius = (this.height > this.width ? this.centerX : this.centerY);
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	setup_utils() { }
	static getPositionByAngle(angle,radius){
		return {
			x:Math.sin(angle * ANGLE_RATIO) * radius,
			y:Math.cos(angle * ANGLE_RATIO) * radius,
		};
	}
	makeArcPath(startPosition,endPosition){
		const{centerX,centerY,radius,clockWise} = this;
		return `M${centerX} ${centerY} L${centerX+startPosition.x} ${centerY+startPosition.y} A ${radius} ${radius} 0 0 ${clockWise ? 1 : 0} ${centerX+endPosition.x} ${centerY+endPosition.y} z`;
	}
	make_graph_components(init){
		const{radius,clockWise} = this;
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		const prevSlicesProperties = this.slicesProperties || [];
		this.slices = [];
		this.elements_to_animate = [];
		this.slicesProperties = [];
		let curAngle = 180 - this.startAngle;
		this.slice_totals.map((total, i) => {
			const startAngle = curAngle;
			const originDiffAngle = (total / this.grand_total) * FULL_ANGLE;
			const diffAngle = clockWise ? -originDiffAngle : originDiffAngle;
			const endAngle = curAngle = curAngle + diffAngle;
			const startPosition = PieChart.getPositionByAngle(startAngle,radius);
			const endPosition = PieChart.getPositionByAngle(endAngle,radius);
			const prevProperty = init && prevSlicesProperties[i];
			let curStart,curEnd;
			if(init){
				curStart = prevProperty?prevProperty.startPosition : startPosition;
				curEnd = prevProperty? prevProperty.endPosition : startPosition;
			}else{
				curStart = startPosition;
				curEnd = endPosition;
			}
			const curPath = this.makeArcPath(curStart,curEnd);
			let slice = $.createSVG('path',{
				inside:this.draw_area,
				className:'pie-path',
				style:'transition:transform .3s;',
				d:curPath,
				fill:this.colors[i]
			});
			this.slices.push(slice);
			this.slicesProperties.push({
				startPosition,
				endPosition,
				value:total,
				total:this.grand_total,
				startAngle,
				endAngle,
				angle:diffAngle
			});
			if(init){
				this.elements_to_animate.push([{unit: slice, array: this.slices, index: this.slices.length - 1},
					{d:this.makeArcPath(startPosition,endPosition)},
					650, "easein",null,{
						d:curPath
					}]);
			}

		});
		if(init){
			this.run_animation();
		}
	}
	run_animation() {
		// if(this.isAnimate) return ;
		// this.isAnimate = true;
		if(!this.elements_to_animate || this.elements_to_animate.length === 0) return;
		let anim_svg = runSVGAnimation(this.svg, this.elements_to_animate);

		if(this.svg.parentNode == this.chart_wrapper) {
			this.chart_wrapper.removeChild(this.svg);
			this.chart_wrapper.appendChild(anim_svg);

		}

		// Replace the new svg (data has long been replaced)
		setTimeout(() => {
			// this.isAnimate = false;
			if(anim_svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(anim_svg);
				this.chart_wrapper.appendChild(this.svg);
			}
		}, 650);
	}

	calTranslateByAngle(property){
		const{radius,hoverRadio} = this;
		const position = PieChart.getPositionByAngle(property.startAngle+(property.angle / 2),radius);
		return `translate3d(${(position.x) * hoverRadio}px,${(position.y) * hoverRadio}px,0)`;
	}
	hoverSlice(path,i,flag,e){
		if(!path) return;
		if(flag){
			transform(path,this.calTranslateByAngle(this.slicesProperties[i]));
			path.setAttribute('fill',lighten_darken_color(this.colors[i],50));
			let g_off = $.offset(this.svg);
			let x = e.pageX - g_off.left + 10;
			let y = e.pageY - g_off.top - 10;
			let title = (this.formatted_labels && this.formatted_labels.length>0
				? this.formatted_labels[i] : this.labels[i]) + ': ';
			let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);
			this.tip.set_values(x, y, title, percent + "%");
			this.tip.show_tip();
		}else{
			transform(path,'translate3d(0,0,0)');
			this.tip.hide_tip();
			path.setAttribute('fill',this.colors[i]);
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
	bind_tooltip() {
		this.draw_area.addEventListener('mousemove',this.mouseMove);
		this.draw_area.addEventListener('mouseleave',this.mouseLeave);
	}

	show_summary() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			if(d) {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator">
					<i style="background-color:${this.colors[i]};"></i>
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}
