_config.layers.parks = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/major_parks.json"
    }),
    style: function(feature, resolution) {
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: "rgba(174, 213, 129, 0.5)"
            })
        });
    }
})
