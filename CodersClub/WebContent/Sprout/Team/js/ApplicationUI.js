/*
Copyright 2014 Will Provost.
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
 *   Gallery.js
 *   Challenge.js
 */

/*******************************************************************************
 * Global functions
 */

//TODO encapsluate this somewhere
var INTERVAL = 100;

function getDefaultContext(drawing)
{
    return getContext(drawing);
}

function getContext(drawing, style, x, y, bearing)
{
    return new Context(drawing, style || new Line(), x || 0, y || 0, bearing || 0);
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
 * DrawingUI class
 */

function DrawingUI()
{
    var RUN_CAPTION = "Run program";
    var RUN_TOOLTIP = "Run your program";
    var CANCEL_CAPTION = "Cancel";
    var CANCEL_TOOLTIP = "Stop the animation or step-by-step drawing";

    var canvas = byID("canvas");

    var glass = byID("glass");
    var glassContext = glass.getContext("2d");
    glassContext.strokeStyle = "#0040c0";
    glassContext.lineWidth = 2;

    var runButton = byID("runButton");
    var auto = byID("auto");
    var animate = byID("animate");
    var delay = byID("interval");

    var twoDContext = canvas.getContext("2d");
    var scale = 1;
    var xTranslate = 0;
    var yTranslate = 0;

    var programUIs = [];
    var challenge = null;

    var timer = null;

    this.addProgramUI = function(programUI)
    {
        programUIs.push(programUI);
    }

    this.getProgramUIs = function()
    {
        return programUIs;
    }

    this.takeChallenge = function(newChallenge)
    {
        challenge = newChallenge.program;
        languageLevel = newChallenge.level;

        for (let index = 0; index < this.getProgramUIs().length; ++index) {
            this.getProgramUIs()[index].setupChallenge
              (newChallenge.starters[index],
                newChallenge.limits ? newChallenge.limits[index] : null);
        }

        this.setBounds([challenge]);
        this.startDrawing(true);
    };

    this.quitChallenge = function()
    {
        challenge = null;
        this.startDrawing(true);
    };

    this.setBounds = function(programs)
    {
        var drawing = new Drawing();
        let context = getDefaultContext(drawing);
        for (let program of programs) {
          program.execute(context);
        }

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

    this.resetBounds = function()
    {
        twoDContext.translate(-xTranslate, -yTranslate);
        twoDContext.scale(1 / scale, 1 / scale);

        glassContext.translate(-xTranslate, -yTranslate);
        glassContext.scale(1 / scale, 1 / scale);

        xTranslate = yTranslate = 0;
        scale = 1.0;
    };

    var clearShuttles = function()
    {
        glassContext.clearRect(-xTranslate, -yTranslate,
            canvas.width / scale, canvas.height / scale);
    };

    var drawShuttle = function(context, style)
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

        glassContext.strokeStyle = style.color;
        glassContext.beginPath();
        glassContext.moveTo(xPos(1.0, 0.0), yPos(1.0, 0.0));
        glassContext.lineTo(xPos(1.0, .8), yPos(1.0, .8));
        glassContext.lineTo(xPos(.35, 1.0), yPos(.35, 1.0));
        glassContext.lineTo(xPos(1.0, -.8), yPos(1.0, -.8));
        glassContext.lineTo(xPos(1.0, 0.0), yPos(1.0, 0.0));
        glassContext.stroke();
    };

    this.animator = function()
    {
        let finished = true;
        clearShuttles();
        for (let programUI of programUIs) {
            if (programUI.context.animationContexts.length != 0) {
                programUI.model.execute(programUI.context);
                finished = false;
            }
            drawShuttle(programUI.context, programUI.style);
        }

        if (finished)
            this.stopDrawing();
    };

    this.startDrawing = function(skipAnimation)
    {
        this.stopDrawing();
        clearShuttles();

        var clearContext = canvas.getContext("2d");
        if (challenge)
            clearContext.clearRect(-xTranslate, -yTranslate,
                canvas.width / scale, canvas.height / scale);
        else
            clearContext.clearRect
                (0, 0, canvas.width, canvas.height);

        if (programUIs.map(UI => UI.model.instructions.length).reduce((x,y) => x + y) == 0)
            return;

        if (!challenge)
            this.setBounds(programUIs.map(UI => UI.model));

        let drawing = new Drawing();

        if (challenge)
        {
            var challengeContext = getDefaultContext(drawing);
            challenge.execute(challengeContext);
        }

        if(animate.checked && !(skipAnimation == true))
        {
            if (challenge)
                drawing.draw(canvas);

            adjustDelay();

            for (let programUI of programUIs) {
                programUI.context = getContext(drawing, programUI.style,
                    programUI.x, programUI.y, programUI.bearing);
                programUI.context.canvas = canvas;

                programUI.context.animating = true;
                programUI.context.animationLevel = 0;
                programUI.context.animationContexts = [];
                programUI.context.observer =  {
                    activeInstructionView: iUI => programUI.scrollIntoView(iUI),
                    inactiveInstructionView: iUI => {}
                };

                programUI.model.execute(programUI.context);
                drawShuttle(programUI.context, programUI.style);
            }

            timer = setInterval(() => this.animator(), INTERVAL);

            runButton.innerHTML = CANCEL_CAPTION;
            runButton.title = CANCEL_TOOLTIP;
        }
        else
        {
            for (let programUI of programUIs) {
                let context = getContext(drawing, programUI.style,
                    programUI.x, programUI.y, programUI.bearing);
                programUI.model.execute(context);
                context.drawing.draw(canvas);
                drawShuttle(context, programUI.style);
            }

            if (!challenge)
                this.resetBounds();
        }
    };

    this.stopDrawing = function()
    {
        if (timer !== null)
        {
            clearInterval(timer);
            timer = null;
        }

        for (let programUI of programUIs) {
            delete programUI.context;
        }

        if (!challenge)
            this.resetBounds();

        runButton.innerHTML = RUN_CAPTION;
        runButton.title = RUN_TOOLTIP;
    };

    this.drawIfYoureGonna = function()
    {
        this.stopDrawing();

        if (auto.checked)
            this.startDrawing(true);
    }

    runButton.onclick = ev =>
    {
        if (runButton.innerHTML == RUN_CAPTION)
            this.startDrawing();
        else
            this.stopDrawing();
    };

    auto.onchange = ev =>
    {
        this.startDrawing(true);
    }

    var adjustDelay = function()
    {
        var value = parseFloat(delay.value);
        INTERVAL = 400000 / value / value / value
                          / value / value / value / value;
    };

    delay.onchange = ev =>
    {
        adjustDelay();
        if (timer !== null) {
            clearInterval(timer);
            timer = setInterval(() => this.animator(), INTERVAL);
        }
    };

    this.resizeCanvasAndProgramArea = () =>
    {
        // Height of the program area:
        var windowHeight = window.innerHeight;
        var programAreaTop = programUIs[0].programArea.getBoundingClientRect().top;
        var programAreaHeight = windowHeight - programAreaTop;
        var node = programUIs[0].programArea;
        while ((node = node.parentNode).nodeName != "#document")
            programAreaHeight -=
                parseInt(window.getComputedStyle(node, null).marginBottom, 10) +
                parseInt(window.getComputedStyle(node, null).paddingBottom, 10);

        for (let programArea of programUIs.map(UI => UI.programArea)) {
            programArea.style.height = "" + programAreaHeight + "px";
        }

        // Width of the drawing area:
        var canvasParentRect = canvas.parentNode.getBoundingClientRect();
        var canvasWidth = canvasParentRect.right - canvasParentRect.left - 8;
        var canvasHeight = canvasParentRect.bottom - canvasParentRect.top - 8;

        //TODO must re-create the canvas with innerHTML!
        // otherwise we have the same old blurry-image problem
        var sizeString = "width='" + canvasWidth +
            "' height='" + canvasHeight + "' ";
        canvas.parentNode.innerHTML =
            "<canvas id='canvas' class='drawing shadow' " +
                sizeString + "></canvas>" +
            "<canvas id='glass' class='drawing transparent' " +
                sizeString + "></canvas>";
        canvas = byID("canvas");
        glass = byID("glass");
        twoDContext = canvas.getContext("2d");
        glassContext = glass.getContext("2d");

        if (challenge)
          this.setBounds([challenge]);
        this.startDrawing(true);
    };
    window.onresize = this.resizeCanvasAndProgramArea;
}


/*******************************************************************************
 * ProgramUI class
 */

function ProgramUI(programID, drawingUI, style)
{
    var wrapper = new Wrapper();
    this.model = wrapper.delegate = new Block();

    this.x = 0;
    this.y = 0;
    this.bearing = 0;
    this.style = style;

    this.programArea = byID("programArea" + programID);
    this.blockUI = new BlockUI(wrapper.delegate, byID("program" + programID));
    this.blockUI.addInstruction(new Wrapper());
    this.heading = byID("heading" + programID);
    this.tooMany = byID("tooMany" + programID);

    drawingUI.addProgramUI(this);

    this.reset = function()
    {
        drawingUI.startDrawing();
    }

    this.scrollIntoView = function(view)
    {
        var programRect = this.programArea.getBoundingClientRect();

        var viewRect = view.getBoundingClientRect();
        if (viewRect.top < programRect.top)
            this.programArea.scrollTop += viewRect.top - programRect.top;

        viewRect = view.getBoundingClientRect();
        if (viewRect.bottom > programRect.bottom)
            this.programArea.scrollTop += viewRect.bottom - programRect.bottom;
    };

    this.setupChallenge = function(startingStyle, limit)
    {
        this.heading.style.color = startingStyle.style.color;
        this.blockUI.clearInstructions();

        this.x = startingStyle.x;
        this.y = startingStyle.y;
        this.bearing = startingStyle.bearing;
        this.style = startingStyle.style;

        this.limit = limit;
    };

    this.loadDrawing = function(data)
    {
        let program = eval("(" + data + ")").drawing;
        this.blockUI.clearInstructions();
        for (var i = 0; i < program.instructions.length - 1; ++i)
            this.blockUI.addInstruction(createWrapper(program.instructions[i]), i);

        drawingUI.startDrawing(true);
    }.bind(this);

    this.saveDrawing = function()
    {
        var stripObservers = function(obj)
        {
            if (obj === null)
                return;
            else if (typeof(obj) == "object")
            {
                delete obj.observer;
                for (var prop in obj)
                    stripObservers(obj[prop]);
            }
            else if (Object.prototype.toString.call(obj) == '[object Array]')
                for (var i = 0; i < obj.length; ++i)
                    stripObservers(obj[i]);
        };

        var copy = eval("(" + JSON.stringify(this.model) + ")");
        stripObservers(copy);

        return "{ 'level': '" + languageLevels[languageLevel].name +
            "', 'drawing': " + JSON.stringify(copy) + "}";
    }.bind(this);

    this.enableInstructions = function(enable)
    {
      for (let select of this.programArea.querySelectorAll("select.instruction"))
        if (select.value.length == 0)
          select.disabled = enable ? "" : "disabled";
    }

    function countUpInstructions(node)
    {
      if (node.hasOwnProperty("delegate"))
        return node.delegate != null
          ? countUpInstructions(node.delegate)
          : 0; // "Choose" / empty Wrapper
      else if (node.instructions)
      {
        var count = 1;
        for (var i = 0; i < node.instructions.length; ++i)
          count += countUpInstructions(node.instructions[i]);
        return count;
      }

      return 1;
    };

    this.checkInstructionCount = function()
    {
      let shutdown = this.limit &&
          countUpInstructions(this.model) > this.limit;
      this.tooMany.style.display = shutdown ? "inline" : "none";
      this.enableInstructions(!shutdown);
    }

    this.onInstructionChanged = function()
    {
      drawingUI.drawIfYoureGonna();
      if (this.autoSaver)
        this.autoSaver.makeDirty();
    };

    this.onInstructionAdded = function(newInstructionUI)
    {
      this.scrollIntoView(newInstructionUI.view);
      this.checkInstructionCount();
      if (this.autoSaver)
        this.autoSaver.makeDirty();
    };

    this.onInstructionRemoved = function(newInstructionUI)
    {
      drawingUI.drawIfYoureGonna();
      this.checkInstructionCount();
      if (this.autoSaver)
        this.autoSaver.makeDirty();
    };
}


/*******************************************************************************
 * ChallengeUI class
 */

function ChallengeUI(drawingUI, programUI, blockUI, program)
{
    var TAKE_CAPTION = "Take challenge";
    var TAKE_TOOLTIP = "Try to match an existing drawing exactly by creating the right program";
    var QUIT_CAPTION = "Quit challenge";
    var QUIT_TOOLTIP = "Turn off the challenge mode and go back to normal drawing";

    var basePageID = "SproutTeam:";
    var autoSaver = null;

    //CHALLENGEDIALOG var challengeToggle = byID("challenge.toggle");
    var challengeBalloon = null;

    var challengeMode = false;
    var challengeLimit;
    var tooManyBalloon;

    var setupTeam = function(team, challengeKey) {
      for (let index = 0; index < team.length; ++index) {
        let programUI = drawingUI.getProgramUIs()[index];
        programUI.heading.textContent = team[index].coder.name;

        let pageID = basePageID + challengeKey;
        if (team[index].me) {
          programUI.autoSaver = new AutoSaver(programUI.loadDrawing,
            programUI.saveDrawing, [], pageID);
        } else {
          let storage = new Storage();
          programUI.programArea.parentNode.classList.add("teammate");

          var loadTeammateDrawing = function()
          {
            if (!programUI.context || !programUI.context.animating) {
              storage.loadTeammate(pageID, team[index].teamCode,
                  team[index].coder.id, data => {
                      programUI.loadDrawing(data);
                      programUI.checkInstructionCount();
                      programUI.enableInstructions(false);
                    });
            }
          }

          loadTeammateDrawing();
          teamTimer = setInterval(loadTeammateDrawing, 5000);
        }
      }
    }

    var loadChallenge = function(challengeKey)
    {
        var challenge = challenges.byKey(challengeKey);
        drawingUI.takeChallenge(challenge);

        challengeMode = true;

        //CHALLENGEDIALOG challengeToggle.innerHTML = QUIT_CAPTION;
        //CHALLENGEDIALOG challengeToggle.title = QUIT_TOOLTIP;

        new TeamerUpper(basePageID + challengeKey,
            "createTeam", "teamCreated", "teamToJoin", "joinTeam",
            "teamUp", "programArea2", team => setupTeam(team, challengeKey));
    };
    this.jumpToChallenge = loadChallenge;

    function LoadChallengeDialogUI()
    {
        var dialog = $("#loadChallengeDialog");

        var level = byID("loadChallenge.level");
        var name = byID("loadChallenge.name");
        var select = byID("loadChallenge.select");

        var init = function()
        {
            level.innerHTML = "";
            name.innerHTML = "";
            for (var lvl = 0; lvl < languageLevels.length; ++lvl)
            {
                var option = document.createElement("option");
                option.innerHTML = "Level " + (lvl + 1);
                option.value = lvl;
                level.appendChild(option);
            }
        };
        init();

        this.show = function()
        {
            level.value = languageLevel;
            level.onchange();

            select.disabled = "disabled";
            byID("loadChallenge.cancel").disabled = "";

            //TODO use AutoSaver's dirty flag
            /*
            byID("loadChallenge.message").innerHTML = storageUI.isDirty()
                ? "Note that entering challenge mode will clear your current drawing."
                : "";
            */
            dialog.modal("show");
        };

        level.onchange = function(ev)
        {
            name.innerHTML = "";
            var keys = challenges.atLevel(level.value);
            for (var k = 0; k < keys.length; ++k)
            {
                var option = document.createElement("option");
                option.innerHTML = challenges.byKey(keys[k]).name;
                option.value = keys[k];
                name.appendChild(option);
            }

            select.disabled = "disabled";
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
    loadChallengeDialogUI = new LoadChallengeDialogUI();

    var quitChallenge = function()
    {
        //TODO autoSaver.save();
        //TODO autoSaver.stop();

        drawingUI.quitChallenge();

        challengeMode = false;
        //CHALLENGEDIALOG challengeToggle.innerHTML = TAKE_CAPTION;
        //CHALLENGEDIALOG challengeToggle.title = TAKE_TOOLTIP;
    };

    /*
    CHALLENGEDIALOG
    challengeToggle.onclick = function(ev)
    {
        if (challengeMode)
            quitChallenge();
        else
            loadChallengeDialogUI.show();
    };
    */
}


/*******************************************************************************
 * Splash
 */

function SplashUI()
{
    var TIMING = 3000; //msec to draw everything
    var FADE_STEPS = 25;

    var starterDrawings = [ "web" ];

    var drawings =
      [
        {
          key: "squares",
          instructions: gallery.byKey("squares").work.drawing.instructions,
          steps: 330,
          start: 0.100,
          interval: .002,
          opacity: 0,
          opacityIncrement: .004
        },
        {
          key: "vine",
          instructions: gallery.byKey("vine").work.drawing.instructions,
          steps: 380,
          start: 0.200,
          interval: .001,
          opacity: 0,
          opacityIncrement: .003
        },
        {
          key: "border1",
          instructions:
          [
            {
              "name":"loop",
              "delegate":
              {
                "instructions":
                [
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                ],
                "count":12
              }
            },
            {"name":"move","delegate":{"distance":5}},
            {"name":"move","delegate":{"distance":5}}
          ],
          steps: 194,
          start: .700,
          interval: .005,
          opacity: 1,
          opacityIncrement: 0
        },
        {
          key: "border2",
          instructions:
          [
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {
              "name":"loop",
              "delegate":
              {
                "instructions":
                [
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnRight","delegate":{"degrees":90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"move","delegate":{"distance":5}},
                  {"name":"turnLeft","delegate":{"degrees":-90}},
                ],
                "count":12
              }
            },
            {"name":"move","delegate":{"distance":5}},
            {"name":"move","delegate":{"distance":5}}
          ],
          steps: 194,
          start: .700,
          interval: .005,
          opacity: 1,
          opacityIncrement: 0
        }
      ];

    for (var s = 0; s < starterDrawings.length; ++s)
        galleryDrawing(starterDrawings[s]);

    var main = byID("splash-main");
    var mainOpacity = 0;
    var fadeInTimer = setInterval(function()
        {
            main.style.opacity = (mainOpacity += .02);
            if (mainOpacity > 3)
                clearInterval(fadeInTimer);
        }, 20);

    var title = byID("splash-title");
    var titleTimer = null;
    var titleFadeCount = 0;

    var titleFader = function()
    {
        ++titleFadeCount;
        title.style.opacity = titleFadeCount / FADE_STEPS;

        if (titleFadeCount == FADE_STEPS)
            clearInterval(titleTimer);
    };

    // We're not replacing the title with a button in this version:
    //titleTimer = setInterval(titleFader, TIMING / FADE_STEPS / 2);

    var animate = function(drawing)
    {
        drawing.block.execute(drawing.context);
        drawing.block.execute(drawing.context);
        drawing.context.canvas.style.opacity =
            (drawing.opacity += drawing.opacityIncrement);
        if (drawing.context.animationContexts.length == 0)
            clearInterval(drawing.timer);
    };

    var kickoff = function(drawing)
    {
        initDrawing(byID(drawing.key), drawing.instructions);
        drawing.context = new Context();
        drawing.context.style = new Line(1);
        drawing.context.canvas = byID(drawing.key);
        drawing.context.animating = true;
        drawing.context.animationLevel = 0;
        drawing.context.animationContexts = [];

        drawing.block = new Block();
        for (var i = 0; i < drawing.instructions.length; ++i)
            drawing.block.instructions.push(createWrapper(drawing.instructions[i]));
        reifyBlock(drawing.block);

        drawing.timer = setInterval(animate, drawing.interval * TIMING, drawing);
    };

    for (var d = 0; d < drawings.length; ++d)
        if (drawings[d].start == 0)
            kickoff(drawings[d]);
        else
            setTimeout(kickoff, drawings[d].start * TIMING, drawings[d]);

    var splash = byID("splash");
    splash.onclick = function(ev)
    {
        splash.style.display = "none";
    };
}


/*******************************************************************************
 * Initialization
 */

function setupProgram(programID, drawingUI, style)
{
    var program = new Wrapper();
    program.delegate = new Block();

    let blockUI = new BlockUI(program.delegate, byID("program" + programID));
    let programUI = new ProgramUI(programID, program, drawingUI, style);

    blockUI.setEditingObserver
        (new DrawingChangeMultiplexer([ programUI ])); //TODO challengeUI
    blockUI.addInstruction(new Wrapper());

    drawingUI.addProgramUI(programUI);
}

function init()
{
    let drawingUI = new DrawingUI();
    new ProgramUI(1, drawingUI, new Line(2, "#0a0"));
    new ProgramUI(2, drawingUI, new Line(2, "#c00"));
    let challengeUI = new ChallengeUI(drawingUI, null, null, null);

    for (let programUI of drawingUI.getProgramUIs()) {
        programUI.blockUI.setEditingObserver
            (new DrawingChangeMultiplexer([ programUI, challengeUI ]));
    }

    drawingUI.resizeCanvasAndProgramArea();

    if (window.location.protocol == "file:") {
      byID("splash").style.display = "none";

      let query = window.location.search;
      if (query) {
        challengeUI.jumpToChallenge
          (window.location.search.replace("?challenge=", ""));
      } else {
        challengeUI.jumpToChallenge("weave");
      }
    } else {
      let challengeKey = requestParams().challenge;
      if (challengeKey) {
        byID("splash").style.display = "none";
        challengeUI.jumpToChallenge(challengeKey);
      } else {
        new SplashUI();
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
}