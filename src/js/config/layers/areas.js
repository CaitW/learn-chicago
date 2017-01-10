_config.layers.areas = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/areas.json"
    }),
    style: function(feature, resolution) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "#616161",
                width: 4
            }),
            fill: new ol.style.Fill({
                color: "#757575",
            })
        });
    }
})
