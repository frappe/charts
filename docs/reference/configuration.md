# Configuration

With all the customizable features of Frappe Charts, this section is dedicated to enabling / disabling existing functionality.

## Container

The first parameter required by the `Chart` constructor is the container element. You can pass in a CSS Selector or a DOM Object.

```javascript
const chart = new Chart('#chart', options);
// or
const container = document.querySelector('#chart');
const chart = new Chart(container, options);
```

## Options

The second parameter required by the `Chart` constructor is the options object. The minimum required configuration is to pass `data` values, which itself requires an array of `labels` and an array of `datasets`.

```javascript
const options = {
    data: {
        labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm", "12pm-3pm"],

        datasets: [
            {
                name: "Some Data", values: [25, 40, 30, 35, 8]
            },
            {
                name: "Another Set", values: [25, 50, -10, 15, 18]
            }
        ]
    }
}

const chart = new Chart(container, options);
```

### data
 - Type: `Object`
 - Required Properties: `labels`, `datasets`
 - Optional Properties: `yMarkers`, `yRegions`

Contains an array of `labels` and an array of `datasets`, each a value for the 2-dimensional data points.

May also have [annotation]() parameters, for example those for `yMarkers` and `yRegions`. This is because all properties defined inside data are meant to be animatable.
```javascript
data: {
    labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm", "12pm-3pm"],

    datasets: [
        { name: "Some Data", values: [25, 40, 30, 35, 8] },
        { name: "Another Set", values: [25, 50, -10, 15, 18] }
    ],

    yMarkers: [{ label: "Marker", value: 70 }],

    yRegions: [{ label: "Region", start: -10, end: 50 }]
}
```

Other configurable options are listed as follows:

### title
 - Type: `String`
 - Default: `''`

Add a title to the Chart.

---

### type
 - Type: `String`
 - Values: `line | bar | axis-mixed | pie | percentage | heatmap`
 - Default: `line`

Let the chart know what type to render.

#### type: 'axis-mixed'

Mixed axis chart. For this to work, you must pass the `chartType` value for each dataset.

```javascript

const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    datasets: [
        {
            name: "Some Data",
            values: [18, 40, 30, 35, 8, 52, 17],
            chartType: 'bar'
        },
        {
            name: "Yet Another",
            values: [15, 20, -3, -15, 58, 12, -17],
            chartType: 'line'
        }
    ]
}

const chart = new Chart('#chart', {
    data: data
});

```

---

### colors
 - Type: `Array`
 - Default: `['light-blue', 'blue', 'violet', 'red', 'orange',
	'yellow', 'green', 'light-green', 'purple', 'magenta', 'light-grey', 'dark-grey']`

Set the colors to be used for each individual unit type, depending on the chart type.

---

### height
 - Type: `Number`
 - Default: `240`

Set the height of the chart in pixels.

---

### axisOptions
 - Type: `Object`
 - Default: `{}`

#### xAxisMode and yAxisMode
 - Type: `String`
 - Values: `span | tick`
 - Default: `span`

Display axis points as short ticks or long spanning lines.

#### xIsSeries
 - Type: `Boolean`
 - Default: `0`

The X axis (often the time axis) is usually continuous. That means we can reduce the redundancy of rendering every X label by setting `xIsSeries` to `1` and allowing only a few periodic ones.

---

### TooltipOptions
 - Type: `Object`
 - Default: `{}`

Customizing options for the format of the label and value displayed on hover tooltips.

####
 - Type: `function`
 - Default: `{}`

---

### barOptions
 - Type: `Object`
 - Default: `{}`

Can be used to set various properties on bar plots.

#### spaceRatio
 - Type: `Number`
 - Min: `0`
 - Max: `2`
 - Default: `0.5`

In order to set the bar width, instead of defining it and the space between the bars independently, we simply define the <b>ratio of the space</b> between bars to the bar width. The chart then adjusts the actual size proportional to the chart container.

#### stacked
 - Type: `Boolean`
 - Default: `0`

Renders multiple bar datasets in a stacked configuration, rather than the default adjacent.

---

### lineOptions
 - Type: `Object`
 - Default: `{}`

Can be used to set various properties on line plots, turn them into Area Charts and so on. Explore in details on the [Trends]() page.

---

### isNavigable
 - Type: `Boolean`
 - Default: `0`

Makes the chart interactive with arrow keys and highlights the current active data point.

---

### valuesOverPoints
 - Type: `Boolean`
 - Default: `0`

To display data values over bars or dots in an axis graph.
