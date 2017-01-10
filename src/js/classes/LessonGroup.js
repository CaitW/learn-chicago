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