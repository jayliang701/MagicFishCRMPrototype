
class TimeAction {
    constructor() {
        this.type = "time";
    }

    getDefaultStorage() {
        return {
            date:new Date()
        };
    }

    init() {
        setInterval(function () {
            this.timeUpdate();
        }.bind(this), 1000);
    }

    timeUpdate() {
        this.update('date', new Date());
    }

}

export default TimeAction;