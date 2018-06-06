# API

## Modifying Data
There are two ways to update data in a chart: either in adding and removing individual points, or updating the existing data with an entirely new set of data points.

### Updating individual data points

#### addDataPoint
Add a data point to the chart, increasing the length of the dataset.

```js
addDataPoint(label: String, valueFromEachDataset: Array, index: Number): void

// Usage
let label = 'Wed';
let valueFromEachDataset = [30, 17];

chart.addDataPoint(label, valueFromEachDataset); // by default adds at end
chart.addDataPoint(label, valueFromEachDataset, 6);
```

#### removeDataPoint
Remove a data point from the chart, reducing the length of the dataset.

```js
removeDataPoint(index: Number): void

// Usage
chart.removeDataPoint(); // by default removes from end
chart.removeDataPoint(10);
```

### Updating full data

#### update

Update the entire data, including annotations, by passing the entire new `data` object to `update`.

```js
update(data: Object): void

// Usage
chart.update(data);
```

## Exporting

#### export

Frappe charts are exportable to an SVG format, in which they are natively rendered.

```js
export(): void

// Usage
chart.export();
```
