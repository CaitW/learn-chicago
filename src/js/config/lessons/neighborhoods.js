_config.lessonGroups.neighborhoods = new LessonGroup({
    id: "neighborhoods",
    name: "Neighborhoods",
    style: function(feature, resolution) {
        if (feature.get('FOI') === true) {
            return null;
        } else if (feature.get('answeredCorrectly') === true) {
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(139, 195, 74, 1)"
                })
            });
        } else {
            return null;
        }
    },
    label_style: function(feature, resolution) {
        if (feature.get('FOI') === true) {
            return new ol.style.Style({
                text: new ol.style.Text({
                    text: "\uf059",
                    font: "24px FontAwesome",
                    fill: new ol.style.Fill({
                        color: "#000000"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(255,255,255,1)",
                        width: 4
                    })
                }),
                fill: new ol.style.Fill({
                    color: "#4FC3F7"
                }),
                stroke: new ol.style.Stroke({
                    color: "#81D4FA",
                    width: 2
                }),
                zIndex: 99
            });
        } else if (feature.get('answeredCorrectly') === true) {
            return new ol.style.Style({
                text: new ol.style.Text({
                    text: feature.get('PRI_NEIGH'),
                    font: "12px Roboto",
                    fill: new ol.style.Fill({
                        color: "#000000"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(255,255,255,1)",
                        width: 4
                    })
                }),
                stroke: new ol.style.Stroke({
                    color: "#C5E1A5",
                    width: 2
                })
            })
        } else {
            return null;
        }
    },
    incorrectAnswer: function(FOI, lesson) {
        FOI.feature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "#FFFFFF",
                width: 2
            }),
            fill: new ol.style.Fill({
                color: "#E53935"
            }),
            text: new ol.style.Text({
                text: FOI.feature.get('PRI_NEIGH'),
                font: "12px Roboto",
                fill: new ol.style.Fill({
                    color: "#000000"
                })
            })
        }));
        setTimeout(function() {
            FOI.feature.setStyle(null);
        }, 3000);
    },
    prependLayers: [_config.layers.michigan, _config.layers.parks],
    appendLayers: [_config.layers.hydro, _config.layers.cta, _config.layers.roads],
    lessons: {
        downtown: new Lesson({
            id: "downtown",
            name: "downtown",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/downtown.json',
            extent: [-9759511.095178286, 5137025.967719563, -9749674.347775986, 5148657.571875363]
        }),
        northeast: new Lesson({
            id: "northeast",
            name: "northeast",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/northeast.json',
            extent: [-9790485.442149477, 5145620.955218375, -9752632.34966757, 5165620.560776997]
        }),
        northwest: new Lesson({
            id: "northwest",
            name: "northwest",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/northwest.json',
            extent: [-9790485.442149477, 5145620.955218375, -9752632.34966757, 5165620.560776997]
        }),
        "south-central": new Lesson({
            id: "south-central",
            name: "south-central",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/south-central.json',
            extent: [-9774851.687725516, 5106667.370653244, -9738297.316051764, 5139253.946787348]
        }),
        south: new Lesson({
            id: "south",
            name: "south",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/south.json',
            extent: [-9774851.687725516, 5106667.370653244, -9738297.316051764, 5139253.946787348]
        }),
        west: new Lesson({
            id: "west",
            name: "west",
            nameAttr: "PRI_NEIGH",
            dataLocation: 'data/lessons/neighborhoods/west.json',
            extent: [-9772365.332804928, 5133350.632368901, -9754628.964665914, 5149161.805813841]
        }),
    }
})
