import { test, expect } from '@playwright/test';

const axisData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
        { name: 'This week', values: [10, 40, 30, 50, 20] },
        { name: 'Last week', values: [20, 30, 25, 45, 35] }
    ]
};

const sliceData = {
    labels: ['Open', 'In review', 'Done'],
    datasets: [{ values: [14, 6, 27] }]
};

let errors;

test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/playwright/index.html');
});

test.afterEach(() => {
    expect(errors).toEqual([]);
});

const render = (page, options) => page.evaluate(o => window.renderChart(o), options);

test('bar chart draws one bar per value', async ({ page }) => {
    await render(page, { type: 'bar', data: axisData });
    await expect(page.locator('#chart .dataset-units path')).toHaveCount(10);
    await expect(page.locator('#chart .x.axis text')).toHaveText(axisData.labels);
});

test('line chart draws one line per dataset', async ({ page }) => {
    await render(page, { type: 'line', data: axisData });
    await expect(page.locator('#chart path.line-graph-path')).toHaveCount(2);
});

test('mixed chart draws bars and a line', async ({ page }) => {
    await render(page, {
        type: 'axis-mixed',
        data: {
            labels: axisData.labels,
            datasets: [
                { name: 'Sales', chartType: 'bar', values: [10, 40, 30, 50, 20] },
                { name: 'Target', chartType: 'line', values: [20, 30, 25, 45, 35] }
            ]
        }
    });
    await expect(page.locator('#chart .dataset-bars path')).toHaveCount(5);
    await expect(page.locator('#chart path.line-graph-path')).toHaveCount(1);
});

test('time x axis spaces line points by date', async ({ page }) => {
    const data = { labels: ['2017-01-01', '2017-01-02', '2017-01-10'], datasets: [{ values: [1, 2, 10] }] };
    const gaps = () => page.evaluate(() => {
        const p = window.chart.state.xAxis.positions;
        return [p[1] - p[0], p[2] - p[1]];
    });
    await render(page, { type: 'line', data });
    const [even1, even2] = await gaps();
    expect(even2).toBeCloseTo(even1, 1);
    await render(page, { type: 'line', data, axisOptions: { xAxisType: 'time' } });
    const [day, week] = await gaps();
    expect(week / day).toBeCloseTo(8, 1);
});

test('x axis labels can be rotated', async ({ page }) => {
    const data = { labels: ['Frappe Technologies', 'Acme Corporation', 'Globex'], datasets: [{ values: [3, 5, 2] }] };
    const labels = page.locator('#chart .x.axis text');
    await render(page, { type: 'bar', data });
    await expect(labels.first()).not.toHaveAttribute('transform', /rotate/);
    await render(page, { type: 'bar', data, axisOptions: { xAxisLabelRotation: 45 } });
    await expect(labels).toHaveCount(3);
    await expect(labels.first()).toHaveAttribute('transform', /rotate\(-45/);
    await expect(labels.nth(1)).toHaveText('Acme Corporation');
});

test('horizontal bar chart shows a row per label with its value', async ({ page }) => {
    await render(page, { type: 'bar', barOptions: { horizontal: 1 }, data: { labels: ['India', 'Kenya'], datasets: [{ values: [48200, 6100] }] } });
    await expect(page.locator('#chart .horizontal-bar-label')).toHaveCount(2);
    await expect(page.locator('#chart .horizontal-bar-label').first()).toContainText('India');
    await expect(page.locator('#chart .horizontal-bar-value')).toHaveCount(2);
});

test('donut chart draws a slice per label and reports clicks', async ({ page }) => {
    await page.evaluate(() => {
        window.clicked = null;
        window.renderChart({
            type: 'donut',
            data: { labels: ['Open', 'In review', 'Done'], datasets: [{ values: [14, 6, 27] }] },
            onClick: (slice) => { window.clicked = slice; }
        });
    });
    const slices = page.locator('#chart .donut-path');
    await expect(slices).toHaveCount(3);
    await page.locator('#chart .donut-legend-item').nth(2).click({ force: true });
    expect(await page.evaluate(() => window.clicked)).toEqual({ index: 2, label: 'Done', value: 27 });
});

test('pie chart draws a slice per label', async ({ page }) => {
    await render(page, { type: 'pie', data: sliceData });
    await expect(page.locator('#chart .pie-path')).toHaveCount(3);
});

test('percentage chart draws a part per label', async ({ page }) => {
    await render(page, { type: 'percentage', data: sliceData });
    await expect(page.locator('#chart .percentage-bar')).toHaveCount(3);
});

test('heatmap draws a square per day', async ({ page }) => {
    await page.evaluate(() => window.renderChart({
        type: 'heatmap',
        data: { start: new Date(2026, 0, 4), end: new Date(2026, 1, 28), dataPoints: { [Date.UTC(2026, 0, 10) / 1000]: 4 } }
    }));
    expect(await page.locator('#chart rect.day').count()).toBeGreaterThanOrEqual(50);
});

test('data points can be added, removed and replaced', async ({ page }) => {
    await render(page, { type: 'bar', data: axisData });
    const bars = page.locator('#chart .dataset-units path');
    await expect(bars).toHaveCount(10);
    await page.evaluate(() => window.chart.addDataPoint('Sat', [60, 15]));
    await expect(bars).toHaveCount(12);
    await page.evaluate(() => window.chart.removeDataPoint());
    await expect(bars).toHaveCount(10);
    await page.evaluate(() => window.chart.update({ labels: ['A', 'B'], datasets: [{ values: [1, 2] }, { values: [3, 4] }] }));
    await expect(bars).toHaveCount(4);
});

test('hovering a column shows every value in it', async ({ page }) => {
    await page.evaluate(data => window.renderChart({ type: 'bar', data, tooltipOptions: { formatTooltipY: d => d + ' visits' } }), axisData);
    const box = await page.locator('#chart svg').first().boundingBox();
    const tooltip = page.locator('#chart .graph-svg-tip');
    await expect(async () => {
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await expect(tooltip).toContainText('30 visits', { timeout: 300 });
    }).toPass();
    await expect(tooltip).toContainText('Wed');
    await expect(tooltip).toContainText('25 visits');
});

test('markers are drawn on axis charts', async ({ page }) => {
    await render(page, {
        type: 'line',
        data: Object.assign({}, axisData, {
            xMarkers: [{ label: 'Today', value: 'Wed' }],
            yMarkers: [{ label: 'Goal', value: 45 }]
        })
    });
    await expect(page.locator('#chart .x-markers')).toContainText('Today');
    await expect(page.locator('#chart')).toContainText('Goal');
});

test('export downloads the chart as SVG', async ({ page }) => {
    await render(page, { type: 'bar', title: 'Visitors', data: axisData });
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.evaluate(() => window.chart.export())
    ]);
    expect(download.suggestedFilename()).toBe('Visitors.svg');
});
