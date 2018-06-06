# Modifying Data

There are two ways to update data in a chart: either in adding and removing individual points, or updating the existing data with an entirely new set of data points.

### Updating individual data points

```js
let label = 'Wed';
let valueFromEachDataset = [30];
let index = 10; // default for adding/removing values: last index

chart.addDataPoint(label, valueFromEachDataset); // by default adds at end
chart.addDataPoint(label, valueFromEachDataset, index);
```

```js
let index = 10;
chart.removeDataPoint();
chart.removeDataPoint(index);
```

<project-demo data="get-update-data" v-bind:config="{
        type: 'line',
        height: 200
    }"
	v-bind:actions="[
		{
			name: 'Add Value',
			fn: 'addDataPoint',
			args: getAddUpdateData()
		},
		{
			name: 'Remove Value',
			fn: 'removeDataPoint',
			args: []
		}
	]">
</project-demo>

### Updating full data

Another way is to simply update the entire data, including annotations, by passing the entire new `data` object to `update`.

```js
chart.update(data);
```

<project-demo data="get-update-data" v-bind:config="{
        type: 'line',
        height: 200
    }"
	v-bind:actions="[
		{
			name: 'Random Data',
			fn: 'update',
			args: [getUpdateData()]
		}
	]">
</project-demo>

