import BaseChart from './BaseChart';
import $ from '../utils/dom';

export default class PercentageChart extends BaseChart {
	constructor(args) {
		super(args);
		this.type = 'percentage';

		this.get_y_label = this.format_lambdas.y_label;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;

		this.max_slices = 10;
		this.max_legend_points = 6;

		this.colors = args.colors;

		if(!this.colors || this.colors.length < this.data.labels.length) {
			this.colors = ['light-blue', 'blue', 'violet', 'red', 'orange',
				'yellow', 'green', 'light-green', 'purple', 'magenta'];
		}

		this.setup();
	}

	make_chart_area() {
		this.chart_wrapper.className += ' ' + 'graph-focus-margin';
		this.chart_wrapper.style.marginTop = '45px';

		this.stats_wrapper.className += ' ' + 'graph-focus-margin';
		this.stats_wrapper.style.marginBottom = '30px';
		this.stats_wrapper.style.paddingTop = '0px';
	}

	make_draw_area() {
		this.chart_div = $.create('div', {
			className: 'div',
			inside: this.chart_wrapper
		});

		this.chart = $.create('div', {
			className: 'progress-chart',
			inside: this.chart_div
		});
	}

	setup_components() {
		this.percentage_bar = $.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	setup_values() {
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0];});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	setup_utils() { }

	make_graph_components() {
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		this.slices = [];
		this.slice_totals.map((total, i) => {
			let slice = $.create('div', {
				className: `progress-bar background ${this.colors[i]}`,
				inside: this.percentage_bar,
				styles: {
					width: total*100/this.grand_total + "%"
				}
			});
			this.slices.push(slice);
		});
	}

	bind_tooltip() {
		this.slices.map((slice, i) => {
			slice.addEventListener('mouseenter', () => {
				let g_off = $.offset(this.chart_wrapper), p_off = $.offset(slice);

				let x = p_off.left - g_off.left + slice.offsetWidth/2;
				let y = p_off.top - g_off.top - 6;
				let title = (this.formatted_labels && this.formatted_labels.length>0
					? this.formatted_labels[i] : this.labels[i]) + ': ';
				let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);

				this.tip.set_values(x, y, title, percent + "%");
				this.tip.show_tip();
			});
		});
	}

	show_summary() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			if(d) {
				let stats = $.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator ${this.colors[i]}">
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}
