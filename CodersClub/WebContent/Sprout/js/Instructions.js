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
 * Instructions for drawing language.
 */

// Depends on Drawing.js


/* ********************************************************************
 * Global functions
 */

function clear(canvas)
{
    var context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function incrementWithinBounds(value, increment)
{
    value += increment;
    if (value < 0)
        value = 0;
    if (value > 255)
        value = 255;

    return value;
};

function twoDigitHex(value)
{
    var hex = value.toString(16);
    if (hex.length == 1)
        hex = "0" + hex;
    return hex;
};

function getRed(color)
{
    return parseInt(color.substring(1,3), 16);
}

function getGreen(color)
{
    return parseInt(color.substring(3,5), 16);
}

function getBlue(color)
{
    return parseInt(color.substring(5,7), 16);
}

function buildColor(red, green, blue)
{
    return "#" + twoDigitHex(red) + twoDigitHex(green) + twoDigitHex(blue);
}


/* ********************************************************************
 * Indicators class
 */

function Indicators(bearingView, weightView, colorView)
{
    var bearingContext = bearingView.getContext("2d");
    var bearingWidth = bearingView.width;
    var bearingHeight = bearingView.height;

    bearingContext.fillStyle = "#ffffff";
    bearingContext.strokeStyle= "#000000";
    bearingContext.lineWidth = 3;
    bearingContext.translate(bearingWidth / 2, bearingHeight / 2);

    this.updateBearing = function(bearing)
    {
        bearingContext.fillRect(-bearingWidth, -bearingHeight,
            bearingWidth * 2, bearingHeight * 2);

        bearingContext.rotate(-bearing);

        bearingContext.beginPath();
        bearingContext.moveTo(bearingWidth * -.3, 0);
        bearingContext.lineTo(bearingWidth * .3, 0);
        bearingContext.moveTo(bearingWidth * .2, bearingHeight * -.1);
        bearingContext.lineTo(bearingWidth * .3, 0);
        bearingContext.lineTo(bearingWidth * .2, bearingHeight * .1);
        bearingContext.stroke();

        bearingContext.rotate(bearing);
    };

    var weightContext = weightView.getContext("2d");
    var weightWidth = weightView.width;
    var weightHeight = weightView.height;

    weightContext.fillStyle = "#ffffff";
    weightContext.strokeStyle= "#000000";

    this.updateWeight = function(weight)
    {
        weightContext.fillRect(0, 0, weightWidth, weightHeight);
        weightContext.lineWidth = weight;

        weightContext.beginPath();
        weightContext.moveTo(weightWidth * .2, weightHeight * .5);
        weightContext.lineTo(weightWidth * .8, weightHeight * .5);
        weightContext.stroke();
    };

    var colorContext = colorView.getContext("2d");
    var colorWidth = colorView.width;
    var colorHeight = colorView.height;

    this.updateColor = function(color)
    {
        colorContext.fillStyle = "#ffffff";
        colorContext.fillRect(0, 0, colorWidth, colorHeight);
        colorContext.fillStyle = color;
        colorContext.fillRect(2, 2, colorWidth - 4, colorHeight - 4);
    };

    this.update = function(bearing, weight, color)
    {
        this.updateBearing(bearing);
        this.updateWeight(weight);
        this.updateColor(color);
    };

    this.reset = function()
    {
        this.update (Math.PI / 2, 1, "#000000");
    }
}

/* ********************************************************************
 * Context class
 */

function Context(drawing, style, x, y, degrees)
{
    this.drawing = drawing || new Drawing();
    this.style = style || new Line();
    this.x = x || 0;
    this.y = y || 0;

    this.setBearing = function(degrees)
    {
        this.bearing = (90 - (degrees % 360)) * Math.PI / 180;
    };

    this.adjustBearing = function(degrees)
    {
        this.bearing -= (degrees % 360) * Math.PI / 180;
    };

    this.getBearing = function()
    {
        var result = 90 - (this.bearing * 180 / Math.PI);
        while (result < 0) result += 360;
        while (result >= 360) result -= 360;
        return result;
    };

    this.setBearing(degrees || 0);

    this.updateIndicators = function()
    {
        if ("indicators" in this && this.indicators !== null)
            this.indicators.update
                (this.bearing, this.style.weight, this.style.color);
    }

    this.busyAtThisLevel = function()
    {
        return this.animationContexts.length > this.animationLevel;
    };
    this.busyAtNextLevel = function()
    {
        return this.animationContexts.length > this.animationLevel + 1;
    };

    this.getAnimationContext = function()
    {
        return this.animationContexts[this.animationLevel];
    };
    this.setAnimationContext = function(animationContext)
    {
        this.animationContexts[this.animationLevel] = animationContext;
    };
    this.removeAnimationContext = function()
    {
        this.animationContexts.splice(this.animationLevel, 1);
    };

    this.transferTo = function(target)
    {
        target.x = this.x;
        target.y = this.y;
        target.bearing = this.bearing;
        target.style = this.style.clone();
    };
}


/* ********************************************************************
 * Instruction class
 */

function para(content, indent)
{
    return "<p class=\"code\" style=\"margin-left: " + indent + "em;\" >" +
        content + "</p>";
}

function Instruction()
{
    this.execute = function (context)
    {
        alert("Must subclass Instruction and override execute().");
    };
}


/* ********************************************************************
 * Move class
 */

Move.prototype = new Instruction();
Move.prototype.constructor = Move;
function Move(distance)
{
    this.distance = distance;

    this.execute = function (context)
    {
        // We flip the Y axis to be more intuitive for the user:
        var newX = context.x + Math.cos(context.bearing) * this.distance;
        var newY = context.y - Math.sin(context.bearing) * this.distance;

        var segment = new Element
            (context.x, context.y, newX, newY, context.style);
        context.drawing.elements.push (segment);
        context.x = newX;
        context.y = newY;

        if (context.animating)
            segment.draw(context.canvas);
    };

    this.toEnglish = function(indent)
    {
        return indent + "Draw a " + this.distance + "-pixel line.";
    };

    this.toJavaScript = function(indent)
    {
        return para("draw(" + this.distance + ");", indent);
    };
}


/* ********************************************************************
 * Skip class
 */

Skip.prototype = new Instruction();
Skip.prototype.constructor = Skip;
function Skip(distance)
{
    this.distance = distance;

    this.execute = function (context)
    {
        // We flip the Y axis to be more intuitive for the user:
        context.x = context.x + Math.cos(context.bearing) * this.distance;
        context.y = context.y - Math.sin(context.bearing) * this.distance;
    };

    this.toEnglish = function(indent)
    {
        return indent + "Skip " + this.distance + " pixel(s), without drawing.";
    };

    this.toJavaScript = function(indent)
    {
        return para("move(" + this.distance + ");", indent);
    };
}


/* ********************************************************************
 * Turn class
 */

Turn.prototype = new Instruction();
Turn.prototype.constructor = Turn;

/**
 *
 * @param context
 * @param degrees Positive to turn right, negative to turn left
 */
function Turn(degrees)
{
    this.degrees = degrees;

    this.execute = function (context)
    {
        context.adjustBearing(this.degrees);
        
        if (context.animating)
            context.updateIndicators();
    };

    this.toEnglish = function(indent)
    {
        var friendlyDegrees = this.degrees % 360;
        if (friendlyDegrees > 180) friendlyDegrees -= 360;
        if (friendlyDegrees < -180) friendlyDegrees += 360;

        if (friendlyDegrees == 0)
            return indent + "Turn 0 degrees (no-op).";
        else if (friendlyDegrees == 180)
            return indent + "Turn 180 degrees (backwards).";
        else if (friendlyDegrees > 0)
            return indent + "Turn " + friendlyDegrees + " to the right.";
        else
            return indent + "Turn " + -friendlyDegrees + " to the left.";
    };

    this.toJavaScript = function(indent)
    {
        var friendlyDegrees = this.degrees % 360;
        if (friendlyDegrees > 180) friendlyDegrees -= 360;
        if (friendlyDegrees < -180) friendlyDegrees += 360;

        return para("turn(" + friendlyDegrees + ");", indent);
    };
}


/* ********************************************************************
 * SetStyleProperty class
 */

SetStyleProperty.prototype = new Instruction();
SetStyleProperty.prototype.constructor = SetStyleProperty;

function SetStyleProperty(name,value)
{
    this.name = name;
    this.value = value;

    this.execute = function (context)
    {
        context.style = context.style.clone();
        context.style[this.name] = this.value;

        if (context.animating)
            context.updateIndicators();
    };

    this.toEnglish = function(indent)
    {
        return indent + "Set " + this.name + " to " + this.value + ".";
    };

    this.toJavaScript = function(indent)
    {
        var quoteOrNot = typeof(this.value) == "string" ? "\"" : "";
        return para("set(\"" + this.name + "\", " +
            quoteOrNot + this.value + quoteOrNot + ");", indent);
    };
}


/* ********************************************************************
 * AdjustStyleProperty class
 */

AdjustStyleProperty.prototype = new Instruction();
AdjustStyleProperty.prototype.constructor = AdjustStyleProperty;

function AdjustStyleProperty(name,increment)
{
    this.name = name;
    this.increment = increment;

    this.execute = function (context)
    {
        context.style = context.style.clone();
        context.style[this.name] =
            context.style[this.name] + this.increment;

        if (context.animating)
            context.updateIndicators();
    };

    this.toEnglish = function(indent)
    {
        if (this.increment == 0)
            return indent + "Add 0 to " + this.name + " (no-op).";
        else if (this.increment > 0)
            return indent + "Add " + this.increment + " to " + this.name + ".";
        else
            return indent + "Subtract " + -this.increment + " from " + this.name + ".";
    };

    this.toJavaScript = function(indent)
    {
        return para("adjust(\"" + this.name + "\", " + this.value + ");", indent);
    };
}


/* ********************************************************************
 * AdjustColor and BrightenOrDarken classes
 */

AdjustColor.prototype = new Instruction();
AdjustColor.prototype.constructor = AdjustColor;

function AdjustColor(redIncrement, greenIncrement, blueIncrement)
{
    this.redIncrement = redIncrement;
    this.greenIncrement = greenIncrement;
    this.blueIncrement = blueIncrement;

    this.execute = function (context)
    {
        context.style = context.style.clone();

        var color = context.style.color;
        var red = incrementWithinBounds(getRed(color), this.redIncrement);
        var green = incrementWithinBounds(getGreen(color), this.greenIncrement);
        var blue = incrementWithinBounds(getBlue(color), this.blueIncrement);

        context.style.color = buildColor(red, green, blue);

        if (context.animating)
            context.updateIndicators();
    };

    this.toEnglish = function(indent)
    {
        return indent + "Adjust color by (red=" + this.redIncrement +
            ", green=" + this.greenIncrement + ", blue=" + blueIncrement + ").";
    };

    this.toJavaScript = function(indent)
    {
        return para("adjustColor(" + this.redIncrement +
            ", " + this.greenIncrement + ", " + blueIncrement + ");", indent);
    };
}

BrightenOrDarken.prototype = new Instruction();
BrightenOrDarken.prototype.constructor = BrightenOrDarken;

function BrightenOrDarken(increment)
{
    this.adjuster =
        new AdjustColor(increment, increment, increment);

    this.execute = function (context)
    {
        this.adjuster.execute(context);
    };

    this.toEnglish = function(indent)
    {
        if (this.increment == 0)
            return indent + "Brighten color by 0 (no-op).";
        else if (this.increment > 0)
            return indent + "Brighten color by " + this.increment + ".";
        else
            return indent + "Darken color by " + -this.increment + ".";
    };

    this.toJavaScript = function(indent)
    {
        return para("adjustColor(" + this.increment +
            ", " + this.increment + ", " + increment + ");", indent);
    };
}

/* ********************************************************************
 * Block class
 */

Block.prototype = new Instruction();
Block.prototype.constructor = Block;
Block.prototype.init = function(_this)
{
    _this.instructions = new Array();
};

function Block()
{
    this.init(this);

    this.execute = function (context)
    {
        if (context.animating)
        {
            if (this.instructions.length == 0)
                return;

            var animationIndex = 0;
            if (context.busyAtThisLevel())
                animationIndex = context.getAnimationContext();
            else
                context.setAnimationContext(animationIndex);

            if (animationIndex < this.instructions.length)
            {
                ++context.animationLevel;
                this.instructions[animationIndex].execute(context);
                --context.animationLevel;

                // Only iterate if child instruction did NOT save context
                // of its own -- otherwise we cut them off
                if(!context.busyAtNextLevel())
                    context.setAnimationContext(animationIndex + 1);
            }
            else
                context.removeAnimationContext();
        }
        else
            for (var i = 0; i < this.instructions.length; ++i)
                this.instructions[i].execute(context);
    };

    /**
     * Produces a list with leading \n characters.
     */
    this.instructionsToEnglish = function(indent)
    {
        var result = "";
        for (var i = 0; i < this.instructions.length; ++i)
            result += "\n" + this.instructions[i].toEnglish(indent + "  ");

        return result;
    };

    this.instructionsToJavaScript = function(indent)
    {
        var result = para("{", indent);

        for (var i = 0; i < this.instructions.length; ++i)
            result += this.instructions[i].toJavaScript(indent + 2);

        return result + para("}", indent);
    };

    this.toEnglish = function(indent)
    {
        return indent + "Run the following instructions:" +
            this.instructionsToEnglish(indent);
    };

    this.toJavaScript = function(indent)
    {
        return this.instructionsToJavaScript(indent);
    };
}

/* ********************************************************************
 * Loop class
 */

Loop.prototype = new Block();
Loop.prototype.constructor = Loop;

function Loop(count)
{
    this.init(this);
    this.count = count;

    this.execute = function (context)
    {
        if (context.animating)
        {
            if (this.count == 0 || this.instructions.length == 0)
                return;

            var loopContext = new Object();
            loopContext.iteration = 0;
            loopContext.index = 0;
            if (context.busyAtThisLevel())
                loopContext = context.getAnimationContext();
            else
                context.setAnimationContext(loopContext);

            if (loopContext.iteration < this.count)
            {
                ++context.animationLevel;
                this.instructions[loopContext.index].execute(context);
                --context.animationLevel;

                // Only iterate if child instruction did NOT save context
                // of its own -- otherwise we cut them off
                if(!context.busyAtNextLevel())
                {
                    ++loopContext.index;
                    if (loopContext.index == this.instructions.length)
                    {
                        ++loopContext.iteration;
                        loopContext.index = 0;
                    }

                    context.setAnimationContext(loopContext);
                }
            }
            else
                context.removeAnimationContext();
        }
        else
            for (var c = 0; c < this.count; ++c)
                for (var i = 0; i < this.instructions.length; ++i)
                    this.instructions[i].execute(context);
    };

    this.toEnglish = function(indent)
    {
        return indent + "Repeat the following instructions " + this.count
            + " times:" + this.instructionsToEnglish(indent);
    };

    this.toJavaScript = function(indent)
    {
        var loopStatement =
            "for (var index = 0; index < " + this.count + "; ++index)";
        return para(loopStatement, indent) +
            this.instructionsToJavaScript(indent);
    };
};

/* ********************************************************************
 * Sprout class
 */

SproutReset.prototype = new Instruction();
SproutReset.prototype.constructor = SproutReset;

function SproutReset()
{
    this.execute = function (context)
    {
        context.memento.pop().transferTo(context);

        if (context.animating)
            context.updateIndicators();
    };

    this.toEnglish = function(indent)
    {
        return indent + "Go back to where we were";
    };

    this.toJavaScript = function(indent)
    {
        return para("popDrawingContext();", indent);
    };
}

Sprout.prototype = new Block();
Sprout.prototype.constructor = Sprout;

function Sprout()
{
    this.init(this);
    this.resetInstruction = new SproutReset();

    var executeChild = function(child, context, animationIndex)
    {
        ++context.animationLevel;
        child.execute(context);
        --context.animationLevel;

        // Only iterate if child instruction did NOT save context
        // of its own -- otherwise we cut them off
        if(!context.busyAtNextLevel())
            context.setAnimationContext(animationIndex + 1);
    };
    
    var saveContext = function(context)
    {
        if (context.memento === undefined)
            context.memento = [];
        
        var record = new Context();
        context.transferTo(record);
        context.memento.push(record);
    };
    
    this.execute = function (context)
    {
        if (context.animating)
        {
            if (this.instructions.length == 0)
                return;

            var animationIndex = 0;
            if (context.busyAtThisLevel())
                animationIndex = context.getAnimationContext();
            else
            {
                context.setAnimationContext(animationIndex);
                saveContext(context);
            }

            if (animationIndex < this.instructions.length)
                executeChild(this.instructions[animationIndex], 
                    context, animationIndex);
            else if (animationIndex == this.instructions.length)
                executeChild(this.resetInstruction, context, animationIndex);
            else
                context.removeAnimationContext();
        }
        else
        {
            saveContext(context);
            
            for (var i = 0; i < this.instructions.length; ++i)
                this.instructions[i].execute(context);
            
            this.resetInstruction.execute(context);
        }
    };

    this.toEnglish = function(indent)
    {
        return indent + "Remember where we are now\n" +
            indent + "Execute the following instructions:" + 
            this.instructionsToEnglish(indent) + "\n" +
            this.resetInstruction.toEnglish(indent);
    };

    this.toJavaScript = function(indent)
    {
        var pushStatement = "pushDrawingContext();";
        var blockStatement =
            "for (var index = 0; index < " + this.count + "; ++index)";
        
        return para(pushStatement, indent) + 
               para(blockStatement, indent) +
               this.instructionsToJavaScript(indent) +
               this.resetInstruction.toJavaScript(indent);
    };
};
