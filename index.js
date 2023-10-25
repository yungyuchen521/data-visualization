const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const padding = { top: 60, bottom: 20, left: width / 5, right: 80 };

const inner_width = width - padding.left - padding.right;
const inner_height = height - padding.top - padding.bottom;

const refreshPlot = () => {
    d3.csv(
        "https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/ma_lga_12345.csv"
    ).then((data) => {
        const strToDate = (str) => {
            [d, m, y] = str.split("/");
            return new Date(+y, +m - 1, +d);
        };

        data = data.map((d) => ({
            date: strToDate(d["saledate"]),
            median: +d["MA"],
            cls: `${d["type"]}_${d["bedrooms"]}`,
        }));

        createPlot(data);
    });
};

const createPlot = (data) => {
    const data_dict = toDict(data);
    // {
    //     date1: {home_1: xxx, home_2: xxx, ..., unit_1: xxx, ... },
    //     date2: {home_1: xxx, home_2: xxx, ..., unit_1: xxx, ... },
    //     ...
    // }

    const data_arr = Object.values(data_dict).sort((a, b) => a.date - b.date); // sort by date
    const rivers = getRivers(data_arr);

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data_arr, (d) => d.date))
        .range([0, inner_width]);

    const top_flow = d3.max(rivers[rivers.length - 1], (d) => d[1]);
    const btm_flow = d3.min(rivers[0], (d) => d[0]);
    const domain = Math.max(top_flow, Math.abs(btm_flow)) * 1.1;

    const yScale = d3
        .scaleLinear()
        .domain([-domain, domain])
        .range([inner_height + padding.top, padding.top]);

    const getArea = d3
        .area()
        .x((d) => xScale(d.data.date))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

    const g = svg.append("g").attr("id", "plot").attr("transform", `translate(${padding.left})`);
    g.selectAll("path")
        .data(rivers)
        .enter()
        .append("path")
        .attr("class", "river")
        .attr("id", (d) => d.key)
        .attr("d", getArea)
        .style("fill", (d) => color_map[d.key]);

    document.querySelectorAll("path.river").forEach((r) => {
        addToolTip(r, xScale, data_dict);
    });

    addXAxis(
        xScale,
        data_arr.map((d) => d.date)
    );
    addYAxis(yScale);
};

const addLegends = () => {
    const g = svg.append("g").attr("id", "legend").attr("transform", `translate(${padding.left})`);

    const house_arr = cls_order.filter((cls) => cls.includes("house")).sort();
    const unit_arr = cls_order.filter((cls) => cls.includes("unit")).sort();
    const getOffset = d3
        .scaleLinear()
        .domain([0, Math.max(house_arr.length, unit_arr.length)])
        .range([0, inner_width]);

    const house_g = g.append("g").attr("transform", `translate(0,${padding.top / 5})`);
    const unit_g = g.append("g").attr("transform", `translate(0,${padding.top / 2})`);

    const insertLegends = (g, arr) => {
        const r = 8;

        arr.forEach((cls, i) => {
            const block = g.append("g").attr("transform", `translate(${getOffset(i)})`);

            block
                .append("circle")
                .attr("class", "legend")
                .attr("r", r)
                .style("fill", color_map[cls]);

            const [type, rooms] = cls.split("_");
            block
                .append("text")
                .attr("class", "legend")
                .attr("transform", `translate(${r * 1.5},${r / 2})`)
                .text(`${type} (${rooms} rooms)`);
        });
    };

    insertLegends(house_g, house_arr);
    insertLegends(unit_g, unit_arr);
};

const addXAxis = (scale, tick_values) => {
    const max_ticks = 10;
    if (tick_values.length > 10) {
        step = Math.ceil(tick_values.length / max_ticks);
        tick_values = tick_values.filter((_, i) => i % step == 0);
    }

    const axis = d3
        .axisBottom(scale)
        .tickSize(-(height - padding.top - padding.bottom))
        .tickValues(tick_values)
        .tickFormat(d3.timeFormat("%Y / %m"));

    const g = svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${padding.left},${height - padding.bottom})`)
        .call(axis);

    g.selectAll(".tick text").attr("class", "x-tick");
    g.select(".domain").remove();
};

const addYAxis = (scale) => {
    const axis = d3.axisLeft(scale);

    const g = svg
        .append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding.left})`)
        .call(axis);

    g.selectAll(".tick text").attr("class", "y-tick");
    g.select(".domain").remove();
};

const getRivers = (grouped_data) => {
    const stk = d3
        .stack()
        .keys(cls_order)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

    return stk(grouped_data);
};

const toDict = (data) => {
    const groups = {};
    data.forEach((d) => {
        const dt = d.date;
        if (!groups[dt]) {
            groups[dt] = { date: dt };
            cls_order.forEach((cls) => (groups[dt][cls] = 0));
        }

        groups[dt][d.cls] = d.median;
    });

    return groups;
};

const addToolTip = (target, xScale, data_dict) => {
    const tooltip = d3.select("#tooltip");
    const cls = target.getAttribute("id");

    const toQtr = (dt) => {
        let m = dt.getMonth();
        if (m % 3 == 1) m++;
        else if (m % 3 == 0) m--;

        let y = dt.getFullYear();
        if (m < 0) y--;

        return new Date(y, m + 1, 0);
    };

    target.addEventListener("mousemove", (e) => {
        const box = document.getElementById("y-axis").getBoundingClientRect();
        const x = e.screenX - box.x - box.width;
        const dt = toQtr(new Date(xScale.invert(x)));

        tooltip.style("left", e.screenX - 150 + "px").style("top", e.screenY - 250 + "px");
        tooltip.select("#qtr").html(`${dt.getFullYear()} / ${dt.getMonth() + 1}`);
        tooltip.select("#sales").html(data_dict[dt][cls])
    });

    target.addEventListener("mouseover", () => tooltip.style("opacity", "1"));

    target.addEventListener("mouseout", () => tooltip.style("opacity", "0"));
}
