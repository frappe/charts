<div align="center" markdown="1">
    
<img width="80" alt="charts-logo" src="https://github.com/user-attachments/assets/37b7ffaf-8354-48f2-8b9c-fa04fae0135b" />
    
# Frappe Charts
**GitHub-inspired modern, intuitive and responsive charts with zero dependencies**

<p align="center">
    <a href="https://bundlephobia.com/result?p=frappe-charts">
        <img src="https://img.shields.io/bundlephobia/minzip/frappe-charts">
    </a>
</p>

<img src=".github/example.gif">

<div>

[Explore Demos](https://frappe.io/charts) - [Edit at CodeSandbox](https://codesandbox.io/s/frappe-charts-demo-viqud) - [Documentation](https://frappe.io/charts/docs)  

</div>

</div>

## Frappe Charts
Frappe Charts is a simple charting library with a focus on a simple API. The design is inspired by various charts you see on GitHub.

### Motivation

ERPNext needed a simple sales history graph for its user company master to help users track sales. While using c3.js for reports, the library didn’t align well with our product’s classic design. Existing JS libraries were either too complex or rigid in their structure and behavior. To address this, I decided to create a library for translating value pairs into relative shapes or positions, focusing on simplicity.

### Key Features

- **Variety of chart types**: Frappe Charts supports various chart types, including Axis Charts, Area and Trends, Bar, Line, Pie, Percentage, Mixed Axis, and Heatmap.
- **Annotations and tooltips**: Charts can be annotated with x and y markers, regions, and tooltips for enhanced data context and clarity.
- **Dynamic data handling**: Add, remove, or update individual data points in place, or refresh the entire dataset to reflect changes.
- **Customizable configurations**: Flexible options like colors, animations, and custom titles allow for a highly personalized chart experience.

## Installation

Install via [`npm`](https://www.npmjs.com/get-npm):

```sh
$ npm install frappe-charts
```

and include in your project:
```js
import { Chart } from "frappe-charts"
```

Or include following for es-modules(eg:vuejs):
```js
import { Chart } from 'frappe-charts/dist/frappe-charts.esm.js'
// import css
import 'frappe-charts/dist/frappe-charts.min.css'
```

or include within your HTML

```html
<script src="https://cdn.jsdelivr.net/npm/frappe-charts@1.6.1/dist/frappe-charts.min.umd.js"></script>
<!-- or -->
<script src="https://unpkg.com/frappe-charts@1.6.1/dist/frappe-charts.min.umd.js"></script>
```

## Usage
```js
const data = {
    labels: ["12am-3am", "3am-6pm", "6am-9am", "9am-12am",
        "12pm-3pm", "3pm-6pm", "6pm-9pm", "9am-12am"
    ],
    datasets: [
        {
            name: "Some Data", chartType: "bar",
            values: [25, 40, 30, 35, 8, 52, 17, -4]
        },
        {
            name: "Another Set", chartType: "line",
            values: [25, 50, -10, 15, 18, 32, 27, 14]
        }
    ]
}

const chart = new frappe.Chart("#chart", {  // or a DOM element,
                                            // new Chart() in case of ES6 module with above usage
    title: "My Awesome Chart",
    data: data,
    type: 'axis-mixed', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 250,
    colors: ['#7cd6fd', '#743ee2']
})
```

Or for es-modules (replace `new frappe.Chart()` with `new Chart()`):
```diff
- const chart = new frappe.Chart("#chart", {
+ const chart = new Chart("#chart", {  // or a DOM element,
                                    // new Chart() in case of ES6 module with above usage
    title: "My Awesome Chart",
    data: data,
    type: 'axis-mixed', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 250,
    colors: ['#7cd6fd', '#743ee2']
})
```


## Contributing

1. Clone this repo.
2. `cd` into project directory
3. `npm install`
4. `npm i npm-run-all -D` (*optional --> might be required for some developers*)
5. `npm run dev`

## Links

- [Read the blog](https://medium.com/@pratu16x7/so-we-decided-to-create-our-own-charts-a95cb5032c97)


<br>
<br>
<div align="center">
	<a href="https://frappe.io" target="_blank">
		<picture>
			<source media="(prefers-color-scheme: dark)" srcset="https://frappe.io/files/Frappe-white.png">
			<img src="https://frappe.io/files/Frappe-black.png" alt="Frappe Technologies" height="28"/>
		</picture>
	</a>
</div>
