## Axis chart: what is it

An axis chart is generally a 2D rendition of data, where a set of values corresponds to every point in a dataset. That's why, data is the most important component for a chart. For example, for some values across items, the data could look like:
```js
data = {
	labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
	datasets: [
		{ values: [18, 40, 30, 35, 8, 52, 17, -4] }
	]
}
```

Rendering it doesn't require much more that that. Plug the data in with a [type]() `bar`, with an optional [color]() and [height]():

```js
new frappe.Chart( "#chart", {
    data: data,
    type: 'bar',
    height: 140,
    colors: ['red']
});
```
<chart-demo
    data="0"
    v-bind:config="{ type: 'bar', height: 140, colors:['red'] }">
</chart-demo>


And similarly, a `line` chart is data-wise homomorphic to a bar chart:

```js
type:'line'
```
<chart-demo
    data="0"
    v-bind:config="{ type: 'line', height: 140, colors:['red'] }">
</chart-demo>


## Adding more datasets

A chart can have multiple datasets. In an axis chart, every dataset is represented individually.

```js
data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
      { name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
}
```
Notice that this case demonstrates why the `colors` option is an array. We'll see more about it ahead.
<chart-demo data="1" v-bind:config="{
        type: 'line',
        height: 200,
        colors:['green', 'light-green']
    }"
    v-bind:options="[
        {
            name: 'type',
            path: ['type'],
            type: 'string',
            states: { 'Line': 'line', 'Bar': 'bar' },
            activeState: 'Mixed'
        }
    ]">
</chart-demo>


## Responsiveness

Frappe Charts are responsive, as they rerender all the data in the current available container width. To demonstrate, let's take the example of setting the [bar width]() for bar charts.

In order to set the bar width, instead of defining it and the space between the bars independently, we simply define the <b>ratio of the space</b> between bars to the bar width. The chart then adjusts the actual size proportional to the chart container.

```js
barOptions: {
	spaceRatio: 0.2 // default: 1
},
```
Try resizing the window to see the effect, with different ratio values.

<chart-demo data="2" v-bind:config="{
        type: 'bar',
        height: 140,
        colors: ['orange'],
        axisOptions: { xAxisMode: 'tick' },
        barOptions: { spaceRatio: 0.2 },
    }"
    v-bind:options="[
        {
            name: 'barOptions',
            path: ['barOptions', 'spaceRatio'],
            type: 'number',
            numberOptions: { min: 0.1, max: 1.9, step: 0.1 },
            activeState: 0.2
        }
    ]">
</chart-demo>


## More Tweaks

Axis lines define a chart presentation. By default they are long `span`ning lines, but to give prominence to data points, X and/or Y axes can also be short `tick`s:

```js
axisOptions: {
	xAxisMode: 'tick' // default: 'span'
},
```
<chart-demo
    data="2"
    v-bind:config="{
        type: 'bar',
        height: 140,
        colors:['blue'],
        axisOptions: { xAxisMode: 'tick' }
    }">
</chart-demo>


Just like bar width, we can set the <b>dot size</b> on a line graph, with the [`dotSize`]() property in [`lineOptions`]().

```js
lineOptions: {
	dotSize: 8 // default: 4
},
```
<chart-demo data="2" v-bind:config="{
        type: 'line',
        height: 140,
        colors:['orange'],
        axisOptions: { xAxisMode: 'tick' },
        lineOptions: { dotSize: 8 }
    }"
    v-bind:options="[
        {
            name: 'lineOptions',
            path: ['lineOptions', 'dotSize'],
            type: 'number',
            numberOptions: { min: 3, max: 10, step: 1 },
            activeState: 8
        }
    ]">
</chart-demo>


These were some of the basic toggles to a chart; there are quite a few line options to go with, particularly to create [regions](). We'll look at those in next section.
