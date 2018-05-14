import { docsBuilder } from './assets/js/docsBuilder';
import { Chart } from "../dist/frappe-charts.min.esm";
import { demoRegistry } from './demoRegistry';

import { $, insertAfter } from '../src/js/utils/dom';
import { fireballOver25, fireball_2_5, fireball_5_25 } from './assets/js/data';
import { lineComposite, barComposite, demoSections} from './assets/js/demoConfig';

let dbd = new docsBuilder(Chart);
let currentElement = document.querySelector('header');

if(document.querySelectorAll('#line-composite-1').length
	&& !document.querySelector('#home-page').classList.contains("hide")) {

	let lineCompositeChart = new Chart("#line-composite-1", lineComposite.config);
	let barCompositeChart = new Chart("#bar-composite-1", barComposite.config);

	lineCompositeChart.parent.addEventListener('data-select', (e) => {
		let i = e.index;
		barCompositeChart.updateDatasets([
			fireballOver25[i], fireball_5_25[i], fireball_2_5[i]
		]);
	});

	demoSections.forEach(sectionConf => {
		let sectionEl = $.create('section', { className: sectionConf.name || sectionConf.title });
		insertAfter(sectionEl, currentElement);
		currentElement = sectionEl;
		dbd.makeSection(sectionEl, sectionConf);
	});
}

window.$docsify = {
	name: 'frappe-charts',
	// repo: 'https://github.com/frappe/charts',
	loadSidebar: true,
	subMaxLevel: 2,
	executeScript: true,
	plugins: [
		function(hook, vm) {
			hook.doneEach(function() {
				let demos = document.querySelectorAll('.demo')

				for (var i = 0; i < demos.length; ++i) {
					let el = demos[i];
					let id = el.getAttribute("id");
					dbd.makeSection(el, demoRegistry[id]);
				}

				// document.querySelector("main").classList.add("hide");
			});
		}
	]
}

document.querySelector("#docs-link").addEventListener('click', () => {
	document.querySelector("#home-page").classList.add("hide");
	document.querySelector("main").classList.remove("hide");
});
