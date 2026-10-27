import BaseChart from "./BaseChart";
import { truncateString } from "../utils/draw-utils";
import { legendDot } from "../utils/draw";
import { round } from "../utils/helpers";
import { getExtraWidth } from "../utils/constants";

export default class AggregationChart extends BaseChart {
  constructor(parent, args) {
    super(parent, args);
  }

  configure(args) {
    super.configure(args);

    this.config.formatTooltipY = (args.tooltipOptions || {}).formatTooltipY;
    this.config.maxSlices = args.maxSlices || 20;
    this.config.maxLegendPoints = args.maxLegendPoints || 20;
    this.config.legendRowHeight =
      args.legendRowHeight || (this.config.legendPosition === "right" ? 28 : 34);
  }

  calc() {
    let s = this.state;
    let maxSlices = this.config.maxSlices;
    s.sliceTotals = [];

    let allTotals = this.data.labels
      .map((label, i) => {
        let total = 0;
        this.data.datasets.map((e) => {
          total += e.values[i];
        });
        return [total, label];
      })
      .filter((d) => {
        return d[0] >= 0;
      }); // keep only positive results

    let totals = allTotals;
    if (allTotals.length > maxSlices) {
      // Prune and keep a grey area for rest as per maxSlices
      allTotals.sort((a, b) => {
        return b[0] - a[0];
      });

      totals = allTotals.slice(0, maxSlices - 1);
      let remaining = allTotals.slice(maxSlices - 1);

      let sumOfRemaining = 0;
      remaining.map((d) => {
        sumOfRemaining += d[0];
      });
      totals.push([sumOfRemaining, "Rest"]);
      this.colors[maxSlices - 1] = "grey";
    }

    s.labels = [];
    totals.map((d) => {
      s.sliceTotals.push(round(d[0]));
      s.labels.push(d[1]);
    });

    s.grandTotal = s.sliceTotals.reduce((a, b) => a + b, 0);

    this.center = {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  renderLegend() {
    let s = this.state;
    this.legendArea.textContent = "";
    this.legendTotals = s.sliceTotals.slice(0, this.config.maxLegendPoints);
    super.renderLegend(this.legendTotals);
  }

  makeLegend(data, index, x_pos, y_pos, options = {}) {
    let formatted = this.config.formatTooltipY
      ? this.config.formatTooltipY(data)
      : data;

    let isRight = this.config.legendPosition === "right";
    let baseFontSize = options.fontSize || 7.5;
    let dotSize = options.dotSize || 10;
    let maxChars = options.maxChars || (isRight ? 18 : 14);

    return legendDot(
      x_pos,
      y_pos,
      dotSize, // size
      3, // dot radius
      this.colors[index], // fill
      this.state.labels[index], // label
      formatted, // value
      baseFontSize, // base_font_size
      this.config.truncateLegends ? maxChars : false,
      Object.assign(
        {
          fullLabel: this.state.labels[index],
          labelFontSize: options.labelFontSize || "11px",
          valueFontSize: options.valueFontSize || "10px",
          valueY: options.valueY !== undefined ? options.valueY : 13,
          textOffset: options.textOffset !== undefined ? options.textOffset : 8,
        },
        options
      )
    );
  }
}
