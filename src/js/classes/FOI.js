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
