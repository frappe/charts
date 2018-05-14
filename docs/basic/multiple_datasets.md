## Multiple datasets

A chart can have multiple datasets. In an axis chart, every dataset is represented individually.

```js
data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
		{ name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
		{ name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
},
```
<div class="demo" id="multi-dataset-line-bar"></div>
