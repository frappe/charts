<div align="center">
    <img src="https://github.com/frappe/design/blob/master/logos/frappe-charts-symbol.svg" height="128">
    <h2>Frappé Charts</h2>
    <p align="center">
        <p>GitHub-inspired modern, intuitive and responsive charts with zero dependencies</p>
        <a href="https://frappe.github.io/charts">
            <b>Explore Demos »</b>
        </a>
    </p>
</div>

<p align="center">
    <a href="http://github.com/frappe/charts/tree/master/dist/js/frappe-charts.min.iife.js">
        <img src="http://img.badgesize.io/frappe/charts/master/dist/frappe-charts.min.iife.js.svg?compression=gzip">
    </a>
</p>

<p align="center">
    <a href="https://frappe.github.io/charts">
        <img src=".github/example.gif">
    </a>
</p>

### Contents
* [Installation](#installation)
* [Usage](#usage)
* [Updates](#updates)
* [License](#license)

#### Installation
* Install via [`npm`](https://www.npmjs.com/get-npm):

  ```console
  $ npm install frappe-charts
  ```

  and include in your project:
  ```js
  import Chart from "frappe-charts/dist/frappe-charts.min.esm"
  ```

* ...or include within your HTML

  ```html
    <script src="https://unpkg.com/frappe-charts@0.0.8/dist/frappe-charts.min.iife.js"></script>
  ```

#### Usage
```js
const data = {
    labels: ["12am-3am", "3am-6pm", "6am-9am", "9am-12am",
        "12pm-3pm", "3pm-6pm", "6pm-9pm", "9am-12am"
    ],
    datasets: [
        {
            title: "Some Data",
            values: [25, 40, 30, 35, 8, 52, 17, -4]
        },
        {
            title: "Another Set",
            values: [25, 50, -10, 15, 18, 32, 27, 14]
        }
    ]
}

const chart = new Chart({
    parent: "#chart", // or a DOM element
    title: "My Awesome Chart",
    data: data,
    type: 'bar', // or 'line', 'scatter', 'pie', 'percentage'
    height: 250,

    colors: ['#7cd6fd', '#743ee2'],

    format_tooltip_x: d => (d + '').toUpperCase(),
    format_tooltip_y: d => d + ' pts'
})
```

If you want to contribute:

1. Clone this repo.
2. `cd` into project directory
3. `npm install`
4. `npm run dev`

#### Updates
##### v0.0.7
- [Custom color values](https://github.com/frappe/charts/pull/71) for charts as hex codes. The API now takes an array of colors for all charts instead of a color for each dataset.
- [@iamkdev's](https://github.com/iamkdev) blog on [usage with Angular](https://medium.com/@iamkdev/frappé-charts-with-angular-c9c5dd075d9f).

##### v0.0.5
- More [flexible Y values](https://github.com/frappe/charts/commit/3de049c451194dcd8e61ff91ceeb998ce131c709): independent from exponent, minimum Y axis point for line graphs.
- Customisable [Heatmap colors](https://github.com/frappe/charts/pull/53); check out the Halloween demo on the [website](https://frappe.github.io/charts) :D
- Tooltip values can be [formatted](https://github.com/frappe/charts/commit/e3d9ed0eae14b65044dca0542cdd4d12af3f2b44).

##### v0.0.4
- Build update: [Shipped](https://github.com/frappe/charts/pull/35) an ES6 module, along with the browser friendly IIFE.

##### v0.0.2
- We have an animated [Pie Chart](https://github.com/frappe/charts/issues/29)! Thanks [@sheweichun](https://github.com/sheweichun).
- [@tobiaslins](https://github.com/tobiaslins) contributed tweaks for his quest to make these easy to use with React. Check out his [repo](https://github.com/tobiaslins/frappe-charts-react-example) and updates at [#24](https://github.com/frappe/charts/issues/24) to learn more :)
- A new logo.

##### v0.0.1
- The very first version out, with animatable bars and lines, a percentage chart and a heatmap. GitHub-style.

#### License
This repository has been released under the [MIT License](LICENSE)

------------------
Project maintained by [Frappe](https://frappe.io).
Used in [ERPNext](https://erpnext.com). Read the [blog post](https://medium.com/@pratu16x7/so-we-decided-to-create-our-own-charts-a95cb5032c97).

