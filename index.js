const SVG = d3.select("svg");

const MARGIN = {
    top: 20,
    bottom: 20,
    left: 180,
    right: 50,
};

const WIDTH = +SVG.attr("width");
let HEIGHT = 0;

const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;

const FIG_HEIGHT = 60;
const FIG_MARGIN = 20;

const DIST_HEIGHT = (FIG_HEIGHT + FIG_MARGIN) * POLLUTANTS.length;
const DIST_MARGIN = 20;

let CACHED_DATA = undefined;

// max value of each pollutant
const POLLUTANT_MAX = Object.fromEntries(POLLUTANTS.map((p) => [p, 0]));

const refresh = () => {
    Object.keys(POLLUTANT_MAX).forEach((p) => (POLLUTANT_MAX[p] = 0));

    if (!CACHED_DATA) {
        const txt = SVG.append("text")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top + FIG_HEIGHT})`)
            .style("font-size", "3em");
        txt.append("tspan").text("The csv file is large");
        txt.append("tspan").text("Loading may take few seconds ...").attr("x", 0).attr("dy", "1em");

        d3.csv("http://vis.lab.djosix.com:2023/data/air-pollution.csv").then((data) => {
            CACHED_DATA = cleanData(data);
            HEIGHT =
                Object.keys(CACHED_DATA).length * (DIST_HEIGHT + DIST_MARGIN) +
                MARGIN.top +
                MARGIN.bottom;
            SVG.attr("height", HEIGHT);

            createFigures();
        });
    } else createFigures();
};

const cleanData = (data) => {
    const hours_per_day = 24;
    const result = {}; // result[district][pollutant] = { date: daily_average }

    const dictToArr = (dict) => {
        return Object.keys(dict).map((dt) => {
            return {
                date: dt,
                val: dict[dt],
            };
        });
    };

    const getDist = (address) => address.split(", ")[2];

    data.forEach((row) => {
        const dt = row["Measurement date"].split(" ")[0];

        const district = getDist(row.Address);
        if (!(district in result)) result[district] = {};

        POLLUTANTS.forEach((p) => {
            const dict = result[district];
            if (!(p in dict)) dict[p] = {};
            if (!(dt in dict[p])) dict[p][dt] = 0;

            dict[p][dt] += Math.max(+row[p], 0) / hours_per_day;
        });
    });

    Object.keys(result).forEach((district) => {
        Object.keys(result[district]).forEach((pollutant) => {
            result[district][pollutant] = dictToArr(result[district][pollutant]);
        });
    });

    return result; // result[district][pollutant] = [ { date: date, val: daily_average }, ... ]
};

const createFigures = () => {
    SVG.html("");
    const data = getFilteredData();

    // Vertocal separate district and pollutant
    const border_x = MARGIN.left / 3 - 10;
    SVG.append("path")
        .attr("class", "border thick")
        .attr("d", `M${border_x} ${MARGIN.top} L${border_x} ${HEIGHT - MARGIN.bottom}`);

    const yScale = (i) => MARGIN.top + i * (DIST_HEIGHT + DIST_MARGIN);

    const min_dt = new Date(document.getElementById("begin-date").value);
    const max_dt = new Date(document.getElementById("end-date").value);
    const timeScale = d3.scaleTime().domain([min_dt, max_dt]).range([0, INNER_WIDTH]);

    Object.keys(data).forEach((district, i) => {
        const g = SVG.append("g").attr("transform", `translate(0, ${yScale(i)})`);

        // Horizontal Bar between each location
        const border_y = yScale(i + 1) - DIST_MARGIN / 2;
        SVG.append("path")
            .attr("class", "border thick")
            .attr("d", `M0 ${border_y} L${WIDTH} ${border_y}`);

        plotDistrict(g, data[district], district, timeScale);
    });
};

const getFilteredData = () => {
    const data = {};

    const min_dt = new Date(document.getElementById("begin-date").value);
    const max_dt = new Date(document.getElementById("end-date").value);

    Object.keys(CACHED_DATA).forEach((dist) => {
        data[dist] = {};

        Object.keys(CACHED_DATA[dist]).forEach((p) => {
            data[dist][p] = [];

            for (let i = 0; i < CACHED_DATA[dist][p].length; i++) {
                const d = CACHED_DATA[dist][p][i];
                const dt = new Date(d.date);
                if (dt < min_dt) continue;
                else if (dt > max_dt) break;
                else {
                    data[dist][p].push(d);
                    POLLUTANT_MAX[p] = Math.max(POLLUTANT_MAX[p], d.val);
                }
            }
        });
    });

    console.log(POLLUTANT_MAX);
    console.log(data);

    return data;
};

const plotDistrict = (parent_g, data, district, timeScale) => {
    parent_g
        .append("text")
        .attr("class", "district")
        .attr("transform", `translate(30, ${(DIST_HEIGHT / 5) * 3}), rotate(-90)`)
        .text(district);

    const yScale = (i) => i * (FIG_HEIGHT + FIG_MARGIN);

    Object.keys(data).forEach((pollutant, i) => {
        parent_g
            .append("text")
            .text(pollutant)
            .attr("class", "pollutant")
            .attr("transform", `translate(${MARGIN.left / 3},${yScale(i + 0.5)})`);

        const g = parent_g.append("g").attr("transform", `translate(${MARGIN.left},${yScale(i)})`);
        plot(g, data[pollutant], pollutant, timeScale);
    });
};

const plot = (g, data, pollutant, timeScale) => {
    const band_cnt = getBandCnt();
    const band_width = POLLUTANT_MAX[pollutant] / band_cnt;
    const yScale = d3.scaleLinear().domain([0, band_width]).range([FIG_HEIGHT, 0]);

    const getArea = d3
        .area()
        .x((d) => timeScale(new Date(d.date)))
        .y0((_) => yScale(0))
        .y1((d) => yScale(d.val), FIG_HEIGHT);

    const colorScale = d3
        .scaleOrdinal()
        .domain([...Array(band_cnt).keys()]) // 0, 1, ..., band_cnt-1
        .range(getColorScheme(COLOR_MAP[pollutant], 1));

    g.selectAll("path")
        .data(getBands(data, band_width))
        .enter()
        .append("path")
        .attr("d", getArea)
        .attr("class", "area")
        .style("fill", (_, i) => colorScale(i));

    g.selectAll("rect") // tool tips
        .data(data)
        .enter()
        .append("rect")
        .attr("width", INNER_WIDTH / data.length)
        .attr("height", FIG_HEIGHT)
        .attr("x", (d) => timeScale(new Date(d.date)))
        .attr("data-pollutant", pollutant)
        .style("opacity", 0)
        .each(addToolTip);

    const yAxis = d3.axisLeft(yScale).tickSize(5).tickValues([0, band_width]);
    g.append("g").call(yAxis);
};

const getColorScheme = (name, skip_n) => {
    // skip_n: skip n lightest colors of the scheme
    const schemes = d3[`scheme${name}`];
    return schemes[getBandCnt() + skip_n].slice(skip_n);
};

const getBands = (data, band_width) => {
    const clip = (val) => Math.max(Math.min(val, band_width), 0);

    const bands = [];
    for (let i = 0; i < getBandCnt(); i++) {
        const band = data.map((d) => {
            return {
                date: d.date,
                val: clip(d.val - band_width * i),
            };
        });

        bands.push(band);
    }

    return bands;
};

const getBandCnt = () => +document.getElementById("bands").value;

function addToolTip(d, _) {
    const target = d3.select(this);
    const tool_tip = d3.select("#tool-tip");

    target.on("mouseover", () => {
        const p = target.attr("data-pollutant");
        const unit = p.includes("PM") ? "mg/m3" : "ppm";

        tool_tip
            .style("opacity", 1)
            .style("left", d3.event.pageX - 100 + "px")
            .style("top", d3.event.pageY - 160 + "px");

        tool_tip.select("#dt").html(d.date);
        tool_tip.select("#val").html(Math.round(d.val * 10000) / 10000);
        tool_tip.select("#unit").html(unit);
    });

    target.on("mouseout", () => tool_tip.style("opacity", 0));
}
