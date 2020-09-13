/*
Copyright 2014-2017 Will Provost.
Please direct inquiries to sprout@tiac.net.

This file is part of an educational graphics-programming game entitled Sprout.

Sprout is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Sprout is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Sprout.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Drawing-programming UI.
 */

/* Depends on
 *   Drawing.js
 *   Instructions.js
 *   InstructionUI.js
 *   Challenge.js
 */

/*******************************************************************************
 * Global functions
 */

function byID(ID)
{
    return document.getElementById(ID);
}

//TODO encapsluate this somewhere
var INTERVAL = 100;

function getDefaultContext(drawing)
{
    return new Context(drawing, new Line(), 0, 0, 0);
}

function OKCancelDialogUI(titleText, messageText)
{
    var dialog = $("#OKCancelDialog");

    var title = byID("OKCancel.title");
    var message = byID("OKCancel.message");
    var OK = byID("OKCancel.OK");

    OK.disabled = "";

    this.show = function(action)
    {
        title.innerHTML = titleText;
        message.innerHTML = messageText;

        OK.onclick = function(ev) { action(); };

        dialog.modal("show");
    };
}


/*******************************************************************************
 * ProgramUI class
 */

function ProgramUI(program)
{
    var RUN_CAPTION = "<strong><em>Run program</em></strong>";
    var RUN_TOOLTIP = "Run your program";
    var CANCEL_CAPTION = "<strong><em>Cancel</em></strong>";
    var CANCEL_TOOLTIP = "Stop the animation or step-by-step drawing";

    var canvas = byID("canvas");
    var indicators = new Indicators
        (byID("bearing"), byID("weight"), byID("color"));

    var glass = byID("glass");
    var glassContext = glass.getContext("2d");
    glassContext.strokeStyle = "#0040c0";
    glassContext.strokeStyle = "#0040c0";
    glassContext.lineWidth = 2;

    var runButton = byID("runButton");

    var programArea = byID("programArea");
    var errorMessage = byID("errorMessage");

    var timer = null;

    var twoDContext = canvas.getContext("2d");
    var scale = 1;
    var xTranslate = 0;
    var yTranslate = 0;

    var challenge = null;

    indicators.reset();

    var context = null;
    this.getContext = function() { return context; }

    var setBounds = function()
    {
        var drawing = new Drawing();
        context = getDefaultContext(drawing);
        if (challenge)
        {
          runtimeException = null;
          runProgram("red=128;green=128;blue=128;" + challenge, context);
          if (runtimeException)
            console.log(runtimeException);
        }

        runtimeException = null;
        runProgram(program.value, context);
        if (runtimeException)
          console.log(runtimeException);

        var calculator = new BoundsCalculator();
        drawing.draw(calculator);

        var margin = 10;
        var framedWidth = canvas.width - 2 * margin;
        var framedHeight = canvas.height - 2 * margin;

        scale = 1;
        var drawingWidth = calculator.xMax - calculator.xMin;
        var drawingHeight = calculator.yMax - calculator.yMin;
        if (drawingWidth > framedWidth || drawingHeight > framedHeight)
            scale = Math.min(framedWidth / drawingWidth, framedHeight
                    / drawingHeight);
        twoDContext.scale(scale, scale);
        glassContext.scale(scale, scale);

        xTranslate = (canvas.width / scale - calculator.xMax - calculator.xMin) / 2;
        yTranslate = (canvas.height / scale - calculator.yMax - calculator.yMin) / 2;
        twoDContext.translate(xTranslate, yTranslate);
        glassContext.translate(xTranslate, yTranslate);
    }

    var resetBounds = function()
    {
        twoDContext.translate(-xTranslate, -yTranslate);
        twoDContext.scale(1 / scale, 1 / scale);

        glassContext.translate(-xTranslate, -yTranslate);
        glassContext.scale(1 / scale, 1 / scale);

        xTranslate = yTranslate = 0;
        scale = 1.0;
    };

    var clearShuttle = function()
    {
        glassContext.clearRect(-xTranslate, -yTranslate,
            canvas.width / scale, canvas.height / scale);
    };

    var drawShuttle = function()
    {
        var SIZE = 6.0;

        function xPos(distance, direction)
        {
            return context.x + SIZE * distance *
                Math.cos(context.bearing + Math.PI * direction);
        }

        function yPos(distance, direction)
        {
            return context.y - SIZE * distance *
                Math.sin(context.bearing + Math.PI * direction);
        }

        clearShuttle();
        glassContext.beginPath();
        glassContext.moveTo(xPos(1.0, 0.0), yPos(1.0, 0.0));
        glassContext.lineTo(xPos(1.0, .8), yPos(1.0, .8));
        glassContext.lineTo(xPos(.35, 1.0), yPos(.35, 1.0));
        glassContext.lineTo(xPos(1.0, -.8), yPos(1.0, -.8));
        glassContext.lineTo(xPos(1.0, 0.0), yPos(1.0, 0.0));
        glassContext.stroke();
    };

    var animator = function()
    {
        //TODO restore animation
        //model.execute(context);
        drawShuttle();

        if (context.animationContexts.length == 0)
            stopDrawing();
    };

    var startDrawing = function(skipAnimation)
    {
        stopDrawing();
        clearShuttle();

        var clearContext = canvas.getContext("2d");
        clearContext.clearRect(0, 0, canvas.width, canvas.height);
        setBounds();

        context = getDefaultContext(new Drawing());
        context.indicators = indicators;

        if (challenge)
        {
            var challengeContext = getDefaultContext(context.drawing);
            runProgram("red=128;green=128;blue=128;" + challenge,
              challengeContext);
        }

        var ex = runProgram(program.value, context);
        if (ex == null)
        {
            context.drawing.draw(canvas);
            context.updateIndicators();
            drawShuttle();

            resetBounds();
            errorMessage.style.display = "none";
        }
        else
        {
          if (typeof ex == "string")
          {
            errorMessage.value = ex;
          }
          else
          {
            try
            {
              errorMessage.value = "In line " +
                  ex.location.start.line + ", column " +
                  ex.location.start.column + ": " +
                  (("" + ex).replace(/Expected .* but /, ""));

                  var point = 0;
                  var line = ex.location.start.line;
                  while (--line != 0)
                  {
                    point = program.value.indexOf("\n", point) + 1;
                  }

                  program.selectionStart = point + ex.location.start.column - 1;
                  program.selectionEnd = point + ex.location.start.column;
            }
            catch(err)
            {
                console.log(ex);
            }

            errorMessage.style.display = "block";
          }
        }
    };

    var stopDrawing = function()
    {
        if (timer !== null)
        {
            clearInterval(timer);
            timer = null;
        }

        resetBounds();
        runButton.innerHTML = RUN_CAPTION;
        runButton.title = RUN_TOOLTIP;
    };

    var onRunProgram = function(ev)
    {
        if (runButton.innerHTML == RUN_CAPTION)
            startDrawing();
        else
            stopDrawing();
    };

    runButton.onclick = onRunProgram;
    program.onkeyup = function(ev)
      {
        if (ev.ctrlKey && ev.keyCode == 13)
          onRunProgram();
      };

    this.reset = function()
    {
        startDrawing();
    }

    this.takeChallenge = function(newChallenge)
    {
        program.value = newChallenge[0];
        challenge = newChallenge[1];
        setBounds();
        startDrawing(true);
    };

    this.quitChallenge = function()
    {
        challenge = null;
        startDrawing(true);
    };

    scrollIntoView = function(view)
    {
        var programRect = programArea.getBoundingClientRect();

        var viewRect = view.getBoundingClientRect();
        if (viewRect.top < programRect.top)
            programArea.scrollTop += viewRect.top - programRect.top;

        viewRect = view.getBoundingClientRect();
        if (viewRect.bottom > programRect.bottom)
            programArea.scrollTop += viewRect.bottom - programRect.bottom;
    };

    function Observer()
    {
        this.activeInstructionView = function(instructionView)
        {
            scrollIntoView(instructionView);
        };

        this.inactiveInstructionView = function(instructionUI)
        {
        };
    };

    var resizeCanvasAndProgramArea = function()
    {
        // Height of the program area:
        var windowHeight = window.innerHeight;
        var programAreaTop = programArea.getBoundingClientRect().top;
        var programAreaHeight = windowHeight - programAreaTop;
        var node = programArea;
        while ((node = node.parentNode).nodeName != "#document")
            programAreaHeight -=
                parseInt(window.getComputedStyle(node, null).marginBottom, 10) +
                parseInt(window.getComputedStyle(node, null).paddingBottom, 10);

        programArea.style.height = "" + programAreaHeight + "px";

        // Width of the drawing area:
        var canvasParentRect = canvas.parentNode.getBoundingClientRect();
        var canvasWidth = canvasParentRect.right - canvasParentRect.left + 6;
        var canvasHeight = canvasParentRect.bottom - canvasParentRect.top - 7;

        //TODO must re-create the canvas with innerHTML!
        // otherwise we have the same old blurry-image problem
        var sizeString = "width='" + canvasWidth +
            "' height='" + canvasHeight + "' ";
        canvas.parentNode.innerHTML =
            "<canvas id='canvas' class='drawing shadow' " + sizeString +
                "></canvas>" +
            "<canvas id='glass' class='drawing transparent' " + sizeString +
                "></canvas>";
        canvas = byID("canvas");
        glass = byID("glass");
        twoDContext = canvas.getContext("2d");
        glassContext = glass.getContext("2d");
        //TODO: redraw if running automatically

        if (challenge)
          setBounds(challenge);
        startDrawing(true);
    };
    resizeCanvasAndProgramArea();
    window.onresize = resizeCanvasAndProgramArea;
}

/*******************************************************************************
 * GalleryUI class
 */

function GalleryUI(tutorialUI)
{
    var galleryButton = byID("gallery");
    var filename = byID("storage.filename");
    var program = byID("program");
    var gallery = byID("galleryPrograms")
    var allPrograms = new Array();

    function GalleryDialogUI()
    {
        var dialog = $("#galleryDialog");

        var name = byID("gallery.name");
        var select = byID("gallery.select");

        var init = function()
        {
            name.innerHTML = "";

            var programs = gallery.childNodes;
            for(var i = 0; i < programs.length; i++)
            {
                var thisProgram = programs[i];
                if (thisProgram.nodeType == 1)
                {
                    allPrograms[thisProgram.id] = thisProgram.value;

                    var option = document.createElement("option");
                    option.innerHTML = thisProgram.id;
                    option.value = thisProgram.id;

                    name.appendChild(option);
                }
            }

            select.disabled = "disabled";
        };
        init();

        this.show = function()
        {
            byID("gallery.cancel").disabled = "";
            dialog.modal("show");
        };


        name.onchange = function(ev)
        {
            select.disabled =
                (name.value !== null && name.value.length != 0)
                    ? "" : "disabled";
        };

        select.onclick = function(ev)
        {
            defaultSaver.save();
            tutorialUI.stopTutorial();
            defaultSaver.stop();

            program.value = allPrograms[name.value];
            //filename.innerHTML = galleryDrawing.name;
        };
    }
    galleryDialogUI = new GalleryDialogUI();

    galleryButton.onclick = function(ev)
    {
        galleryDialogUI.show();
    };
}


/*******************************************************************************
 * ChallengeUI class
 */

function ChallengeUI(tutorialUI)
{
    var TAKE_CAPTION = "Take challenge";
    var TAKE_TOOLTIP = "Try to match an existing drawing exactly by creating the right program";
    var QUIT_CAPTION = "Quit challenge";
    var QUIT_TOOLTIP = "Turn off the challenge mode and go back to normal drawing";

    var challengeMode = false;

    var challengeButton = byID("challenge");
    var filename = byID("storage.filename");
    var program = byID("program");
    var challenge = byID("challengePrograms")
    var allPrograms = new Array();

    var autoSaver = null;

    var loadChallenge = function(challengeName)
    {
        defaultSaver.save();
        tutorialUI.stopTutorial();
        tutorialUI.disableTutorial();
        defaultSaver.stop();

        var challenge = allPrograms[challengeName];
        programUI.takeChallenge(challenge);

        challengeMode = true;
        challengeButton.innerHTML = QUIT_CAPTION;
        challengeButton.title = QUIT_TOOLTIP;

        autoSaver = new ChallengeAutoSaver(challengeName);
    }
    this.jumpToChallenge = loadChallenge;

    function ChallengeDialogUI()
    {
        var dialog = $("#challengeDialog");

        var name = byID("challenge.name");
        var select = byID("challenge.select");

        var init = function()
        {
            name.innerHTML = "";

            var programs = challenge.childNodes;
            for(var i = 0; i < programs.length; i++)
            {
                var thisProgram = programs[i];
                if (thisProgram.nodeType == 1)
                {
                    allPrograms[thisProgram.id] = new Array();
                    var children = thisProgram.childNodes;
                    for (var j = 0; j < children.length; ++j)
                    {
                        var thisChild = children[j];
                        if (thisChild.nodeType == 1)
                            allPrograms[thisProgram.id].push
                                (thisChild.innerHTML);
                    }

                    var option = document.createElement("option");
                    option.innerHTML = thisProgram.id;
                    option.value = thisProgram.id;

                    name.appendChild(option);
                }
            }

            select.disabled = "disabled";
        };
        init();

        this.show = function()
        {
            byID("challenge.cancel").disabled = "";
            dialog.modal("show");
        };


        name.onchange = function(ev)
        {
            select.disabled =
                (name.value !== null && name.value.length != 0)
                    ? "" : "disabled";
        };

        select.onclick = function(ev)
        {
          loadChallenge(name.value);
        };
    }
    challengeDialogUI = new ChallengeDialogUI();

    var quitChallenge = function()
    {
        autoSaver.save();
        autoSaver.stop();
        defaultSaver.start();

        programUI.quitChallenge();

        challengeMode = false;
        challengeButton.innerHTML = TAKE_CAPTION;
        challengeButton.title = TAKE_TOOLTIP;

        tutorialUI.enableTutorial();
    };

    challengeButton.onclick = function(ev)
    {
        if (challengeMode)
          quitChallenge();
        else
          challengeDialogUI.show();
    };
}


/*******************************************************************************
 * TutorialUI class
 */

function TutorialUI()
{
    var tutorialButton = byID("tutorial");
    var nextButton = byID("tutorial.next");
    var quitButton = byID("tutorial.quit");

    var tutorial = byID("tutorialPrograms")
    var allPrograms = new Array();

    var step = 0;

    var showStep = function()
    {
      program.value = allPrograms[step];
      nextButton.disabled = step < allPrograms.length - 1
          ? "" : "disabled";
    }

    this.startTutorial = function()
    {
      tutorialButton.onclick(null);
    };

    this.stopTutorial = function()
    {
      quitButton.onclick(null);
    };

    this.enableTutorial = function()
    {
      tutorialButton.disabled = "";
    };

    this.disableTutorial = function()
    {
      tutorialButton.disabled = "disabled";
    };

    tutorialButton.onclick = function(ev)
    {
      defaultSaver.save();
      defaultSaver.stop();

      tutorialButton.style.display = "none";
      nextButton.style.display = "inline";
      quitButton.style.display = "inline";

      var programs = tutorial.childNodes;
      for(var i = 0; i < programs.length; i++)
      {
          var thisProgram = programs[i];
          if (thisProgram.nodeType == 1)
              allPrograms.push(thisProgram.value);
      }

      step = 0;
      showStep();
    }

    nextButton.onclick = function(ev)
    {
      ++step;
      showStep();
    }

    quitButton.onclick = function(ev)
    {
      tutorialButton.style.display = "inline";
      nextButton.style.display = "none";
      quitButton.style.display = "none";

      program.value = "";

      defaultSaver.start();
    }
}


/*******************************************************************************
 * Work-saving
 */

var basePageID = "SproutText:";

/*
Connects an AutoSaver to Sprout Text for a specific challenge.
This is an SPA, so no bookmarkable pages, so the built-in pageID generator
won't work for us.
*/
function ChallengeAutoSaver(challengeName)
{
  var workElement = $("#program");
  var autoSaver = new AutoSaver
  (
    function(data)  { workElement.val(data); },
    function() { return workElement.val(); },
    [],
    basePageID + challengeName
  );

  workElement.change(autoSaver.makeDirty);
  workElement.keyup(autoSaver.makeDirty);

  $("#challenge").click(autoSaver.save);

  this.makeDirty = autoSaver.makeDirty;
  this.save = autoSaver.save;
  this.start = autoSaver.start;
  this.stop = autoSaver.stop;
}

/*
Connects an AutoSaver to Sprout Text for general coding.
This is an SPA, so no bookmarkable pages, so the built-in pageID generator
won't work for us.
*/
function DefaultAutoSaver()
{
  var running = false;
  var workElement = $("#program");
  var autoSaver = new AutoSaver
  (
    function(data)  { workElement.val(data); },
    function() { return workElement.val(); },
    [],
    basePageID + "default",
    defaultInterval,
    true
  );

  workElement.change(autoSaver.makeDirty);
  workElement.keyup(autoSaver.makeDirty);

  this.makeDirty = autoSaver.makeDirty;
  this.save = autoSaver.save;

  this.stop = function()
    {
      if (running)
      {
        autoSaver.stop();
        running = false;
      }
    };

  this.start = function()
    {
      running = true;
      setTimeout(function()
        {
          if (running)
            autoSaver.start();
        }, 1000);
    };
}

var defaultSaver = null;


/*******************************************************************************
 * Cheat sheet
 */

function RemindersUI(targetID, phrases, onselect)
{
  var target = $("#" + targetID);

  var reminders = $("#reminders");
  var parsed = new Array();

  for (var i = 0; i < phrases.length; ++i)
  {
    parsed.push
      ({
        start: phrases[i].indexOf("<select>"),
        end: phrases[i].indexOf("</select>") - "<select>".length,
        display: phrases[i].replace(/<\/?select>/g, "")
      });

    var option = $(document.createElement("option"));
    option.text(parsed[i].display);
    reminders.append(option);
  }

  var insertPhrase = function()
    {
      var index = reminders[0].selectedIndex;
      if (index == -1)
        return;

      var phrase = parsed[index];

      var insertPoint = target[0].selectionEnd;
      var text = target.val();
      text = text.substring(0, insertPoint) + phrase.display +
        text.substring(insertPoint);
      target.val(text);

      if (phrase.start != -1)
      {
        target[0].selectionStart = insertPoint + phrase.start;
        target[0].selectionEnd = insertPoint + phrase.end;
      }
      else
      {
        target[0].selectionStart = insertPoint + phrase.display.length;
        target[0].selectionEnd = insertPoint + phrase.display.length;
      }

      target.focus();

      if (onselect)
        onselect();
    };

  reminders.dblclick(insertPhrase);
  reminders.keyup(function(ev)
    {
      if (ev.keyCode == 13)
      {
        insertPhrase();
      }
    });
}

function openCheatSheet()
{
  $("#cheatSheet").modal("show");
}

function closeCheatSheet()
{
  $("#cheatSheet").modal("hide");
}

function setupCheatSheet()
{
  var phrases =
    [
      "move <select>40</select>;\n",
      "skip <select>40</select>;\n",
      "turn <select>90</select>;\n",
      "number <select>var-name</select> = 1;\n",
      "random <select>min</select> to max",
      "repeat <select>N</select> times\n{\n  \n}\n",
      "repeat until <select>x == 0</select>\n{\n  \n}\n",
      "for <select>var-name</select> = N to M\n{\n  \n}\n",
      "if <select>x == 1</select>\n{\n  \n}\n",
      "show me <select>variable</select>;\n",
      "procedure <select>proc-name</select>(param1, param2)\n{\n  \n}\n",
      "call <select>proc-name</select>(arg1, arg2);\n",
      "number[N] <select>var-name</select>;\n"
    ];

  new RemindersUI("program", phrases, closeCheatSheet);

  $("#cheatSheet").on("shown.bs.modal", function ()
    {
      $("#reminders")[0].selectedIndex = 0;
      $("#reminders").focus();
    });

  $("#program").keydown(function (ev)
    {
      if (ev.ctrlKey && ev.keyCode == 32)
        openCheatSheet();
    });

  $("#assistant").click(openCheatSheet);
}



/*******************************************************************************
 * Initialization
 */

var programUI = null;
var grammar = null;
var parser = null;
var runtimeException = null;

function runProgram(code, context)
{
  try
  {
    runtimeException = null;
    var program = parser.parse(code);
    program.execute(context);
    return runtimeException;
  }
  catch (err)
  {
    return err;
  }
}

function init()
{
    defaultSaver = new DefaultAutoSaver();
    grammar = document.getElementById("grammar").innerHTML
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    parser = peg.generate(grammar);


    programUI = new ProgramUI(byID("program"));
    var tutorialUI = new TutorialUI();
    new GalleryUI(tutorialUI);
    var challengeUI = new ChallengeUI(tutorialUI);

    setupCheatSheet();

    tutorialUI.startTutorial();

    var challengeName = requestParams().challenge;
    if (challengeName)
    {
        challengeUI.jumpToChallenge(challengeName.replace("%20", " "));
    }

    var suffix = getShadowingStatement();
    if (suffix)
    {
        var title = byID("title");
        title.textContent = title.textContent + " -- " + suffix;
    }

    if (sessionStorage.getItem("tracking")) {
      pollAndFollow();
    }
}
