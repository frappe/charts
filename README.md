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
    <script src="https://unpkg.com/frappe-charts@0.0.4/dist/frappe-charts.min.iife.js"></script>
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
            color: "light-blue",
            values: [25, 40, 30, 35, 8, 52, 17, -4]
        },
        {
            title: "Another Set",
            color: "violet",
            values: [25, 50, -10, 15, 18, 32, 27, 14]
        }
    ]
}

const chart = new Chart({
    parent: '#chart',
    title: "My Awesome Chart",
    data: data,
    type: 'bar', // or 'line', 'scatter', 'pie', 'percentage'
    height: 250
})
```

If you want to contribute:

1. Clone this repo.
2. `cd` into project directory
3. `npm install`
4. `npm run dev`

#### License
This repository has been released under the [MIT License](LICENSE)

------------------
Made with ♥ by [pratu16x7](https://github.com/pratu16x7). Awesome logo by [raghukamath](https://github.com/raghukamath).
Project maintained by [frappe](https://github.com/frappe).
