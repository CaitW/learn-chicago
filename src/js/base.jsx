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


