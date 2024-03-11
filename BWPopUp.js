window.addEventListener("load", () => {
  $.getJSON("BW.geojson", (data) => {
    const map = L.map("map").setView(
      [48.726605690296552, 9.211547316465603],
      8
    );

    const solar = data.features;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 10,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    function getColor(Bruttoleis) {
      return Bruttoleis >= 25000
        ? "#BD0026" // dark red
        : Bruttoleis >= 18000
        ? "#E31A1C"
        : Bruttoleis >= 15000
        ? "#FC4E2A"
        : Bruttoleis >= 1000
        ? "#FD8D3C"
        : Bruttoleis >= 500
        ? "#FEB24C"
        : Bruttoleis === null
        ? "#FED976"
        : "#FFEDA0"; // light red
    }

    const solarLayer = L.geoJSON(solar, {
      style: (feature) => {
        const bruttoleis = feature.properties.Bruttoleis;
        var color = getColor(feature.properties.Bruttoleis);
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
          var name = feature.properties.name || "Unknown"; // ? feature.properties.name
          //   : "Unknown";
          var plz_name = feature.properties.plz_name || "Unknown";
          // ("No postcode available"); // ? feature.properties.plz_name
          // : "Unknown";
          var bruttoleis = feature.properties.Bruttoleis
            ? feature.properties.Bruttoleis
            : "No data";
          var nettonennl = feature.properties.Nettonennl
            ? feature.properties.Nettonennl
            : "No data";
          // create and display popup on map
          let popupContent = `<div><h2>${name} - ${plz_name}</h2></div>
                             <div>Bruttoleis: ${bruttoleis}</div>
                              <div>Nettonennl: ${nettonennl}</div>
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
              categories: ["Bruttoleis", "Nettonennl"], // Categories should match your data properties
            },
            title: {
              text: "Brutto und Netto",
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
