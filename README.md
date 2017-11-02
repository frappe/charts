<div align="center">
    <img src=".github/logo.png" height="256">
    <h2>Frappé Charts</h2>
    <p align="center">
        <h3>A <b>zero-dependency</b> GitHub-inspired modern, intuitive and responsive charting library</h3>
        <a href="https://frappe.github.io/charts">
            Explore the Demos »
        </a>
    </p>
</div>

<p align="center">
    <a href="https://www.npmjs.com/package/frappe-charts">
        <img src="https://img.shields.io/npm/v/frappe-charts.svg?maxAge=2592000">
    </a>
    <a href="https://www.npmjs.com/package/frappe-charts">
        <img src="https://img.shields.io/npm/dm/frappe-charts.svg?maxAge=2592000">
    </a>
    <a href="https://www.npmjs.com/package/frappe-charts">
        <img src="https://img.shields.io/npm/dt/frappe-charts.svg?maxAge=2592000">
    </a>
    <a href="http://github.com/frappe/charts/tree/master/dist/js/frappe-charts.min.js">
        <img src="http://img.badgesize.io/frappe/charts/master/dist/js/frappe-charts.min.js?compression=gzip&label=size">
    </a>
    <a href="https://saythanks.io/to/frappe">
        <img src="https://img.shields.io/badge/Say%20Thanks-🦉-1EAEDB.svg?style=flat-square">
    </a>
    <a href="https://paypal.me/erpnext">
        <img src="https://img.shields.io/badge/donate-💵-f44336.svg?style=flat-square">
    </a>
</p>

<p align="center">
    <a href="https://frappe.github.io/charts">
        <img src=".github/example.gif" height="300">
    </a>
</p>

### Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [License](#license)

#### Installation
* Install via [`npm`](https://www.npmjs.com/get-npm):
  ```console
  $ npm install frappe-charts
  ```
* ... or include in your HTML
```html
  <script src="https://raw.githubusercontent.com/frappe/charts/master/dist/frappe-charts.min.js"></script>
```

### Usage
```js
const data = {
    labels: ["12 A.M. - 3 A.M.", "3 A.M. - 6 P.M.", "6 A.M. - 9 A.M",
        "9 A.M. - 12 A.M.", "12 P.M. - 3 P.M.", "3 P.M. - 6 P.M.",
        "6 P.M. - 9 P.M.", "9 A.M. - 12 A.M."
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
    type: 'bar', // or 'line', 'scatter', 'percentage'
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
Made with ♥ by [pratu16x7](https://github.com/pratu16x7). Project maintained by [frappe](https://github.com/frappe)
