var map_data;
document.addEventListener("DOMContentLoaded", function () {
  fetch("BW.geojson")
    .then((response) => response.json())
    .then((data) => {
      map_data = data;

      var container = L.DomUtil.get("map");
      if (container != null) {
        container._leaflet_id = null;
      }
      var map = L.map("map").setView(
        [48.726605690296552, 9.211547316465603],
        8
      );
      var tiles = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 12,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ).addTo(map);

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

      function style(feature) {
        console.log(feature.properties.Bruttoleis);
        var color = getColor(feature.properties.Bruttoleis);
        return {
          fillColor: color,
          weight: 1,
          opacity: 1,
          color: "green",
          dashArray: "3",
          fillOpacity: 0.95,
        };
      }

      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
          weight: 2,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.7,
        });

        layer.bringToFront();
      }

      function resetHighlight(e) {
        geojson.resetStyle(e.target);
      }

      function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
      }

      function onEachFeature(feature, layer) {
        var bruttoleis = feature.properties.Bruttoleis
          ? feature.properties.Bruttoleis
          : "";
        layer.bindPopup(
          "<h4>" +
          feature.properties.plz_name_lo +
          "</h4>" +
          bruttoleis + // feature.properties.Bruttoleis +
            ": Bruttoleistung der Einheit: kWp:</p>"
        );

        layer.on({
          mouseover: function (e) {
            highlightFeature(e);
            info.update(feature.properties);
          },
          mouseout: resetHighlight,
          click: zoomToFeature,
        });
      }

      // },

      L.geoJSON(map_data, {
        onEachFeature: onEachFeature,
        style: style,
      }).addTo(map);

      var info = L.control();

      info.onAdd = function (map) {
        this._div = L.DomUtil.create("div", "info");
        this.update();
        return this._div;
      };
      info.update = function (props) {
        this._div.innerHTML =
          "<h4>Baden Württemberg</h4>" +
          (props
            ? "<b>" +
              props.plz_name_lo +
              "</b><br />" +
              props.Bruttoleis +
              " kWp "
            : "");
      };

      info.addTo(map);

      var legend = L.control({ position: "bottomright" });

      legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var ranges = [25000, 18000, 15000, 1000, 500, null];
        div.innerHTML = "<h4>Bruttoleistung der Einheit: <br /> kWp > 500</h4>";

        for (var i = 0; i < ranges.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            getColor(ranges[i]) +
            '"></i>' +
            '<span style="color:' +
            getColor(ranges[i]) +
            '">' +
            "<strong>" +
            ranges[i] +
            "</strong>" +
            (ranges[i + 1] ? "&ndash;" + ranges[i + 1] : "+");
        }
        return div;
      };

      legend.addTo(map);
    })

    .catch((error) => {
      console.error("Error loading Geojson data:", error);
    });
});
