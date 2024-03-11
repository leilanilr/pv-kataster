window.addEventListener("load", () => {
  $.getJSON("StuggiFinal.geojson", (data) => {
    const map = L.map("map").setView([48.775846, 9.182932], 12);

    const solar = data.features;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    function getColor(Bruttoleis) {
      return Bruttoleis >= 6000
        ? "#BD0026" // dark red
        : Bruttoleis >= 3000
        ? "#E31A1C"
        : Bruttoleis >= 1000
        ? "#FC4E2A"
        : Bruttoleis >= 500
        ? "#FD8D3C"
        : Bruttoleis >= 100
        ? "#FEB24C"
        : Bruttoleis >= 50
        ? "#FED976"
        : Bruttoleis === null
        ? "#FED976"
        : "#FFEDA0"; // light red
    }

    const solarLayer = L.geoJSON(solar, {
      style: (feature) => {
        const bruttoleis = feature.properties.Bruttoleis;
        var color = getColor(bruttoleis);
        return {
          fillColor: color,
          weight: 1,
          opacity: 1,
          color: "green",
          dashArray: "3",
          fillOpacity: 0.95,
        };
      },

      onEachFeature: (feature, layer) => {
        layer.on("click", (e) => {
          var name = feature.properties.name;
          var plz_name = feature.properties.plz_name;
          // create and display popup on map
          let popupContent = `<div><h2>${name} - ${plz_name}</h2></div>
                              <div>Bruttoleis: ${feature.properties.Bruttoleis}</div>
                              <div>Nettonennl: ${feature.properties.Nettonennl}</div>
                              <div>Nettonennl: ${feature.properties.Anzahl_der}</div>
                              <div id="chart"></div>`;

          // create and display popup on map
          let popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);

          // apexchart options
          const options = {
            series: [
              {
                name: "Bruttoleis",
                data: [feature.properties.Bruttoleis],
              },

              {
                name: "Nettonennl",
                data: [feature.properties.Nettonennl], // Wrap the value in an array
              },
              {
                name: "Module",
                data: [feature.properties.Anzahl_der], // Wrap the value in an array
              },
            ],
            chart: {
              type: "bar",
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: "20%",
                endingShape: "rounded",
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              categories: ["Bruttoleis", "Nettonennl", "Module"],
            },
            title: {
              text: "Brutto Netto & Anzahl der Module",
            },
            yaxis: {
              title: {
                text: "Values kWp",
              },
            },
            fill: {
              opacity: 1,
            },
          };

          const chart = new ApexCharts(
            document.querySelector("#chart"),
            options
          );
          chart.render();

          // popup close event
          popup.on("remove", () => {
            chart.destroy();
            const chartNode = document.getElementById("chart");
            chartNode.parentNode.replaceChildren();
          });
        });
      },
    }).addTo(map);
  });
});
