const plot_svg = d3.select("svg#plot");
const attr_cnt = attr_order.length;

const margin = {
    top: 80,
    bottom: 0,
    left: 400,
    right: 0,
};

const clearPlots = () => {
    d3.select("g#axis").remove();
    d3.select("g#plot").remove();
};

const createPlots = () => {
    clearPlots();

    const width = +plot_svg.attr("width");
    const inner_width = width - margin.left - margin.right;

    d3.csv(
        "https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/TIMES_WorldUniversityRankings_2024.csv"
    ).then((data) => {
        data = data
            .filter((d) => d["scores_overall"] != "n/a")
            .map((d) => {
                var obj = {
                    name: d["name"],
                    rank: +d["rank"].split("\u2013")[0],
                    scores_overall: +d["scores_overall"].split("\u2013")[0],
                };
                attr_order.forEach((attr) => (obj[attr] = +d[attr]));
                return obj;
            });

        sortData(data);

        const bar_margin = 15;
        const bar_height = 20;
        const yScale = (i) => i * (bar_margin + bar_height);

        const height = (bar_margin + bar_height) * data.length + margin.top;
        plot_svg.attr("height", height);

        addAxis(yScale, data, desc);
        addBorders(height);

        const barLenScale = d3
            .scaleLinear()
            .domain([0, attr_cnt * 100])
            .range([0, inner_width]);

        addBars(yScale, barLenScale, data, bar_height);
    });
};

const sortData = (data) => {
    const sort_by = document.querySelector("select").value;
    const desc = document.getElementById("desc").checked;

    const compare = (a, b) => {
        a = a[sort_by];
        b = b[sort_by];

        return b - a;
    };

    data.sort(compare);
    if (!desc) data.reverse();
};

const addAxis = (scale, data) => {
    const collapse = (name) => {
        const max_len = 35;
        return name.length > max_len
            ? name.slice(0, max_len - 3) + "..."
            : name;
    };
    const collpased = (name) => name.includes(".");
    const desc = document.getElementById("desc").checked;

    const axis_g = plot_svg
        .append("g")
        .attr("id", "axis")
        .attr("transform", `translate(0, ${margin.top})`);

    axis_g
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (_, i) => `translate(0, ${scale(i)})`)
        .each(function (d, i) {
            const g = d3.select(this);

            const name = d["name"];
            const display_name = collapse(name);

            g.append("text")
                .text(desc ? i + 1 : data.length - i)
                .attr("class", "axis-rank")
                .attr("transform", `translate(${cols_offset["rank"]})`);
            g.append("text")
                .text(d["scores_overall"])
                .attr("class", "axis-score")
                .attr(
                    "transform",
                    `translate(${cols_offset["overall score"]})`
                );
            g.append("text")
                .text(display_name)
                .attr("class", "axis-school-name")
                .attr("transform", `translate(${cols_offset["name"]})`);

            if (collpased(display_name)) addToolTip(g, name);
        });
};

const addBorders = (height) => {
    if (document.querySelector("svg#plot path")) return;

    const bar_y = 45;
    plot_svg
        .append("path")
        .attr("d", `M0 ${bar_y} L${plot_svg.attr("width")} ${bar_y}`)
        .attr("class", "table-border");

    Object.keys(cols_offset).forEach((key, i) => {
        if (i != 0) {
            const x = cols_offset[key] - 10;
            const y0 = -55;

            plot_svg
                .append("path")
                .attr("class", "table-border")
                .attr("d", `M${x} ${y0} L${x} ${height}`);
        }
    });
};

const addBars = (yScale, barLenScale, data, bar_height) => {
    const g = plot_svg
        .append("g")
        .attr("id", "plot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr(
            "transform",
            (_, i) => `translate(0,${yScale(i) - bar_height / 2 - 7})`
        )
        .each(function (d, _) {
            addStackedBar(d3.select(this), d, barLenScale, bar_height);
        });
};

function addStackedBar(g, d, barLenScale, bar_height) {
    const stack_margin = 2;

    let offset = 0;
    attr_order.forEach((attr) => {
        const w = barLenScale(d[attr]);

        const rect = g
            .append("rect")
            .attr("class", "bar")
            .attr("width", w)
            .attr("height", bar_height)
            .attr("transform", `translate(${offset})`)
            .attr("fill", color_map[attr]);

        addToolTip(rect, `${formatAttr(attr)} = ${d[attr]}`);

        offset += w + stack_margin;
    });
}

function addToolTip(taget, msg) {
    taget.on("mouseover", () => {
        const tool_tip = d3.select("#tool-tip");

        tool_tip
            .style("opacity", 1)
            .style("left", d3.event.pageX - 100 + "px")
            .style("top", d3.event.pageY - 120 + "px");

        tool_tip.html(msg);
    });

    taget.on("mouseout", () => d3.select("#tool-tip").style("opacity", 0));
}
