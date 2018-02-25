import { makeSVGGroup } from '../utils/draw';
import { xLine, yLine } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine, translateVertLine } from '../utils/animate';

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		parent,
		constants,
		data,

		// called on update
		preMake,
		makeElements,
		postMake,
		getData,
		animateElements
	}) {
		this.parent = parent;
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.preMake = preMake;
		this.makeElements = makeElements;
		this.postMake = postMake;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.layer = makeSVGGroup(this.parent, this.layerClass, this.layerTransform);

		this.data = data;

		this.make();
	}

	refresh(data) {
		this.data = data;
	}

	make() {
		this.preMake && this.preMake();
		this.render(this.data);
		this.postMake && this.postMake();
		this.oldData = this.data;
	}

	render(data) {
		this.store = this.makeElements(data);

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	update(animate = true) {
		let animateElements = []
		if(animate) {
			animateElements = this.animateElements(this.data);
		}
		// TODO: Can we remove this?
		setTimeout(() => {
			this.make();
		}, 1400);
		return animateElements;
	}
}

let componentConfigs = {
	yAxis: {
		layerClass: 'y axis',
		makeElements: function(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements: function(newData) {
			let newPos =  newData.positions;
			let newLabels =  newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map((line, i) => {
				return translateHoriLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	xAxis: {
		layerClass: 'x axis',
		makeElements: function(data) {
			return data.positions.map((position, i) =>
				xLine(position, data.labels[i], this.constants.height,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements: function(newData) {
			let newPos =  newData.positions;
			let newLabels =  newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map((line, i) => {
				return translateVertLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	}
}

export function getComponent(name, parent, constants, initData, getData) {
	let config = componentConfigs[name];
	Object.assign(config, {
		parent: parent,
		constants: constants,
		data: initData,
		getData: getData
	})
	return new ChartComponent(config);
}
