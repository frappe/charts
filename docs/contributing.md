# Contributing
If you wish to contribute to Frappe Charts:

1. Clone the git repo.
2. `cd` into project directory
3. `npm install`
4. `npm run dev`

All changes should be made in the code base contained in `src`.

To contribute to one of the chart types, there are individual js files specific to each chart type in `src/js/charts/`, with `BaseChart` being the root for any chart. All charts are broadly categorised as `AxisChart`, `AggregationCharts` (`PieChart` and `PercentageChart`) and `Heatmap`. Common behaviour to be in all children charts can be considered to be defined in the parent.

Most of the ground-level logic code is segregated into the utils modules `src/js/utils/`.

If you wish to use an arbitrary constant value for a specific measure, color, ratio etc., check `src/js/utils/constants.js` and register the value to be used.
