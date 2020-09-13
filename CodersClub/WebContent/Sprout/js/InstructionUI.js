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
 */

var colorScheme =
{
    background: "#fffff4",
    highlight: "#ee0",
    blockHighlight: "#dd0",
    insertHighlight: "#ada",
    flashHighlight: "#fea",  //TODO still needed?
    removeActive: "#d00",
    removeInactive: "#ccc"
};


/*******************************************************************************
 * Global functions
 */

function byID(ID)
{
    return document.getElementById(ID);
}

function byTag(name)
{
    return document.getElementsByTagName(name);
}

function clone(source)
{
    var x = source.cloneNode();

    // IE <= 10 (at least) does a shallow copy, so we need to finish the job:
    if (x.childNodes.length == 0)
        for (var c = 0; c < source.childNodes.length; ++c)
            x.appendChild(clone(source.childNodes[c]));

    return x;
}

function createFromTemplate(ID)
{
    var x = clone(byID(ID));
    x.id = "";
    return x;
}

function notifyObserverOfEdit(observer)
{
    if (observer && observer.onInstructionChanged)
        observer.onInstructionChanged();
}

function DrawingChangeMultiplexer(targets)
{
    var onAnyChange = function()
    {
        for (var t = 0; t < targets.length; ++t)
        {
            if (targets[t] && targets[t].onAnyChange)
            {
                targets[t].onAnyChange();
            }
        }
    };

    this.onInstructionChanged = function()
    {
        for (var t = 0; t < targets.length; ++t)
            if (targets[t] && targets[t].onInstructionChanged)
                targets[t].onInstructionChanged();

        onAnyChange();
    };

    this.onInstructionAdded = function(instructionUI)
    {
        for (var t = 0; t < targets.length; ++t)
            if (targets[t] && targets[t].onInstructionAdded)
              targets[t].onInstructionAdded(instructionUI);

        onAnyChange();
    };

    this.onInstructionRemoved = function(instructionUI)
    {
        for (var t = 0; t < targets.length; ++t)
            if (targets[t] && targets[t].onInstructionRemoved)
              targets[t].onInstructionRemoved(instructionUI);

        onAnyChange();
    };
}

/*******************************************************************************
 * Wrapper class
 */

Wrapper.prototype = new Instruction();
Wrapper.prototype.constructor = Wrapper;
function Wrapper(name, delegate)
{
    this.name = name || "";
    this.delegate = delegate || null;

    this.execute = function(context)
    {
        if ("observer" in this && this.observer !== null && context.animating &&
            !context.busyAtThisLevel())
                this.observer.activeInstruction(context);

        if (this.delegate !== null)
            this.delegate.execute(context);

        if ("observer" in this && this.observer !== null && context.animating &&
            !context.busyAtThisLevel())
                this.observer.inactiveInstruction(context);
    };

    this.toEnglish = function(indent)
    {
        if (this.delegate !== null)
            return this.delegate.toString(indent);
        else
            return indent + "(No-op.)";
    };

    this.toJavaScript = function(indent)
    {
        if (this.delegate !== null)
            return this.delegate.toJavaScript(indent);
        else
            return "";
    };
}


/*******************************************************************************
 * xxxUI classes and xxxFactory methods
 */

function createWrapper(state)
{
    var clone = new Wrapper();
    clone.name = state.name;
    clone.delegate = state.delegate;

    return clone;
}

function createInstruction(wrapper)
{
    var factoryMethod = eval(wrapper.name + "Factory");
    return factoryMethod(wrapper.delegate);
}

/* -------------------------------------------------------- */

function move1Factory(state)
{
    return new Move(25);
};

function move1UI()
{
    this.connect = function(model, view, observer) {};
    this.disconnect = function() {};
}

function moveFactory(state)
{
    var result = new Move(1);

    if (state !== null)
        result.distance = state.distance;

    return result;
};

function moveUI()
{
    var distanceView = null;

    this.connect = function(model, view, observer, parent)
    {
        distanceView = view.getElementsByTagName("input")[0];
        distanceView.value = model.distance;
        distanceView.onkeyup = distanceView.onchange = function(ev)
        {
            model.distance = parseInt(distanceView.value);
            notifyObserverOfEdit(observer);
        };
    };

    this.disconnect = function()
    {
        distanceView.onkeyup = distanceView.onchange = null;
    };
}

/* -------------------------------------------------------- */

function skip1Factory(state)
{
    return new Skip(25);
};

function skip1UI()
{
    this.connect = function(model, view, observer) {};
    this.disconnect = function() {};
}

function skipFactory(state)
{
    var result = new Skip(1);

    if (state !== null)
        result.distance = state.distance;

    return result;
};

function skipUI()
{
    var distanceView = null;

    this.connect = function(model, view, observer)
    {
        distanceView = view.getElementsByTagName("input")[0];
        distanceView.value = model.distance;
        distanceView.onkeyup = distanceView.onchange = function(ev)
        {
            model.distance = parseInt(distanceView.value);
            notifyObserverOfEdit(observer);
        };
    };

    this.disconnect = function()
    {
        distanceViewonkeyup = distanceView.onchange = null;
    };
}

/* -------------------------------------------------------- */

function turnLeftFactory(state)
{
    return new Turn(-90);
}

function turnLeftUI()
{
    this.connect = function(model, view, observer) {};
    this.disconnect = function() {};
}

function turnRightFactory(state)
{
    return new Turn(90);
}

function turnRightUI()
{
    this.connect = function(model, view, observer) {};
    this.disconnect = function() {};
}

function turnFactory(state)
{
    var result = new Turn(0);

    if (state !== null)
        result.degrees = state.degrees;

    return result;
};
function turn8Factory(state) { return turnFactory(state); }
function turn16Factory(state) { return turnFactory(state); }
function turn36Factory(state) { return turnFactory(state); }

function turnWithOneSelectorUI() {}

turnWithOneSelectorUI.prototype.connect = function(model, view, observer)
{
    var degreesView = view.getElementsByTagName("select")[0];
    degreesView.value = "" + model.degrees;
    degreesView.onchange = function(ev)
    {
        model.degrees = parseInt(degreesView.value);
        notifyObserverOfEdit(observer);
    };

    this.degreesView = degreesView;
};

turnWithOneSelectorUI.prototype.disconnect = function()
{
    this.degreesView.onchange = null;
};



function turnWithTwoSelectorsUI() {}

turnWithTwoSelectorsUI.prototype.readDegrees = function(model, observer)
{
    var temp = null;

    if (this.directionView.value == "0")
        temp = 0;
    else if (this.directionView.value == "180")
        temp = 180;
    else
        temp = parseFloat(this.degreesView.value) *
               parseInt(this.directionView.value);

    if (!isNaN(temp))
    {
        model.degrees = temp;
        notifyObserverOfEdit(observer);
    }
};

turnWithTwoSelectorsUI.prototype.setDegreesOptions = function(model)
{
    var direction = parseInt(this.directionView.value);
    this.degreesView.style.display =
        (direction == 0 || direction == 180) ? "none" : "inline";
    this.arrow.style.display = this.reminder.style.display =
        (this.directionView.value == "0") ? "inline" : "none";

    var firstChoice = this.directionView.getElementsByTagName("option")[0];
    if (this.directionView.value != "0" && firstChoice.innerHTML == "(Choose)")
        this.directionView.removeChild(firstChoice);

    this.degreesView.value = "" + Math.abs(model.degrees);
}

turnWithTwoSelectorsUI.prototype.connect = function(model, view, observer)
{
    this.directionView = view.getElementsByTagName("select")[0];
    this.degreesView = view.getElementsByTagName("select")[1];
    this.arrow = view.getElementsByTagName("span")[0];
    this.reminder = view.getElementsByTagName("span")[1];

    if (model.degrees == 180)
        this.directionView.value = "180";
    else if (model.degrees == 0)
        this.directionView.value = "0";
    else if (model.degrees > 0)
        this.directionView.value = "1";
    else
        this.directionView.value = "-1";

    this.setDegreesOptions(model);

    var _this = this;
    this.directionView.onchange = function(ev)
    {
        _this.readDegrees(model, observer);
        // so we preserve reasonable settings if possible
        _this.setDegreesOptions(model);
        _this.readDegrees(model, observer);
    };
    this.degreesView.onchange = function(ev)
    {
        _this.readDegrees(model, observer);
    };
};

turnWithTwoSelectorsUI.prototype.disconnect = function()
{
    this.directionView.onchange = this.degreesView.onchange = null;
};

function turn8UI() {}
turn8UI.prototype = new turnWithTwoSelectorsUI();



function turnWithThreeSelectorsUI() {}

turnWithThreeSelectorsUI.prototype.readDegrees = function(model, observer)
{
    var temp = null;

    if (this.directionView.value == "0")
        temp = 0;
    else if (this.directionView.value == "180")
        temp = 180;
    else
        temp = parseFloat(this.degreesView.value) *
               parseInt(this.directionView.value);

    if (!isNaN(temp))
    {
        model.degrees = temp;
        notifyObserverOfEdit(observer);
    }
};

turnWithThreeSelectorsUI.prototype.setDegreesOptions = function(model)
{
    this.degreesView.innerHTML = "";

    var direction = parseInt(this.directionView.value);
    var showTurnControls = direction != 0 && direction != 180;
    this.degreesView.style.display = this.categoryView.style.display =
        showTurnControls ? "inline" : "none";
    this.arrow.style.display = direction != 180 ? "inline" : "none";
    this.reminder.style.display = direction == 0 ? "inline" : "none";

    var firstChoice = this.directionView.getElementsByTagName("option")[0];
    if (direction != 0 && firstChoice.innerHTML == "(Choose)")
        this.directionView.removeChild(firstChoice);

    //TODO set of 5 should disable Reverse option

    if (!showTurnControls)
        return;

    var base = parseFloat(this.categoryView.value);
    if (base != 0)
    {
        for (var angle = base; angle < 180; angle += base)
        {
            var option = document.createElement("option");
            option.value = angle;
            option.innerHTML = "" + angle + " degrees";

            this.degreesView.appendChild(option);
        }

        this.degreesView.value = "" + Math.abs(model.degrees);
    }
    else
        alert("Freestyle not yet implemented.");
};

turnWithThreeSelectorsUI.prototype.connect = function(model, view, observer)
{
    this.directionView = view.getElementsByTagName("select")[0];
    this.degreesView = view.getElementsByTagName("select")[1];
    this.arrow = view.getElementsByTagName("span")[0];
    this.categoryView = view.getElementsByTagName("select")[2];
    this.reminder = view.getElementsByTagName("span")[1];

    //TODO this may be a text input, too

    //TODO intelligent choice of category based on actual value
    //TODO this really calls for a look at the whole program,
    // so that we don't just assume 4 turns because we saw the value 90

    if (model.degrees != 0 && model.degrees != 180)
    {
        var categories = this.categoryView.childNodes;
        for (var o = categories.length - 1; o >= 0; --o)
            if (categories[o].nodeType == 1 &&
                    model.degrees % parseFloat(categories[o].value) == 0)
                this.categoryView.value = categories[o].value;
    }

    if (model.degrees == 180)
        this.directionView.value = "180";
    else if (model.degrees == 0)
        this.directionView.value = "0";
    else if (model.degrees > 0)
        this.directionView.value = "1";
    else
        this.directionView.value = "-1";

    this.setDegreesOptions(model);

    var _this = this;
    this.categoryView.onchange = this.directionView.onchange = function(ev)
    {
        _this.readDegrees(model, observer);
            // so we preserve reasonable settings if possible
        _this.setDegreesOptions(model);
        _this.readDegrees(model, observer);
    };

    this.degreesView.onchange = function(ev)
    {
        _this.readDegrees(model, observer);
    };
};

turnWithThreeSelectorsUI.prototype.disconnect = function()
{
    this.categoryView.onchange =
        this.directionView.onchange =
            this.degreesView.onchange = null;
};

function turn16UI() {}
turn16UI.prototype = new turnWithThreeSelectorsUI();

function turn36UI() {}
turn36UI.prototype = new turnWithThreeSelectorsUI();

/* -------------------------------------------------------- */

function setColorFactory(state)
{
    var result = new SetStyleProperty("color", "#000000");

    if (state !== null)
        result.value = state.value;

    return result;
};
function setColorSelectFactory(state) { return setColorFactory(state); }
function setColorRGBFactory(state) { return setColorFactory(state); }

function setColorSelectUI()
{
    var colorView = null;

    this.connect = function(model, view, observer)
    {
        colorView = view.getElementsByTagName("select")[0];
        colorView.value = model.value;
        colorView.onchange = function(ev)
        {
            model.value = colorView.value;
            notifyObserverOfEdit(observer);

        };
    };

    this.disconnect = function()
    {
        colorView.onchange = null;
    };
}

function setColorRGBUI()
{
    var redView = null;
    var greenView = null;
    var blueView = null;

    this.connect = function(model, view, observer)
    {
        redView = view.getElementsByTagName("input")[0];
        greenView = view.getElementsByTagName("input")[1];
        blueView = view.getElementsByTagName("input")[2];
        var preview = view.getElementsByTagName("input")[3];

        redView.value = getRed(model.value);
        greenView.value = getGreen(model.value);
        blueView.value = getBlue(model.value);
        preview.style.background = model.value;

        redView.onkeyup = redView.onchange =
            greenView.onkeyup = greenView.onchange =
                blueView.onkeyup = blueView.onchange =
            function(ev)
            {
                model.value = buildColor(parseInt(redView.value),
                    parseInt(greenView.value), parseInt(blueView.value));
                preview.style.background = model.value;
                notifyObserverOfEdit(observer);
            };
    };

    this.disconnect = function()
    {
        redView.onkeyup = greenView.onkeyup = blueView.onkeyup =
            redView.onchange = greenView.onchange = blueView.onchange = null;
    };
}



/* -------------------------------------------------------- */

function setWidthFactory(state)
{
    var result = new SetStyleProperty("weight", 1);

    if (state !== null)
        result.value = state.value;

    return result;
};
;

function setWidthUI()
{
    var widthView = null;

    this.connect = function(model, view, observer)
    {
        widthView = view.getElementsByTagName("select")[0];
        preview = view.getElementsByTagName("input")[0];

        widthView.value = model.value;
        preview.style.borderTopWidth = "" + model.value + "px";

        widthView.onchange = function(ev)
        {
            model.value = parseInt(widthView.value);
            preview.style.borderTopWidth = "" + model.value + "px";
            notifyObserverOfEdit(observer);
        };
    };

    this.disconnect = function()
    {
        widthView.onchange = null;
    };
}

/* -------------------------------------------------------- */

function adjustColorFactory(state)
{
    var result = new AdjustColor(0, 0, 0);

    if (state !== null)
    {
        result.redIncrement = state.redIncrement;
        result.greenIncrement = state.greenIncrement;
        result.blueIncrement = state.blueIncrement;
    }

    return result;
};

function adjustColorUI()
{
    var redView = null;
    var greenView = null;
    var blueView = null;

    this.connect = function(model, view, observer)
    {
        redView = view.getElementsByTagName("input")[0];
        greenView = view.getElementsByTagName("input")[1];
        blueView = view.getElementsByTagName("input")[2];

        redView.value = model.redIncrement;
        greenView.value = model.greenIncrement;
        blueView.value = model.blueIncrement;

        redView.onkeyup = redView.onchange = function(ev)
        {
            model.redIncrement = parseInt(redView.value);
            notifyObserverOfEdit(observer);
        };
        greenView.onkeyup = greenView.onchange = function(ev)
        {
            model.greenIncrement = parseInt(greenView.value);
            notifyObserverOfEdit(observer);
        };
        blueView.onkeyup = blueView.onchange = function(ev)
        {
            model.blueIncrement = parseInt(blueView.value);
            notifyObserverOfEdit(observer);
        };
    };

    this.disconnect = function()
    {
        redView.onkeyup = greenView.onkeyup = blueView.onkeyup =
            redView.onchange = greenView.onchange = blueView.onchange = null;
    };
}

/* -------------------------------------------------------- */

function adjustWidthFactory(state)
{
    var result = new AdjustStyleProperty("weight", 0);

    if (state !== null)
        result.increment = state.increment;

    return result;
};

function adjustWidthUI()
{
    var incrementView = null;

    this.connect = function(model, view, observer)
    {
        incrementView = view.getElementsByTagName("input")[0];
        incrementView.value = model.increment;
        incrementView.onkeyup = incrementView.onchange = function(ev)
        {
            model.increment = parseFloat(incrementView.value);
            notifyObserverOfEdit(observer);
        };
    };

    this.disconnect = function()
    {
        incrementView.onkeyup = incrementView.onchange = null;
    };
}

/* -------------------------------------------------------- */

function loopFactory(state)
{
    var result = new Loop(1);

    if (state !== null)
    {
        result.count = state.count;
        for (var i = 0; i < state.instructions.length; ++i)
            result.instructions.push(createWrapper(state.instructions[i]));
    }
    else
        result.instructions.push(new Wrapper());

    return result;
};

function loopUI()
{
    var countView = null;
    var blockView = null;

    var blockTop = null;
    var blockBottom = null;

    this.connect = function(model, view, observer, parent)
    {
        countView = view.getElementsByTagName("input")[0];
        countView.value = model.count;
        countView.onkeyup = countView.onchange = function(ev)
        {
            model.count = parseInt(countView.value);
            notifyObserverOfEdit(observer);
        };

        blockView = createFromTemplate("loopBlock");
        parent.appendChild(blockView);

        blockTop = blockView.getElementsByTagName("td")[0];
        var td = blockView.getElementsByTagName("td")[1];
        blockBottom = blockView.getElementsByTagName("td")[2];

        var blockUI = new BlockUI(model, td);
        blockUI.setEditingObserver(observer);

        for (var i = 0; i < model.instructions.length; ++i)
            blockUI.processInstruction(model.instructions[i]);
    };

    this.disconnect = function()
    {
        countView.onkeyup = countView.onchange = null;

        // TODO disconnect all children
        blockView.parentNode.removeChild(blockView);
    };

    this.showActive = function()
    {
        blockTop.style.background = colorScheme.blockHighlight;
        blockBottom.style.background = colorScheme.blockHighlight;
    };

    this.showInactive = function()
    {
        blockTop.style.background = colorScheme.background;
        blockBottom.style.background = colorScheme.background;
    };
}

/* -------------------------------------------------------- */

function sproutFactory(state)
{
    var result = new Sprout();
    result.resetInstruction = new Wrapper("reset", result.resetInstruction);

    if (state !== null)
    {
        for (var i = 0; i < state.instructions.length; ++i)
            result.instructions.push(createWrapper(state.instructions[i]));
    }
    else
        result.instructions.push(new Wrapper());

    return result;
};

function sproutUI()
{
    var blockView = null;
    var resetView = null;

    var blockTop = null;
    var blockBottom = null;

    this.connect = function(model, view, observer, parent)
    {
        blockView = createFromTemplate("sproutBlock");
        parent.appendChild(blockView);

        blockTop = blockView.getElementsByTagName("td")[0];
        var td = blockView.getElementsByTagName("td")[1];
        blockBottom = blockView.getElementsByTagName("td")[2];

        var blockUI = new BlockUI(model, td);
        blockUI.setEditingObserver(observer);

        for (var i = 0; i < model.instructions.length; ++i)
            blockUI.processInstruction(model.instructions[i]);

        resetView = createFromTemplate("reset");
        parent.appendChild(resetView);
        model.resetInstruction.observer =
            {
                activeInstruction: function(context)
                {
                    resetView.style.background = colorScheme.highlight;
                    setTimeout
                    (
                        function()
                        {
                            resetView.style.background = colorScheme.background;
                        },
                        INTERVAL - 100
                    );

                    if (context.observer !== null)
                        context.observer.activeInstructionView(resetView);
                },

                inactiveInstruction: function(context)
                {
                    if (context.observer !== null)
                        context.observer.inactiveInstructionView(resetView);
                }
            };
    };

    this.disconnect = function()
    {
        // TODO disconnect all children
        blockView.parentNode.removeChild(blockView);
    };

    this.showActive = function()
    {
        blockTop.style.background = colorScheme.blockHighlight;
        blockBottom.style.background = colorScheme.blockHighlight;
    };

    this.showInactive = function()
    {
        blockTop.style.background = colorScheme.background;
        blockBottom.style.background = colorScheme.background;
    };
}


/* ********************************************************************
 * Language class and level definitions
 */

function Language(level, name)
{
    this.level = level;
    this.name = name;
    this.instructionSet = {};
    this.dragAndDrop = true;
    this.tutorialName = "";
    this.tutorialTitle = "";
    this.tutorialIntro = "";

    this.repopulateSelector = function(selector)
    {
        selector.innerHTML = "";

        var emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.innerHTML = "(Choose)";
        selector.appendChild(emptyOption);

        for (var name in this.instructionSet)
        {
            //TODO exclude nested repeat as per language level setting

            var option = document.createElement("option");
            option.value = name;
            option.innerHTML = this.instructionSet[name];
            selector.appendChild(option);
        }
    };
}

// alpha levels: Draw1TurnLR and Draw1Skip1TurnLR

var level1 = new Language(1, "Draw1Skip1TurnLR");
level1.instructionSet.move1 = "Draw";
level1.instructionSet.skip1 = "Skip";
level1.instructionSet.turnLeft = "Turn left";
level1.instructionSet.turnRight = "Turn right";
level1.dragAndDrop = false;
level1.tutorialName = "Show me how Sprout works";
level1.tutorialTitle = "Getting Started with Sprout";
level1.tutorialIntro = "Sprout helps you write <strong>programs</strong> that draw designs on the screen. A program is just a list of instructions, such as &quot;Draw&quot; or &quot;Turn.&quot; This tutorial will walk you through writing a simple drawing program. You'll be directed as to each instruction and what buttons to click to see your program run, add to it, change it, and see it run again. Ready? Click <strong>Start Tutorial</strong> to begin.";

var level2 = new Language(2, "Draw1Skip1Turn8Repeat");
level2.instructionSet.move1 = "Draw";
level2.instructionSet.skip1 = "Skip";
level2.instructionSet.turn8 = "Turn";
level2.instructionSet.loop = "Repeat";
level2.tutorialName = "Show me how to make loops";
level2.tutorialTitle = "Programming with Loops";
level2.tutorialIntro = "In computer programming, a <strong>loop</strong> is a set of instructions that are run several times over. Loops are very powerful things -- especially in drawing programs! At Level 2, Sprout supports a new instruction, &quot;Repeat.&quot; This tutorial will show you some of the things you can do with repeats, or loops. Click <strong>Start Tutuorial</strong> to begin.";

var level3 = new Language(3, "Draw1Skip1Turn16Repeat");
level3.instructionSet.move1 = "Draw";
level3.instructionSet.skip1 = "Skip";
level3.instructionSet.turn16 = "Turn";
level3.instructionSet.loop = "Repeat";
level3.tutorialName = "Show me nested loops";

var level4 = new Language(4, "DrawSkipTurn16Repeat");
level4.instructionSet.move = "Draw";
level4.instructionSet.skip = "Skip";
level4.instructionSet.turn16 = "Turn";
level4.instructionSet.loop = "Repeat";

var level5 = new Language(5, "DrawSkipTurn16SetWidthSetColorRepeat");
level5.instructionSet.move = "Draw";
level5.instructionSet.skip = "Skip";
level5.instructionSet.turn16 = "Turn";
level5.instructionSet.setWidth = "Set width";
level5.instructionSet.setColorSelect = "Set color";
level5.instructionSet.loop = "Repeat";

var level6 = new Language(6, "DrawSkipTurn16SetWidthSetColorNestedRepeat");
level6.instructionSet.move = "Draw";
level6.instructionSet.skip = "Skip";
level6.instructionSet.turn16 = "Turn";
level6.instructionSet.setWidth = "Set width";
level6.instructionSet.setColorSelect = "Set color";
level6.instructionSet.loop = "Repeat";
level6.instructionSet.sprout = "Sprout";

var level7 = new Language(7, "DrawSkipTurn16SetWidthSetColorRGBNestedRepeat");
level7.instructionSet.move = "Draw";
level7.instructionSet.skip = "Skip";
level7.instructionSet.turn16 = "Turn";
level7.instructionSet.setWidth = "Set width";
level7.instructionSet.setColorRGB = "Set color";
level7.instructionSet.loop = "Repeat";
level7.instructionSet.sprout = "Sprout";

var level8 = new Language(8, "DrawSkipTurn16SetAndAdjustWidthAndColorNestedRepeat");
level8.instructionSet.move = "Draw";
level8.instructionSet.skip = "Skip";
level8.instructionSet.turn16 = "Turn";
level8.instructionSet.setWidth = "Set width";
level8.instructionSet.setColorRGB = "Set color";
level8.instructionSet.adjustWidth = "Adjust width";
level8.instructionSet.adjustColor = "Adjust color";
level8.instructionSet.loop = "Repeat";
level8.instructionSet.sprout = "Sprout";

var level9 = new Language(9, "DrawSkipTurn36SetAndAdjustWidthAndColorNestedRepeat");
level9.instructionSet.move = "Draw";
level9.instructionSet.skip = "Skip";
level9.instructionSet.turn36 = "Turn";
level9.instructionSet.setWidth = "Set width";
level9.instructionSet.setColorRGB = "Set color";
level9.instructionSet.adjustWidth = "Adjust width";
level9.instructionSet.adjustColor = "Adjust color";
level9.instructionSet.loop = "Repeat";
level9.instructionSet.sprout = "Sprout";


var languageLevels =
    [
         level1,
         level2,
         level3,
         level4,
         level5,
         level6,
         level7,
         level8,
         level9
    ];

var languageLevel = 0;

var promotions = {};
promotions.move1 = "move";
promotions.skip1 = "skip";
promotions.turnLeft = "turn8";
promotions.turnRight = "turn8";
promotions.turn8 = "turn16";
promotions.turn16 = "turn36";
promotions.setColorSelect = "setColorRGB";


/*******************************************************************************
 * InstructionUI class
 */

function InstructionUI(wrapper, view,
    selectionHandler, insertionHandler, removalHandler,
    editingObserver, isAutomaticAtBottom)
{
    this.model = wrapper;
    this.view = view;

    var _this = this;
    var formUI = null;
    var observer = editingObserver;

    // This code is fragile: must adapt if the template structure changes
    var inserter = view.getElementsByTagName("p").item(0);
    var grabber = view.getElementsByTagName("p").item(1);
    var selector = view.getElementsByTagName("select").item(0);
    var holder = view.getElementsByTagName("span").item(0);
    var remover = view.getElementsByTagName("span").item(1);

    var IAmDragSource = false;


    languageLevels[languageLevel].repopulateSelector(selector);
    wrapper.observer = new Observer();

    // In FireFox, we need to do this manually:
    var blockDraggingInTextFields = function()
    {
        var inputFields = holder.getElementsByTagName("input");
        for (var f = 0; f < inputFields.length; ++f)
            if (inputFields[f].type == "text")
            {
                inputFields[f].onmouseover = function(ev)
                {
                    grabber.draggable = false;
                    grabber.style.cursor = "default";
                };
                inputFields[f].onmouseout = function(ev)
                {
                    grabber.draggable = true;
                    grabber.style.cursor = "move";
                };
            }
    };

    var adoptNewModel = function(updateSelector)
    {
        //TODO keep this until we can patch existing saved drawings:
        if (wrapper.name == "turn") wrapper.name = "turn36";
        if (wrapper.name == "setColor") wrapper.name = "setColorSelect"

        var active = wrapper.name.length != 0;

        holder.innerHTML = "";
        if (formUI !== null)
        {
            formUI.disconnect();
            formUI = null;
        }

        if (active)
        {
            while (!(wrapper.name in
                languageLevels[languageLevel].instructionSet) &&
                    (wrapper.name in promotions))
                wrapper.name = promotions[wrapper.name];

            if (!wrapper.name in
                    languageLevels[languageLevel].instructionSet)
                alert ("Couldn't promote instruction: " + wrapper.name);

            wrapper.delegate = createInstruction(wrapper);

            var panel = createFromTemplate(wrapper.name);

            holder.appendChild(panel);

            formUI = eval("new " + wrapper.name + "UI()");
            formUI.connect(wrapper.delegate, panel, observer, view);
            blockDraggingInTextFields();
        }

        if (updateSelector)
            selector.value = wrapper.name;

        if (active && selector.childNodes[0].value == "")
            selector.removeChild(selector.childNodes[0]);
    };

    if (isAutomaticAtBottom)
        remover.style.visibility = "hidden";

    adoptNewModel(true);

    this.disconnect = function()
    {
        if (formUI !== null)
            formUI.disconnect();
    };

    inserter.onmouseover = function(ev)
    {
        if (wrapper.name != "")
            inserter.style.background = colorScheme.insertHighlight;
    };

    inserter.ondragover = grabber.ondragover = function(ev)
    {
        ev.dataTransfer.effectAllowed = IAmDragSource ? "none" : "moveCopy";
        ev.preventDefault();

        if (!IAmDragSource)
            inserter.style.background = colorScheme.insertHighlight;
    };

    inserter.onmouseout = inserter.ondragleave = grabber.ondragleave = function(ev)
    {
        inserter.style.background = colorScheme.background;
    };

    inserter.onclick = function(ev)
    {
        if (wrapper.name != "")
            insertionHandler(_this);
    };

    inserter.ondrop = grabber.ondrop = function(ev)
    {
        ev.preventDefault();

        inserter.style.background = colorScheme.background;

        insertionHandler(_this, createWrapper
            (eval("(" + ev.dataTransfer.getData("instruction") + ")")));
    };

    selector.onchange = function()
    {
        var instructionName = selector.value;
        var oldInstructionName = wrapper.name;

        if (instructionName.length != 0)
        {
            wrapper.name = instructionName;
            wrapper.delegate = null;
            adoptNewModel(false);
        }
        remover.style.visibility = "visible";

        if (selectionHandler !== null)
            selectionHandler(_this, instructionName, oldInstructionName);
    };

    var dragEnabled = function()
    {
        return languageLevels[languageLevel].dragAndDrop && wrapper.name != "";
    };

    grabber.onmouseover = function(ev)
    {
        if (dragEnabled())
        {
            grabber.style.cursor = "move";
        }
    };

    grabber.onmouseout = function(ev)
    {
        grabber.style.cursor = "default";
    };

    grabber.ondragstart = function(ev)
    {
        if (dragEnabled())
        {
            IAmDragSource = true;
            ev.dataTransfer.setData("instruction", JSON.stringify(wrapper));
        }
    };

    grabber.ondragend = function(ev)
    {
        if (ev.dataTransfer.dropEffect == "move")
            removalHandler(_this);

        IAmDragSource = false;
    };

    remover.onmouseover = function(ev)
    {
        remover.style.color = colorScheme.removeActive;
    };

    remover.onmouseout = function(ev)
    {
        remover.style.color = colorScheme.removeInactive;
    };

    remover.onclick = function(ev)
    {
        removalHandler(_this);
    };

    function Observer()
    {
        var isBlock = function(wrapper)
        {
            return wrapper.name != "" && "instructions" in wrapper.delegate;
        }

        this.activeInstruction = function(context)
        {

            if (isBlock(wrapper))
                formUI.showActive();
            else
            {
                view.style.background = colorScheme.highlight;
                setTimeout
                (
                    function() { view.style.background = colorScheme.background; },
                    INTERVAL - 100
                );
            }

            if (context.observer !== null)
                context.observer.activeInstructionView(view);
        };

        this.inactiveInstruction = function(context)
        {
            if (isBlock(wrapper))
                formUI.showInactive();

            if (context.observer !== null)
                context.observer.inactiveInstructionView(view);
        };
    };
}

/*******************************************************************************
 * BlockUI class
 */

function BlockUI(model, view)
{
    var instructionUIs = [];
    var observer = null;

    var notifyOfEdit = function()
    {
        notifyObserverOfEdit(observer);
    }

    var addInstruction = function(wrapper, index)
    {
        var instructionView = createFromTemplate("instruction");
        var instructionUI = new InstructionUI(wrapper, instructionView,
            selectionHandler, insertionHandler, removeInstruction,
            observer, index === undefined);

        if (index !== undefined)
        {
            model.instructions.splice(index, 0, wrapper);
            view.insertBefore(instructionView, instructionUIs[index].view);
            instructionUIs.splice(index, 0, instructionUI);
        }
        else
        {
            model.instructions.push(wrapper);
            view.appendChild(instructionView);
            instructionUIs.push(instructionUI);
        }

        if (observer && observer.onInstructionAdded)
            observer.onInstructionAdded(instructionUI);
    };

    var removeInstruction = function(instructionUI)
    {
        var index = instructionUIs.indexOf(instructionUI);
        model.instructions.splice(index, 1);

        view.removeChild(instructionUI.view);
        instructionUIs.splice(index, 1);

        if (observer && observer.onInstructionRemoved)
            observer.onInstructionRemoved(instructionUI);
    };

    var insertionHandler = function(instructionUI, wrapper)
    {
        addInstruction
            (wrapper || new Wrapper(), instructionUIs.indexOf(instructionUI));
        notifyOfEdit();
    };

    var selectionHandler = function(instructionUI, selection, oldSelection)
    {
        if (selection.length == 0)
            removeInstruction(instructionUI);
        else if (oldSelection.length == 0 &&
                instructionUI === instructionUIs[instructionUIs.length - 1])
        {
            addInstruction(new Wrapper());
            notifyOfEdit();
        }
        else if (selection != oldSelection)
            notifyOfEdit();
    };

    this.clearInstructions = function()
    {
        model.instructions = [];

        for (var i = 0; i < instructionUIs.length; ++i)
        {
            instructionUIs[i].disconnect();
            view.removeChild(instructionUIs[i].view);
        }
        instructionUIs = [];
        addInstruction(new Wrapper());
    };

    this.addInstruction = addInstruction;

    this.processInstruction = function(wrapper)
    {
        var instructionView = createFromTemplate("instruction");
        var instructionUI = new InstructionUI(wrapper, instructionView,
            selectionHandler, insertionHandler, removeInstruction,
            observer, wrapper.name == "");

        view.appendChild(instructionView);
        instructionUIs.push(instructionUI);
    };


    this.setEditingObserver = function(newObserver)
    {
        observer = newObserver;
    };
}

