const scatterPlot = (g, size, x, y, data) => {
    const get_x = (d) => d[x];
    const get_y = (d) => d[y];

    const inner_min = g_padding;
    const inner_max = size - g_padding;

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, get_x))
        .range([inner_min, inner_max])
        .nice();

    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(data, get_y))
        .range([inner_max, inner_min])
        .nice();

    addScatterPlotAxis(
        g.append("g").attr("class", "axis"),
        size,
        xScale,
        yScale
    );

    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("data-id", (_, i) => i)
        .attr("cy", (d) => yScale(get_y(d)))
        .attr("cx", (d) => xScale(get_x(d)))
        .attr("fill", (d) => color_map[d.cls]);

    const brush = d3
        .brush()
        .extent([
            [inner_min, inner_min],
            [inner_max, inner_max],
        ])
        .on("start", onBrushStarts)
        .on("end", onBrushEnds);

    g.call(brush);
};

const addScatterPlotAxis = (g, size, xScale, yScale) => {
    const y_axis = d3
        .axisLeft(yScale)
        .tickSize(-size + 2 * g_padding)
        .tickPadding(10);

    g.append("g")
        .attr("transform", `translate(${g_padding})`)
        .call(y_axis)
        .selectAll("path")
        .remove();

    const x_axis = d3
        .axisBottom(xScale)
        .tickSize(-size + 2 * g_padding)
        .tickPadding(15);

    g.append("g")
        .call(x_axis)
        .attr("transform", `translate(0,${size - g_padding})`)
        .select("path")
        .remove();
};
