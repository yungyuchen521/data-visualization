const svg = d3.select("svg");
const svg_size = +svg.attr("width");
const svg_padding = { top: 30, left: 80 };

const g_margin = 30;
const g_padding = 30;
const g_size =
    (svg_size - Math.max(svg_padding.top, svg_padding.left)) / attr_arr.length;

d3.csv(
    "https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/iris.csv"
).then((data) => {
    data = data
        .map((d) => ({
            "sepal length": +d["sepal length"],
            "sepal width": +d["sepal width"],
            "petal length": +d["petal length"],
            "petal width": +d["petal width"],
            cls: d.class,
        }))
        .filter((d) => d.cls);

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const g = svg.append("g").attr(
                "transform",
                `translate(
                        ${svg_padding.left + g_size * j},
                        ${svg_padding.top + g_size * i}
                    )`
            );

            const x = attr_arr[i];
            const y = attr_arr[j];

            if (i == j) {
                g.attr("class", "histogram");
                histogram(
                    g,
                    g_size,
                    data.map((d) => d[x])
                );
            } else {
                g.attr("class", "scatter-plot");
                scatterPlot(g, g_size, x, y, data);
            }
        }
    }

    addMatrixAxis();
});

const addMatrixAxis = () => {
    const scale = d3
        .scaleBand()
        .domain(attr_arr)
        .range([0, svg_size - Math.max(svg_padding.top, svg_padding.left)]);

    const xAxis = d3.axisTop(scale).tickSize(0).tickPadding(15);
    const yAxis = d3.axisLeft(scale).tickSize(0).tickPadding(15);

    const x_axis_g = svg
        .append("g")
        .attr("class", "matrix-axis")
        .attr("transform", `translate(${svg_padding.left}, ${svg_size})`)
        .call(xAxis);

    x_axis_g.select("path").remove();
    x_axis_g.selectAll("g.tick text").call(breakTickText);

    const y_axis_g = svg
        .append("g")
        .attr("class", "matrix-axis")
        .attr(
            "transform",
            `translate(${svg_padding.left - 10}, ${svg_padding.top})`
        )
        .call(yAxis);

    y_axis_g.select("path").remove();
    y_axis_g.selectAll("g.tick text").call(breakTickText);
};

function breakTickText(texts) {
    texts.each(function () {
        const text = d3.select(this);
        const words = text.text().split(" ");

        this.innerHTML = "";
        text.append("tspan").text(words[0]).attr("x", 0);
        text.append("tspan").text(words[1]).attr("x", 0).attr("dy", "1em");
    });
}
