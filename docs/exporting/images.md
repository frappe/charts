## Exporting to images

Frappe charts are exportable to an SVG format, in which they are natively rendered.

```js
chart.export();
```

<project-demo data="get-update-data" v-bind:config="{
		title: 'My Area Chart',
        type: 'line',
        height: 300,
		lineOptions: { areaFill: 1 }
    }"
	v-bind:actions="[
		{
			name: 'Export',
			fn: 'export',
			args: []
		}
	]">
</project-demo>
