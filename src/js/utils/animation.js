// Leveraging SMIL Animations

import { REPLACE_ALL_NEW_DUR } from './animate';

const EASING = {
	ease: "0.25 0.1 0.25 1",
	linear: "0 0 1 1",
	// easein: "0.42 0 1 1",
	easein: "0.1 0.8 0.2 1",
	easeout: "0 0 0.58 1",
	easeinout: "0.42 0 0.58 1"
};

function animateSVGElement(element, props, dur, easingType="linear", type=undefined, oldValues={}) {

	let animElement = element.cloneNode(true);
	let newElement = element.cloneNode(true);

	for(var attributeName in props) {
		let animateElement;
		if(attributeName === 'transform') {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		let currentValue = oldValues[attributeName] || element.getAttribute(attributeName);
		let value = props[attributeName];

		let animAttr = {
			attributeName: attributeName,
			from: currentValue,
			to: value,
			begin: "0s",
			dur: dur/1000 + "s",
			values: currentValue + ";" + value,
			keySplines: EASING[easingType],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		};

		if(type) {
			animAttr["type"] = type;
		}

		for (var i in animAttr) {
			animateElement.setAttribute(i, animAttr[i]);
		}

		animElement.appendChild(animateElement);

		if(type) {
			newElement.setAttribute(attributeName, `translate(${value})`);
		} else {
			newElement.setAttribute(attributeName, value);
		}
	}

	return [animElement, newElement];
}

export function transform(element, style) { // eslint-disable-line no-unused-vars
	element.style.transform = style;
	element.style.webkitTransform = style;
	element.style.msTransform = style;
	element.style.mozTransform = style;
	element.style.oTransform = style;
}

function animateSVG(svgContainer, elements) {
	let newElements = [];
	let animElements = [];

	elements.map(element => {
		let unit = element[0];
		let parent = unit.parentNode;

		let animElement, newElement;

		element[0] = unit;
		[animElement, newElement] = animateSVGElement(...element);

		newElements.push(newElement);
		animElements.push([animElement, parent]);

		parent.replaceChild(animElement, unit);
	});

	let animSvg = svgContainer.cloneNode(true);

	animElements.map((animElement, i) => {
		animElement[1].replaceChild(newElements[i], animElement[0]);
		elements[i][0] = newElements[i];
	});

	return animSvg;
}

export function runSMILAnimation(parent, svgElement, elementsToAnimate) {
	if(elementsToAnimate.length === 0) return;

	let animSvgElement = animateSVG(svgElement, elementsToAnimate);
	if(svgElement.parentNode == parent) {
		parent.removeChild(svgElement);
		parent.appendChild(animSvgElement);

	}

	// Replace the new svgElement (data has already been replaced)
	setTimeout(() => {
		if(animSvgElement.parentNode == parent) {
			parent.removeChild(animSvgElement);
			parent.appendChild(svgElement);
		}
	}, REPLACE_ALL_NEW_DUR);
}
