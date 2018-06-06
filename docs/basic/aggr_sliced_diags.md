## Also called Sliced Diagrams
Another family of charts, the aggregation charts accumulate the value at a data point across the multiple datasets.

**The data format stays the same, with single or multi datasets.**

#### Pie chart
Perhaps the most well-known representation of data slices are Pie charts:

```js
type: 'pie'
```
<project-demo data="mixed-2" v-bind:config="{
        type: 'pie',
        height: 300
    }">
</project-demo>

#### Percentage Charts FTW

Pies have received some [criticism]() for data perception; we are much better at parsing sizes in a single dimension rather than an area. That's why, the much leaner `percentage` chart can come in handy:

```js
type: 'percentage'
```
<project-demo data="mixed-2" v-bind:config="{
        type: 'percentage',
        height: 180,
    }">
</project-demo>

#### Limiting the slices
When there are too many data values to show visually, it makes sense to bundle up the least of the values as a cumulated data point, rather than showing tiny slices. This can be done by defining the maximum number of slices to be shown.

```js
maxSlices: 7,
```
<project-demo data="mixed-2" v-bind:config="{
        type: 'pie',
        height: 300,
		maxSlices: 7,
    }"
    v-bind:options="[
        {
            name: 'maxSlices',
            path: ['maxSlices'],
            type: 'number',
            numberOptions: { min: 5, max: 8, step: 1 },
            activeState: 7
        }
    ]">
</project-demo>

#### Configuring percentage bars
Some attributes of a percentage bar can be redefined; like its height and the depth of it's shadow.

```js
barOptions: {
	height: 15,          // default: 20
	depth: 5             // default: 2
}
```
<project-demo data="mixed-2" v-bind:config="{
        type: 'percentage',
        height: 200,
		barOptions: {
			height: 15,
			depth: 5
		}
    }"
    v-bind:options="[
        {
            name: 'barOptions',
            path: ['barOptions', 'depth'],
            type: 'number',
            numberOptions: { min: 1, max: 10, step: 1 },
            activeState: 5
        },
        {
            name: 'barOptions',
            path: ['barOptions', 'height'],
            type: 'number',
            numberOptions: { min: 11, max: 31, step: 2 },
            activeState: 15
        }
    ]">
</project-demo>
