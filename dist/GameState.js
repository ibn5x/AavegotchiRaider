var AavegotchiRaiderGame = {};

AavegotchiRaiderGame.GameState = function(game){

};

AavegotchiRaiderGame.GameState.prototype = {
    preload: function () {

    },
    create: function () {
        
        this.state.start('StateB');
    }
};