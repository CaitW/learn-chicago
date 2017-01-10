_config.layers.roads = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/major_roads.json"
    }),
    style: function(feature, resolution) {
        if (feature.get("CLASS") === "1") {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#757575",
                    width: 3
                }),
                zIndex: 99
            });
        } else if (feature.get("CLASS") === "2") {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#757575",
                    width: 2
                }),
                zIndex: 98,
            });
        } else if (resolution < 17) {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#757575",
                    width: 1
                }),
                zIndex: 97,
            });
        } else {
            return null;
        }
    }
})
