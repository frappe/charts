import { makeSVGGroup } from "../utils/draw";
import {
	makeText,
	makePath,
	makePolygon,
	xLine,
	yLine,
	generateAxisLabel,
	rAxis,
	thetaAxis,
	yMarker,
	yRegion,
	datasetBar,
	datasetDot,
	percentageBar,
	getPaths,
	heatSquare,
} from "../utils/draw";
import { equilizeNoOfElements } from "../utils/draw-utils";
import {
	translateHoriLine,
	translateVertLine,
	animateRegion,
	animateBar,
	animateDot,
	animatePath,
	animatePathStr,
} from "../utils/animate";
import { getMonthName } from "../utils/date-utils";

class ChartComponent {
	constructor({
		layerClass = "",
		layerTransform = "",
		constants,

		getData,
		makeElements,
		animateElements,
	}) {
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.labels = [];

		this.layerClass = layerClass;
		this.layerClass =
			typeof this.layerClass === "function"
				? this.layerClass()
				: this.layerClass;

		this.refresh();
	}

	refresh(data) {
		this.data = data || this.getData();
	}

	setup(parent) {
		this.layer = makeSVGGroup(this.layerClass, this.layerTransform, parent);
	}

	make() {
		this.render(this.data);
		this.oldData = this.data;
	}

	render(data) {
		this.store = this.makeElements(data);

		this.layer.textContent = "";
		this.store.forEach((element) => {
			element.length
				? element.forEach((el) => {
						this.layer.appendChild(el);
				  })
				: this.layer.appendChild(element);
		});
		this.labels.forEach((element) => {
			this.layer.appendChild(element);
		});
	}

	update(animate = true) {
		this.refresh();
		let animateElements = [];
		if (animate) {
			animateElements = this.animateElements(this.data) || [];
		}
		return animateElements;
	}
}

let componentConfigs = {
	donutSlices: {
		layerClass: "donut-slices",
		makeElements(data) {
			return data.sliceStrings.map((s, i) => {
				let slice = makePath(
					s,
					"donut-path",
					data.colors[i],
					"none",
					data.strokeWidth
				);
				slice.style.transition = "transform .3s;";
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) =>
				animatePathStr(slice, newData.sliceStrings[i])
			);
		},
	},
	pieSlices: {
		layerClass: "pie-slices",
		makeElements(data) {
			return data.sliceStrings.map((s, i) => {
				let slice = makePath(s, "pie-path", "none", data.colors[i]);
				slice.style.transition = "transform .3s;";
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) =>
				animatePathStr(slice, newData.sliceStrings[i])
			);
		},
	},
	percentageBars: {
		layerClass: "percentage-bars",
		makeElements(data) {
			const numberOfPoints = data.xPositions.length;
			return data.xPositions.map((x, i) => {
				let y = 0;

				let isLast = i == numberOfPoints - 1;
				let isFirst = i == 0;

				let bar = percentageBar(
					x,
					y,
					data.widths[i],
					this.constants.barHeight,
					isFirst,
					isLast,
					data.colors[i]
				);
				return bar;
			});
		},

		animateElements(newData) {
			if (newData) return [];
		},
	},
	yAxis: {
		layerClass: "y axis",
		makeElements(data) {
			let elements = [];
			// will loop through each yaxis dataset if it exists
			if (data.length) {
				data.forEach((item, i) => {
					item.positions.map((position, i) => {
						elements.push(
							yLine(
								position,
								item.labels[i],
								this.constants.width,
								{
									mode: this.constants.mode,
									pos: item.pos || this.constants.pos,
									shortenNumbers:
										this.constants.shortenNumbers,
									title: item.title,
								}
							)
						);
					});
					// we need to make yAxis titles if they are defined
					if (item.title) {
						elements.push(
							generateAxisLabel({
								title: item.title,
								position: item.pos,
								height: this.constants.height || data.zeroLine,
								width: this.constants.width,
							})
						);
					}
				});

				return elements;
			}

			data.positions.forEach((position, i) => {
				elements.push(
					yLine(position, data.labels[i], this.constants.width, {
						mode: this.constants.mode,
						pos: data.pos || this.constants.pos,
						shortenNumbers: this.constants.shortenNumbers,
					})
				);
			});

			if (data.title) {
				elements.push(
					generateAxisLabel({
						title: data.title,
						position: data.pos,
						height: this.constants.height || data.zeroLine,
						width: this.constants.width,
					})
				);
			}

			return elements;
		},

		animateElements(newData) {
			const animateMultipleElements = (oldData, newData) => {
				let newPos = newData.positions;
				let newLabels = newData.labels;
				let oldPos = oldData.positions;
				let oldLabels = oldData.labels;

				[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
				[oldLabels, newLabels] = equilizeNoOfElements(
					oldLabels,
					newLabels
				);

				this.render({
					positions: oldPos,
					labels: newLabels,
				});

				return this.store.map((line, i) => {
					return translateHoriLine(line, newPos[i], oldPos[i]);
				});
			};

			// we will need to animate both axis if we have more than one.
			// so check if the oldData is an array of values.
			if (this.oldData instanceof Array) {
				return this.oldData.forEach((old, i) => {
					animateMultipleElements(old, newData[i]);
				});
			}

			let newPos = newData.positions;
			let newLabels = newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels,
			});

			return this.store.map((line, i) => {
				return translateHoriLine(line, newPos[i], oldPos[i]);
			});
		},
	},

	xAxis: {
		layerClass: "x axis",
		makeElements(data) {
			return data.positions.map((position, i) =>
				xLine(position, data.calcLabels[i], this.constants.height, {
					mode: this.constants.mode,
					pos: this.constants.pos,
				})
			);
		},

		animateElements(newData) {
			let newPos = newData.positions;
			let newLabels = newData.calcLabels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.calcLabels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				calcLabels: newLabels,
			});

			return this.store.map((line, i) => {
				return translateVertLine(line, newPos[i], oldPos[i]);
			});
		},
	},

	rAxis: {
		layerClass: "r axis",
		makeElements(data) {
			return [rAxis(
				this.constants.radius,
				data.maxValue,
				this.constants.center,
				this.constants
			)];
		},
		animateElements(newData) {
			if (newData) return [];
		},
	},

	thetaAxis: {
		layerClass: "theta axis",
		makeElements(data) {
			return [thetaAxis(
				data.points,
				data.labels,
				this.constants.center,
				this.constants
			)];
		},
		animateElements(newData) {
			if (newData) return [];
		},
	},

	yMarkers: {
		layerClass: "y-markers",
		makeElements(data) {
			return data.map((m) =>
				yMarker(m.position, m.label, this.constants.width, {
					labelPos: m.options.labelPos,
					stroke: m.options.stroke,
					mode: "span",
					lineType: m.options.lineType,
				})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(
				this.oldData,
				newData
			);

			let newPos = newData.map((d) => d.position);
			let newLabels = newData.map((d) => d.label);
			let newOptions = newData.map((d) => d.options);

			let oldPos = this.oldData.map((d) => d.position);

			this.render(
				oldPos.map((pos, i) => {
					return {
						position: oldPos[i],
						label: newLabels[i],
						options: newOptions[i],
					};
				})
			);

			return this.store.map((line, i) => {
				return translateHoriLine(line, newPos[i], oldPos[i]);
			});
		},
	},

	yRegions: {
		layerClass: "y-regions",
		makeElements(data) {
			return data.map((r) =>
				yRegion(r.startPos, r.endPos, this.constants.width, r.label, {
					labelPos: r.options.labelPos,
				})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(
				this.oldData,
				newData
			);

			let newPos = newData.map((d) => d.endPos);
			let newLabels = newData.map((d) => d.label);
			let newStarts = newData.map((d) => d.startPos);
			let newOptions = newData.map((d) => d.options);

			let oldPos = this.oldData.map((d) => d.endPos);
			let oldStarts = this.oldData.map((d) => d.startPos);

			this.render(
				oldPos.map((pos, i) => {
					return {
						startPos: oldStarts[i],
						endPos: oldPos[i],
						label: newLabels[i],
						options: newOptions[i],
					};
				})
			);

			let animateElements = [];

			this.store.map((rectGroup, i) => {
				animateElements = animateElements.concat(
					animateRegion(rectGroup, newStarts[i], newPos[i], oldPos[i])
				);
			});

			return animateElements;
		},
	},

// ChartComponent constructed with: layerClass, layerTransform,
// constants, getData, makeElements, animateElements
	radarChart: {
		layerClass: function () {
			return "radar-chart radar-" + this.constants.index;
		},
		makeElements(data) {
			const { index, hasStroke, colour, opacity } = this.constants;
			let elements = [];
			elements.push(makePolygon(
				data.points.map(point => `${point.x},${point.y}`).join(" "),
				"radar-area",
				hasStroke ? colour : "none",
				colour,
				opacity
			));

			return elements;
		},
		animateElements(newData) {
			if (newData) return [];
		},
	},

	heatDomain: {
		layerClass: function () {
			return "heat-domain domain-" + this.constants.index;
		},
		makeElements(data) {
			let { index, colWidth, rowHeight, squareSize, radius, xTranslate } =
				this.constants;
			let monthNameHeight = -12;
			let x = xTranslate,
				y = 0;

			this.serializedSubDomains = [];

			data.cols.map((week, weekNo) => {
				if (weekNo === 1) {
					this.labels.push(
						makeText(
							"domain-name",
							x,
							monthNameHeight,
							getMonthName(index, true).toUpperCase(),
							{
								fontSize: 9,
							}
						)
					);
				}
				week.map((day, i) => {
					if (day.fill) {
						let data = {
							"data-date": day.yyyyMmDd,
							"data-value": day.dataValue,
							"data-day": i,
						};
						let square = heatSquare(
							"day",
							x,
							y,
							squareSize,
							radius,
							day.fill,
							data
						);
						this.serializedSubDomains.push(square);
					}
					y += rowHeight;
				});
				y = 0;
				x += colWidth;
			});

			return this.serializedSubDomains;
		},

		animateElements(newData) {
			if (newData) return [];
		},
	},

	barGraph: {
		layerClass: function () {
			return "dataset-units dataset-bars dataset-" + this.constants.index;
		},
		makeElements(data) {
			let c = this.constants;
			this.unitType = "bar";
			this.units = data.yPositions.map((y, j) => {
				return datasetBar(
					data.xPositions[j],
					y,
					data.barWidth,
					c.color,
					data.labels[j],
					j,
					data.offsets[j],
					{
						zeroLine: data.zeroLine,
						barsWidth: data.barsWidth,
						minHeight: c.minHeight,
					}
				);
			});
			return this.units;
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newOffsets = newData.offsets;
			let newLabels = newData.labels;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldOffsets = this.oldData.offsets;
			let oldLabels = this.oldData.labels;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldOffsets, newOffsets] = equilizeNoOfElements(
				oldOffsets,
				newOffsets
			);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				offsets: oldOffsets,
				labels: newLabels,

				zeroLine: this.oldData.zeroLine,
				barsWidth: this.oldData.barsWidth,
				barWidth: this.oldData.barWidth,
			});

			let animateElements = [];

			this.store.map((bar, i) => {
				animateElements = animateElements.concat(
					animateBar(
						bar,
						newXPos[i],
						newYPos[i],
						newData.barWidth,
						newOffsets[i],
						{ zeroLine: newData.zeroLine }
					)
				);
			});

			return animateElements;
		},
	},

	lineGraph: {
		layerClass: function () {
			return "dataset-units dataset-line dataset-" + this.constants.index;
		},
		makeElements(data) {
			let c = this.constants;
			this.unitType = "dot";
			this.paths = {};
			if (!c.hideLine) {
				this.paths = getPaths(
					data.xPositions,
					data.yPositions,
					c.color,
					{
						heatline: c.heatline,
						regionFill: c.regionFill,
						spline: c.spline,
					},
					{
						svgDefs: c.svgDefs,
						zeroLine: data.zeroLine,
					}
				);
			}

			this.units = [];
			if (!c.hideDots) {
				this.units = data.yPositions.map((y, j) => {
					return datasetDot(
						data.xPositions[j],
						y,
						data.radius,
						c.color,
						c.valuesOverPoints ? data.values[j] : "",
						j
					);
				});
			}

			return Object.values(this.paths).concat(this.units);
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newValues = newData.values;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldValues = this.oldData.values;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldValues, newValues] = equilizeNoOfElements(oldValues, newValues);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				values: newValues,

				zeroLine: this.oldData.zeroLine,
				radius: this.oldData.radius,
			});

			let animateElements = [];

			if (Object.keys(this.paths).length) {
				animateElements = animateElements.concat(
					animatePath(
						this.paths,
						newXPos,
						newYPos,
						newData.zeroLine,
						this.constants.spline
					)
				);
			}

			if (this.units.length) {
				this.units.map((dot, i) => {
					animateElements = animateElements.concat(
						animateDot(dot, newXPos[i], newYPos[i])
					);
				});
			}

			return animateElements;
		},
	},
};

export function getComponent(name, constants, getData) {
	let keys = Object.keys(componentConfigs).filter((k) => name.includes(k));
	let config = componentConfigs[keys[0]];
	Object.assign(config, {
		constants: constants,
		getData: getData,
	});
	return new ChartComponent(config);
}
