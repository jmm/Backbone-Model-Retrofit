var klasses = {};

var Player = klasses.Player = function ( data ) {

  this.name = data.name;

  // Spot them 100 points, just to show this ctor is running.

  this.score = data.score || 100;

};


Player.prototype.constructor = Player;


Player.prototype.name = null;

Player.prototype.score = 0;


Player.prototype.get_new_score = function ( wager ) {

  return this.score + wager;

};
