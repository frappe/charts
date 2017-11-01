<div align="center">
    <img src="https://github.com/frappe/design/blob/master/logos/frappe-charts-symbol.svg" width="100px" height="auto">
    <h1>
      <a href="https://frappe.github.io/charts">
        Frappé Charts
      </a>
    </h1>
    <p>
        GitHub-inspired simple and responsive charts with zero dependencies.
    </p>
    <img src="https://user-images.githubusercontent.com/5196925/32153733-4a747898-bd52-11e7-9248-15ba307d3142.gif">
</div>

More information at the website: https://frappe.github.io/charts<br>
Core build: ~14kb gzipped

### Usage

Install
```
npm install frappe-charts
```

Include it in your app:
```
import Chart from 'frappe-charts';
```

Make a new Chart:
```js
let data = {
  labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
    "12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],

  datasets: [
    {
      title: "Some Data", color: "light-blue",
      values: [25, 40, 30, 35, 8, 52, 17, -4]
    },
    {
      title: "Another Set", color: "violet",
      values: [25, 50, -10, 15, 18, 32, 27, 14]
    }
  ]
};

let chart = new Chart({
  parent: "#chart",
  title: "My Awesome Chart",
  data: data,
  type: 'bar', // or 'line', 'scatter', 'percentage'
  height: 250
});
```

If you want to contribute:

1. Clone this repo.
2. `cd` into project directory
3. `npm install`
4. `npm run dev`

License: MIT

------------------
Made with ♥ by [pratu16x7](https://github.com/pratu16x7). Project maintained by [frappe](https://github.com/frappe)
