import { docsBuilder } from '../assets/js/docsBuilder';
import { Chart } from "../../dist/frappe-charts.min.esm";
import { demoRegistry } from './demoRegistry';

window.$docsify = {
	name: 'frappe-charts',
	// repo: 'https://github.com/frappe/charts',
	loadSidebar: true,
	executeScript: true,
	plugins: [
		function(hook, vm) {
			hook.doneEach(function() {
				let dbd = new docsBuilder(Chart);

				console.log("inside hook", document.querySelector('.demo'));
				dbd.makeSection(document.querySelector('.demo'), demoRegistry.demo2);
			});
		}
	]
}
