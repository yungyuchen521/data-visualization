const histogram = (g, size, data, b = 10) => {
    const [min_val, max_val] = d3.extent(data);
    const step = (max_val * 1.01 - min_val) / b;
    const x_ranges = d3.range(min_val, max_val + step, step);

    const bin_margin = 1;

    const hist = d3
        .histogram()
        .value((d) => d)
        .thresholds(x_ranges);

    const bins = hist(data);

    const wScale = d3
        .scaleLinear()
        .domain([min_val, max_val])
        .range([g_padding, size - g_padding]);

    const hScale = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .range([0, size - 2 * g_padding]);

    g.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bin")
        .attr("width", (d) => wScale(d.x1) - wScale(d.x0) - 2 * bin_margin)
        .attr("height", (d) => hScale(d.length))
        .attr(
            "transform",
            (d) =>
                `translate(
                    ${wScale(d.x0) + bin_margin},
                    ${size - hScale(d.length) - g_padding}
                )`
        );

    addHistogramAxis(g, size, bins, hScale);
};

const addHistogramAxis = (g, size, bins, hScale) => {
    const yScale = hScale;
    yScale.range(hScale.range().toReversed());

    const y_axis = d3
        .axisLeft(yScale)
        .tickSize(-size + 2 * g_padding)
        .tickPadding(10);

    g.append("g")
        .attr("transform", `translate(${g_padding}, ${g_padding})`)
        .call(y_axis)
        .selectAll("path")
        .remove();

    const xScale = d3
        .scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([g_padding, size - g_padding]);

    const tick_values = bins.map((b) => b.x0);
    tick_values.push(bins[bins.length - 1].x1);
    const xAxis = d3.axisBottom(xScale).tickValues(tick_values).tickPadding(15);

    g.append("g")
        .call(xAxis)
        .attr("transform", `translate(0,${size - g_padding})`)
        .select("path")
        .remove();
};
