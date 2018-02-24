import { makeSVGGroup } from '../utils/draw';
import { yLine } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine } from '../utils/animate';

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
		animateElements
	}) {
		this.parent = parent;
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.preMake = preMake;
		this.makeElements = makeElements;
		this.postMake = postMake;

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

export function getYAxisComponent(parent, constants, initData) {
	return new ChartComponent({
		parent: parent,
		layerClass: 'y axis',
		constants: constants,
		data: initData,
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

			let extra = newPos.length - oldPos.length;

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
	})
}
