import { BlocklyAutoSaver } from "../../js/save.js";
import {
    getShadowingStatement,
    pollAndFollow
  } from "../../js/utility.js";

//////////////////////////////////////////////
// Page sequence
//

var mainSequence =
  [
    "index.html",
    "Scales.html",
    "MandMs.html",
    "HotCrossBuns.html",
    "FrereJacques.html",
    "Patterns.html",
    "Compose1.html",
    "HotCrossBuns2.html",
    "Twinkle.html",
    "OdeToJoy.html",
    "DoReMi.html",
    "Compose2.html"
  ];

function currentPage()
{
  return window.location.pathname.split("/").pop();
}

function pageIndex()
{
  var pageName = currentPage();
  for (var i = 0; i < mainSequence.length; ++i)
    if (pageName == mainSequence[i])
      return i;

  return -1;
}

function hasNextPage()
{
  return currentPage() != mainSequence[mainSequence.length - 1];
}

function nextPage()
{
  return mainSequence[pageIndex() + 1];
}

function hasPreviousPage()
{
  return currentPage() != mainSequence[0];
}

function previousPage()
{
  return mainSequence[pageIndex() - 1];
}


//////////////////////////////////////////////
// Music player
//

var Value =
  {
    WHOLE: 1,
    DOTTED_HALF: .75,
    HALF: .5,
    DOTTED_QUARTER: .375,
    QUARTER: .25,
    DOTTED_EIGHTH: .1875,
    EIGHTH: .125,
    SIXTEENTH: .0625
  };

function toFrequency(noteNumber)
{
  var halfStep = 1.059463;

  var bases =
    [
      { number: 36, frequency:  110 },
      { number: 43, frequency:  165 },
      { number: 48, frequency:  220 },
      { number: 55, frequency:  330 },
      { number: 60, frequency:  440 },
      { number: 67, frequency:  660 },
      { number: 72, frequency:  880 },
      { number: 79, frequency: 1320 },
      { number: 84, frequency: 1760}
    ];

  if (noteNumber < 36 || noteNumber > 84)
    throw "We only support two octaves above and below middle C.";

  var base = -1;
  while (++base < bases.length && bases[base].number <= noteNumber);
  --base;

  return bases[base].frequency *
    Math.pow(halfStep, noteNumber - bases[base].number);
}

// Attack curve, with time units in seconds
function attack()
{
  var result = [ { time: 0, amplitude: 0 } ];
  var duration = .03;
  var steps = 10;

  var timeInterval = duration / steps;
  var amplitudeInterval = 1 / steps;

  for (var i = 0; i < steps; ++i)
  {
    result.push({ time: timeInterval * i, amplitude: amplitudeInterval * i });
  }

  return result;
}

// Decay curve, with time units relative to overall note duration
function decay(duration)
{
  var result = [];
  var start = duration * .6;
  var steps = 10;

  var timeInterval = (duration - start) / steps;
  var amplitudeInterval = 1 / steps;

  for (var i = 0; i < steps; ++i)
  {
    result.push
      ({
        time: start + timeInterval * i,
        amplitude: 1 - amplitudeInterval * (i + 1)
      });
  }

  return result;
}

var audioContext = new AudioContext();

function Player(tempo)
{
  this.context = audioContext;
  this.tempo = tempo || 120;
  this.volume = 1;

  this.gain = this.context.createGain();
  this.gain.connect(this.context.destination);

  this.oscillator = this.context.createOscillator();
  this.oscillator.connect(this.gain);
  this.oscillator.frequency.setValueAtTime(0, 0);

  this.oscillator.start();

  // @param noteNumber MIDI note number, e.g. 60 is middle C
  // @param bars for the moment this assumes 4/N time
  this.play = function(noteNumber, bars, onEnd)
    {
      var when = this.context.currentTime;

      var attackCurve = attack();
      var frequency = toFrequency(noteNumber);
      var duration = bars * 4 * 60 / this.tempo; //TODO magic number 4

      for (var i = 0; i < attackCurve.length; ++i)
      {
        this.gain.gain.setValueAtTime
          (attackCurve[i].amplitude * this.volume, when + attackCurve[i].time);
      }

      var decayCurve = decay(duration);
      for (var i = 0; i < decayCurve.length; ++i)
      {
        this.gain.gain.setValueAtTime
          (decayCurve[i].amplitude * this.volume, when + decayCurve[i].time);
      }

      this.oscillator.frequency.setValueAtTime(frequency, when);
      this.oscillator.frequency.setValueAtTime(0, when + duration * .9); //TODO magic number .9
      setTimeout(onEnd, duration * 1000);
    };

  this.rest = function(bars, onEnd)
    {
      var duration = bars * 4 * 60 / this.tempo; //TODO magic number 4
      setTimeout(onEnd, duration * 1000);
    };

  this.stop = function()
    {
      this.oscillator.stop();
    }
}


//////////////////////////////////////////////
// Blocks
//

const durationArgument =
  {
    type: "input_value",
    name: "duration"
  };

const stepsArgument =
  {
    type: "field_number",
    name: "steps",
    value: 1,
    min: 1,
    max: 7
  };

function durationCode(block)
{
  return Blockly.JavaScript.valueToCode(block,
        "duration", Blockly.JavaScript.ORDER_ADDITION);
}

Allegro.Blockly = {};

Blockly.Blocks["duration_quarter"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "%1",
            args0: [
              {
                type: "field_dropdown",
                name: "value",
                options:
                  [
                    [ "quarter note", "" + Value.QUARTER ],
                    [ "half note", "" + Value.HALF ],
                    [ "whole note", "" + Value.WHOLE ],
                    [ "eighth note", "" + Value.EIGHTH ],
                    [ "sixteenth note", "" + Value.SIXTEENTH ],
                    [ "dotted half note", "" + Value.DOTTED_HALF ],
                    [ "dotted quarter note", "" + Value.DOTTED_QUARTER ],
                    [ "dotted eighth note", "" + Value.DOTTED_EIGHTH ]
                  ]
              }
            ],
            output: "Number",
            colour: 200,
            tooltip: "Duration to play or rest"
          });
      }
  };

Blockly.JavaScript["duration_quarter"] = function(block)
  {
    return [ block.getFieldValue("value"), Blockly.JavaScript.ORDER_MEMBER ];
  };

Blockly.Blocks["duration_eighth"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "%1",
            args0: [
              {
                type: "field_dropdown",
                name: "value",
                options:
                  [
                    [ "eighth note", "" + Value.EIGHTH ],
                    [ "quarter note", "" + Value.QUARTER ],
                    [ "whole note", "" + Value.WHOLE ],
                    [ "half note", "" + Value.HALF ],
                    [ "sixteenth note", "" + Value.SIXTEENTH ],
                    [ "dotted half note", "" + Value.DOTTED_HALF ],
                    [ "dotted quarter note", "" + Value.DOTTED_QUARTER ],
                    [ "dotted eighth note", "" + Value.DOTTED_EIGHTH ]
                  ]
              }
            ],
            output: "Number",
            colour: 200,
            tooltip: "Duration to play or rest"
          });
      }
  };

Blockly.JavaScript["duration_eighth"] = function(block)
  {
    return [ block.getFieldValue("value"), Blockly.JavaScript.ORDER_MEMBER ];
  };

Blockly.Blocks["allegro_play"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "play %1",
            args0: [ durationArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Play the current note"
          });
      }
  };

Blockly.JavaScript["allegro_play"] = function(block)
  {
    return "play(" + durationCode(block) + ");\n";
  };

Blockly.Blocks["allegro_rest"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "rest %1",
            args0: [ durationArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Rest (make no sound)"
          });
      }
  };

Blockly.JavaScript["allegro_rest"] = function(block)
  {
    return "rest(" + durationCode(block) + ");\n";
  };

Blockly.Blocks["allegro_up"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "up %1 step(s)",
            args0: [ stepsArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Move the current pitch up the scale"
          });
      }
  };

Blockly.JavaScript["allegro_up"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    return "up(" + steps + ");\n";
  };

Blockly.Blocks["allegro_down"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "down %1 step(s)",
            args0: [ stepsArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Move the current pitch down the scale"
          });
      }
  };

Blockly.JavaScript["allegro_down"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    return "down(" + steps + ");\n";
  };

Blockly.Blocks["allegro_up_and_play"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "up %1 and play %2",
            args0: [ stepsArgument, durationArgument  ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Move the current pitch up the scale and play for the given duration"
          });
      }
  };

Blockly.JavaScript["allegro_up_and_play"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    var value = durationCode(block);
    return "up(" + steps + ");\nplay(" + value + ");\n";
  };

Blockly.Blocks["allegro_down_and_play"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "down %1 and play %2",
            args0: [ stepsArgument, durationArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Move the current pitch down the scale and play for the given duration"
          });
      }
  };

Blockly.JavaScript["allegro_down_and_play"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    var value = durationCode(block);
    return "down(" + steps + ");\nplay(" + value + ");\n";
  };

Blockly.Blocks["allegro_play_and_up"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "play %1 and up %2",
            args0: [ durationArgument, stepsArgument  ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Play the current note and then move up the scale"
          });
      }
  };

Blockly.JavaScript["allegro_play_and_up"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    var value = durationCode(block);
    return "play(" + value + ");\nup(" + steps + ");\n";
  };

Blockly.Blocks["allegro_play_and_down"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "play %1 and down %2",
            args0: [ durationArgument, stepsArgument ],
            previousStatement: null,
            nextStatement: null,
            colour: 50,
            tooltip: "Play the current note and then move down the scale"
          });
      }
  };

Blockly.JavaScript["allegro_play_and_down"] = function(block)
  {
    var steps = block.getFieldValue("steps");
    var value = durationCode(block);
    return "play(" + value + ");\ndown(" + steps + ");\n";
  };

Blockly.Blocks["allegro_flip"] =
  {
    init: function()
      {
        this.jsonInit
          ({
            message0: "flip %1",
            args0: [ { type: "input_statement", name: "DO" } ],
            previousStatement: null,
            nextStatement: null,
            colour: 270,
            tooltip: "Play enclosed phrase upside-down"
          });
      }
  };

Blockly.JavaScript["allegro_flip"] = function(block)
  {
    return Blockly.JavaScript.statementToCode(block, "DO")
        .replace(/up/g, "XXX")
        .replace(/down/g, "up")
        .replace(/XXX/g, "down");
  };



Blockly.JavaScript.STATEMENT_PREFIX = "highlightBlock(%1); ";
Blockly.JavaScript.addReservedWords("highlightBlock");



//////////////////////////////////////////////
// Setup
//

export function Allegro(title, saveWork, limit)
{
  $("#title").text("\"" + title + "\"");

  this.currentNote = 60;

  var timer;
  this.showErrorMessage = function(message)
  {
    var error = $("#error");
    error.text(message);
    if (timer)
      clearTimeout(timer);

    error.css('z-index', 1000);
    error.show(250, function()
      {
        timer = setTimeout(function()
          {
            error.hide(250);
          }, 5000);
      });
  }

  // Blockly workspace

  this.workspace = Blockly.inject("code",
    {
      toolbox: $("#toolboxBase").html().replace("<more_blocks></more_blocks>", ""),
      trashcan: true,
      maxBlocks: typeof limit == "number" ? limit : Infinity
    });
  this.running = false;
  this.delayed = false;

  // Instruction set

  this.up = function(steps)
    {
      for (var i = 0; i < steps; ++i)
      {
        var relativeNote = this.currentNote % 12;
        this.currentNote += relativeNote == 4 || relativeNote == 11 ? 1 : 2;
      }
    };

  this.down = function(steps)
    {
      for (var i = 0; i < steps; ++i)
      {
        var relativeNote = this.currentNote % 12;
        this.currentNote -= relativeNote == 0 || relativeNote == 5 ? 1 : 2;
      }
    };

  this.next = function()
  {
    try
    {
      this.delayed = false;
      if (this.running && this.interpreter.step())
      {
        if (!this.delayed)
          this.next();
      }
      else
        this.workspace.highlightBlock();
    }
    catch (ex)
    {
      console.log(ex);
      this.workspace.highlightBlock();
      this.running = false;
    }
  };

  // Interpreter

  var allegro = this;
  this.interpreterAPI = function(interpreter, scope)
    {
      interpreter.setProperty(scope, "play",
        interpreter.createNativeFunction(function(value)
          {
            allegro.delayed = true;
            return interpreter.createPrimitive
              (allegro.player.play(allegro.currentNote, value, allegro.next.bind(allegro)));
          }));

      interpreter.setProperty(scope, "rest",
        interpreter.createNativeFunction(function(value)
          {
            allegro.delayed = true;
            return interpreter.createPrimitive
              (allegro.player.rest(value, allegro.next.bind(allegro)));
          }));

      interpreter.setProperty(scope, "up",
        interpreter.createNativeFunction(function(steps)
          {
            return interpreter.createPrimitive(allegro.up(steps));
          }));

      interpreter.setProperty(scope, "down",
        interpreter.createNativeFunction(function(steps)
          {
            return interpreter.createPrimitive(allegro.down(steps));
          }));

      interpreter.setProperty(scope, "highlightBlock",
        interpreter.createNativeFunction(function(ID)
          {
            return interpreter.createPrimitive
              (allegro.workspace.highlightBlock(ID));
          }));

      interpreter.setProperty(scope, "log",
        interpreter.createNativeFunction(function(text)
          {
            return interpreter.createPrimitive(console.log(text || ""));
          }));
    };

  // Managing dynamic procedures

  this.updateProcedureCallBlocks = function()
    {
      var blocks = Blockly.Xml.workspaceToDom(this.workspace)
        .getElementsByTagName("block");

      var procedureNames = [];
      for (var i = 0; i < blocks.length; ++i)
      {
        if (blocks[i].getAttribute("type") == "procedures_defnoreturn")
        {
          procedureNames.push(blocks[i].getElementsByTagName("field")[0]
            .textContent);
        }
      }

      procedureNames.sort();
      var callBlocks = "";
      for (var i = 0; i < procedureNames.length; ++i)
      {
        callBlocks += $("#callBlockTemplate").html()
          .replace("PROCEDURE_NAME", procedureNames[i]);
      }
      this.workspace.updateToolbox($("#toolboxBase").html()
        .replace("<more_blocks></more_blocks>", callBlocks));
    };

  this.workspace.addChangeListener(function(ev)
    {
      if (ev.type == Blockly.Events.BLOCK_CHANGE &&
        ev.element == "field" && ev.name == "NAME") // a bit dangerous
      {
        this.updateProcedureCallBlocks();
      }
      else if (ev.type == Blockly.Events.BLOCK_DELETE &&
        ev.oldXml.getAttribute("type") == "procedures_defnoreturn")
      {
        /* maybe not necessary?
        if (Blockly.JavaScript.workspaceToCode(this.workspace)
          .indexOf(name + "();") != -1)
        {
          this.showErrorMessage("You are deleting a phrase that is " +
            "currently called elsewhere in your program. " +
            "Be sure to remove any remaining '" + name + "' instructions, " +
            "or your program will not work.");
        }
        */

        this.updateProcedureCallBlocks();
      }
    }.bind(this));

  // Sample programs and work-saving

  this.showSample = function()
    {
      if (!$("#sampleCode").length)
        $("#sample").prop("disabled", "disabled");

      this.workspace.clear();
      Blockly.Xml.domToWorkspace
        (Blockly.Xml.textToDom($("#sampleBlocks").html()),
          this.workspace);

      setTimeout(function()
        {
          this.updateProcedureCallBlocks();
        }.bind(this), 250);
    };

  if (saveWork)
    new BlocklyAutoSaver(this.workspace,
      ["back", "next", "start"].map(ID => document.getElementById(ID)));

  // Playback

  this.volume = $("#volume");
  this.volume.change(function(ev)
    {
      if (this.player)
        this.player.volume = this.volume.val() / 100;
    }.bind(this));

  this.start = function(program)
    {
      this.player = new Player();
      this.player.volume = this.volume.val() / 100;
      this.currentNote = 60;

      program = program || Blockly.JavaScript.workspaceToCode(this.workspace);
      this.interpreter = new Interpreter(program, this.interpreterAPI);

      this.running = true;
      this.next();
    };

  this.stop = function()
    {
      this.running = false;
      this.player.stop();

      //console.log(Blockly.Xml.domToText
      //  (Blockly.Xml.workspaceToDom(this.workspace)));
    };

  $("#start").click(function(ev) { this.start(); }.bind(this));
  $("#stop").click(function(ev) { this.stop(); }.bind(this));
  $("#sample").click(function (ev)
    {
      this.start($("#sampleCode").text());
    }.bind(this));

  function onResize(ev)
  {
    //$("#controls").height(window.innerHeight);
    $("#code").width(window.innerWidth - $("#controls").outerWidth());
  }
  onResize();
  window.onresize = onResize;

  window.hasNextPage = hasNextPage;
  window.nextPage = nextPage;
  window.hasPreviousPage = hasPreviousPage;
  window.previousPage = previousPage;

  let statement = getShadowingStatement();
  if (statement) {
    $("body").append("<div id='shadow' >" + statement + "</div>");
  }

  if (sessionStorage.getItem("tracking")) {
    pollAndFollow();
  }
}
