
//////////////////////////////////////////////
// Games
//

/**
 * Prototype for all of our games.
 */
function Game()
{
  this.observers = [];
  this.addObserver = function(observer)
    {
      this.observers.push(observer);
    };

  // To override:
  this.onStart = function() {};

  this.start = function(random, whichScript)
    {
      this.rollsSoFar = [];
      this.score = 0;
      this.over = false;
      this.won = false;

      this.random = random;
      this.whichScript = whichScript || 0;
      this.index = 0;

      this.onStart();
      for (var i = 0; i < this.observers.length; ++i)
        if (this.observers[i].onStart)
          this.observers[i].onStart();
    };
  this.start(true);

  this.scripts = [];

  this.scriptCompleted = function()
    {
      return this.index >= this.scripts[this.whichScript].length;
    };

  this.rollOneDie = function()
    {
      if (this.random)
      {
        return Math.floor(Math.random() * 6) + 1;
      }
      else
        return this.scripts[this.whichScript][this.index++];
    };

  this.latestRoll = function()
    {
      if (!this.rollsSoFar || !this.rollsSoFar.length)
        throw "Whoops -- you haven't rolled the dice yet!";

      return this.rollsSoFar[this.rollsSoFar.length - 1];
    };

  this.oneValidValue = function()
    {
      return null;
    };

  this.endGame = function(won)
    {
      this.over = true;
      this.won = won;

      for (var i = 0; i < this.observers.length; ++i)
        if (this.observers[i].onGameOver)
          this.observers[i].onGameOver();
    };
}

/**
 * Intermediate prototype for games that
 * (a) use one or two dice (would probably stretch to N dice)
 * (b) have a defined winning score,
 * (c) have only certain valid plays based on the latest roll.
 */
GoalGame.prototype = new Game();
GoalGame.prototype.constructor = GoalGame;
function GoalGame()
{
  // Override these:
  this.diceCount = 1;
  this.isNotValid = function(roll) { return true; };

  this.onStart = function()
    {
      this.waiting = false;
    };

  this.roll = function()
    {
      if (this.waiting)
        return "Whoops -- rolled again without deciding what to do.";

      var newRoll = null;
      if (this.diceCount == 1)
        newRoll = this.rollOneDie();
      else // really, assuming == 2
      {
        var one = this.rollOneDie();
        var two = this.rollOneDie();
        newRoll = one >= two
          ? [one, two]
          : [two, one];
      }

      this.rollsSoFar.push(newRoll);
      this.waiting = true;

      for (var i = 0; i < this.observers.length; ++i)
        if (this.observers[i].onRoll)
          this.observers[i].onRoll(newRoll);
    };

  this.checkForWinOrLoss = function()
  {
      if (this.score == 10)
        this.endGame(true);
  }

  this.addOrSubtract = function(value, eventToFire)
  {
    if (!this.waiting)
      return "Whoops -- have to roll before adding or subtracting.";

    var rule = this.isNotValid(value);
    if (!rule)
    {
      this.score += value;
      for (var i = 0; i < this.observers.length; ++i)
        if (eventToFire in this.observers[i])
          this.observers[i][eventToFire](value);

      this.checkForWinOrLoss();
      this.waiting = false;

      if (this.scriptCompleted() && !this.over)
        this.endGame(false);

      return null;
    }

    return "Whoops -- " + value +
      " on a roll of " + this.rollsSoFar[this.rollsSoFar.length - 1] +
      " is not a legal play! " + rule;
  }

  this.add = function(value)
    {
      return this.addOrSubtract(value, "onAdd");
    };

  this.subtract = function(value)
    {
      if (this.score - value < 0)
        return "Whoops -- can't subtract to a negative score.";

      return this.addOrSubtract(-value, "onSubtract");
    };
}

/**
 * Game #1 is a single die, you can add or subtract to your score,
 * with the goal of getting 10 exactly.
 */
Game1.prototype = new GoalGame();
Game1.prototype.constructor = Game1;
function Game1()
{
  this.scripts =
    [
      [ 3, 5, 2 ],
      [ 6, 1, 5, 2 ],
      [ 3, 5, 5, 4, 1]
    ];

  this.blockLimit = 12;

  this.oneValidValue = function()
    {
      return this.latestRoll();
    };

  this.isNotValid = function(value)
    {
      return value == this.latestRoll() || value == 0-this.latestRoll()
        ? null
        : "You must add or subtract the value shown on the die.";

    };
};

function TestObserver()
{
  this.onRoll = function(roll)
    {
      console.log("onRoll(" + roll + ")");
    };

  this.onAdd = function(value)
    {
      console.log("onAdd(" + value + ")");
    };

  this.onSubtract = function(value)
    {
      console.log("onSubtract(" + value + ")");
    };

  this.onGameOver = function()
    {
      console.log("onGameOver()");
    };
}

function testGame1(game)
{
console.log("Testing Game1");
  var game1 = game || new Game1();
/*
  game1.start(false, 0);

  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(2)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(4)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(6)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(1)) console.log("FAILED");f
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.subtract(3)) console.log("FAILED");
  if (!game1.over) console.log("FAILED");

  game1.start(false, 0);
  if (game1.roll()) console.log("FAILED");
  if (!game1.add(5)) console.log("FAILED");

  game1.start(false, 1);

  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(1)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(4)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(6)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.subtract(5)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(2)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(1)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(6)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.subtract(5)) console.log("FAILED");
  if (!game1.over) console.log("FAILED");
*/
  //game1.start(false, 2, new TestObserver());
  game1.start(false, 2);

  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(6)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(6)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.subtract(1)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.subtract(5)) console.log("FAILED");
  if (game1.over) console.log("FAILED");
  if (game1.roll()) console.log("FAILED");
  if (game1.add(4)) console.log("FAILED");
  if (!game1.over) console.log("FAILED");
}


/**
 * Game #2 is game #1 but 0 wins and 13 is poison.
 */
Game2.prototype = new Game1();
Game2.prototype.constructor = Game2;
function Game2()
{
  this.scripts =
    [
      [ 3, 3, 4 ],
      [ 3, 1, 4, 2 ],
      [ 3, 5, 5, 4, 3 ]
    ];

  this.blockLimit = 18; // if we use this at all ...

  this.checkForWinOrLoss = function()
  {
      if (this.score == 10 || this.score == 0)
        this.endGame(true);
      else if (this.score == 13)
        this.endGame(false);
    }
};

function TestObserver()
{
  this.onRoll = function(roll)
    {
      console.log("onRoll(" + roll + ")");
    };

  this.onAdd = function(value)
    {
      console.log("onAdd(" + value + ")");
    };

  this.onSubtract = function(value)
    {
      console.log("onSubtract(" + value + ")");
    };

  this.onGameOver = function()
    {
      console.log("onGameOver()");
    };
}


/**
 * Game that uses two dice, and you can re-roll either one,
 * just looking for matches; but the higher the score, the better.
 */
MatchingGame.prototype = new Game();
MatchingGame.prototype.constructor = MatchingGame;
function MatchingGame()
{
  this.diceCount = 2;
  this.scripts =
    [
      [ 2, 4, 1, 4 ],
      [ 1, 4, 6, 5, 2, 1, 6 ],
      [ 1, 5, 4, 4, 2, 5 ]
    ];

  this.onStart = function()
    {
      // Roll two dice, but don't allow doubles to start out:
      var rolls = new Array();
      rolls.push(this.rollOneDie());
      var secondDie;
      do
      {
        secondDie = this.rollOneDie();
      } while(secondDie == rolls[0]);
      rolls.push(secondDie);

      this.rollsSoFar.push(rolls);
      for (var i = 0; i < this.observers.length; ++i)
        if (this.observers[i].onRoll)
          this.observers[i].onRoll(rolls);
    };

  this.roll = function(whichOne)
    {
      var rolls = new Array();
      rolls[1 - whichOne] =
        this.rollsSoFar[this.rollsSoFar.length - 1][1 - whichOne];
      rolls[whichOne] = this.rollOneDie();

      this.rollsSoFar.push(rolls);
      for (var i = 0; i < this.observers.length; ++i)
        if (this.observers[i].onRoll)
          this.observers[i].onRoll(rolls);

      if (rolls[0] == rolls[1])
        this.endGame(true);
    };
}

function testMatchingGame()
{
console.log("Testing MatchingGame");
  var game2 = new MatchingGame();
  //game2.start(false, 0, new TestObserver());
  game2.start(false, 0);

  if (game2.over) console.log("FAILED");
  if (game2.roll(0)) console.log("FAILED");
  if (game2.over) console.log("FAILED");
  if (game2.roll(0)) console.log("FAILED");
  if (!game2.over) console.log("FAILED");
}

/**
 * Game that uses two dice, and you can add or subtract the total of the dice,
 * with the goal of getting 10 exactly.
 */
TwoDiceSumOnly.prototype = new GoalGame();
TwoDiceSumOnly.prototype.constructor = TwoDiceSumOnly;
function TwoDiceSumOnly()
{
  this.diceCount = 2;
  this.scripts =
    [
      [ 4, 4, 5, 2, 4, 1 ],
      [ 2, 5, 3, 3, 2, 2, 6, 1, 4, 1 ],
      [ 1, 1, 2, 2, 4, 2, 6, 1, 1, 1, 3, 4 ]
    ];

  this.isNotValid = function(value)
    {
      var total = this.latestRoll()[0] + this.latestRoll()[1];
      return value == total || value == -total
        ? null
        : "You must add or subtract the sum of the values shown on the dice.";
    };
};

function testTwoDiceSumOnly(game)
{
console.log("Testing TwoDiceSumOnly");
  var game3 = game || new TwoDiceSumOnly();
  //game3.start(false, 1, new TestObserver());
  game3.start(false, 1);

  if (game3.over) console.log("FAILED");
  if (game3.roll()) console.log("FAILED");
  if (game3.add(7)) console.log("FAILED");
  if (game3.over) console.log("FAILED");
  if (game3.roll()) console.log("FAILED");
  if (game3.add(6)) console.log("FAILED");
  if (game3.over) console.log("FAILED");
  if (game3.roll()) console.log("FAILED");
  if (game3.add(4)) console.log("FAILED");
  if (game3.over) console.log("FAILED");
  if (game3.roll()) console.log("FAILED");
  if (game3.subtract(7)) console.log("FAILED");
  if (!game3.over) console.log("FAILED");

  game3.start(false, 1);
  if (game3.roll()) console.log("FAILED");
  if (!game3.add(5)) console.log("FAILED");
}

/**
 * Game #3 uses two dice, and you can add or subtract either of them.
 * You can never go below 0 or above 11.
 */
Game3.prototype = new GoalGame();
Game3.prototype.constructor = Game3;
function Game3()
{
  this.diceCount = 2;
  this.scripts =
    [
      [ 6, 1, 2, 2, 5, 2 ],
      [ 5, 3, 4, 1, 3, 3, 3, 2, 6, 1 ]
    ];

  this.isNotValid = function(value)
    {
      var one = this.latestRoll()[0];
      var two = this.latestRoll()[1];
      return value == one || value == -one ||
          value == two || value == -two
        ? null
        : "You must add or subtract the value of just one of the two dice.";
    };

  this.add = function(value)
    {
      if (this.score + value > 11)
        return ("Whoops -- can't add to a score greater than 11.");

      return this.addOrSubtract(value, "onAdd");
    };
};


/**
 * Game #4 uses two dice, and you can either add their sum or subtract
 * their difference, with the goal of getting 10 exactly.
 */
Game4.prototype = new GoalGame();
Game4.prototype.constructor = Game4;
function Game4()
{
  this.diceCount = 2;
  this.scripts =
    [
      [ 1, 1, 2, 2, 6, 2 ],
      [ 5, 3, 4, 1, 1, 1, 4, 3 ]
    ];

  this.isNotValid = function(value)
    {
      var sum = this.latestRoll()[0] + this.latestRoll()[1];
      var difference = this.latestRoll()[0] - this.latestRoll()[1];
      return value == sum || value == -difference
        ? null
        : "You must either add the sum or subtract the difference of the values shown on the dice.";
    };
};

function testGame4()
{
console.log("Testing Game4");
  var game4 = new Game4();
  //game4.start(false, 2, new TestObserver());
  game4.start(false, 2);

  if (game4.over) console.log("FAILED");
  if (game4.roll()) console.log("FAILED");
  if (game4.add(8)) console.log("FAILED");
  if (game4.over) console.log("FAILED");
  if (game4.roll()) console.log("FAILED");
  if (game4.add(3)) console.log("FAILED");
  if (game4.over) console.log("FAILED");
  if (game4.roll()) console.log("FAILED");
  if (game4.add(0)) console.log("FAILED");
  if (game4.over) console.log("FAILED");
  if (game4.roll()) console.log("FAILED");
  if (game4.subtract(1)) console.log("FAILED");
  if (!game4.over) console.log("FAILED");

  game4.start(false, 2);
  if (game4.roll()) console.log("FAILED");
  if (!game4.add(3)) console.log("FAILED");
}


/**
 * Game #5 uses two dice, and you can either add their sum or subtract
 * their difference. The goal is to get 21 or higher -- but 13-20 loses.
 * If you roll doubles, the 13-20 rule is suspended, until you roll
 * doubles again -- meaning you can freely add trying to get to 21,
 * but if you roll doubles again and your score is over 12, you go to 0.
 */
Game5.prototype = new GoalGame();
Game5.prototype.constructor = Game5;
function Game5()
{
  this.diceCount = 2;
  this.no13to20 = true;

  this.scripts =
    [
      [ 6, 5, 6, 1, 3, 1, 6, 5 ],
      [ 4, 2, 2, 1, 2, 2, 3, 1, 5, 1 ],
      [ 4, 4, 6, 1, 2, 2, 6, 1, 4, 1, 5, 4 ]
    ];

  this.onStart = function()
    {
      this.waiting = false;
      this.no13to20 = true;
    };

  this.checkForWinOrLoss = function()
  {
      if (this.latestRoll()[0] == this.latestRoll()[1])
      {
        this.no13to20 = !this.no13to20;
        if (this.score > 12 && this.score < 21 && this.no13to20)
          this.score = 0;
      }

      if (this.score > 20)
        this.endGame(true);
      else if (this.no13to20 && this.score > 12)
        this.endGame(false);
  }

  this.isNotValid = function(value)
    {
      var sum = this.latestRoll()[0] + this.latestRoll()[1];
      var difference = this.latestRoll()[0] - this.latestRoll()[1];
      return value == sum || value == -difference
        ? null
        : "You must either add the sum or subtract the difference of the values shown on the dice.";
    };
};


/**
 * Game that uses two dice, and you can add or subtract any two-digit number
 * that you can make from their values. The goal is now 100.
 */
TwoDigitGame.prototype = new GoalGame();
TwoDigitGame.prototype.constructor = TwoDigitGame;
function TwoDigitGame()
{
  this.diceCount = 2;
  this.scripts =
    [
      [ 2, 5, 3, 3, 5, 1, 6, 3 ],
      [ 1, 1, 2, 2, 6, 2, 1, 1, 6, 1 ],
      [ 3, 5, 1, 4, 3, 3 ]
    ];

  this.isNotValid = function(value)
    {
      var AB = this.latestRoll()[0] * 10 + this.latestRoll()[1];
      var BA = this.latestRoll()[1] * 10 + this.latestRoll()[0];
      return value == AB || value == -AB ||
          value == BA || value == -BA
        ? null
        : "You must add or subtract a two-digit number made up of the values shown on the dice.";
    };

  this.checkForWinOrLoss = function()
  {
      if (this.score == 100)
        this.endGame(true);
  }
};

function testTwoDigitGame()
{
console.log("Testing TwoDigitGame");
  var game5 = new TwoDigitGame();
  //game5.start(false, 0, new TestObserver());
  game5.start(false, 0);

  if (game5.over) console.log("FAILED");
  if (game5.roll()) console.log("FAILED");
  if (game5.add(52)) console.log("FAILED");
  if (game5.over) console.log("FAILED");
  if (game5.roll()) console.log("FAILED");
  if (game5.add(33)) console.log("FAILED");
  if (game5.over) console.log("FAILED");
  if (game5.roll()) console.log("FAILED");
  if (game5.add(51)) console.log("FAILED");
  if (game5.over) console.log("FAILED");
  if (game5.roll()) console.log("FAILED");
  if (game5.subtract(36)) console.log("FAILED");
  if (!game5.over) console.log("FAILED");

  game5.start(false, 0);
  if (game5.roll()) console.log("FAILED");
  if (!game5.add(7)) console.log("FAILED");
}


/**
 * Game #5 is back to one die. You must roll 8 times.
 * The goal is to get at least 18 but no more than 21.
 * If you ever exceed 21, you lose.
 */
Approach21Game.prototype = new Game1();
Approach21Game.prototype.constructor = Approach21Game;
function Approach21Game()
{
  this.numberOfRolls = 8;

  this.scripts =
    [
      [ 3, 4, 3, 2, 2, 1, 2, 4 ],
      [ 3, 6, 5, 4, 5, 6, 2, 4 ],
      [ 1, 1, 4, 6, 5, 6, 4, 4 ]
    ];

  this.addOrSubtract = function(value, eventToFire)
  {
    if (!this.waiting)
      return "Whoops -- have to roll before adding or subtracting.";

    var rule = this.isNotValid(value);
    if (!rule)
    {
      this.score += value;
      for (var i = 0; i < this.observers.length; ++i)
        if (eventToFire in this.observers[i])
          this.observers[i][eventToFire](value);

      this.waiting = false;

      if (this.score > 21)
        this.endGame(false);

      if (this.rollsSoFar.length == this.numberOfRolls)
        this.endGame(this.score >= 18 && this.score <= 21);

      return null;
    }

    return "Whoops -- " + value +
      " on a roll of " + this.rollsSoFar[this.rollsSoFar.length - 1] +
      " is not a legal play! " + rule;
  }
}


function TestObserver()
{
  this.onRoll = function(roll)
    {
      console.log("onRoll(" + roll + ")");
    };

  this.onAdd = function(value)
    {
      console.log("onAdd(" + value + ")");
    };

  this.onSubtract = function(value)
    {
      console.log("onSubtract(" + value + ")");
    };

  this.onGameOver = function()
    {
      console.log("onGameOver()");
    };
}

