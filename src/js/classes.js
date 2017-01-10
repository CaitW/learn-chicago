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
}