import AxisChart from './AxisChart';

export default class BarChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'bar';
		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'tick';
		this.config.yAxisMode = args.yAxisMode || 'span';
	}

	// setUnitWidthAndXOffset() {
	// 	this.state.unitWidth = this.width/(this.state.datasetLength);
	// 	this.state.xOffset = this.state.unitWidth/2;
	// }

	configUnits() {
		this.state.unitArgs = {
			type: 'bar',
			args: {
				spaceWidth: this.state.unitWidth/2,
			}
		};
	}

	// makeOverlay() {
	// 	// Just make one out of the first element
	// 	let index = this.xAxisLabels.length - 1;
	// 	let unit = this.y[0].svg_units[index];
	// 	this.updateCurrentDataPoint(index);

	// 	if(this.overlay) {
	// 		this.overlay.parentNode.removeChild(this.overlay);
	// 	}
	// 	this.overlay = unit.cloneNode();
	// 	this.overlay.style.fill = '#000000';
	// 	this.overlay.style.opacity = '0.4';
	// 	this.drawArea.appendChild(this.overlay);
	// }

	// bindOverlay() {
	// 	// on event, update overlay
	// 	this.parent.addEventListener('data-select', (e) => {
	// 		this.update_overlay(e.svg_unit);
	// 	});
	// }

	// bind_units(units_array) {
	// 	units_array.map(unit => {
	// 		unit.addEventListener('click', () => {
	// 			let index = unit.getAttribute('data-point-index');
	// 			this.updateCurrentDataPoint(index);
	// 		});
	// 	});
	// }

	// update_overlay(unit) {
	// 	let attributes = [];
	// 	Object.keys(unit.attributes).map(index => {
	// 		attributes.push(unit.attributes[index]);
	// 	});

	// 	attributes.filter(attr => attr.specified).map(attr => {
	// 		this.overlay.setAttribute(attr.name, attr.nodeValue);
	// 	});

	// 	this.overlay.style.fill = '#000000';
	// 	this.overlay.style.opacity = '0.4';
	// }

	// onLeftArrow() {
	// 	this.updateCurrentDataPoint(this.currentIndex - 1);
	// }

	// onRightArrow() {
	// 	this.updateCurrentDataPoint(this.currentIndex + 1);
	// }

}
