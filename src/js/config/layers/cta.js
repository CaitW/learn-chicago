_config.layers.cta = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/cta.json"
    }),
    style: function(feature, resolution) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "#424242",
                width: 2,
                lineDash: [3,5]
            }),
            zIndex: 99,
        });  
    }
});
