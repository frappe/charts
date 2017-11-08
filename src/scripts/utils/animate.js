// Leveraging SMIL Animations

const EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

function animateSVG(element, props, dur, easing_type="linear", type=undefined, old_values={}) {

	let anim_element = element.cloneNode(true);
	let new_element = element.cloneNode(true);

	for(var attributeName in props) {
		let animate_element;
		if(attributeName === 'transform') {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		let current_value = old_values[attributeName] || element.getAttribute(attributeName);
		let value = props[attributeName];

		let anim_attr = {
			attributeName: attributeName,
			from: current_value,
			to: value,
			begin: "0s",
			dur: dur/1000 + "s",
			values: current_value + ";" + value,
			keySplines: EASING[easing_type],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if(type) {
			anim_attr["type"] = type;
		}

		for (var i in anim_attr) {
			animate_element.setAttribute(i, anim_attr[i]);
		}

		anim_element.appendChild(animate_element);

		if(type) {
			new_element.setAttribute(attributeName, `translate(${value})`);
		} else {
			new_element.setAttribute(attributeName, value);
		}
	}

	return [anim_element, new_element];
}

export function transform(element, style) { // eslint-disable-line no-unused-vars
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
}

export function runSVGAnimation(svg_container, elements) {
	let new_elements = [];
	let anim_elements = [];

	elements.map(element => {
		let obj = element[0];
		let parent = obj.unit.parentNode;

		let anim_element, new_element;

		element[0] = obj.unit;
		[anim_element, new_element] = animateSVG(...element);

		new_elements.push(new_element);
		anim_elements.push([anim_element, parent]);

		parent.replaceChild(anim_element, obj.unit);

		if(obj.array) {
			obj.array[obj.index] = new_element;
		} else {
			obj.object[obj.key] = new_element;
		}
	});

	let anim_svg = svg_container.cloneNode(true);

	anim_elements.map((anim_element, i) => {
		anim_element[1].replaceChild(new_elements[i], anim_element[0]);
		elements[i][0] = new_elements[i];
	});

	return anim_svg;
}
