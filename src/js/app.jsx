var Immutable = require('immutable');
import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';;
class FOI {
    constructor (name, feature) {
        this.name = name;
        this.feature = feature;
        this.selected = false;
        this.feature.set('FOI', false);
        this.answeredCorrectly = false;
    }
    pick () {
        this.selected = true;
        this.feature.set("FOI", true);
    }
    unpick () {
        this.selected = false;
        this.feature.set("FOI", false);        
    }
    resetAnswer () {
        this.answeredCorrectly = false;
        this.feature.set('answeredCorrectly', false);        
    }
    answer (correct) {
        if (correct === true) {
            this.answeredCorrectly = true;
            this.feature.set('answeredCorrectly', true);
        } else {
            this.answeredCorrectly = false;
            this.feature.set('answeredCorrectly', false);
        }
    }
}
;
class Lesson {
    constructor(properties) {
        var self = this;
        this.id = properties.id;
        this.complete = false;
        this.loaded = false;
        this.name = properties.name;
        this.source = new ol.source.Vector({
            format: new ol.format.GeoJSON({
                featureProjection: "EPSG:3857"
            }),
            url: properties.dataLocation
        });
        this.layer = new ol.layer.Vector({
            layerName: self.name,
            source: self.source
        });
        this.labels_layer = new ol.layer.Vector({
            layerName: self.name + "_labels",
            source: self.source
        });
        this.FOI = [];
        this.currentlySelectedFOI = false;
        this.extent = properties.extent;
        var checkIfReady = this.layer.getSource().on("addfeature", function(e) {
            if (self.layer.getSource().getState() === "ready") {
                $.each(self.layer.getSource().getFeatures(), function(i, feature) {
                    var newFeature = new FOI(feature.get(properties.nameAttr), feature);
                    self.FOI.push(newFeature);
                    state.dispatch({
                        type: 'NEW_FEATURE',
                        feature: newFeature.name
                    });
                });
                self.extent = self.layer.getSource().getExtent();
                self.start();
                self.loaded = true;
                ol.Observable.unByKey(checkIfReady);
            }
        });
    }
    answer(feature) {
        var self = this;
        let answeredCorrectly = false;
        if (feature.answeredCorrectly === false) {
            if (feature === self.currentlySelectedFOI) {
                state.dispatch({
                    type: 'CORRECT_ANSWER',
                    feature: feature.name
                });
                feature.answer(true);
                answeredCorrectly = true;
            } else {
                state.dispatch({
                    type: "INCORRECT_ANSWER",
                    feature: self.currentlySelectedFOI.name
                });
                self.currentlySelectedFOI.answer(false);
                self.incorrectAnswer(self.currentlySelectedFOI, self);
            }
            self.selectNextFeature();
        }
        return answeredCorrectly;
    }
    selectNextFeature() {
        var self = this;
        var lastSelectedFeature = self.currentlySelectedFOI;
        if (self.FOI.length > 0) {
            $.each(self.FOI, function(i, f) {
                f.unpick();
            });
            var remainingFOI = [];
            $.each(self.FOI, function(i, f) {
                if (f.answeredCorrectly === false) {
                    remainingFOI.push(f);
                }
            });
            if (remainingFOI.length === 0) {
                self.complete = true;
                state.dispatch({ type: "LESSON_COMPLETE" });
            } else {
                // don't pick the most recently selected feature
                if (remainingFOI.length > 2 && lastSelectedFeature !== false) {
                    var indexOfLastSelectedFeature = $.inArray(lastSelectedFeature, remainingFOI);
                    if (indexOfLastSelectedFeature != -1) {
                        remainingFOI.splice(indexOfLastSelectedFeature, 1);
                    }
                }
                var randomIndex = (Math.floor((Math.random() * remainingFOI.length) + 1)) - 1;
                remainingFOI[randomIndex].pick();
                self.currentlySelectedFOI = remainingFOI[randomIndex];
                state.dispatch({
                    type: "NEW_SELECTED_FEATURE",
                    selectedFeature: self.currentlySelectedFOI.name
                });
                self.currentlySelectedFOI.feature.setStyle(null);
            }
            self.resetLayerStyles();
        }
    }
    resetLayerStyles () {
        var self = this;
        self.layer.setStyle(self.layer.getStyle());
        self.labels_layer.setStyle(self.labels_layer.getStyle());        
    }
    resetLesson() {
        var self = this;
        $.each(self.FOI, function(i, f) {
            f.feature.setStyle(null);
            f.unpick();
            f.resetAnswer();
        });
        self.currentlySelectedFOI = false;
        self.resetLayerStyles();
        self.complete = false;
    }
    start() {
        var self = this;
        self.resetLesson();
        self.selectNextFeature();
        state.dispatch({ type: "LESSON_READY" });
    }
    getFeatureByName(fName) {
        var featureToReturn = false;
        $.each(self.FOI, function(i, feature) {
            if (feature.name = fName) {
                featureToReturn = feature;
                return false;
            }
        });
        return featureToReturn;
    }
}
;
class LessonGroup {
    constructor(options) {
        var self = this;
        this.id = options.id || "";
        this.name = options.name || "";
        this.style = options.style || null;
        this.label_style = options.label_style || null;
        this.prependLayers = options.prependLayers || [];
        this.appendLayers = options.appendLayers || [];
        this.lessons = options.lessons || [];
        this.incorrectAnswer = options.incorrectAnswer || function() {};
        $.each(self.lessons, function(lessonName, lesson) {
            lesson.layer.setStyle(self.style);
            lesson.labels_layer.setStyle(self.label_style);
            lesson.incorrectAnswer = self.incorrectAnswer;
            lesson.groupID = self.id;
        });
    }
};
var _config = {
    map: {
        extent: [-9805648.63842716, 5106413.302270456, -9719387.465406507, 5167155.544939167]
    },
    lessonGroups: {},
    layers: {}
};
;
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
;
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
;
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
;
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
;
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
;
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
;
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
;
var state = (function() {
    var _types = {};
    var _store = createStore(function(previousState, action) {
        switch (action.type) {
            case 'SELECT_LESSON':
                var newState = previousState.merge({
                    'overall_mode': 'learning',
                    'lesson_state': 'not_ready',
                    'current_lesson': action.lesson,
                    'current_lesson_group': action.lessonGroup
                });
                break;
            case 'LESSON_COMPLETE':
                var newState = previousState.merge({
                    'overall_mode': 'default',
                    'lesson_state': 'not_ready',
                    'current_lesson': false,
                    'current_lesson_group': false,
                    'selected_feature': false,
                    'last_incorrect_answer': false,
                    'features': [],
                    'correct_answers': []
                });
                break;
            case 'LESSON_READY':
                var newState = previousState.merge({
                    'lesson_state': 'ready'
                });
                break;
            case 'NEW_SELECTED_FEATURE':
                var newState = previousState.merge({
                    'selected_feature': action.selectedFeature
                });
                break;
            case 'NEW_FEATURE':
                var newState = previousState.merge({
                    'features': [...previousState.get('features'), action.feature]
                });
                break;
            case 'CORRECT_ANSWER':
                var newState = previousState.merge({
                    'correct_answers': [...previousState.get('correct_answers'), action.feature]
                });
                break;
            case 'INCORRECT_ANSWER':
                var newState = previousState.merge({
                    'last_incorrect_answer': action.feature
                });
            break;
            default:
                var newState = previousState;
                break;
        }
        return newState;
    }, Immutable.Map({
        'overall_mode': 'default',
        'lesson_state': 'not_ready',
        'current_lesson': false,
        'current_lesson_group': false,
        'selected_feature': false,
        'features': [],
        'correct_answers': []
    }), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

    function dispatch(action) {
        _store.dispatch(action);
        if (typeof _types[action.type] !== "undefined") {
            _types[action.type].forEach(function(subscription) {
                subscription(_store.getState().toJS());
            });
        }
    };

    function on(type, subscription) {
        if (typeof _types[type] !== "undefined") {
            _types[type].push(subscription);
        } else {
            _types[type] = [subscription];
        }
    };

    function getState () {
        return _store.getState().toJS();
    }

    function debug () {
        console.log(_types);
    };

    function getCurrentLesson() {
        var lessonID = state.getState()['current_lesson'];
        var lessonGroupID = state.getState()['current_lesson_group'];
        return _config.lessonGroups[lessonGroupID].lessons[lessonID];
    };

    function getCurrentLessonGroup() {
        var lessonGroupID = state.getState()['current_lesson_group'];
        return _config.lessonGroups[lessonGroupID];
    };

    function getFeatureByName(name) {
        return getCurrentLesson().getFeatureByName(name);
    };

    function getCurrentSelectedFeature () {
        return state.getState()['selected_feature'];
    };

    return {
        dispatch: dispatch,
        on: on,
        getState: getState,
        debug: debug,
        getCurrentLesson: getCurrentLesson,
        getCurrentSelectedFeature: getCurrentSelectedFeature,
        getCurrentLessonGroup: getCurrentLessonGroup,
        getFeatureByName: getFeatureByName
    }
})();

var map = (function () {
    var _interactions = {
        dragrotate: new ol.interaction.DragRotate(),
        dragpan: new ol.interaction.DragPan(),
        pinchrotate: new ol.interaction.PinchRotate(),
        pinchzoom: new ol.interaction.PinchZoom(),
        keyboardpan: new ol.interaction.KeyboardPan(),
        keyboardzoom: new ol.interaction.KeyboardZoom(),
        mousewheelzoom: new ol.interaction.MouseWheelZoom(),
        dragzoom: new ol.interaction.DragZoom()
    };
    var _map = new ol.Map({
        controls: [],
        view: new ol.View({
            center: ol.proj.transform([-87.623177, 41.881832], "EPSG:4326", "EPSG:3857"),
            zoom: 11
        }),
        layers: [_config.layers.michigan],
        target: 'map',
        interactions: [
            _interactions.dragrotate,
            _interactions.dragpan,
            _interactions.pinchrotate,
            _interactions.pinchzoom,
            _interactions.keyboardpan,
            _interactions.keyboardzoom,
            _interactions.mousewheelzoom,
            _interactions.dragzoom
        ]
    });

    window.mapDebug = _map;

    function _resetLayerStyles() {
        _map.getLayers().forEach(function(layer, index, array) {
            layer.setStyle(layer.getStyle());
        });
    };

    function _zoomToExtent() {
        _map.getView().fit(_config.map.extent, _map.getSize());
    };

    function _resetMap() {
        _zoomToExtent();
        _resetLayerStyles();
    };

    function init() {
            _zoomToExtent();
            state.on("NEW_SELECTED_FEATURE", function(newState) {
                _resetLayerStyles();
            });
            state.on("SELECT_LESSON", function(newState) {
                var activeLayers = [];
                var currentLessonGroup = state.getCurrentLessonGroup();
                $.each(currentLessonGroup.prependLayers, function(i, layers) {
                    activeLayers.push(layers);
                });
                var currentLesson = state.getCurrentLesson();
                activeLayers.push(currentLesson.layer);
                $.each(currentLessonGroup.appendLayers, function(i, layers) {
                    activeLayers.push(layers);
                });
                activeLayers.push(currentLesson.labels_layer);
                _map.setLayerGroup(new ol.layer.Group({
                    layers: activeLayers
                }));
                _resetLayerStyles();
                // if the lesson has already been loaded, start it immediately
                if(currentLesson.loaded === true) {
                    currentLesson.start();
                }
            });
            state.on("LESSON_READY", function(newState) {
                var currentLesson = state.getCurrentLesson();
                if (!ol.extent.isEmpty(currentLesson.extent)) {
                    _map.getView().fit(currentLesson.extent, _map.getSize());
                }
            });
            state.on("LESSON_COMPLETE", function(newState) {
                _resetMap();
            });
    };
    return {
        init: init
    }
})();

var lessonList = (function() {
    var _lessonGroups = [];

    class LessonItem extends React.Component {
        constructor (props) {
            super(props);
            this.onLessonClick = this.onLessonClick.bind(this);
        }
        render () {
            var classNames = ["waves-effect","waves-light","btn-large"];
            if(this.props.lesson.complete === true) {
                classNames.push("complete");
            };
            return (
                <a href="#!" className={classNames.join(" ")} onClick={this.onLessonClick}>
                        <span className="card-title">{this.props.lesson.name}</span>
                </a>
            );
        }
        onLessonClick (e) {
            e.preventDefault();
            state.dispatch({
                type: 'SELECT_LESSON',
                lesson: this.props.lesson.id,
                lessonGroup: this.props.lesson.groupID
            }); 
            $('#lessonModal').modal('close');                    
        }
    }

    class LessonGroupItem extends React.Component {
        constructor (props) {
            super(props);
        }
        render () {
            var self = this;
            var lessons = [];
            $.each(this.props.lessonGroup.lessons, function (lessonID, lesson) {
                lessons.push(
                    <LessonItem key={lesson.id} lesson={lesson} />
                );                
            });
            return (  
                <div className="lessons">
                    {lessons}
                </div>
            );               
        }
    }

    class LessonList extends React.Component {
        constructor (props) {
            super(props);
        }
        render () {
            var lessonGroups = [];
            $.each(this.props.lessonGroups, function (lessonGroupID, group) {
                lessonGroups.push(<LessonGroupItem key={group.id} lessonGroup={group} />);
            });
            return (
                <div>
                    {lessonGroups}
                </div>
            );            
        }
    }
 
    class OpenLessonListButton extends React.Component {
        constructor (props) {
            super(props);
            this.openLessonList = this.openLessonList.bind(this);
        }
        openLessonList () {
            _openLessonListModal();
        }
        render () {
            return (
                <a className="btn" id="openLessonModal" onClick={this.openLessonList}>Lesson List</a>
            )
        }
    }

    class StartButton extends React.Component {
        constructor (props) {
            super(props);
        }
        openLessonList () {
            // close automatically triggers lesson list
            $('#introModal').modal('close');
        }
        render () {
            return (
                <a className="waves-effect waves-light btn-large" onClick={this.openLessonList}>Start</a>
            )
        }
    }

    function _render () {
        ReactDOM.render(
            <LessonList lessonGroups={_config.lessonGroups}/>,
            document.getElementById('lessonList')
        );        
    }

    function _openLessonListModal() {
        $('#lessonModal').modal('open');
    }

    function _openIntroModal () {
         $('#introModal').modal('open');
    }

    (function init() {
        $('#lessonModal').modal({
            dismissible: false
        });
        $('#introModal').modal({
            dismissible: false,
            complete: function () {
                _openLessonListModal();
            }
        });
        _render();
        _openIntroModal();
        state.on("LESSON_COMPLETE", function () {
            _render();
            _openLessonListModal();
        });
        ReactDOM.render(
            <OpenLessonListButton />,
            document.getElementById('rightNav')
        );
        ReactDOM.render(
            <StartButton />,
            document.getElementById('startApp')
        );
    })();
})();

var lesson = (function() {
    var _currentLesson;

    class Answer extends React.Component {
        constructor (props) {
            super(props);
            this.answerClick = this.answerClick.bind(this);
        }
        render () {
            let classNames = ["collection-item"];
            if(this.props.feature.answeredCorrectly === true) {
                classNames.push("correct");
            }
            return (
                <a href="#!" className={classNames.join(" ")} onClick={this.answerClick}>{this.props.feature.name}</a>
            );            
        }
        answerClick (e) {
            e.preventDefault();
            _currentLesson.answer(this.props.feature);      
        }
    };

    class AnswerList extends React.Component {
        constructor (props) {
            super(props);
        }
        render () {
            let list = [];
            this.props.lesson.FOI.forEach(function (FOI) {
                list.push(<Answer key={FOI.name} feature={FOI}/>);
            });
            return (
                <div>
                    <h4> {this.props.lesson.name} </h4>
                    <div className="collection">
                        {list}
                    </div>
                </div>
            );            
        }
    }

    function _render () {
        ReactDOM.render(
            <AnswerList lesson={_currentLesson} />,
            document.getElementById('lesson')
        );    
    }    
    
    state.on("LESSON_READY", function(newState) {
        _currentLesson = state.getCurrentLesson();
        _render();
    });
    state.on("CORRECT_ANSWER", function (newState) {
        _render();
    });
})();

$(document).ready(function () {
    map.init();
})


