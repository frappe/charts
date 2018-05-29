There are two ways to update data in a chart: either in adding and removing individual points, or updating the existing data with an entirely new set of data points.

## Updating individual data points
<chart-demo data="get-update-data" v-bind:config="{
        type: 'bar',
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
</chart-demo>

## Updating full data

<chart-demo data="get-update-data" v-bind:config="{
        type: 'bar',
        height: 200
    }"
	v-bind:actions="[
		{
			name: 'Random Data',
			fn: 'update',
			args: [getUpdateData()]
		}
	]">
</chart-demo>


[update data with varying lengths]

