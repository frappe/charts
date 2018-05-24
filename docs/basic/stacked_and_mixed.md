## Adding more datasets

As we have seen, chart can have [multiple datasets](). In an axis chart, every dataset is represented individually.

```js
data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
      { name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
}
```
<div class="demo" id="multi-dataset-line-bar"></div>

## Stacked Bar Chart

Bars have two ways to show multiple data point values. The property [`stacked`]() in `barOptions` renders a stacked bar chart instead of the default adjacent bars:

```js
barOptions: {
  stacked: 1    // default 0
}
```

[stacked/adjacent]


## Mixed Bar/Line Chart
Each dataset can also have a different `chartType`, which if specified, will take precedence over the `type` property.

```js
data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
      { name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
}
```


All the `lineOptions` and `barOptions` apply to mix and match datasets as well.

[mix and match demo, no buttons]

In [Aggregation Charts]() however, instead of being rendered individually, each data point in aggregated accross every dataset. We'll cover those next.
