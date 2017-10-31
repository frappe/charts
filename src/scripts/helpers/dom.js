export default function $(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

$.findNodeIndex = (node) =>
{
	var i = 0;
	while (node.previousSibling) {
		node = node.previousSibling;
		i++;
	}
	return i;
};

$.create = (tag, o) => {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
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

	return element;
};

$.createSVG = (tag, o) => {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		}
		else {
			if(i === "className") { i = "class"; }
			if(i === "innerHTML") {
				element['textContent'] = val;
			} else {
				element.setAttribute(i, val);
			}
		}
	}

	return element;
};

$.runSVGAnimation = (svg_container, elements) => {
	// let parent = elements[0][0]['unit'].parentNode;

	let new_elements = [];
	let anim_elements = [];

	elements.map(element => {
		let obj = element[0];
		let parent = obj.unit.parentNode;
		// let index = let findNodeIndex(obj.unit);

		let anim_element, new_element;

		element[0] = obj.unit;

		[anim_element, new_element] = $.animateSVG(...element);

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
};

$.animateSVG = (element, props, dur, easing_type="linear", type=undefined, old_values={}) => {
	let easing = {
		ease: "0.25 0.1 0.25 1",
		linear: "0 0 1 1",
		// easein: "0.42 0 1 1",
		easein: "0.1 0.8 0.2 1",
		easeout: "0 0 0.58 1",
		easeinout: "0.42 0 0.58 1"
	};

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
			keySplines: easing[easing_type],
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
};

$.offset = (element) => {
	let rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	};
};

$.isElementInViewport = (el) => {
	// Although straightforward: https://stackoverflow.com/a/7557433/6495043
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
	);
};

$.bind = (element, o) => {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.addEventListener(event, callback);
			});
		}
	}
};

$.unbind = (element, o) => {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function(event) {
				element.removeEventListener(event, callback);
			});
		}
	}
};

$.fire = (target, type, properties) => {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true );

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
};
