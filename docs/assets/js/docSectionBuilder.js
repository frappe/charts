import { $ } from '../../../src/js/utils/dom';
import { toTitleCase } from '../../../src/js/utils/helpers';

export class docSectionBuilder {
	constructor(LIB_OBJ) {
		this.LIB_OBJ = LIB_OBJ;
	}

	setParent(parent) {
		// this.parent = parent;
		this.section = parent;
	}

	setSys(sys) {
		this.sys = sys;
		this.blockMap = {};
	}

	make() {
		// const section = document.querySelector(this.section);
		let s = this.sys;
		$.create('h6', { inside: this.section, innerHTML: s.title });

		s.contentBlocks.forEach((blockConf, index) => {
			this.blockMap[index] = this.getBlock(blockConf);
		});
	}

	getBlock(blockConf) {
		let fnName = 'get' + toTitleCase(blockConf.type);
		if(this[fnName]) {
			return this[fnName](blockConf);
		} else {
			throw new Error(`Unknown section block type '${blockConf.type}'.`);
		}
	}
	getText(blockConf) {
		return $.create('p', {
			inside: this.section,
			innerHTML: blockConf.content
		});
	}
	getCode(blockConf) {
		let pre = $.create('pre', { inside: this.section });
		let lang = blockConf.lang || 'javascript';
		let code = $.create('code', {
			inside: pre,
			className: `hljs ${lang}`,
			innerHTML: blockConf.content
		});
	}
	getCustom(blockConf) {
		this.section.innerHTML +=  blockConf.html;
	}
	getDemo(blockConf) {
		let args = blockConf.config;
		let figure = $.create('figure', { inside: this.section });
		this.libObj = new this.LIB_OBJ(figure, args);

		this.getDemoOptions(blockConf.options, args, figure);
		this.getDemoActions(blockConf.actions, args);
	}
	getDemoOptions(options, args, figure) {
		options.forEach(o => {
			const btnGroup = $.create('div', {
				inside: this.section,
				className: `btn-group ${o.name}`
			});
			const mapKeys = o.mapKeys;

			if(o.type === "map") {
				args[o.path[0]] = {};
			}

			Object.keys(o.states).forEach(key => {
				let state = o.states[key];
				let activeClass = key === o.activeState ? 'active' : '';

				let button = $.create('button', {
					inside: btnGroup,
					className: `btn btn-sm btn-secondary ${activeClass}`,
					innerHTML: key,
					onClick: (e) => {
						// map
						if(o.type === "map") {
							mapKeys.forEach((attr, i) => {
								args[o.path[0]][attr] = state[i];
							})
						} else {
							// boolean, string, number, object
							args[o.path[0]] = state;
						}
						this.libObj = new this.LIB_OBJ(figure, args);
					}
				});

				if(activeClass) { button.click(); }
			});
		});
	}

	getDemoActions(actions, args) {
		actions.forEach(o => {
			let args = o.args || [];
			$.create('button', {
				inside: this.section,
				className: `btn btn-sm btn-secondary`,
				innerHTML: o.name,
				onClick: () => {this.libObj[o.fn](...o.args);}
			});
		});
	}
}

