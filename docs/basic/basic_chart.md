## What is it

A chart is generally a 2D rendition of data. For example, for a set of values across items, the data could look like:
```js

data = {
	labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
	datasets: [
		{ values: [18, 40, 30, 35, 8, 52, 17, -4] }
	]
}
```

Plug that in with a type `bar`, a color and height,

```js
new frappe.Chart( "#chart", {
    data: data,
    type: 'bar',
    height: 140,
    colors: ['red']
});
```
<div class="demo" id="bar-basic-1"></div>

And similarly, a `line` chart:

```js
type:'line'
```
<div class="demo" id="line-basic-1"></div>

## Tweaks

Axes lines are configurable. By default they are long `span`ning lines, but can also be short `tick`s:`

```js
axisOptions: {
	xAxisMode: 'tick' // default: 'span'
},
```
<div class="demo" id="bar-axis-tick"></div>

The bar <b>width</b> can be set by defining the <b>ratio of the space</b> between bars to the bar width.

```js
barOptions: {
	spaceRatio: 0.2 // default: 1
},
```
<div class="demo" id="bar-barwidth"></div>

So can the <b>dot size</b> on a line graph, with the `dotSize` property in `lineOptions`.

```js
lineOptions: {
	dotSize: 8 // default: 4
},
```
<div class="demo" id="line-dotsize"></div>

Next up, we'll discover how multiple datasets can behave in different charts.
