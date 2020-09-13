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

function Starter(x, y, bearing, style)
{
    this.x = x;
    this.y = y;
    this.bearing = bearing;
    this.style = style;
}

function Challenge(level, name, program, starters, limits)
{
    this.level = level;
    this.name = name;
    this.program = program;
    this.starters = starters;
    this.limits = limits;
}

function Challenges()
{
    let all = {};

    // Level 2 --------------------------------------

    let weave = new Block();

    let stitch1 = new Loop(4);
    stitch1.instructions.push(new Move(50));
    stitch1.instructions.push(new Turn(45));
    stitch1.instructions.push(new Move(50));
    stitch1.instructions.push(new Turn(-90));
    stitch1.instructions.push(new Move(50));
    stitch1.instructions.push(new Turn(45));

    let stitch2 = new Loop(4);
    stitch2.instructions.push(new Move(50));
    stitch2.instructions.push(new Turn(45));
    stitch2.instructions.push(new Move(50));
    stitch2.instructions.push(new Turn(-90));
    stitch2.instructions.push(new Move(50));
    stitch2.instructions.push(new Turn(45));

    weave.instructions.push(new SetStyleProperty("color", "#fda"));
    weave.instructions.push(new Turn(90));
    weave.instructions.push(stitch1);
    weave.instructions.push(new Move(50));
    weave.instructions.push(new Turn(90));
    weave.instructions.push(new Skip(40));
    weave.instructions.push(new Turn(90));
    weave.instructions.push(new SetStyleProperty("color", "#fbb"));
    weave.instructions.push(stitch2);
    weave.instructions.push(new Move(50));

    all.weave = new Challenge(1, "Weave", weave, [
            new Starter(0,  0, 90, new Line(3, "#c80")),
            new Starter(0, 40, 90, new Line(3, "#f00"))
        ], [ 14, 14  ]);

    /////////

    let gear = new Block();
    gear.instructions.push(new SetStyleProperty("color", "#ccf"));

    let round = new Loop(8);
    round.instructions.push(new Move(25));
    round.instructions.push(new Turn(-90));
    round.instructions.push(new Move(25));
    round.instructions.push(new Turn(45));
    round.instructions.push(new Move(25));
    round.instructions.push(new Turn(-90));
    round.instructions.push(new Move(25));
    round.instructions.push(new Turn(90));
    round.instructions.push(new Move(25));
    round.instructions.push(new Turn(90));

    let flat = new Loop(8);
    flat.instructions.push(new Move(50));
    flat.instructions.push(new Turn(-90));
    flat.instructions.push(new Move(25));
    flat.instructions.push(new Turn(90));
    flat.instructions.push(new Move(25));
    flat.instructions.push(new Turn(90));
    flat.instructions.push(new Move(25));
    flat.instructions.push(new Turn(-90));

    gear.instructions.push(new Skip(5));
    gear.instructions.push(round);
    gear.instructions.push(new Skip(-5));
    gear.instructions.push(new Turn(-90));
    gear.instructions.push(new Skip(312));
    gear.instructions.push(new Turn(180));
    gear.instructions.push(new SetStyleProperty("color", "#fcc"));
    gear.instructions.push(flat);
    gear.instructions.push(new Move(50));

    all.gear = new Challenge(1, "Gear", gear, [
            new Starter(   0, -5,  0, new Line(2, "#000")),
            new Starter(-312,  0, 90, new Line(2, "#c00"))
        ], [ 15, 15  ]);

    /////////

    let crystals = new Block();
    crystals.instructions.push(new SetStyleProperty("color", "#ccf"));

    let loop1 = new Loop(9);
    loop1.instructions.push(new Move(75));
    loop1.instructions.push(new Turn(45));
    loop1.instructions.push(new Move(25));
    loop1.instructions.push(new Turn(90));
    loop1.instructions.push(new Move(25));
    loop1.instructions.push(new Turn(45));
    loop1.instructions.push(new Move(75));
    loop1.instructions.push(new Turn(180));

    let loop2 = new Loop(8);
    loop2.instructions.push(new Move(75));
    loop2.instructions.push(new Turn(45));
    loop2.instructions.push(new Move(25));
    loop2.instructions.push(new Turn(90));
    loop2.instructions.push(new Move(25));
    loop2.instructions.push(new Turn(45));
    loop2.instructions.push(new Move(75));
    loop2.instructions.push(new Turn(180));

    crystals.instructions.push(loop1);
    crystals.instructions.push(new Turn(-45));
    crystals.instructions.push(new Skip(225));
    crystals.instructions.push(new Turn(-90));
    crystals.instructions.push(new Skip(200));
    crystals.instructions.push(new Turn(135));
    crystals.instructions.push(loop2);

    all.crystals = new Challenge(1, "Crystals", crystals, [
            new Starter(  0,   0, 0, new Line(1, "#080")),
            new Starter(301, -18, 0, new Line(2, "#0c0"))
        ], [ 30, 25 ]);

    /////////

    let picnic = new Block();
    picnic.instructions.push(new SetStyleProperty("color", "#ccccff"));

    let table = new Loop(4);
    table.instructions.push(new Turn(-45));
    table.instructions.push(new Move(75));
    table.instructions.push(new Turn(-135));
    table.instructions.push(new Move(50));
    table.instructions.push(new Turn(-135));
    table.instructions.push(new Move(75));
    table.instructions.push(new Skip(-25));
    table.instructions.push(new Turn(90));
    table.instructions.push(new Skip(25));
    table.instructions.push(new Turn(-135));
    table.instructions.push(new Skip(150));

    let bench = new Loop(8);
    bench.instructions.push(new Turn(90));
    bench.instructions.push(new Move(25));
    bench.instructions.push(new Turn(-90));
    bench.instructions.push(new Move(25));
    bench.instructions.push(new Turn(-90));
    bench.instructions.push(new Move(25));
    bench.instructions.push(new Turn(90));
    bench.instructions.push(new Move(50));

    picnic.instructions.push(new Turn(90));
    picnic.instructions.push(table);
    picnic.instructions.push(new Turn(180));
    picnic.instructions.push(new Skip(32));
    picnic.instructions.push(new Move(50));
    picnic.instructions.push(bench);

    all.picnic = new Challenge(1, "Picnic tables", picnic, [
            new Starter(  0, 0,  45, new Line(2, "#000")),
            new Starter(568, 0, -90, new Line(2, "#000"))
        ]);

    /////////

    let piano = new Block();
    piano.instructions.push(new SetStyleProperty("color", "#ccf"));

    let whiteKeys = new Loop(15);
    whiteKeys.instructions.push(new Move(125));
    whiteKeys.instructions.push(new Turn(180));
    whiteKeys.instructions.push(new Skip(125));
    whiteKeys.instructions.push(new Turn(90));
    whiteKeys.instructions.push(new Skip(25));
    whiteKeys.instructions.push(new Turn(90));

    let blackKeys3 = new Loop(3);
    blackKeys3.instructions.push(new Turn(-90));
    blackKeys3.instructions.push(new Move(75));
    blackKeys3.instructions.push(new Turn(180));
    blackKeys3.instructions.push(new Skip(75));
    blackKeys3.instructions.push(new Turn(-90));
    blackKeys3.instructions.push(new Skip(25));

    let blackKeys2 = new Loop(2);
    blackKeys2.instructions.push(new Turn(-90));
    blackKeys2.instructions.push(new Move(75));
    blackKeys2.instructions.push(new Turn(180));
    blackKeys2.instructions.push(new Skip(75));
    blackKeys2.instructions.push(new Turn(-90));
    blackKeys2.instructions.push(new Skip(25));

    piano.instructions.push(new Turn(90));
    piano.instructions.push(new Move(375));
    piano.instructions.push(new Turn(-90));
    piano.instructions.push(new Move(125));
    piano.instructions.push(new Turn(-90));
    piano.instructions.push(new Move(375));
    piano.instructions.push(new Turn(-90));
    piano.instructions.push(whiteKeys);
    piano.instructions.push(new SetStyleProperty("weight", 12));
    piano.instructions.push(new Turn(90));
    piano.instructions.push(new Skip(50));
    piano.instructions.push(blackKeys3);
    piano.instructions.push(new Skip(25));
    piano.instructions.push(blackKeys2);
    piano.instructions.push(new Skip(25));
    piano.instructions.push(blackKeys3);
    piano.instructions.push(new Skip(25));
    piano.instructions.push(blackKeys2);

    all.piano = new Challenge(1, "Piano keys", piano, [
            new Starter( 0,    0, 90, new Line( 2, "#000")),
            new Starter(25, -125, 90, new Line(12, "#000"))
        ], [ 15, 30 ]);

    /////////

    let pingPong = new Block();
    let thick = 8;
    pingPong.instructions.push(new SetStyleProperty("color", "#ccccff"));

    pingPong.instructions.push(new Skip(100));
    pingPong.instructions.push(new Turn(90));
    pingPong.instructions.push(new Move(250));
    pingPong.instructions.push(new Turn(-90));
    pingPong.instructions.push(new SetStyleProperty("weight", thick));
    pingPong.instructions.push(new Move(25));
    pingPong.instructions.push(new SetStyleProperty("weight", 2));
    pingPong.instructions.push(new Turn(-60));
    pingPong.instructions.push(new Move(100));
    pingPong.instructions.push(new Turn(-120));
    pingPong.instructions.push(new SetStyleProperty("weight", thick));
    pingPong.instructions.push(new Move(25));
    pingPong.instructions.push(new SetStyleProperty("weight", 2));
    pingPong.instructions.push(new Turn(-60));
    pingPong.instructions.push(new Move(100));
    pingPong.instructions.push(new Turn(-30));
    pingPong.instructions.push(new Move(250));
    pingPong.instructions.push(new Turn(-150));
    pingPong.instructions.push(new Move(100));
    pingPong.instructions.push(new Turn(-30));
    pingPong.instructions.push(new Move(500));
    pingPong.instructions.push(new Turn(-150));
    pingPong.instructions.push(new Move(50));
    pingPong.instructions.push(new Turn(-30));
    pingPong.instructions.push(new Move(500));
    pingPong.instructions.push(new Skip(-500));
    pingPong.instructions.push(new Turn(30));
    pingPong.instructions.push(new Move(50));
    pingPong.instructions.push(new Turn(-30));

    pingPong.instructions.push(new Skip(75));
    pingPong.instructions.push(new Turn(90));
    pingPong.instructions.push(new Skip(100));
    pingPong.instructions.push(new Turn(180));
    pingPong.instructions.push(new SetStyleProperty("weight", thick));
    pingPong.instructions.push(new Move(100));
    pingPong.instructions.push(new Skip(-100));
    pingPong.instructions.push(new Turn(-60));
    pingPong.instructions.push(new Skip(50));
    pingPong.instructions.push(new Turn(60));
    pingPong.instructions.push(new Move(75));
    pingPong.instructions.push(new Skip(-75));
    pingPong.instructions.push(new Turn(-60));
    pingPong.instructions.push(new Skip(-50));
    pingPong.instructions.push(new Turn(150));
    pingPong.instructions.push(new Skip(350));
    pingPong.instructions.push(new Turn(-90));
    pingPong.instructions.push(new Move(100));
    pingPong.instructions.push(new Skip(-100));
    pingPong.instructions.push(new Turn(-60));
    pingPong.instructions.push(new Skip(50));
    pingPong.instructions.push(new Turn(60));
    pingPong.instructions.push(new Move(75));

    all.pingPong = new Challenge(2, "Ping-pong table", pingPong, [
            new Starter( 0, 0, 0, new Line(2, "#000")),
            new Starter(75, 0, 0, new Line(thick, "#000"))
        ]);

    // Level 3 --------------------------------------

    let gears = new Block();

    let leftGear = new Loop(8);
    leftGear.instructions.push(new Move(25));
    leftGear.instructions.push(new Turn(-90));
    leftGear.instructions.push(new Move(25));
    leftGear.instructions.push(new Turn(67.5));
    leftGear.instructions.push(new Move(25));
    leftGear.instructions.push(new Turn(67.5));
    leftGear.instructions.push(new Move(25));
    leftGear.instructions.push(new Turn(-90));

    let rightGear = new Loop(6);
    rightGear.instructions.push(new Move(25));
    rightGear.instructions.push(new Turn(-60));
    rightGear.instructions.push(new Move(25));
    rightGear.instructions.push(new Turn(90));
    rightGear.instructions.push(new Move(25));
    rightGear.instructions.push(new Turn(90));
    rightGear.instructions.push(new Move(25));
    rightGear.instructions.push(new Turn(-60));

    gears.instructions.push(new SetStyleProperty("color", "#ccf"));
    gears.instructions.push(leftGear);
    gears.instructions.push(new Turn(90));
    gears.instructions.push(new Skip(5));
    gears.instructions.push(new Turn(-90));
    gears.instructions.push(new SetStyleProperty("color", "#fcc"));
    gears.instructions.push(rightGear);

    all.gears = new Challenge(2, "Gears", gears, [
            new Starter(0, 0, 0, new Line(2, "#000")),
            new Starter(5, 0, 0, new Line(2, "#800"))
        ], [ 10, 10 ]);

    let fancy = new Block();

    let oneFiligree = new Loop(8);
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(45));
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(60));
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(150));
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(60));
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(45));
    oneFiligree.instructions.push(new Move(25));
    oneFiligree.instructions.push(new Turn(-45));

    let filigree = new Loop(16);
    filigree.instructions.push(new Move(100));
    filigree.instructions.push(new Turn(112.5));

    let threeFiligrees = new Loop(3);
    threeFiligrees.instructions.push(filigree);
    threeFiligrees.instructions.push(new Turn(90));
    threeFiligrees.instructions.push(new Skip(200));
    threeFiligrees.instructions.push(new Turn(-90));

    fancy.instructions.push(new SetStyleProperty("color", "#ccc"));
    fancy.instructions.push(oneFiligree);
    fancy.instructions.push(new Turn(-90));
    fancy.instructions.push(new Skip(321));
    fancy.instructions.push(new Turn(90));
    fancy.instructions.push(new Skip(-15));
    fancy.instructions.push(new SetStyleProperty("color", "#eca"));
    fancy.instructions.push(threeFiligrees);

    all.fancy = new Challenge(2, "Fancy", fancy, [
            new Starter(-321, 15, 0, new Line(2, "#f80")),
            new Starter(   0,  0, 0, new Line(2, "#080"))
        ], [ 100, 100 ]);

    let herringbone = new Block();
    let columns = 4;

    let sliverLeft = new Loop(2);
    sliverLeft.instructions.push(new Move(25));
    sliverLeft.instructions.push(new Turn(-120));
    sliverLeft.instructions.push(new Move(50));
    sliverLeft.instructions.push(new Turn(-60));

    let columnLeft = new Loop(6);
    columnLeft.instructions.push(new Turn(60));
    columnLeft.instructions.push(sliverLeft);
    columnLeft.instructions.push(new Turn(-60));
    columnLeft.instructions.push(new Skip(25));

    let leftwise = new Loop(columns);
    leftwise.instructions.push(columnLeft);
    leftwise.instructions.push(new Skip(-100));
    leftwise.instructions.push(new Turn(120));
    leftwise.instructions.push(new Skip(100));
    leftwise.instructions.push(new Turn(-120));

    herringbone.instructions.push(new SetStyleProperty("color", "#fcc"));
    herringbone.instructions.push(leftwise);
    herringbone.instructions.push(new Turn(-60));
    herringbone.instructions.push(new Skip(columns * 50));
    herringbone.instructions.push(new Turn(-60));
    herringbone.instructions.push(new Skip(columns * 50 - 25));
    herringbone.instructions.push(new Turn(120));

    let sliverRight = new Loop(2);
    sliverRight.instructions.push(new Move(25));
    sliverRight.instructions.push(new Turn(120));
    sliverRight.instructions.push(new Move(50));
    sliverRight.instructions.push(new Turn(60));

    let columnRight = new Loop(6);
    columnRight.instructions.push(new Turn(-60));
    columnRight.instructions.push(sliverRight);
    columnRight.instructions.push(new Turn(60));
    columnRight.instructions.push(new Skip(25));

    let rightwise = new Loop(columns);
    rightwise.instructions.push(columnRight);
    rightwise.instructions.push(new Skip(-100));
    rightwise.instructions.push(new Turn(120));
    rightwise.instructions.push(new Skip(100));
    rightwise.instructions.push(new Turn(-120));

    herringbone.instructions.push(new SetStyleProperty("color", "#fcf"));
    herringbone.instructions.push(rightwise);

    all.herringbone = new Challenge(2, "Herringbone", herringbone, [
            new Starter( 0  ,   0  , 0, new Line(2, "#f00")),
            new Starter(21.6, -12.5, 0, new Line(2, "#c0c"))
        ], [ 20, 20 ]);

    let hexes = new Block();

    let hex = new Loop(5);
    hex.instructions.push(new Move(50));
    hex.instructions.push(new Turn(60));

    let row8 = new Loop(8);
    row8.instructions.push(hex);
    row8.instructions.push(new Turn(60));
    row8.instructions.push(new Skip(100));

    let row7 = new Loop(7);
    row7.instructions.push(hex);
    row7.instructions.push(new Turn(60));
    row7.instructions.push(new Skip(100));

    hexes.instructions.push(new SetStyleProperty("color", "#cee"));
    hexes.instructions.push(new Move(50));
    hexes.instructions.push(new Turn(60));
    hexes.instructions.push(row8);

    hexes.instructions.push(new SetStyleProperty("color", "#fea"));
    hexes.instructions.push(new SetStyleProperty("weight", 2));
    hexes.instructions.push(new Turn(-150));
    hexes.instructions.push(new Skip(43));
    hexes.instructions.push(new Turn(-90));
    hexes.instructions.push(new Move(50));
    hexes.instructions.push(new Turn(60));
    hexes.instructions.push(row7);

    all.hexes = new Challenge(2, "Hexes", hexes, [
            new Starter(  0, 0, 0, new Line(12, "#0cc")),
            new Starter(650, 0, 0, new Line(12, "#f80"))
        ], [ 15, 15 ]);

/*
    let birds = new Block();

    let bird = new Loop(1);
    bird.instructions.push(new Turn(15));
    bird.instructions.push(new Move(30));
    bird.instructions.push(new Turn(45));
    bird.instructions.push(new Move(90));
    bird.instructions.push(new Turn(-45));
    bird.instructions.push(new Move(30));
    bird.instructions.push(new Turn(-105));
    bird.instructions.push(new Move(50));
    bird.instructions.push(new Turn (90));
    bird.instructions.push(new Move(50));

    birds.instructions.push(new SetStyleProperty("color", "#000"));
    birds.instructions.push(new Turn(90));
    birds.instructions.push(bird);

    all.birds = new Challenge(1, "Birds", birds, [
            new Starter(0, 0, 0, new Line(2, "#000")),
            new Starter(0, 0, 0, new Line(2, "#000"))
        ], [ 1, 1 ]);

    use transparency?
    bricks
    Escher birds/fish
    text

    level 5?
    honeycomb with every other hex filled in
    checkerboard + dots
*/
/*
    all.template = new Challenge(1, "Template", template, [
            new Starter(0, 0, 0, new Line(2, "#000")),
            new Starter(0, 0, 0, new Line(2, "#000"))
        ], [ ***limits*** ]);

    let template = new Block();
    template.instructions.push(new SetStyleProperty("color", "#ccf"));

    all.template = new Challenge(1, "Template", template, [
            new Starter(0, 0, 0, new Line(2, "#000")),
            new Starter(0, 0, 0, new Line(2, "#000"))
        ], [ ***limits*** ]);

*/
    // ----------------------------------------------

    this.byKey = function(key)
    {
        return all[key];
    };

    this.atLevel = function(level)
    {
        let result = [];
        for (let key in all)
            if (all[key].level == level)
                result.push(key);

        return result;
    };
}
let challenges = new Challenges();


