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
 * Drawing challenges -- model and UI.
 */

/* Depends on
 *   Drawing.js
 *   Instructions.js
 *   InstructionUI.js
 */

/*******************************************************************************
 * Challenges
 */

function Challenge(level, name, program, limit)
{
    this.level = level;
    this.name = name;
    this.program = program;
    this.limit = limit;
}

function Challenges()
{
    var all = {};

    // Level 1 --------------------------------------

    var square = new Block();
    square.instructions.push(new SetStyleProperty("color", "#ccccff"));
    square.instructions.push(new Move(25));
    square.instructions.push(new Turn(90));
    square.instructions.push(new Move(25));
    square.instructions.push(new Turn(90));
    square.instructions.push(new Move(25));
    square.instructions.push(new Turn(90));
    square.instructions.push(new Move(25));

    var steps = new Block();
    steps.instructions.push(new SetStyleProperty("color", "#ccccff"));
    steps.instructions.push(new Move(25));
    steps.instructions.push(new Turn(90));
    steps.instructions.push(new Move(25));
    steps.instructions.push(new Turn(-90));
    steps.instructions.push(new Move(25));
    steps.instructions.push(new Turn(90));
    steps.instructions.push(new Move(25));
    steps.instructions.push(new Turn(-90));
    steps.instructions.push(new Move(25));
    steps.instructions.push(new Turn(90));
    steps.instructions.push(new Move(25));

    var twoSquares = new Block();
    twoSquares.instructions.push(new SetStyleProperty("color", "#ccccff"));
    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(90));
    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(90));
    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(90));
    twoSquares.instructions.push(new Move(25));

    twoSquares.instructions.push(new Turn(90));
    twoSquares.instructions.push(new Turn(90));
    twoSquares.instructions.push(new Skip(25));
    twoSquares.instructions.push(new Skip(25));

    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(-90));
    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(-90));
    twoSquares.instructions.push(new Move(25));
    twoSquares.instructions.push(new Turn(-90));
    twoSquares.instructions.push(new Move(25));

    var threeSquares = new Block();
    threeSquares.instructions.push(new SetStyleProperty("color", "#ccccff"));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));

    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Skip(25));
    threeSquares.instructions.push(new Skip(25));

    threeSquares.instructions.push(new Turn(-90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Move(25));

    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Turn(90));
    threeSquares.instructions.push(new Skip(25));
    threeSquares.instructions.push(new Turn(-90));
    threeSquares.instructions.push(new Skip(25));
    threeSquares.instructions.push(new Skip(25));

    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(-90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(-90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Turn(-90));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));
    threeSquares.instructions.push(new Move(25));

    all.square = new Challenge(0, "Square", square);
    all.steps = new Challenge(0, "Steps", steps);
    all.twoSquares = new Challenge(0, "Two squares", twoSquares);
    all.threeSquares = new Challenge(0, "Three squares", threeSquares);


    // Level 2 --------------------------------------

    var octagon = new Block();
    octagon.instructions.push(new SetStyleProperty("color", "#ccccff"));

    var loop = new Loop(8);
    loop.instructions.push(new Move(25));
    loop.instructions.push(new Turn(45));

    octagon.instructions.push(loop);

    var border = new Block();
    border.instructions.push(new SetStyleProperty("color", "#ccccff"));

    var rep = new Loop(8);
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(-90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(-90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(-90));

    border.instructions.push(rep);

    var sawblade = new Block();
    sawblade.instructions.push(new SetStyleProperty("color", "#ccccff"));

    var rep = new Loop(8);
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(-90));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(-135));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(45));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Move(25));
    rep.instructions.push(new Turn(45));

    sawblade.instructions.push(rep);


    var threeDiamonds = new Block();
    threeDiamonds.instructions.push(new SetStyleProperty("color", "#ccccff"));
    threeDiamonds.instructions.push(new Turn(45));

    var diamond = new Loop(4);
    diamond.instructions.push(new Move(25));
    diamond.instructions.push(new Turn(90));

    threeDiamonds.instructions.push(diamond);
    threeDiamonds.instructions.push(new Turn(45));
    threeDiamonds.instructions.push(new Skip(25));
    threeDiamonds.instructions.push(new Turn(-45));
    threeDiamonds.instructions.push(diamond);
    threeDiamonds.instructions.push(new Turn(45));
    threeDiamonds.instructions.push(new Skip(25));
    threeDiamonds.instructions.push(new Turn(-45));
    threeDiamonds.instructions.push(diamond);

    all.octagon = new Challenge(1, "Octagon", octagon, 4);
    all.border = new Challenge(1, "Decorative border", border, 24);
    all.sawblade = new Challenge(1, "Saw blade", sawblade, 16);
    all.threeDiamonds = new Challenge(1, "Three diamonds", threeDiamonds, 15);


    // Level 3 --------------------------------------

    var cookieCutter = new Block();
    cookieCutter.instructions.push(new SetStyleProperty("color", "#ccccff"));

    var segments = new Loop(12);
    segments.instructions.push(new Move(25));
    segments.instructions.push(new Turn(-30));
    segments.instructions.push(new Move(25));
    segments.instructions.push(new Turn(60));

    cookieCutter.instructions.push(segments);

    var stitch = new Block();
    stitch.instructions.push(new SetStyleProperty("color", "#ccccff"));

    stitch.instructions.push(new Turn(90));

    var stitches = new Loop(4);
    stitches.instructions.push(new Move(25));
    stitches.instructions.push(new Turn(-120));
    stitches.instructions.push(new Move(25));
    stitches.instructions.push(new Turn(120));
    stitches.instructions.push(new Move(25));
    stitches.instructions.push(new Move(25));
    stitches.instructions.push(new Turn(120));
    stitches.instructions.push(new Move(25));
    stitches.instructions.push(new Turn(-120));
    stitches.instructions.push(new Move(25));

    stitch.instructions.push(stitches);

    var beads = new Block();
    beads.instructions.push(new SetStyleProperty("color", "#ccccff"));

    beads.instructions.push(new Turn(90));
    beads.instructions.push(new Move(25));
    beads.instructions.push(new Move(25));

    var hex = new Loop(6);
    hex.instructions.push(new Move(25));
    hex.instructions.push(new Turn(60));

    var hexes = new Loop(3);
    hexes.instructions.push(new Turn(-60));
    hexes.instructions.push(hex);
    hexes.instructions.push(new Turn(60));
    hexes.instructions.push(new Skip(25));
    hexes.instructions.push(new Skip(25));
    hexes.instructions.push(new Move(25));

    beads.instructions.push(hexes);
    beads.instructions.push(new Move(25));

    all.cookieCutter = new Challenge(2, "Cookie cutter", cookieCutter, 8);
    all.stitch = new Challenge(2, "Stitch", stitch, 16);
    all.beads = new Challenge(2, "Beads", beads, 15);
    all.threeDiamonds2 = new Challenge(2, "Three diamonds (harder)", threeDiamonds, 10);
    // TODO: Jack-o-lantern

    // Level 4 --------------------------------------

    var reutersvard = new Block();
    reutersvard.instructions.push(new SetStyleProperty("color", "#ccccff"));

    reutersvard.instructions.push(new Turn(30));

    var triangle = new Loop(3);
    triangle.instructions.push(new Move(100));
    triangle.instructions.push(new Turn(120));
    triangle.instructions.push(new Move(140));
    triangle.instructions.push(new Turn(120));
    triangle.instructions.push(new Move(160));
    triangle.instructions.push(new Turn(60));
    triangle.instructions.push(new Move(20));
    triangle.instructions.push(new Turn(60));
    triangle.instructions.push(new Skip(100));
    triangle.instructions.push(new Turn(60));
    triangle.instructions.push(new Skip(40));
    triangle.instructions.push(new Turn(60));

    reutersvard.instructions.push(triangle);


    all.Reutersvard = new Challenge(3, "Reutersvärd triangle", reutersvard, 15);

    // Kilroy!
    // Gear(s): or maybe wait for turn-24 at least and turn-36, etc.
    //          R90 ||:8 D L90 D L90 D R67.5 D R67.5 :||
    //          S S L90 ||:6 D L60 D R90 D R90 D L60 :||


    // Level 5 --------------------------------------

    var pianoKeys = new Block();
    pianoKeys.instructions.push(new SetStyleProperty("color", "#ccccff"));

    var whiteKeys = new Loop(8);
    whiteKeys.instructions.push(new Move(80));
    whiteKeys.instructions.push(new Turn(180));
    whiteKeys.instructions.push(new Skip(80));
    whiteKeys.instructions.push(new Turn(90));
    whiteKeys.instructions.push(new Skip(16));
    whiteKeys.instructions.push(new Turn(90));

    var blackKeys3 = new Loop(3);
    blackKeys3.instructions.push(new Turn(-90));
    blackKeys3.instructions.push(new Move(60));
    blackKeys3.instructions.push(new Turn(180));
    blackKeys3.instructions.push(new Skip(60));
    blackKeys3.instructions.push(new Turn(-90));
    blackKeys3.instructions.push(new Skip(16));

    var blackKeys2 = new Loop(2);
    blackKeys2.instructions.push(new Turn(-90));
    blackKeys2.instructions.push(new Move(60));
    blackKeys2.instructions.push(new Turn(180));
    blackKeys2.instructions.push(new Skip(60));
    blackKeys2.instructions.push(new Turn(-90));
    blackKeys2.instructions.push(new Skip(16));

    pianoKeys.instructions.push(new Turn(90));
    pianoKeys.instructions.push(new Move(128));
    pianoKeys.instructions.push(new Turn(-90));
    pianoKeys.instructions.push(new Move(80));
    pianoKeys.instructions.push(new Turn(-90));
    pianoKeys.instructions.push(new Move(128));
    pianoKeys.instructions.push(new Turn(-90));
    pianoKeys.instructions.push(whiteKeys);
    pianoKeys.instructions.push(new SetStyleProperty("weight", 8));
    pianoKeys.instructions.push(new Turn(90));
    pianoKeys.instructions.push(new Skip(32));
    pianoKeys.instructions.push(blackKeys3);
    pianoKeys.instructions.push(new Skip(16));
    pianoKeys.instructions.push(blackKeys2);

    all.pianoKeys = new Challenge(4, "Piano keys", pianoKeys);

    //TODO three stars RGB, peppermint stick, pinwheel w/ alternating colors


    // Level 6 --------------------------------------

    //TODO frame with Greek border pattern, snowflakes, scale with major/minor hashes

    var diamondChain = new Block();
    diamondChain.instructions.push(new SetStyleProperty("color", "#ccccff"));
    diamondChain.instructions.push(new Turn(45));

    var diamond = new Loop(4);
    diamond.instructions.push(new Move(25));
    diamond.instructions.push(new Turn(90));

    var chain = new Loop(12);
    chain.instructions.push(diamond);
    chain.instructions.push(new Turn(45));
    chain.instructions.push(new Skip(25));
    chain.instructions.push(new Turn(-45));

    diamondChain.instructions.push(chain);

    all.diamondChain = new Challenge(5, "Diamond chain", diamondChain);
    //all.diamondChain.hints.push("A nested repeat: first how many links, then how many sides to the diamond?");


    // Level 7 --------------------------------------

    //TODO pyramid, kite, kite with tail


    // Level 8 --------------------------------------

    //TODO gradient bar, disappearing tube


    // Level 9 --------------------------------------

    //TODO spirograph, flower


    // ----------------------------------------------

    this.byKey = function(key)
    {
        return all[key];
    };

    this.atLevel = function(level)
    {
        var result = [];
        for (var key in all)
            if (all[key].level == level)
                result.push(key);

        return result;
    };
}
var challenges = new Challenges();


