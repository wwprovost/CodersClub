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
 * Persistence class
 */

function Persistence(wrapper, blockUI, programUI)
{
    var levelLabel = byID("levelDropdown");

    this.serializeDrawing = function(overrideLevel)
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

        var stringified = JSON.stringify(wrapper.delegate);

        var copy = eval("(" + stringified + ")");
        stripObservers(copy);

        var level = typeof(overrideLevel) == "undefined"
            ? languageLevel : overrideLevel;

        return "{ 'level': '" + languageLevels[level].name +
            "', 'drawing': " + JSON.stringify(copy) + "}";
    };

    this.deserializeDrawing = function(stringified)
    {
        return eval("(" + stringified + ")");
    };

    this.loadDrawing = function(source)
    {
        var drawing = null;

        if (source.hasOwnProperty("level"))
        {
            var level = -1;
            for (var lvl = 0; lvl < languageLevels.length; ++lvl)
                if (languageLevels[lvl].name == source.level)
                    languageLevel = level = lvl;

            if (level == -1)
            {
                alert("Unknown language level: " + source.level);
                return;
            }

            drawing = source.drawing;
        }
        //TODO until we can re-save existing samples
        else
        {
            languageLevel = 8;
            drawing = source;
        }

        levelLabel.innerHTML =
            "Language level " + languageLevels[languageLevel].level;

        // clear adds one empty instruction, and we insert all but
        // that last empty instruction from the saved program:
        blockUI.clearInstructions();
        for (var i = 0; i < drawing.instructions.length - 1; ++i)
            blockUI.addInstruction(createWrapper(drawing.instructions[i]), i);

        programUI.reset();
    };
}

/*******************************************************************************
 * StorageUI class
 */

function StorageUI(wrapper, blockUI, persistence, programUI)
{
    var clearButton = byID("storage.clear");
    var saveButton = byID("storage.save");
    var loadButton = byID("storage.load");
    var filename = byID("storage.filename");
    var levelDropdown = byID("levelDropdown");
    var levelSelector = byID("levelSelector");
    var help = byID("help");

    var storage = new Storage();

    var storedLocally = null;
    var dirty = false;

    var dirtyDialogUI = new OKCancelDialogUI
    (
        "Unsaved changes",
        "You've made changes to your drawing since the last time you saved it, and the operation you just selected will not save your work. Are you sure you want to proceed without saving?"
    );

    var downgradeDirtyDialogUI = new OKCancelDialogUI
    (
        "Can't reduce level",
        "You can't reduce the language level of an existing drawing; it may include instructions that wouldn't make sense at the lower level. Your drawing has unsaved changes. Do you want to proceed by clearing your current drawing and starting over?"
    );

    var downgradeDialogUI = new OKCancelDialogUI
    (
        "Can't reduce level",
        "You can't reduce the language level of an existing drawing; it may include instructions that wouldn't make sense at the lower level. Do you want to proceed by clearing your current drawing and starting over?"
    );

    function SaveDialogUI()
    {
        var dialog = $("#saveDialog");

        var localRadio = byID("save.local");
        var remoteRadio = byID("save.remote");
        var saveFilename = byID("save.filename");
        var errorOutput = byID("save.error");
        var saveButton = byID("save.save");

        var init = function()
        {
            localRadio.disabled =
                (typeof (Storage) === undefined) ? "disabled" : "";
            localRadio.checked =
                (typeof (Storage) === undefined) ? "" : "checked";

            saveButton.disabled = "disabled";
        };
        init();

        this.show = function()
        {
            dialog.modal("show");
        };

        var validateLocal = function()
        {
            return localStorage.getItem(saveFilename.value) !== null
                ? "A drawing of that name already exists." : null;
        };

        var validateRemote = function()
        {
            return null; //TODO maybe check for bad characters?
        };

        saveFilename.onkeyup = function(ev)
        {
            var message = localRadio.checked ? validateLocal() : validateRemote();
            if (message !== null)
            {
                errorOutput.innerHTML = message;
                errorOutput.style.visibility = "visible";
                saveButton.disabled = "disabled";
            }
            else
            {
                errorOutput.style.visibility = "hidden";
                saveButton.disabled = "";
            }
        };

        var saveLocal = function(name)
        {
            var stringified = persistence.serializeDrawing();
            localStorage.setItem(name, stringified);

            storedLocally = true;
        };

        var saveRemote = function(name)
        {
            var stringified = persistence.serializeDrawing();
            storage.save(name, stringified);
        };

        var _save = function(name, local)
        {
            if (local)
                saveLocal(name);
            else
                saveRemote(name);

            filename.innerHTML = name;
            setDirty(false);
        };
        this.save = _save;

        saveButton.onclick = function(ev)
        {
            alert(localRadio.checked);
            alert(remoteRadio.checked);
            //_save(saveFilename.value, localRadio.checked);
        };
    }
    var saveDialogUI = new SaveDialogUI();

    function LoadDialogUI()
    {
        var dialog = $("#loadDialog");

        var localRadio = byID("load.local");
        var remoteRadio = byID("load.remote");
        var filenames = byID("load.filename");
        var loadButton = byID("load.load");
        var removeButton = byID("load.remove");

        var showLocalFilenames = function()
        {
            for (var filename in localStorage)
            {
                var option = document.createElement("option");
                option.innerHTML = filename;
                filenames.appendChild(option);
            }
        };

        var showRemoteFilenames = function()
        {
            var remoteNames = storage.getNames();
            for (var i = 0; i < remoteNames.length; ++i)
            {
                var option = document.createElement("option");
                option.innerHTML = remoteNames[i];
                filenames.appendChild(option);
            }
        };

        var showFilenames =  function()
        {
            filenames.innerHTML = "";

            if (localRadio.checked)
                showLocalFilenames();
            else if (remoteRadio.checked)
                showRemoteFilenames();
        };

        localRadio.onchange = remoteRadio.onchange =
            function(ev)
            {
                showFilenames();
            };

        var init = function()
        {
            localRadio.disabled =
                (typeof (Storage) === undefined) ? "disabled" : "";
            localRadio.checked =
                (typeof (Storage) === undefined) ? "" : "checked";

            loadButton.disabled = "disabled";
        };
        init();

        this.show = function()
        {
            showFilenames();
            dialog.modal("show");
        };

        filenames.onchange = function(ev)
        {
            loadButton.disabled = removeButton.disabled =
                (filenames.value !== null && filenames.value.length != 0)
                    ? "" : "disabled";
        };

        var loadLocal = function()
        {
            var stringified = localStorage.getItem(filenames.value);
            if (stringified === null || stringified.length == 0)
            {
                alert("Nothing stored with that name.");
                return false;
            }

            persistence.loadDrawing(persistence.deserializeDrawing(stringified));
            filename.innerHTML = filenames.value;
            return true;
        };

        var loadRemote = function(handler)
        {
            var stringified = storage.load(filenames.value, function(data)
              {
                if (data === null || data.length == 0)
                {
                  alert("Nothing stored with that name.");
                  handler(false);
                }
                else
                {
                  persistence.loadDrawing(persistence.deserializeDrawing(stringified));
                  filename.innerHTML = filenames.value;
                  handler(true);
                }
              });
        };

        loadButton.onclick = function(ev)
        {
            if (localRadio.checked)
            {
              if (loadLocal())
              {
                storedLocally = true;
                setDirty(false);
              }
            }
            else if (remoteRadio.checked)
            {
              loaded = loadRemote(function(loaded)
                {
                  storedLocally = false;
                  setDirty(false);
                });
            }
        };

        var removeLocal = function()
        {
            localStorage.removeItem(filenames.value);
        };

        var removeRemote = function()
        {
            alert("Remote storage not yet implemented.");
        };

        removeButton.onclick = function(ev)
        {
            var confirmUI = new OKCancelDialogUI("Remove drawing",
                "Remove the drawing \"" + filenames.value + "\" from storage?");
            confirmUI.show(function()
                {
                    if (localRadio.checked)
                        removeLocal();
                    else if (remoteRadio.checked)
                        removeRemote();

                    showFilenames();
                });
        };
    }
    var loadDialogUI = new LoadDialogUI();

    var clearProgram = function()
    {
        blockUI.clearInstructions();

        filename.innerHTML = "";
        storedLocally = null;

        setDirty(false);
        programUI.reset();
    };
    this.clearProgram = clearProgram;

    clearButton.onclick = function(ev)
    {
        if (dirty)
            dirtyDialogUI.show(function() { clearProgram(); });
        else
            clearProgram();
    };

    saveButton.onclick = function(ev)
    {
        if (filename.innerHTML !== "")
            saveDialogUI.save(filename.innerHTML, storedLocally);
        else
            saveDialogUI.show();
    };

    this.enableStorage = function(enable)
    {
        saveButton.disabled = !enable;
        loadButton.disabled = !enable;
    };

    loadButton.onclick = function(ev)
    {
        if (dirty)
            dirtyDialogUI.show(function() { loadDialogUI.show(); });
        else
            loadDialogUI.show();
    };

    var setDirty = function(newValue)
    {
        dirty = newValue;
        saveButton.style.borderWidth =
            (dirty && !saveButton.disabled) ? "2px" : "1px";
    };

    this.onAnyChange = function()
    {
        setDirty(true);
    };

    this.isDirty = function()
    {
        return dirty;
    };

    var changeLevel = function(level)
    {
        persistence.loadDrawing(persistence.deserializeDrawing
            (persistence.serializeDrawing(level)));
        levelDropdown.innerHTML = "Language level " + (languageLevel + 1);

        byID("tutorial").innerHTML = languageLevels[languageLevel].tutorialName;
    };

    var downgrade = function(level)
    {
        clearProgram();
        changeLevel(level);
    };

    this.setLanguageLevel = function(level)
    {
        if (level == languageLevel)
            return;

        if (level < languageLevel && wrapper.delegate.instructions.length > 1)
        {
            if (dirty)
                downgradeDirtyDialogUI.show(function() { downgrade(level); });
            else
                downgradeDialogUI.show(function() { downgrade(level); });
        }
        else
            changeLevel(level);
    };

    this.enableLanguageLevel = function(enable)
    {
        levelDropdown.disabled = !enable;
    };

    for (var lvl = 0; lvl < languageLevels.length; ++lvl)
    {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.innerHTML = "Level " + languageLevels[lvl].level;
        a.href = "javascript:levelUI.setLanguageLevel(" + lvl + ");";
        li.appendChild(a);
        levelSelector.appendChild(li);
    }

    help.onclick = function(ev)
    {
        var page = "Level" + (languageLevel + 1) + ".html";
        window.open(page);
    };
}


/*******************************************************************************
 * ProgramUI class
 */

function ProgramUI(wrapper, blockUI)
{
    var RUN_CAPTION = "Run program";
    var RUN_TOOLTIP = "Run your program";
    var CANCEL_CAPTION = "Cancel";
    var CANCEL_TOOLTIP = "Stop the animation or step-by-step drawing";

    var canvas = byID("canvas");
    var indicators = new Indicators
        (byID("bearing"), byID("weight"), byID("color"));

    var glass = byID("glass");
    var glassContext = glass.getContext("2d");
    glassContext.strokeStyle = "#0040c0";
    glassContext.lineWidth = 2;

    var runButton = byID("runButton");
    var auto = byID("auto");
    var animate = byID("animate");
    var delay = byID("interval");
    var stepByStep = byID("stepByStep");
    var stepButton = byID("stepButton");
    var showButton = byID("showButton");

    var programArea = byID("programArea");

    var model = wrapper.delegate;
    var timer = null;

    var twoDContext = canvas.getContext("2d");
    var scale = 1;
    var xTranslate = 0;
    var yTranslate = 0;

    var challenge = null;

    indicators.reset();

    var context = null;

    var setBounds = function(program)
    {
        var drawing = new Drawing();
        context = getDefaultContext(drawing);
        program.execute(context);

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
        model.execute(context);
        drawShuttle();

        if (context.animationContexts.length == 0)
            stopDrawing();
    };

    var startDrawing = function(skipAnimation)
    {
        stopDrawing();
        clearShuttle();

        var clearContext = canvas.getContext("2d");
        //TODO safe to remove? clearContext.fillStyle = "#ffffff";
        if (challenge)
            clearContext.clearRect(-xTranslate, -yTranslate,
                canvas.width / scale, canvas.height / scale);
        else
            clearContext.clearRect
                (0, 0, canvas.width, canvas.height);

        if (model.instructions.length == 0)
            return;

        if (!challenge)
            setBounds(model);

        context = getDefaultContext(new Drawing());
        context.indicators = indicators;

        if (challenge)
        {
            var challengeContext = getDefaultContext(context.drawing);
            challenge.execute(challengeContext);
        }

        if(animate.checked && !(skipAnimation == true))
        {
            if (challenge)
                context.drawing.draw(canvas);

            adjustDelay();

            context.canvas = canvas;

            context.animating = true;
            context.animationLevel = 0;
            context.animationContexts = [];
            context.observer = new Observer();

            indicators.update(Math.PI / 2, 1, "#000000");
            drawShuttle();

            if (stepByStep.checked)
                INTERVAL = 1500;
            else
                timer = setInterval(animator, INTERVAL);

            runButton.innerHTML = CANCEL_CAPTION;
            runButton.title = CANCEL_TOOLTIP;
        }
        else
        {
            model.execute(context);
            context.drawing.draw(canvas);
            context.updateIndicators();
            if (auto.checked)
                drawShuttle();

            if (!challenge)
                resetBounds();
        }
    };

    var stopDrawing = function()
    {
        if (timer !== null)
        {
            clearInterval(timer);
            timer = null;
        }

        if (!challenge)
            resetBounds();

        runButton.innerHTML = RUN_CAPTION;
        runButton.title = RUN_TOOLTIP;
    };

    runButton.onclick = function(ev)
    {
        if (runButton.innerHTML == RUN_CAPTION)
            startDrawing();
        else
            stopDrawing();
    };

    var updateAnimationControls = function()
    {
        //TODO introduce step-by-step at a higher level
        //stepByStep.disabled = animate.checked ? "" : "disabled";
        stepByStep.style.visibility = "hidden";
        stepButton.style.visibility =
            (animate.checked && stepByStep.checked) ? "visible" : "hidden";
    };
    updateAnimationControls();

    auto.onchange = function(ev)
    {
        startDrawing(true);
    }

    animate.onchange = stepByStep.onchange = function(ev)
    {
        updateAnimationControls();
    };

    var adjustDelay = function()
    {
        var value = parseFloat(delay.value);
        INTERVAL = 400000 / value / value / value
                          / value / value / value / value;
    };

    delay.onchange = function(ev)
    {
        adjustDelay();
        if (timer !== null)
        {
            clearInterval(timer);
            timer = setInterval(animator, INTERVAL);
        }
    };

    stepButton.onclick = function(ev)
    {
        animator();
    };

    this.onInstructionChanged = this.onInstructionRemoved = function()
    {
        stopDrawing();

        if (auto.checked)
            startDrawing(true);
    };

    this.onInstructionAdded = function(newInstructionUI)
    {
        scrollIntoView(newInstructionUI.view);
    };

    this.reset = function()
    {
        startDrawing();
    }

    this.takeChallenge = function(newChallenge)
    {
        challenge = newChallenge;
        setBounds(challenge);
        startDrawing(true);
    };

    this.quitChallenge = function()
    {
        challenge = null;
        startDrawing(true);
    };

    showButton.onclick = function(ev)
    {
        function ShowCodeDialogUI()
        {
            var dialog = $("#showCodeDialog");

            this.show = function(code)
            {
                byID("showCode.code").innerHTML = code;

                dialog.modal("show");
            };
        }

        new ShowCodeDialogUI().show(model.toJavaScript(0));
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

function GalleryUI(persistence, storageUI)
{
    var galleryButton = byID("gallery");
    var filename = byID("storage.filename");

    function GalleryDialogUI()
    {
        var dialog = $("#galleryDialog");

        var level = byID("gallery.level");
        var name = byID("gallery.name");
        var select = byID("gallery.select");

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
            byID("gallery.cancel").disabled = "";

            byID("gallery.message").innerHTML = storageUI.isDirty()
                ? "Note that viewing a gallery drawing will clear your current drawing."
                : "";
            dialog.modal("show");
        };

        level.onchange = function(ev)
        {
            name.innerHTML = "";
            var keys = gallery.atLevel(level.value);
            for (var k = 0; k < keys.length; ++k)
            {
                var option = document.createElement("option");
                option.innerHTML = gallery.byKey(keys[k]).name;
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
            var galleryDrawing = gallery.byKey(name.value);
            persistence.loadDrawing(galleryDrawing.work);
            filename.innerHTML = galleryDrawing.name;
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

function ChallengeUI(programUI, program, storageUI, persistence)
{
    var TAKE_CAPTION = "Take challenge";
    var TAKE_TOOLTIP = "Try to match an existing drawing exactly by creating the right program";
    var QUIT_CAPTION = "Quit challenge";
    var QUIT_TOOLTIP = "Turn off the challenge mode and go back to normal drawing";

    var basePageID = "Sprout:";
    var autoSaver = null;

    var challengeToggle = byID("challenge.toggle");
    var challengeNotes = byID("challenge.notes");
    var challengeBalloon = null;

    var challengeMode = false;
    var challengeLimit;
    var tooManyBalloon;

    var loadChallenge = function(challengeName)
    {
        var challenge = challenges.byKey(challengeName);

        storageUI.clearProgram();
        storageUI.enableStorage(false);
        levelUI.setLanguageLevel(challenge.level);
        levelUI.enableLanguageLevel(false);

        programUI.takeChallenge(challenge.program);

        challengeMode = true;
        challengeLimit = challenge.limit;

        challengeToggle.innerHTML = QUIT_CAPTION;
        challengeToggle.title = QUIT_TOOLTIP;

        challengeBalloon =
            byID("challengeLevel" + (challenge.level + 1) + "." + challengeName);
        if (challengeBalloon)
        {
            challengeBalloon.getElementsByTagName("span")[0].onclick =
                function(ev)
                {
                    challengeNotes.style.display = "inline";
                    challengeBalloon.style.display = "none";
                }

            var paneRect = challengeBalloon.parentNode.getBoundingClientRect();
            challengeBalloon.style.left = "12px";
            challengeBalloon.style.width =
                "" + (paneRect.right - paneRect.left - 24) + "px";
            challengeBalloon.style.bottom = "12px";
            challengeBalloon.style.top = "auto";

            challengeBalloon.style.display = "block";
        }

        tooManyBalloon = byID("challenge.tooManyInstructions");

        var paneRect = tooManyBalloon.parentNode.getBoundingClientRect();
        tooManyBalloon.style.left = "12px";
        tooManyBalloon.style.width =
            "" + (paneRect.right - paneRect.left - 24) + "px";
        tooManyBalloon.style.top = "20px";
        tooManyBalloon.style.bottom = "auto";

        tooManyBalloon.style.display = "none";

        autoSaver = new AutoSaver
        (
          function(data)
            {
              persistence.loadDrawing(persistence.deserializeDrawing(data));
            },
          function()
            {
              return persistence.serializeDrawing();
            },
          [],
          basePageID + challengeName
        );
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

            byID("loadChallenge.message").innerHTML = storageUI.isDirty()
                ? "Note that entering challenge mode will clear your current drawing."
                : "";
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
        autoSaver.save();
        autoSaver.stop();

        programUI.quitChallenge();
        storageUI.enableStorage(true);
        levelUI.enableLanguageLevel(true);

        challengeMode = false;
        challengeToggle.innerHTML = TAKE_CAPTION;
        challengeToggle.title = TAKE_TOOLTIP;
        challengeNotes.style.display = "none";

        if (challengeBalloon)
          challengeBalloon.style.display = "none";

        checkInstructionCount();
    };

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

    function checkInstructionCount()
    {
      var shutDown = challengeMode && challengeLimit &&
        countUpInstructions(program) > challengeLimit;

      if (tooManyBalloon)
        tooManyBalloon.style.display = shutDown ? "block" : "none";

      var allSelects = $("#program select.instruction");
      for (var i = 0; i < allSelects.length; ++i)
        if (allSelects[i].value.length == 0)
          allSelects[i].disabled = shutDown ? "disabled" : "";
    }

    this.onAnyChange = function()
    {
      if (autoSaver)
      {
        autoSaver.makeDirty();
      }

      checkInstructionCount();
    };

    challengeToggle.onclick = function(ev)
    {
        if (challengeMode)
            quitChallenge();
        else
            loadChallengeDialogUI.show();
    };

    challengeNotes.onclick = function(ev)
    {
        challengeNotes.style.display = "none";
        challengeBalloon.style.display = "block";
    };
}


/*******************************************************************************
 * TutorialUI class
 */

function TutorialUI(storageUI)
{
    var TAKE_CAPTION = "Show me how Sprout works";
    var TAKE_TOOLTIP = "Take a tutorial to learn the basics of using Sprout";
    var QUIT_CAPTION = "Stop the tutorial";
    var QUIT_TOOLTIP = "Stop the tutorial and let me use Sprout normally";

    var LEFT_ARROW = byID("tutorialLeftArrow");
    var RIGHT_ARROW = byID("tutorialRightArrow");
    var UP_ARROW = byID("tutorialUpArrow");
    var DOWN_ARROW = byID("tutorialDownArrow");

    var allStages =
        [
          // Level 1 tutorial:
          [
            { UI: byID("tutorial1Step1"), fromSide: "left",
                trigger: "auto", event: "onchange" },
            { UI: byID("tutorial1Step2"), modal: true },
            { UI: byID("tutorial1Step3"), fromSide: "right", triggerInstruction: 0,
                triggerName: "select", triggerIndex: 0, event: "onchange",
                expectedValue: "move1" },
            { UI: byID("tutorial1Step4"), fromSide: "right", triggerInstruction: 1,
                triggerName: "select", triggerIndex: 0, event: "onchange",
                expectedValue: "turnRight" },
            { UI: byID("tutorial1Step5"), fromSide: "right", triggerInstruction: 2,
                triggerName: "select", triggerIndex: 0, event: "onchange",
                expectedValue: "move1" },
            { UI: byID("tutorial1Step6"), fromSide: "right", triggerInstruction: 3,
                triggerName: "select", triggerIndex: 0, event: "onchange",
                expectedValue: "move1" },
            { UI: byID("tutorial1Step7"), modal: true },
            { UI: byID("tutorial1Step8"), fromSide: "top", triggerInstruction: 0,
                triggerName: "p", triggerIndex: 0, event: "onclick" },
            { UI: byID("tutorial1Step9"), fromSide: "right",  triggerInstruction: 0,
                triggerName: "select", triggerIndex: 0, event: "onchange",
                expectedValue: "turnLeft" },
            { UI: byID("tutorial1Step10"), modal: true },
            { UI: byID("tutorial1Step11"), fromSide: "left",
                trigger: "animate", event: "onchange" },
            { UI: byID("tutorial1Step12"), fromSide: "left",
                trigger: "interval", event: "onchange", expectedValue: 2 },
            { UI: byID("tutorial1Step13"), fromSide: "bottom",
                trigger: "runButton", event: "onclick" },
            { UI: byID("tutorial1Step14"), modal: true, position: "bottom" },
            { UI: byID("tutorial1Step15"), fromSide: "left",
                trigger: "interval", event: "onchange" },
            { UI: byID("tutorial1Step16"), fromSide: "bottom",
                trigger: "runButton", event: "onclick" },
            { UI: byID("tutorial1Step17"), modal: true, position: "bottom" },
            { UI: byID("tutorial1Step18"), fromSide: "bottom", triggerInstruction: 2,
                triggerName: "span", triggerIndex: 2, event: "onclick" },
            { UI: byID("tutorial1Step19"), modal: true, position: "bottom" }
          ],
          // Level 2 tutorial:
          [
           { UI: byID("tutorial2Step1"), fromSide: "left",
               trigger: "auto", event: "onchange" },
           { UI: byID("tutorial2Step2"), fromSide: "right", triggerInstruction: 0,
               triggerName: "select", triggerIndex: 0, event: "onchange",
               expectedValue: "loop" },
           { UI: byID("tutorial2Step3"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 0, triggerName: "select", triggerIndex: 0,
               event: "onchange", expectedValue: "move1" },
           { UI: byID("tutorial2Step4"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 1, triggerName: "select", triggerIndex: 0,
               event: "onchange", expectedValue: "move1" },
           { UI: byID("tutorial2Step5"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 2, triggerName: "select", triggerIndex: 0,
               event: "onchange", expectedValue: "turn8" },
           { UI: byID("tutorial2Step6"), fromSide: "bottom", triggerInstruction: 0,
               triggerSubInstruction: 2, triggerName: "select", triggerIndex: 1,
               event: "onchange", expectedValue: "1" },
           { UI: byID("tutorial2Step7"), fromSide: "right", triggerInstruction: 0,
               triggerName: "input", triggerIndex: 0, event: "onkeyup",
               expectedValue: "2" },
           { UI: byID("tutorial2Step8"), fromSide: "right", triggerInstruction: 0,
               triggerName: "input", triggerIndex: 0, event: "onkeyup",
               expectedValue: "4" },
           { UI: byID("tutorial2Step9"), fromSide: "top", triggerInstruction: 0,
               triggerSubInstruction: 1, triggerName: "p", triggerIndex: 0,
               event: "onclick" },
           { UI: byID("tutorial2Step10"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 1, triggerName: "select", triggerIndex: 0,
               event: "onchange", expectedValue: "turn8" },
           { UI: byID("tutorial2Step11"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 1, triggerName: "select", triggerIndex: 1,
               event: "onchange", expectedValue: "-1" },
           { UI: byID("tutorial2Step12"), modal: true },
           { UI: byID("tutorial2Step12.5"), fromSide: "right", triggerInstruction: 0,
               triggerName: "input", triggerIndex: 0, event: "onkeyup",
               expectedValue: "20" },
           { UI: byID("tutorial2Step13"), fromSide: "right", triggerInstruction: 0,
               triggerName: "input", triggerIndex: 0, event: "onkeyup",
               expectedValue: "4" },
           { UI: byID("tutorial2Step14"), fromSide: "right", triggerInstruction: 0,
               triggerSubInstruction: 1, triggerName: "select", triggerIndex: 0,
               event: "onchange", expectedValue: "skip1" },
           { UI: byID("tutorial2Step14.5"), modal: true },
           { UI: byID("tutorial2Step15"), fromSide: "bottom", triggerInstruction: 0,
               triggerSubInstruction: 0, triggerName: "p", triggerIndex: 1,
               dropDetectInstruction: 0 },
           { UI: byID("tutorial2Step16"), fromSide: "bottom", triggerInstruction: 1,
               triggerSubInstruction: 0, triggerName: "p", triggerIndex: 1,
               dropDetectInstruction: 0 },
           { UI: byID("tutorial2Step17"), fromSide: "left",
               trigger: "showButton", event: "onclick" },
           { UI: byID("tutorial2Step18"), modal: true, position: "bottom" },
           { UI: byID("tutorial2Step19"), modal: true, position: "bottom" }
          ]
          // etc.
        ];

    var stages = null;
    var stage = -1;
    var storedTrigger = null;

    var program = byID("program");
    var tutorialButton = byID("tutorial");

    var _this = this;

    var getTrigger = function(stage)
    {
        if (stages[stage].modal)
            return stages[stage].UI;

        if (typeof(stages[stage].trigger) != "undefined" &&
                byID(stages[stage].trigger) == null)
            alert("DIDN'T FIND " + stages[stage].trigger);

        if (typeof(stages[stage].trigger) != "undefined")
            return byID(stages[stage].trigger);

        var children = program.childNodes;
        var instructionCount = -1;
        var instruction = null;
        for (var c = 0; c < children.length; ++c)
            if (children[c].nodeType == 1 &&
                ++instructionCount == stages[stage].triggerInstruction)
            instruction = children[c];

        if ("triggerSubInstruction" in stages[stage])
        {
            var subCount = -1;
            var subs = instruction.getElementsByTagName("td")[1].childNodes;
            for (var s = 0; s < subs.length; ++s)
                if (subs[s].nodeType == 1 &&
                    ++subCount == stages[stage].triggerSubInstruction)
                instruction = subs[s];
        }

        return instruction.getElementsByTagName
            (stages[stage].triggerName)[stages[stage].triggerIndex];

        alert("Ran out of instructions looking for #" +
            stages[stage].triggerInstruction);
    };

    var getDropTarget = function(stage)
    {
        var children = program.childNodes;
        var instructionCount = -1;
        var instruction = null;
        for (var c = 0; c < children.length; ++c)
            if (children[c].nodeType == 1 &&
                ++instructionCount == stages[stage].dropDetectInstruction)
            return children[c];

        alert("Ran out of instructions looking for #" +
                stages[stage].dropDetectInstruction);
    };

    var hideCurrentStage = function()
    {
        if (stage >= 0)
        {
            stages[stage].UI.style.display = "none";
            if ("dropDetectInstruction" in stages[stage])
            {
                var dropTarget = getDropTarget(stage);
                var insertBar = dropTarget.getElementsByTagName("p")[0];
                var grabber = dropTarget.getElementsByTagName("p")[1];

                insertBar.ondrop = grabber.ondrop = storedTrigger;
            }
            else
                getTrigger(stage)[stages[stage].event] = storedTrigger;
        }

        LEFT_ARROW.style.display = RIGHT_ARROW.style.display =
            UP_ARROW.style.display = DOWN_ARROW.style.display = "none";
    };

    var quitTutorial = function()
    {
        stage = -1;

        tutorialButton.innerHTML = languageLevels[languageLevel].tutorialName;
        tutorialButton.title = TAKE_TOOLTIP;

        storageUI.enableLanguageLevel(true);
    };

    this.followTutorial = function()
    {
        hideCurrentStage();

        ++stage;

        if (stage < stages.length)
        {
            var ARROW_WIDTH = 24;
            var HALF_ARROW = 15;
            var ABOVE_TOP = 8;
            var MARGIN = 28;

            var trigger = getTrigger(stage);
            var UI = stages[stage].UI;

            if (!("addedCloser" in UI))
            {
                UI.innerHTML =
                    "<span class='right glyphicon glyphicon-remove tutorialCloser' ></span>"
                    + UI.innerHTML;

                UI.getElementsByTagName("span")[0].onclick =
                    function(ev)
                    {
                        hideCurrentStage();
                        quitTutorial();
                    }

                UI.addedCloser = true;
            }

            //TODO re-position and re-size
            var target = trigger;
            var fromSide = stages[stage].fromSide;

            var targetRect = target.getBoundingClientRect();
            var paneRect = UI.parentNode.getBoundingClientRect();
            var paneWidth = paneRect.right - paneRect.left;
            var left = targetRect.left - paneRect.left;
            var top = targetRect.top - paneRect.top;
            var right = targetRect.right - paneRect.left;
            var bottom = targetRect.bottom - paneRect.top;
            var halfwayAcross = (left + right - target.style.marginRight) / 2;
            var halfwayDown = (top + bottom - target.style.marginBottom) / 2;

            if (stages[stage].modal)
            {
                UI.style.left = "" + MARGIN + "px";
                UI.style.width = "" + (paneWidth - MARGIN * 2) + "px";
                if (stages[stage].position == "bottom")
                {
                    UI.style.bottom = "" + MARGIN + "px";
                    UI.style.top = "auto";
                }
                else
                    UI.style.top = "" +
                        (programArea.getBoundingClientRect().top + 12) + "px";
            }
            else if (fromSide == "left")
            {
                UI.style.left = "" + MARGIN + "px";
                UI.style.top = "" + (top - ABOVE_TOP) + "px";
                UI.style.width = "" + (left - MARGIN * 2) + "px";

                RIGHT_ARROW.style.left = "" + (left - MARGIN) + "px";
                RIGHT_ARROW.style.top = "" + (halfwayDown - HALF_ARROW) + "px";
                RIGHT_ARROW.style.display = "block";
            }
            else if (fromSide == "top")
            {
                UI.style.left = "" + MARGIN + "px";
                UI.style.width = "" + (paneWidth - MARGIN * 2) + "px";
                UI.style.bottom =
                    "" + (paneRect.bottom - paneRect.top - top + MARGIN - 2) + "px";
                UI.style.top = "auto";

                DOWN_ARROW.style.left = "" + (halfwayAcross - ARROW_WIDTH / 2) + "px";
                DOWN_ARROW.style.top = "" + (top - MARGIN) + "px";
                DOWN_ARROW.style.display = "block";
            }
            else if (fromSide == "right")
            {
                UI.style.left = "" + (right + MARGIN) + "px";
                UI.style.top = "" + (top - ABOVE_TOP) + "px";
                var rect = UI.getBoundingClientRect();

                LEFT_ARROW.style.left = "" + (right + MARGIN - ARROW_WIDTH) + "px";
                LEFT_ARROW.style.top = "" + (halfwayDown - HALF_ARROW) + "px";
                LEFT_ARROW.style.display = "block";
            }
            else
            {
                UI.style.left = "" + MARGIN + "px";
                UI.style.width = "" + (paneWidth - MARGIN * 2) + "px";
                UI.style.top = "" + (bottom + MARGIN) + "px";
                UI.style.bottom = "auto";

                UP_ARROW.style.left = "" + (halfwayAcross - ARROW_WIDTH / 2) + "px";
                UP_ARROW.style.top = "" + (bottom + MARGIN - 24) + "px";
                UP_ARROW.style.display = "block";
            }

            UI.style.display = "block";

            if ("dropDetectInstruction" in stages[stage])
            {
                var dropTarget = getDropTarget(stage);
                var insertBar = dropTarget.getElementsByTagName("p")[0];
                var grabber = dropTarget.getElementsByTagName("p")[1];

                storedTrigger = insertBar.ondrop;
                var detector = function(ev)
                {
                    if (typeof(storedTrigger) == "function")
                        storedTrigger(ev);

                    _this.followTutorial();
                }
                insertBar.ondrop = grabber.ondrop = detector;
            }
            else
            {
                var event = stages[stage].modal ? "onclick" : stages[stage].event;
                storedTrigger = trigger[event];
                trigger[event] = function(ev)
                {
                    if (typeof(storedTrigger) == "function")
                        storedTrigger(ev);

                    if (typeof(stages[stage].expectedValue) == "undefined" ||
                            trigger.value == stages[stage].expectedValue)
                        _this.followTutorial();
                };
            }
        }
        else
            quitTutorial();
    };

    function TutorialDialogUI()
    {
        var dialog = $("#tutorialDialog");

        var OK = byID("tutorial.OK");

        this.show = function()
        {
            stage = -1;
            byID("tutorial.title").innerHTML =
                languageLevels[languageLevel].tutorialTitle;
            byID("tutorial.intro").innerHTML =
                languageLevels[languageLevel].tutorialIntro;
            byID("tutorial.message").innerHTML = storageUI.isDirty()
                ? "Note that following the tutorial will clear your current drawing."
                : "";
            dialog.modal("show");
        };

        OK.onclick = function(ev)
        {
            storageUI.clearProgram();
            storageUI.enableLanguageLevel(false);

            byID("auto").checked = false;
            byID("animate").checked = false;
            byID("stepByStep").checked = false;
            byID("interval").value = 3.5;

            tutorialButton.innerHTML = QUIT_CAPTION;
            tutorialButton.title = QUIT_TOOLTIP;

            stages = allStages[languageLevel];
            _this.followTutorial();
        };
    }
    tutorialDialogUI = new TutorialDialogUI();

    var startTutorial = function()
    {
        if (tutorialButton.innerHTML == languageLevels[languageLevel].tutorialName)
        {
            tutorialDialogUI.show();
        }
        else
        {
            hideCurrentStage();
            quitTutorial();
        }
    };
    this.startTutorial = startTutorial;

    tutorialButton.onclick = function(ev) { startTutorial(); }
}


/*******************************************************************************
 * Splash
 */

function SplashUI(tutorialUI)
{
    var TIMING = 3000; //msec to draw everything
    var FADE_STEPS = 25;

    var starterDrawings = [ "web" ];
//      [
//        {
//          key: "web",
//          instructions: gallery.byKey("web").work.drawing.instructions,
//          steps: 110,
//          start: .100,
//          interval: .004,
//          opacity: 0,
//          opacityIncrement: .01
//        },
//      ];

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

    var showMe = byID("splash-show-me");
    var rect = showMe.getBoundingClientRect();
    byID("border1").style.width =
        byID("border2").style.width = "" + (rect.right - rect.left) + "px";

    for (var s = 0; s < starterDrawings.length; ++s)
        galleryDrawing(starterDrawings[s]);

    var main = byID("splash-main");
    var mainOpacity = 0;
    var fadeInTimer = setInterval(function()
        {
            main.style.opacity = (mainOpacity += .02);
            showMe.style.opacity = mainOpacity - 2;
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
    titleTimer = setInterval(titleFader, TIMING / FADE_STEPS / 2);

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

    showMe.onclick = function(ev)
    {
        splash.style.display = "none";
        tutorialUI.startTutorial();
    };
}


/*******************************************************************************
 * Initialization
 */

function init()
{
    var program = new Wrapper();
    program.delegate = new Block();

    var blockUI = new BlockUI(program.delegate, byID("program"));
    var programUI = new ProgramUI(program, blockUI);
    var persistence = new Persistence(program, blockUI, programUI);
    var storageUI = new StorageUI(program, blockUI, persistence, programUI);
    levelUI = storageUI;
    new GalleryUI(persistence, storageUI);
    var challengeUI = new ChallengeUI
      (programUI, program, storageUI, persistence);
    var tutorialUI = new TutorialUI(storageUI);

    blockUI.setEditingObserver
        (new DrawingChangeMultiplexer([ programUI, storageUI, challengeUI ]));
    blockUI.addInstruction(new Wrapper());

    let challengeName = requestParams().challenge;
    if (challengeName) {
      byID("splash").style.display = "none";
      challengeUI.jumpToChallenge(challengeName);
    } else {
      new SplashUI(tutorialUI);
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