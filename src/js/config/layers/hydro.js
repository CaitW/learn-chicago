_config.layers.hydro = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/hydro.json"
    }),
    style: function(feature, resolution) {
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: "rgba(128, 203, 196, 1)"
            })
        });
    }
})
