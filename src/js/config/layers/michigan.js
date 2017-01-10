_config.layers.michigan = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "data/layers/lake_michigan.json"
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "#80CBC4"
        })
    })
})
