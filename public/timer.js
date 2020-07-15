class Timer {
    constructor(durationInput, startButton, nextButton, loseButton, callbacks){
        this.durationInput = durationInput;
        this.startButton = startButton;
        this.nextButton = nextButton;
        this.loseButton = loseButton;
        if (callbacks) {
            this.onStart = callbacks.onStart;
            this.onTick = callbacks.onTick;
            this.onComplete = callbacks.onComplete;
        }
        switch (level) {
            case 1:
                this.durationInput.value = 5; 
              break;
            case 2:
                this.durationInput.value = 12; 
              break;
            case 3:
                this.durationInput.value = 20; 
        }
        
        correction = 1;
        this.startButton.addEventListener('click', this.start);
        this.nextButton.addEventListener('click', this.start);
        this.loseButton.addEventListener('click', this.start);
    }

    start = () => {
        if(correction === 1) {
            if(level > 1) {
                clearInterval(this.interval);
            }
    
            if (this.onStart){
                this.onStart(this.timeRemaining);
            }
            this.tick();
            this.interval = setInterval(this.tick, 50);
        } 
        correction ++;
    };

    tick = () => {
            if(this.timeRemaining <= 0){
                if (this.onComplete){
                    this.onComplete();
                }
            } else {
                this.timeRemaining = this.timeRemaining - 0.05;
                if (this.onTick) {
                    this.onTick(this.timeRemaining);
                }
            }
    };

    get timeRemaining() {
        return parseFloat(this.durationInput.value);
    }

    set timeRemaining(time) {
        this.durationInput.value = time.toFixed(2);
    }

}
