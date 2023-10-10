const svg = d3.select("svg.matrix");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = {
    top: 50,
    bottom: 0,
    left: 20,
    right: 20,
};
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;

const attr_cnt = attr_arr.length;
const grid_width = inner_width / attr_cnt;
const grid_height = inner_height / attr_cnt;

const colorScale = d3
    .scaleSequential()
    .domain([-1, 1])
    .interpolator(d3.interpolateRdYlGn);

const radiusScale = d3
    .scalePow()
    .exponent(0.5)
    .domain([0, 1])
    .range([0, grid_width / 2]);

const createPlots = () => {
    d3.text(
        "https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/abalone.data"
    ).then((txt) => {
        const data = d3.csvParseRows(txt);

        const cols_m = Array.from(Array(attr_arr.length), (_) => Array());
        const cols_f = Array.from(Array(attr_arr.length), (_) => Array());
        const cols_i = Array.from(Array(attr_arr.length), (_) => Array());

        data.forEach((row) => {
            row.slice(1).forEach((n, i) => {
                switch (row[0]) {
                    case "M":
                        cols_m[i].push(+n);
                        break;
                    case "F":
                        cols_f[i].push(+n);
                        break;
                    case "I":
                        cols_i[i].push(+n);
                        break;
                }
            });
        });

        
        createGrids("male", cols_m);
        createGrids("female", cols_f);
        createGrids("infant", cols_i);
    });
};

const getCls = (row, col) => {
    if (row == col) return "diagonal";
    else if (row > col) return "lower-diagonal";
    else return "upper-diagonal";
};

const createGrids = (gender, cols) => {
    const cur_svg = d3.select(`#${gender}`);

    cur_svg
        .append("text")
        .attr("class", "plot-title")
        .text(gender)
        .attr("transform", `translate(${inner_width / 2}, ${margin.top / 2})`);

    const g = cur_svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    for (var i = 0; i < attr_cnt; i++) {
        for (var j = 0; j < attr_cnt; j++) {
            g.append("rect")
                .attr("class", getCls(i, j))
                .attr(
                    "transform",
                    `translate(${grid_width * j}, ${grid_height * i})`
                )
                .attr("width", grid_width)
                .attr("height", grid_height);
        }
    }

    fillGrids(g, cols);
};

const fillGrids = (g, cols) => {
    const mat = getMatrix(cols);

    const x = (col) => grid_width * (col + 0.5);
    const y = (row) => grid_height * (row + 0.5);

    const fillDiagonal = (i) => {
        const text = g
            .append("text")
            .attr("class", getCls(i, i))
            .attr("transform", `translate(${x(i)}, ${y(i)})`);

        attr_arr[i].split("_").forEach((t, j) => {
            text.append("tspan")
                .attr("x", "0")
                .attr("dy", j == 0 ? "0" : "1em")
                .text(t);
        });
    };

    const fillUpper = (i, j) => {
        g.append("text")
            .attr("class", getCls(i, j))
            .attr("transform", `translate(${x(j)}, ${y(i)})`)
            .attr("fill", colorScale(mat[i][j]))
            .text(Math.round(mat[i][j] * 100) / 100);
    };

    const fillLower = (i, j) => {
        g.append("circle")
            .attr("class", getCls(i, j))
            .attr("r", radiusScale(Math.abs(mat[i][j])))
            .attr("cx", x(j))
            .attr("cy", y(i))
            .attr("fill", colorScale(mat[i][j]));
    };

    for (var i = 0; i < attr_cnt; i++) {
        for (var j = 0; j < attr_cnt; j++) {
            if (i == j) fillDiagonal(i);
            else if (i < j) fillUpper(i, j);
            else fillLower(i, j);
        }
    }
};

const getMatrix = (cols) => {
    const mean_table = Array(cols.length);
    const var_table = Array(cols.length);

    const mean = (i) => {
        if (!mean_table[i]) {
            const arr = cols[i];
            mean_table[i] = arr.reduce((acc, cur) => acc + cur) / arr.length;
        }
        return mean_table[i];
    };
    const dnom = (i) => {
        if (!var_table[i]) {
            const m = mean(i);
            var_table[i] = cols[i].reduce((acc, cur) => acc + (cur - m) ** 2);
        }

        return var_table[i];
    };
    const coef = (x, y) => {
        const m_x = mean(x);
        const m_y = mean(y);

        let nom = 0;
        for (let i = 0; i < cols[x].length; i++)
            nom += (cols[x][i] - m_x) * (cols[y][i] - m_y);

        return nom / (dnom(x) * dnom(y)) ** 0.5;
    };

    const mat = [];
    for (let i = 0; i < cols.length; i++) {
        mat.push([]);

        for (let j = 0; j < cols.length; j++) {
            if (i == j) mat[i].push(1);
            else if (i > j) mat[i].push(mat[j][i]);
            else mat[i].push(coef(i, j));
        }
    }

    return mat;
};
