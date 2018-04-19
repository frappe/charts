import { $ } from '../utils/dom';
import { TOOLTIP_POINTER_TRIANGLE_HEIGHT } from '../utils/constants';

export default class SvgTip {
	constructor({
		parent = null,
		colors = []
	}) {
		this.parent = parent;
		this.colors = colors;
		this.titleName = '';
		this.titleValue = '';
		this.listValues = [];
		this.titleValueFirst = 0;

		this.x = 0;
		this.y = 0;

		this.top = 0;
		this.left = 0;

		this.setup();
	}

	setup() {
		this.makeTooltip();
	}

	refresh() {
		this.fill();
		this.calcPosition();
	}

	makeTooltip() {
		this.container = $.create('div', {
			inside: this.parent,
			className: 'graph-svg-tip comparison',
			innerHTML: `<span class="title"></span>
				<ul class="data-point-list"></ul>
				<div class="svg-pointer"></div>`
		});
		this.hideTip();

		this.title = this.container.querySelector('.title');
		this.dataPointList = this.container.querySelector('.data-point-list');

		this.parent.addEventListener('mouseleave', () => {
			this.hideTip();
		});
	}

	fill() {
		let title;
		if(this.index) {
			this.container.setAttribute('data-point-index', this.index);
		}
		if(this.titleValueFirst) {
			title = `<strong>${this.titleValue}</strong>${this.titleName}`;
		} else {
			title = `${this.titleName}<strong>${this.titleValue}</strong>`;
		}
		this.title.innerHTML = title;
		this.dataPointList.innerHTML = '';

		this.listValues.map((set, i) => {
			const color = this.colors[i] || 'black';
			let value = set.formatted === 0 || set.formatted ? set.formatted : set.value;

			let li = $.create('li', {
				styles: {
					'border-top': `3px solid ${color}`
				},
				innerHTML: `<strong style="display: block;">${ value === 0 || value ? value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.dataPointList.appendChild(li);
		});
	}

	calcPosition() {
		let width = this.container.offsetWidth;

		this.top = this.y - this.container.offsetHeight
			- TOOLTIP_POINTER_TRIANGLE_HEIGHT;
		this.left = this.x - width/2;
		let maxLeft = this.parent.offsetWidth - width;

		let pointer = this.container.querySelector('.svg-pointer');

		if(this.left < 0) {
			pointer.style.left = `calc(50% - ${-1 * this.left}px)`;
			this.left = 0;
		} else if(this.left > maxLeft) {
			let delta = this.left - maxLeft;
			let pointerOffset = `calc(50% + ${delta}px)`;
			pointer.style.left = pointerOffset;

			this.left = maxLeft;
		} else {
			pointer.style.left = `50%`;
		}
	}

	setValues(x, y, title = {}, listValues = [], index = -1) {
		this.titleName = title.name;
		this.titleValue = title.value;
		this.listValues = listValues;
		this.x = x;
		this.y = y;
		this.titleValueFirst = title.valueFirst || 0;
		this.index = index;
		this.refresh();
	}

	hideTip() {
		this.container.style.top = '0px';
		this.container.style.left = '0px';
		this.container.style.opacity = '0';
	}

	showTip() {
		this.container.style.top = this.top + 'px';
		this.container.style.left = this.left + 'px';
		this.container.style.opacity = '1';
	}
}
