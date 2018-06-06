# Navigation

In order to analyse a data individually, it helps if the chart can activate a given point on the plot. This is where `isNavigable` comes in handy, which makes the chart interactive with arrow keys and highlights the current active data point.

```js
isNavigable: true // default: false
```

Try and traverse this chart with arrow-keys.

<project-demo data="2" v-bind:config="{
        type: 'bar',
        height: 140,
		isNavigable: 1,
        colors: ['light-blue'],
        axisOptions: { xAxisMode: 'tick' },
        barOptions: { spaceRatio: 0.2 },
    }">
</project-demo>

Each time a data point is activated, a new `data-select` event is triggered that contains all the label and value information specific to the point This can then be used to reflect in other parts of the webpage.

```js
chart.parent.addEventListener('data-select', (e) => {
    update_moon_data(e.index); // e contains index and value of current datapoint
});
```
