#### Mixed Bar/Line Chart

As we have seen, chart can have [multiple datasets](/basic/basic_chart?id=adding-more-datasets). Each dataset can also have a different `chartType`, which if specified, should accompany the `type` property set to `axis-mixed`.

```js
data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        name: "Dataset 1",
        values: [18, 40, 30, 35, 8, 52, 17, -4],
        chartType: 'bar'
      },
      {
        name: "Dataset 2",
        values: [30, 50, -10, 15, 18, 32, 27, 14],
        chartType: 'line'
      }
    ]
},

type: 'axis-mixed'
```
This allows for creation of mixed axis chart. It is recommended to list the bar datasets before the line ones to avoid overlapping.
<project-demo data="mixed-1" v-bind:config="{
        type: 'axis-mixed',
        height: 200,
        colors:['light-green', 'green']
    }">
</project-demo>

All the `lineOptions` and `barOptions` apply to mix and match datasets as well.

<project-demo data="mixed-2" v-bind:config="{
        type: 'axis-mixed',
        height: 240,
        colors:['light-green', 'green', 'blue'],
        lineOptions: {
          dotSize: 4
        },
        barOptions: {
          spaceRatio: 0.4
        },
    }"
    v-bind:options="[
        {
            name: 'barOptions',
            path: ['barOptions', 'spaceRatio'],
            type: 'number',
            numberOptions: { min: 0.1, max: 1.9, step: 0.1 },
            activeState: 0.4
        },
        {
            name: 'lineOptions',
            path: ['lineOptions', 'dotSize'],
            type: 'number',
            numberOptions: { min: 3, max: 10, step: 1 },
            activeState: 4
        }
    ]">
</project-demo>

Infact, one of the bar options is actually dependent on multiple datasets.

#### Stacked Bar Chart

Unlike lines, bars have two ways to show multiple data point values: adjacent or stacked bars. Stacked bar charts are similar to area charts, being useful for comparisions of similar trends. The property [`stacked`]() in `barOptions` renders a stacked bar chart instead of the default adjacent bars:

```js
barOptions: {
  stacked: 1    // default 0, i.e. adjacent
}
```
<project-demo data="bar-composite-data" v-bind:config="{
      type: 'bar',
      height: 240,
      colors:['blue', 'green', 'light-green'],
      barOptions: {
        spaceRatio: 0.4,
        stacked: 1
      },
    }"
    v-bind:options="[
      {
        name: 'barOptions',
        path: ['barOptions', 'stacked'],
        type: 'Boolean',
        states: { 'Stacked': 1, 'Adjacent': 0 },
        activeState: 1
      }
    ]">
</project-demo>


In [Aggregation Charts]() however, instead of being rendered individually, each data point in aggregated accross every dataset. We'll cover those next.
