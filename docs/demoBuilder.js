function $$(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

$$.create = (tag, o) => {
	var element = document.createElement(tag);
	let container = null;

	if (o.withLabel) {
		container = document.createElement('div');
		container.classList.add('input-wrapper');
		element.label = document.createElement('label');
		element.label.innerHTML = o.withLabel;
		container.appendChild(element.label);
		container.appendChild(element);
	}

	for (var i in o) {
		var val = o[i];

		if(i === "inside") {
			let child = container ? container : element;

			$$(val).appendChild(child);

		} else if (i === "around") {
			var ref = $$(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);

		} else if (i === "onClick" ) {
			element.addEventListener('click', val);

		} else if (i === "onInput" ) {
			element.addEventListener('input', function(e) {
				val(element.value);
			});

		} else if (i === "onChange" ) {
			element.addEventListener('change', function(e) {
				val(element.value);
			});

		} else if (i === "styles") {
			if(typeof val === "object") {
				Object.keys(val).map(prop => {
					element.style[prop] = val[prop];
				});
			}
		} else if (i in element ) {
			element[i] = val;
		}
		else {
			element.setAttribute(i, val);
		}
	}

	return container ? container : element;
};

function toTitleCase(str) {
    return str.replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function scrub(text) {
	return text.replace(/ /g, "_").toLowerCase();
};

// export class demoBuilder {
class demoBuilder {
	constructor(LIB_OBJ) {
		this.LIB_OBJ = LIB_OBJ;
	}

	makeSection(parent, sys) {
		return new docSection(this.LIB_OBJ, parent, sys);
	}
}

class docSection {
	constructor(LIB_OBJ, parent, sys) {
		this.LIB_OBJ = LIB_OBJ;
		this.parent = parent;
		this.sys = sys;
		this.blockMap = {};
		this.demos = [];

		this.make();
	}

	make() {
		// const section = document.querySelector(this.parent);
		let s = this.sys;
		if(s.title) {
			$$.create('h6', { inside: this.parent, innerHTML: s.title });
		}

		if(s.contentBlocks) {
			s.contentBlocks.forEach((blockConf, index) => {
				this.blockMap[index] = this.getBlock(blockConf);
			});
		} else {
			// TODO:
			this.blockMap['test'] = this.getDemo(s);
		}
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
		return $$.create('p', {
			inside: this.parent,
			className: 'new-context',
			innerHTML: blockConf.content
		});
	}

	getCode(blockConf) {
		let pre = $$.create('pre', { inside: this.parent });
		let lang = blockConf.lang || 'javascript';
		let code = $$.create('code', {
			inside: pre,
			className: `hljs ${lang}`,
			innerHTML: blockConf.content
		});
	}

	getCustom(blockConf) {
		this.parent.innerHTML +=  blockConf.html;
	}

	getDemo(blockConf) {
		let bc = blockConf;
		let args = bc.config;

		let figure, row;
		if(!bc.sideContent) {
			figure = $$.create('figure', { inside: this.parent });
		} else {
			row = $$.create('div', {
				inside: this.parent,
				className: "row",
				innerHTML: `<div class="col-sm-8"></div>
					<div class="col-sm-4"></div>`,
			});
			figure = $$.create('figure', { inside: row.querySelector('.col-sm-8') });
			row.querySelector('.col-sm-4').innerHTML += bc.sideContent;
		}

		let libObj = new this.LIB_OBJ(figure, args);
		let demoIndex = this.demos.length;
		this.demos.push(libObj);

		if(bc.postSetup) {
			bc.postSetup(this.demos[demoIndex], figure, row);
		}

		this.getDemoOptions(demoIndex, bc.options, args, figure);
		this.getDemoActions(demoIndex, bc.actions, args);
	}

	getDemoOptions(demoIndex, options=[], args={}, figure) {
		options.forEach(o => {
			console.log("o", o);
			const btnGroup = $$.create('div', {
				inside: this.parent,
				className: `btn-group ${scrub(o.name)}`
			});
			const mapKeys = o.mapKeys;

			if(o.type === "number") {
				let numOpts = o.numberOptions;
				let activeState = o.activeState ? o.activeState : 0

				const inputGroup = $$.create('input', {
					inside: btnGroup,
					withLabel: o.name + ': ' + '<b>' + activeState + '</b>',
					className: `form-control`,
					type: "range",
					min: numOpts.min,
					max: numOpts.max,
					step: numOpts.step,
					value: activeState,
					// (max - min)/2
					onInput: (value) => {
						if(o.path[1]) {
							args[o.path[0]][o.path[1]] = value;
						} else {
							args[o.path[0]] = value;
						}

						let label = inputGroup.querySelector('label');
						if(label) {
							label.innerHTML = o.name + ': ' + '<b>' + value + '</b>';
						}

						this.demos[demoIndex] = new this.LIB_OBJ(figure, args);
					}
				});

			} else if(["Map", "String", "Boolean", "Array", "Object"].includes(o.type)) {
				args[o.path[0]] = {};

				Object.keys(o.states).forEach(key => {
					let state = o.states[key];
					let activeClass = key === o.activeState ? 'active' : '';

					let button = $$.create('button', {
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
							this.demos[demoIndex] = new this.LIB_OBJ(figure, args);
						}
					});

					if(activeClass) { button.click(); }
				});
			}
		});
	}

	getDemoActions(demoIndex, actions=[], args={}) {
		actions.forEach(o => {
			let args = o.args || [];
			$$.create('button', {
				inside: this.parent,
				className: `btn btn-action btn-sm btn-secondary`,
				innerHTML: o.name,
				onClick: () => {this.demos[demoIndex][o.fn](...args);}
			});
		});
	}
}

