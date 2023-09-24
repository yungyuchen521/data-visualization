const color_map = {
	"Iris-setosa": "red",
  "Iris-versicolor": "green",
  "Iris-virginica": "blue",
};

const addSingleLegend = (parent_g, name, color) => {
	const m = 20; // spacing between circle & text 

  parent_g.append("circle")
  	.attr("class", "legend-color")
		.attr("fill", color);

  parent_g.append("text")
  		.text(name)
  		.attr("class", "legend-label")
      .attr("x", m)
      .attr("y", 10);
}

const addLegends = (parent_g, width) => {
  const offset = 30;
  const legend_margin = width / Object.keys(color_map).length;

  Object.keys(color_map).forEach((name, i) => {
  	const legend_g = parent_g.append("g")
    .attr("class", "legend-container")
  	.attr(
      "transform",
      `translate(${offset+legend_margin*i},-50)`
    );

    addSingleLegend(legend_g, name, color_map[name]);
  });
}

const addAxis = (
  g,
  inner_width,
  inner_height,
  x_scale,
  x_label,
  y_scale,
	y_label,
) => {
  const y_axis = d3.axisLeft(y_scale)
    .tickSize(-inner_width)
    .tickPadding(10);
  const y_axis_g = g.append("g").call(y_axis);
  y_axis_g.selectAll("path").remove();
  y_axis_g
    .append("text")
      .attr("class", "axis-label")
      .attr("y", -70)
      .attr("x", -inner_height / 2)
      .attr("fill", "black")
      .attr("transform", `rotate(-90)`)
      .attr("text-anchor", "middle")
      .text(y_label);

  const xAxis = d3.axisBottom(x_scale)
    .tickSize(-inner_height)
    .tickPadding(15);
  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr(
      "transform",
      `translate(0,${inner_height})`
    );
  xAxisG.select("path").remove();
  xAxisG
    .append("text")
      .attr("class", "axis-label")
      .attr("y", 75)
      .attr("x", inner_width / 2)
      .attr("fill", "black")
      .text(x_label);
}

const plotData = (data, x_axis, y_axis) => {
  const svg = d3.select("svg");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const margin = {
    top: 100,
    right: 40,
    bottom: 100,
    left: 150,
  };

  const inner_width = width - margin.left - margin.right;
  const inner_height = height - margin.top - margin.bottom;

  const get_x = (d => d[x_axis]);
  const get_y = (d => d[y_axis]);

  const x_scale = d3.scaleLinear()
    .domain(d3.extent(data, get_x))
    .range([0, inner_width])
    .nice();

  const y_scale = d3.scaleLinear()
    .domain(d3.extent(data, get_y))
    .range([inner_height, 0])
    .nice();

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},${margin.top})`
    );

  addLegends(g, inner_width);
  addAxis(
    g.append("g").attr("class", "legends-outer-container"),
  	inner_width,
  	inner_height,
  	x_scale,
  	x_axis,
  	y_scale,
		y_axis,
  )

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "dot")
      .attr("cy", d => y_scale(get_y(d)))
      .attr("cx", d => x_scale(get_x(d)))
  		.attr("fill", d => color_map[d.class]);
};

const reload = () => {
  d3.select("svg").html("");

  d3.csv("https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/iris.csv").then((data) => {
    data = data.map(d => (
      {
      	"sepal length": +d["sepal length"],
        "sepal width": +d["sepal width"],
        "petal length": +d["petal length"],
        "petal width": +d["petal width"],
        "class": d.class,
      }
    ))
    .filter(d => d.class);

    plotData(
      data,
      document.getElementById(select_x_id).value,
      document.getElementById(select_y_id).value,
    );
  });
};

document
  .getElementById(select_x_id)
  .addEventListener("change", reload);

document
  .getElementById(select_y_id)
  .addEventListener("change", reload);

reload();
