import { BlocklyAutoSaver } from "../../js/save.js";
import {
    getShadowingStatement,
    pollAndFollow
  } from "../../js/utility.js";

//////////////////////////////////////////////
// General view
//

var Status =
{
  NOT_STARTED: "",
  WORKING: "",
  PROBLEMS: "problems",
  GOOD: "good so far",
  SUCCESS: "success!"
};

export var Dicey = {};

Dicey.onResize = function(ev)
{
  var mainHeight = window.innerHeight - $("#top").outerHeight();
  $("#code").height(mainHeight);
  $("#gameView").height(mainHeight);
  $(".injectionDiv").height( mainHeight);
  $(".blocklyFlyover").height( mainHeight);
  $(".blocklyFlyoverBackground").height( mainHeight);

  $("#code").width(window.innerWidth - $("#gameView").outerWidth());
}

Dicey.showErrorMessage = function(message, duration)
{
  Dicey.error.html(message);
  if (Dicey.timer)
    clearTimeout(Dicey.timer);

  Dicey.error.css('z-index', 1000);
  Dicey.error.show(250, function()
    {
      Dicey.timer = setTimeout(function()
        {
          Dicey.error.hide(250);
        }, duration || 3000);
    });
  Dicey.error.click(function(ev) { Dicey.error.hide(); });
}

Dicey.explain = function(explainerID, onOK)
{
  var explainer = $("#" + explainerID);
  $("#" + explainerID + " input").click(function(ev)
    {
      explainer.hide(250);
      if (onOK)
        onOK();
    });

  explainer.css('z-index', 1000);
  explainer.show(250);
}

Dicey.init = function(gameNumber, gameFactory, view, interactive)
{
  Dicey.status = Status.NOT_STARTED;
  Dicey.gameNumber = gameNumber;
  Dicey.gameFactory = gameFactory;
  Dicey.view = view;
  Dicey.interactive = interactive;
  Dicey.onResize();

  Dicey.error = $("#error");

  Dicey.controlBar = new ControlBar();
  Dicey.manualController = new ManualController();
  if (typeof Blockly !== "undefined")
    Dicey.autoController = new AutoController();

  Dicey.stepping = true;
  Dicey.rapid = false;

  Dicey.setCase(interactive, 0);
  $(window).resize(Dicey.onResize);

  if (sessionStorage.getItem("tracking")) {
    pollAndFollow();
  }
}

Dicey.clearObservers = function()
{
  Dicey.game.observers = [];
}

Dicey.addAllObservers = function()
{
  Dicey.game.observers = [];
  Dicey.game.addObserver(Dicey.controlBar);
  Dicey.game.addObserver(Dicey.view);
  Dicey.game.addObserver(Dicey.manualController);
  if ("autoController" in Dicey)
    Dicey.game.addObserver(Dicey.autoController);
}

Dicey.setCase = function(random, whichScript)
{
  Dicey.game = Dicey.gameFactory();
  Dicey.addAllObservers();

  Dicey.random = random;
  Dicey.whichScript = whichScript;

  Dicey.controlBar.onGameLifecycle(false);
  Dicey.view.onStart();
}

//TODO make this logic part of the Game class and defer to that

Dicey.hasNextCase = function()
{
  return !Dicey.random;
}

Dicey.hasPreviousCase = function()
{
  return !(Dicey.whichScript == 0);
}

Dicey.nextCase = function(ev)
{
  if (Dicey.whichScript == Dicey.game.scripts.length - 1)
    Dicey.setCase(true, null);
  else
    Dicey.setCase(false, Dicey.whichScript + 1);
}

Dicey.previousCase = function(ev)
{
  if (Dicey.random)
    Dicey.setCase(false, Dicey.game.scripts.length - 1);
  else
    Dicey.setCase(false, Dicey.whichScript - 1);
}



//////////////////////////////////////////////
// Control bar
//

function ControlBar()
{
  var explainedRandom = false;

  if (!Dicey.interactive)
  {
    $("#back").click(Dicey.previousCase);

    $("#next").click(function(ev)
      {
        Dicey.nextCase();
        if (Dicey.random && !explainedRandom)
        {
          Dicey.explain("random");
          explainedRandom = true;
        }
      });
  }

  var manualButton = $("#manual");
  var autoButton = $("#auto");
  var gameSelect = $("#whichGame");
  var startButton = $("#start");
  var stopButton = $("#stop");

  var form = $("#form");
  var code = $("#code");

  this.onGameLifecycle = function(started)
  {
    let suffix = getShadowingStatement();
    if (suffix) {
      suffix += ", ";
    }

    $("#top span:eq(1)").text("game " + Dicey.gameNumber + ", " + suffix +
      (Dicey.interactive ? "interactive" :
        (Dicey.random
          ? "random"
          : ("sequence " + (Dicey.whichScript + 1)))) +
      (Dicey.status == Status.NOT_STARTED || Dicey.status == Status.WORKING
        ? ""
        : ","));
    $("#top span:eq(2)").text(Dicey.status);

    $("#back").prop("disabled", !Dicey.hasPreviousCase());
    $("#next").prop("disabled", !Dicey.hasNextCase() && !Dicey.interactive);

    manualButton.prop("disabled", started);
    autoButton.prop("disabled", started);
    gameSelect.prop("disabled", started);
    startButton.prop("disabled", started);
    stopButton.prop("disabled", !started);
  }
  this.onGameLifecycle(false);

  function toggleManualOrAuto(ev)
  {
    if (manualButton.is(":checked"))
      form.show(500);
    else
      form.hide(500);

    if (autoButton.is(":checked"))
    {
      code.css("width", "100%");
      code.show(500, function()
        {
          Dicey.onResize();
        });
    }
    else
      code.hide(500);
  };

  manualButton.click(toggleManualOrAuto);
  autoButton.click(toggleManualOrAuto);

  startButton.click(function()
    {
      Dicey.game.start(Dicey.random, Dicey.whichScript);
    });

  stopButton.click(function()
    {
      Dicey.game.endGame();
    });

  this.onStart = function()
    {
      this.onGameLifecycle(true);
    };

  this.onGameOver = function()
    {
      if ("rapidRunCount" in this)
      {
        if (!Dicey.game.won)
        {
          Dicey.showErrorMessage("Hmm ... your program wins sometimes,<br/>" +
            "but here's a case where it doesn't.<br/>" +
            "Take a closer look ...<br/>", 5000);
          Dicey.status = Status.PROBLEMS;
          this.onGameLifecycle(false);

          delete this.rapidRunCount;
          Dicey.rapid = false;
          Dicey.stepping = true;
        }
        else if (--this.rapidRunCount == 10)
        {
          Dicey.stepping = false;
          Dicey.rapid = true;
          Dicey.status = "10 trials to go";
          this.onGameLifecycle(false);
          Dicey.game.start(true, Dicey.whichScript);
        }
        else if (this.rapidRunCount > 0)
        {
          setTimeout(function()
            {
              Dicey.status = "" + this.rapidRunCount + " trials to go";
              this.onGameLifecycle(false);
              Dicey.game.start(true, Dicey.whichScript);
            }.bind(this), 500);
        }
        else
        {
          Dicey.explain("success");
          Dicey.status = Status.SUCCESS;
          this.onGameLifecycle(false);

          delete this.rapidRunCount;
          Dicey.rapid = false;
          Dicey.stepping = true;
        }

        return;
      }

      Dicey.status = Dicey.game.won ? Status.GOOD : Status.WORKING;
      this.onGameLifecycle(false);

      if (Dicey.game.won && Dicey.hasPreviousCase()) {

        /* Disabling this for now ... there are lots of ways to solve
           these games, and some of the better solutions actually fail
           against the prepared sequences. It's really winning a bunch
           of random games that proves out a solution.
        Dicey.clearObservers();

        var gameRecord = {};
        Object.assign(gameRecord, Dicey.game);

        Dicey.stepping = false;
        for (var i = Dicey.random ? 2 : Dicey.whichScript - 1; i >= 0; --i)
        {
          Dicey.game.start(false, i);

          Dicey.autoController.onStart();
          Dicey.autoController.onGameOver();

          if (!Dicey.game.won)
          {
            Dicey.status = Status.PROBLEMS;
            this.onGameLifecycle(false);
            Dicey.showErrorMessage("Good ... but, try going back and running<br/>" +
              "your program on the earlier sequence(s).<br/>" +
              "It works here, but not there.<br/>" +
              "Maybe you need an [if] block somewhere?<br/>", 7500);
            break;
          }
        }
        Dicey.stepping = true;

        Object.assign(Dicey.game, gameRecord);
        Dicey.addAllObservers();
        */

        if (Dicey.random && Dicey.status == Status.GOOD)
        {
          Dicey.explain("monteCarlo", function()
            {
              this.rapidRunCount = 11;
              this.onGameOver();
            }.bind(this), 25);
        }
      }
    };
}


//////////////////////////////////////////////
// Manual game controller
//

function ManualController()
{
  var rollButton = $("#roll");
  var addButton = $("#add");
  var valueToAdd = $("#valueToAdd");
    var subtractButton = $("#subtract");
  var valueToSubtract = $("#valueToSubtract");

  function onGameLifecycle(started)
  {
    rollButton.prop("disabled", !started || Dicey.game.waiting);
    addButton.prop("disabled", !started || !Dicey.game.waiting);
    subtractButton.prop("disabled", !started || !Dicey.game.waiting);
  }
  onGameLifecycle(false);

  rollButton.click(function(ev)
    {
      Dicey.game.roll();
      onGameLifecycle(true);
    });

  addButton.click(function(ev)
    {
      if (valueToAdd.val().length == 0)
      {
        Dicey.showErrorMessage("You must enter a number, and then click the button.");
        return;
      }

      var response = Dicey.game.add(parseInt(valueToAdd.val()));
      if (response)
      {
        Dicey.showErrorMessage(response);
      }
      else if (!Dicey.game.over)
      {
        onGameLifecycle(true);
      }
    });

  subtractButton.click(function(ev)
    {
      if (valueToSubtract.val().length == 0)
      {
        Dicey.showErrorMessage("You must enter the sum or the difference of the dice here, then click the button.");
        return;
      }

      var response = Dicey.game.subtract(parseInt(valueToSubtract.val()));
      if (response)
      {
        Dicey.showErrorMessage(response);
      }
      else if (!Dicey.game.over)
      {
        onGameLifecycle(true);
      }
    });

  this.onStart = function()
    {
      onGameLifecycle(true);
    };

  this.onGameOver = function()
    {
      onGameLifecycle(false);
    };

    this.onRoll = function(roll)
      {
        var legalValue = Dicey.game.oneValidValue();
        if (legalValue)
        {
          valueToAdd.val(legalValue);
          valueToSubtract.val(legalValue);
        }
      };
}


//////////////////////////////////////////////
// Blockly game controller
//

function setupDiceyBlocks()
{
  // For variable-length games only:
  Blockly.Blocks["dicey_over"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "game over",
              output: "Boolean",
              colour: 0,
              tooltip: "True if the game has ended"
            });
        }
    };

  Blockly.JavaScript["dicey_over"] = function(block)
    {
      return [ "over()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  Blockly.Blocks["dicey_score"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "score",
              output: "Number",
              colour: 0,
              tooltip: "Current score of the game"
            });
        }
    };

  Blockly.JavaScript["dicey_score"] = function(block)
    {
      return [ "score()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  // For one-die games only:
  Blockly.Blocks["dicey_die"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "number on die",
              output: "Number",
              colour: 0,
              tooltip: "Number from the most recent roll"
            });
        }
    };

  Blockly.JavaScript["dicey_die"] = function(block)
    {
      return [ "die()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  // For two-dice games only:
  Blockly.Blocks["dicey_die1"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "number on die 1",
              output: "Number",
              colour: 0,
              tooltip: "Number from the most recent roll"
            });
        }
    };

  Blockly.JavaScript["dicey_die1"] = function(block)
    {
      return [ "die1()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  // For two-dice games only:
  Blockly.Blocks["dicey_die2"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "number on die 2",
              output: "Number",
              colour: 0,
              tooltip: "Number from the most recent roll"
            });
        }
    };

  Blockly.JavaScript["dicey_die2"] = function(block)
    {
      return [ "die2()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  // For fixed-length games only:
  Blockly.Blocks["dicey_remaining"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "rolls remaining",
              output: "Number",
              colour: 0,
              tooltip: "Number of rolls before the game is over"
            });
        }
    };

  Blockly.JavaScript["dicey_remaining"] = function(block)
    {
      return [ "remaining()", Blockly.JavaScript.ORDER_MEMBER ];
    };

  Blockly.Blocks["dicey_roll"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "roll dice",
              previousStatement: null,
              nextStatement: null,
              colour: 0,
              tooltip: "Roll the die or dice"
            });
        }
    };

  Blockly.JavaScript["dicey_roll"] = function(block)
    {
      return "roll();\n";
    };

  Blockly.Blocks["dicey_add"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "add %1",
              args0:
                [
                  {
                    type: "input_value",
                    name: "VALUE"
                  }
                ],
              previousStatement: null,
              nextStatement: null,
              colour: 0,
              tooltip: "Add to the score"
            });
        }
    };

  Blockly.JavaScript["dicey_add"] = function(block)
    {
      return "add(" +
        Blockly.JavaScript.valueToCode(block, "VALUE", Blockly.JavaScript.ORDER_ADDITION) +
        ");\n";
    };

  Blockly.Blocks["dicey_subtract"] =
    {
      init: function()
        {
          this.jsonInit
            ({
              message0: "subtract %1",
              args0:
                [
                  {
                    type: "input_value",
                    name: "VALUE"
                  }
                ],
              previousStatement: null,
              nextStatement: null,
              colour: 0,
              tooltip: "Subtract from the score"
            });
        }
    };

  Blockly.JavaScript["dicey_subtract"] = function(block)
    {
      return "subtract(" +
        Blockly.JavaScript.valueToCode(block, "VALUE", Blockly.JavaScript.ORDER_ADDITION) +
        ");\n";
    };

    Blockly.JavaScript.addReservedWords("highlightBlock");

  //Blockly.JavaScript.INFINITE_LOOP_TRAP =
  //  "if (--window.instructionCount == 0) throw 'Infinite loop aborted.'";
}

//
// Block-limit feature is still available, but it's not currently in use.
//
function AutoController(limit)
{
  setupDiceyBlocks();

  var workspace = Blockly.inject("code",
    {
      toolbox: document.getElementById("toolbox"),
      trashcan: true,
      maxBlocks: limit ? Dicey.game.blockLimit : Infinity
    });

  var running = false;

  function interpreterAPI(interpreter, scope)
  {
    interpreter.setProperty(scope, "over",
    interpreter.createNativeFunction(function()
      {
        return interpreter.createPrimitive(Dicey.game.over);
      }));

    interpreter.setProperty(scope, "score",
      interpreter.createNativeFunction(function()
        {
          return interpreter.createPrimitive(Dicey.game.score);
        }));

    interpreter.setProperty(scope, "die",
      interpreter.createNativeFunction(function()
        {
          return interpreter.createPrimitive(Dicey.game.latestRoll());
        }));

    interpreter.setProperty(scope, "die1",
      interpreter.createNativeFunction(function()
        {
          return interpreter.createPrimitive(Dicey.game.latestRoll()[0]);
        }));

    interpreter.setProperty(scope, "die2",
      interpreter.createNativeFunction(function()
        {
          return interpreter.createPrimitive(Dicey.game.latestRoll()[1]);
        }));

    interpreter.setProperty(scope, "remaining",
      interpreter.createNativeFunction(function()
        {
          return interpreter.createPrimitive
            (Dicey.game.numberOfRolls - Dicey.game.rolls.length - 1);
        }));

    interpreter.setProperty(scope, "roll",
      interpreter.createNativeFunction(function()
        {
          var result = Dicey.game.roll();
          if (result)
          {
            if (Dicey.stepping)
              Dicey.showErrorMessage(result);
            running = false;
          }

          return interpreter.createPrimitive(result);
        }));

    interpreter.setProperty(scope, "add",
      interpreter.createNativeFunction(function(value)
        {
          var result = Dicey.game.add(value);
          if (result)
          {
            if (Dicey.stepping)
              Dicey.showErrorMessage(result);
            running = false;
          }

          return interpreter.createPrimitive(result);
        }));

    interpreter.setProperty(scope, "subtract",
      interpreter.createNativeFunction(function(value)
        {
          var result = Dicey.game.subtract(value);
          if (result)
          {
            if (Dicey.stepping)
              Dicey.showErrorMessage(result);
            running = false;
          }

          return interpreter.createPrimitive(result);
        }));

    interpreter.setProperty(scope, "highlightBlock",
      interpreter.createNativeFunction(function(ID)
        {
          return interpreter.createPrimitive(workspace.highlightBlock(ID));
        }));

    interpreter.setProperty(scope, "log",
      interpreter.createNativeFunction(function(text)
        {
          return interpreter.createPrimitive(console.log(text || ""));
        }));
  }

  new BlocklyAutoSaver(workspace,
      ["back", "next", "start"].map(ID => $("#" + ID)[0]));

  this.onStart = function()
    {
      Blockly.JavaScript.STATEMENT_PREFIX =
          Dicey.stepping ? "highlightBlock(%1); " : "";

      var program = Blockly.JavaScript.workspaceToCode(workspace);
      var interpreter = new Interpreter(program, interpreterAPI);//.run();
      running = true;

      function next()
      {
        try
        {
          if (running && interpreter.step())
          {
            if (Dicey.stepping)
              setTimeout(next, 25);
            else if (Dicey.rapid)
              setTimeout(next, 0);
            else
              next();
          }
          else if (Dicey.stepping)
            workspace.highlightBlock();
        }
        catch (ex)
        {
          console.log(ex);
          if (Dicey.stepping)
          {
            Dicey.showErrorMessage(ex);
            Dicey.game.endGame();
            workspace.highlightBlock();
          }
        }
      };
      next();
    };

  this.onGameOver = function()
    {
      running = false;
    };

  var copy = $("#copy");
  var paste = $("#paste");
  var storageAttribute = "myProgram";

  if (typeof(Storage) !== "undefined")
  {
    copy.show();
    paste.show();

    copy.click(function()
      {
        localStorage.setItem(storageAttribute, Blockly.Xml.domToText
          (Blockly.Xml.workspaceToDom(workspace)));
      });

    paste.click(function()
      {
        Blockly.Xml.domToWorkspace
          (Blockly.Xml.textToDom(localStorage.getItem(storageAttribute)),
            workspace)
      });
  }
}

//////////////////////////////////////////////
// Game views
//

/**
 * Prototype for all of our game views.
 */
function GameView()
{
  this.scrollToBottom = function()
  {
    $("#gameView").animate
      ({
        scrollTop: $("#gameView").prop("scrollHeight"
      )}, 1000);
  }

  function setDiceImages(row, roll, suffix)
  {
    if (roll[0])
    {
      row.children("img:eq(0)").attr("src", "img/" + roll[0] + suffix + ".png");
      row.children("img:eq(1)").attr("src", "img/" + roll[1] + suffix + ".png");
    }
    else
    {
      row.children("img:eq(0)").attr("src", "img/" + roll + suffix + ".png");
      row.children("img:eq(1)").attr("src", "img/blank.png");
    }
  }

  this.addRow = function(roll, suffix)
  {
    var newRow = $(".oneTurn").first().clone();
    newRow.css("display", "block");
    setDiceImages(newRow, roll, suffix);
    $("#gameView").append(newRow);
    this.scrollToBottom();
  }

  this.onStart = function()
    {
      $("#gameView").children().remove();

      var topRow = $(".oneTurn").first().clone();
      topRow.children("img:eq(0)").attr("src", "img/blank.png");
      topRow.children("img:eq(1)").attr("src", "img/blank.png");
      topRow.css("display", "block");
      topRow.children("span:eq(0)").html("&nbsp;");
      topRow.children("span:eq(1)").html("&nbsp;&nbsp;");
      topRow.children("span:eq(2)").html("&nbsp;");
      topRow.children("span:eq(3)").html("&nbsp;0");

      $("#gameView").append(topRow);

      if (!Dicey.random)
      {
        var suffix = "_grey";
        var rolls = Dicey.game.scripts[Dicey.whichScript];
        var r = 0;
        while (r < rolls.length)
        {
          if (Dicey.game.diceCount == 1)
            this.addRow(rolls[r++], suffix);
          else
          {
            this.addRow([rolls[r++], rolls[r++]], suffix);
          }
        }
      }
    };

  this.currentRow = function()
    {
      return $("#gameView div:eq(" + Dicey.game.rollsSoFar.length + ")");
    };

  this.onRoll = function(roll)
    {
      if (Dicey.random)
        this.addRow(roll, "");
      else
        setDiceImages(this.currentRow(), roll, "");
    };

  this.onGameOver = function()
    {
      var p = $(document.createElement("p"));
      p.text(Dicey.game.won ? "You win!" : "Game over.");
      $("#gameView").append(p);
      this.scrollToBottom();
    };
}

/**
 * Intermediate prototype for GoalGames.
 */
GoalGameView.prototype = new GameView();
GoalGameView.prototype.constructor = GoalGameView;
export function GoalGameView()
{
  function addOrSubtract(plusOrMinus, value, score, _this)
  {
    var lastRow = _this.currentRow();
    lastRow.children("span:eq(0)").text(plusOrMinus);
    lastRow.children("span:eq(1)").html
      ((value < 10 ? "&nbsp;" : "") + value);
    lastRow.children("span:eq(2)").text("=");
    lastRow.children("span:eq(3)").html
      ((score < 10 ? "&nbsp;" : "") + score);
  }

  this.onAdd = function(value)
    {
      addOrSubtract("+", value, Dicey.game.score, this);
    };

  this.onSubtract = function(value)
    {
      addOrSubtract("-", -value, Dicey.game.score, this);
    };
}

function testGameView()
{
  Dicey.game = new Game3();
  var view = new GoalGameView();
  testGame3(Dicey.game);
}

/**
 * Intermediate prototype for GoalGames.
 */
IndicatorView.prototype = new GoalGameView();
IndicatorView.prototype.constructor = IndicatorView;
export function IndicatorView()
{
  this.onRoll = function(roll)
    {
      if (this.indicator)
      {
        this.indicator.remove();
        delete this.indicator;
      }

      if (Dicey.random)
        this.addRow(roll, "");
      else
        setDiceImages(this.currentRow(), roll, "");

      let doubles = Dicey.game.latestRoll()[0] == Dicey.game.latestRoll()[1];
      if (Dicey.game.no13to20 == doubles)
      {
        this.indicator = $(document.createElement("p"));
        this.indicator.text("Over 12 OK");
        this.indicator.css("color", "red");
        this.indicator.css("marginRight", "10px");
        $("#gameView").append(this.indicator);
        this.scrollToBottom();
      }
    };
}
