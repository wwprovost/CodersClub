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
 * Drawing object model.
 */

/* ********************************************************************
 * Style class
 */

function Style()
{
    this.draw = function (canvas, x1, y1, x2, y2)
    {
        var context = canvas.getContext("2d");
        context.strokeStyle = this.color;
        context.lineWidth = this.weight;

        this.drawInStyle(context, x1, y1, x2, y2);
    };

    this.drawInStyle = function (context, x1, y1, x2, y2)
    {
        alert("Must subclass Style and override drawInStyle().");
    };

    this.clone = function ()
    {
        alert("Must subclass Style and override clone().");
    };
}


/* ********************************************************************
 * Line class
 */

Line.prototype = new Style();
Line.prototype.constructor = Line;

function Line(weight, color)
{
   this.weight = weight || 2;
   this.color = color || "#000000";

    this.drawInStyle = function (context, x1, y1, x2, y2)
    {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    };

    this.clone = function ()
    {
        return new Line(this.weight, this.color);
    };
}

/* ********************************************************************
 * Element class
 */

function Element(x1, y1, x2, y2, style)
{
    this.getX1 = function() { return x1; };
    this.getY1 = function() { return y1; };
    this.getX2 = function() { return x2; };
    this.getY2 = function() { return y2; };
    this.getStyle = function() { return style; };

    this.draw = function(canvas)
    {
        if (style !== null)
        {
            style.draw(canvas, x1, y1, x2, y2);
        }
    };
}

/* ********************************************************************
 * Drawing class
 */

function Drawing()
{
    this.elements = new Array();

    // Override e.g. for draw-as-we-go debugging ...
    this.add = function(element)
    {
        this.elements.push(element);
    };

    this.connectElement = function(x2, y2)
    {
        var last = this.elements[this.elements.length - 1];
        this.elements.push(new Element
            (last.getX2(), last.getY2(), x2, y2, last.getStyle()));
    };

    this.connectElementWithStyle = function(x2, y2, style)
    {
        var last = this.elements[this.elements.length - 1];
        this.elements.push(new Element
            (last.getX2(), last.getY2(), x2, y2, style));
    };

    this.draw = function(canvas)
    {
        for (var i = 0; i < this.elements.length; ++i)
            this.elements[i].draw(canvas);
    };
}


/* ********************************************************************
 * BoundsCalculator class
 */

function BoundsCalculator()
{
    this.xMin = 1000000;
    this.xMax = -1000000;
    this.yMin = 1000000;
    this.yMax = -1000000;

    var checkBounds = function(x,y)
    {
        if(x < this.xMin) this.xMin = x;
        if(x > this.xMax) this.xMax = x;
        if(y < this.yMin) this.yMin = y;
        if(y > this.yMax) this.yMax = y;
    };

    this.getContext = function(type)
    {
        return this;
    };

    this.moveTo = checkBounds;
    this.lineTo = checkBounds;

    var dontCare0 = function() {};
    this.beginPath = dontCare0;
    this.stroke = dontCare0;
}

