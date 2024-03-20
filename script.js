am5.ready(function() {
  // Create root element
  var root = am5.Root.new("chartdiv");

  // Define chart and axes
  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingLeft: 0
    })
  );
  var yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "task",
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 30,
        minorGridEnabled: true
      })
    })
  );
  var xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.5,
      min: 0,
      renderer: am5xy.AxisRendererX.new(root, {
        visible: true,
        strokeOpacity: 0.5,
        minGridDistance: 80
      })
    })
  );

  // Define series
  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Task Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueXField: "rating",
      sequencedInterpolation: true,
      categoryYField: "task"
    })
  );
  var columnTemplate = series.columns.template;

  // Set up task data
  var taskData = [];

  // Add event listener to task form
  document.getElementById("taskForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var taskName = document.getElementById("taskName").value;
    var taskRating = parseInt(document.getElementById("taskRating").value);

    if (taskName && !isNaN(taskRating)) {
      taskData.push({ task: taskName, rating: taskRating });
      updateChart();
      document.getElementById("taskForm").reset();
    } else {
      alert("Por favor ingresa un nombre de materia y una calificación válida.");
    }
  });

  // Update chart with new task data
  function updateChart() {
    yAxis.data.setAll(taskData);
    series.data.setAll(taskData);
    sortCategoryAxis();
  }

  // Sorting axis
  function sortCategoryAxis() {
    series.dataItems.sort(function(x, y) {
      return y.get("graphics").y() - x.get("graphics").y();
    });
    var easing = am5.ease.out(am5.ease.cubic);

    am5.array.each(yAxis.dataItems, function(dataItem) {
      var seriesDataItem = getSeriesItem(dataItem.get("category"));

      if (seriesDataItem) {
        var index = series.dataItems.indexOf(seriesDataItem);
        var column = seriesDataItem.get("graphics");
        var fy = yAxis.positionToCoordinate(yAxis.indexToPosition(index)) - column.height() / 2;

        if (index != dataItem.get("index")) {
          dataItem.set("index", index);
          var x = column.x();
          var y = column.y();
          column.set("dy", -(fy - y));
          column.set("dx", x);
          column.animate({ key: "dy", to: 0, duration: 600, easing: easing });
          column.animate({ key: "dx", to: 0, duration: 600, easing: easing });
        } else {
          column.animate({ key: "y", to: fy, duration: 600, easing: easing });
          column.animate({ key: "x", to: 0, duration: 600, easing: easing });
        }
      }
    });
    yAxis.dataItems.sort(function(x, y) {
      return x.get("index") - y.get("index");
    });
  }

  // Get series item by category
  function getSeriesItem(category) {
    for (var i = 0; i < series.dataItems.length; i++) {
      var dataItem = series.dataItems[i];
      if (dataItem.get("categoryY") == category) {
        return dataItem;
      }
    }
  }

  // Make stuff animate on load
  series.appear(1000);
  chart.appear(1000, 100);
});
