import { $, insertAfter } from '../../../src/js/utils/dom';
import { fireballOver25, fireball_2_5, fireball_5_25 } from './data';
import { lineComposite, barComposite, demoSections} from './demoConfig';
import { docSections } from './docsConfig';
import { docsBuilder } from './docsBuilder';

let Chart = frappe.Chart; // eslint-disable-line no-undef
let dbd = new docsBuilder(Chart);
let currentElement = document.querySelector('header');
let sections = [];

if(document.querySelectorAll('#line-composite-1').length) {
	let lineCompositeChart = new Chart("#line-composite-1", lineComposite.config);
	let barCompositeChart = new Chart("#bar-composite-1", barComposite.config);

	lineCompositeChart.parent.addEventListener('data-select', (e) => {
		let i = e.index;
		barCompositeChart.updateDatasets([
			fireballOver25[i], fireball_5_25[i], fireball_2_5[i]
		]);
	});

	sections = demoSections;
}

// else {
// 	sections = docSections;
// }

sections.forEach(sectionConf => {
	let sectionEl = $.create('section', { className: sectionConf.name || sectionConf.title });
	insertAfter(sectionEl, currentElement);
	currentElement = sectionEl;
	dbd.makeSection(sectionEl, sectionConf);
});
