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
 * Drawing gallery.
 */

/* Depends on
 *   Drawing.js
 *   Instructions.js
 *   InstructionUI.js
 */



function Gallery()
{
    var all = {};

    all.fiveSquares =
      {
        name: "Five squares",
        work:
        {
          lvl: 0,
          level: "Draw1Skip1TurnLR",
          drawing: {"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}]}
        }
      };

    all.spiral =
      {
        name: "Spiral",
        work:
        {
          lvl: 0,
          level: "Draw1Skip1TurnLR",
          drawing:
          {
            "instructions":
            [
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"turnRight","delegate":{"degrees":90}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"move1","delegate":{"distance":25}},
              {"name":"","delegate":null}
            ]
          }
        }
      };

    all.TTT =
      {
        name: "Tic-tac-toe",
        work:
        {
          lvl: 0,
          level: "Draw1Skip1TurnLR",
          drawing: {"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnLeft","delegate":{"degrees":-90}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnLeft","delegate":{"degrees":-90}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnLeft","delegate":{"degrees":-90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}]}
        }
      };

    all.HELLO =
    {
      name: "Hello, Sprout!",
      work:
      {
        lvl: 0,
        level: "Draw1Skip1TurnLR",
        drawing:
        {
          "instructions":
          [
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnLeft","delegate":{"degrees":-90}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"turnRight","delegate":{"degrees":90}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"move1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"skip1","delegate":{"distance":25}},
            {"name":"","delegate":null}
          ]
        }
      }
    };

    //TODO remove
    all.Hi3G =
      {
        name: "Hi 3G",
        work:
        {
          lvl: 0,
          level: "Draw1Skip1TurnLR",
          drawing: {"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turnRight","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}]}
        }
      };

    all.cube =
      {
        name: "Cube",
        work:
        {
          lvl: 1,
          level: "Draw1Skip1Turn8Repeat",
          drawing: {"instructions":[{"name":"turn8","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":135}},{"name":"skip1","delegate":{"distance":25}},{"name":"skip1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}]}
        }
      };

    all.star =
      {
        name: "Star",
        work:
        {
          lvl: 1,
          level: "Draw1Skip1Turn8Repeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"turn8","delegate":{"degrees":-135}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}]}
        }
      };

    all.frame =
      {
        name: "Frame",
        work:
        {
          lvl: 1,
          level: "Draw1Skip1Turn8Repeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":45}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}]}
        }
      };

    all.fan =
      {
        name: "Fan",
        work:
        {
          lvl: 1,
          level: "Draw1Skip1Turn8Repeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn8","delegate":{"degrees":-135}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}]}
        }
      };

    all.triangles =
    {
      name: "Triangles",
      work:
      {
        lvl: 2,
        level: "Draw1Skip1Turn16Repeat",
        drawing: {"instructions":[{"name":"turn16","delegate":{"degrees":-30}},{"name":"loop","delegate":{"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":-120}},{"name":"","delegate":null}],"count":3}},{"name":"skip","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":-60}},{"name":"loop","delegate":{"instructions":[{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"move1","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":-120}},{"name":"","delegate":null}],"count":3}},{"name":"","delegate":null}]}
      }
    };

    all.honeycomb =
    {
      name: "Honeycomb",
      work:
      {
        lvl: 2,
        level: "Draw1Skip1Turn16Repeat",
        drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"skip","delegate":{"distance":25}},{"name":"loop","delegate":{"instructions":[{"name":"turn16","delegate":{"degrees":60}},{"name":"move1","delegate":{"distance":25}},{"name":"","delegate":null}],"count":5}},{"name":"turn16","delegate":{"degrees":180}},{"name":"skip","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":-60}},{"name":"","delegate":null}],"count":6}},{"name":"","delegate":null}]}
      }
    };

    all.sixteenStars =
    {
      name: "16 stars",
      work:
      {
        lvl: 2,
        level: "Draw1Skip1Turn16Repeat",
        drawing:
        {
          "instructions":
          [
              {
                "name":"loop",
                "delegate":
                {
                  "instructions":
                  [
                   {"name":"turn16","delegate":{"degrees":157.5}},
                   {"name":"loop","delegate":
                     {
                       "instructions":
                       [
                         {"name":"turn16","delegate":{"degrees":144}},
                         {"name":"move1","delegate":{"distance":25}},
                         {"name":"move1","delegate":{"distance":25}},
                         {"name":"move1","delegate":{"distance":25}},
                         {"name":"move1","delegate":{"distance":25}},
                         {"name":"move1","delegate":{"distance":25}}
                       ],
                       "count":5
                     }
                   },
                    {"name":"","delegate":null}
                  ],
                  "count":16
                }
              },
              {"name":"","delegate":null}
          ]
        }
      }
    };

    all.house =
      {
        name: "House",
        work:
        {
          lvl: 3,
          level: "DrawSkipTurn16Repeat",
          drawing: {"instructions":[{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":300}},{"name":"turn8","delegate":{"degrees":180}},{"name":"skip","delegate":{"distance":240}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":100}},{"name":"turn8","delegate":{"degrees":-135}},{"name":"skip","delegate":{"distance":15}},{"name":"turn8","delegate":{"degrees":180}},{"name":"move","delegate":{"distance":100}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":100}},{"name":"turn8","delegate":{"degrees":180}},{"name":"skip","delegate":{"distance":15}},{"name":"turn8","delegate":{"degrees":-135}},{"name":"move","delegate":{"distance":100}},{"name":"turn8","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":30}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":40}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"move","delegate":{"distance":20}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"move","delegate":{"distance":40}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"skip","delegate":{"distance":5}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"skip","delegate":{"distance":16}},{"name":"move","delegate":{"distance":2}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"skip","delegate":{"distance":30}},{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":22}},{"name":"turn8","delegate":{"degrees":90}},{"name":"","delegate":null}],"count":4}},{"name":"skip","delegate":{"distance":11}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":22}},{"name":"turn8","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":11}},{"name":"turn8","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":11}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":22}},{"name":"turn8","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":36}},{"name":"","delegate":null}],"count":3}},{"name":"turn8","delegate":{"degrees":180}},{"name":"skip","delegate":{"distance":88}},{"name":"move","delegate":{"distance":20}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"move","delegate":{"distance":2}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":2}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":14}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":2}},{"name":"turn8","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":2}},{"name":"turn8","delegate":{"degrees":-90}},{"name":"move","delegate":{"distance":31}},{"name":"","delegate":null}]}
        }
      };
/*
    all.reutensvard =
      {
        name: "Reutensvard triangle",
        work:
        {
          lvl: 3,
          level: "DrawSkipTurn16Repeat",
          drawing: {"instructions":[{"name":"turn16","delegate":{"degrees":30}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":120}},{"name":"move","delegate":{"distance":140}},{"name":"turn16","delegate":{"degrees":120}},{"name":"move","delegate":{"distance":160}},{"name":"turn16","delegate":{"degrees":60}},{"name":"move","delegate":{"distance":20}},{"name":"turn16","delegate":{"degrees":60}},{"name":"skip","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":60}},{"name":"skip","delegate":{"distance":40}},{"name":"turn16","delegate":{"degrees":60}},{"name":"","delegate":null}],"count":3}},{"name":"","delegate":null}]}
        }
      };
*/
    all.staircase =
      {
        name: "Staircase",
        work:
        {
          lvl: 3,
          level: "DrawSkipTurn16Repeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":90}},{"name":"","delegate":null}],"count":2}},{"name":"skip","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":67.5}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":20}},{"name":"turn16","delegate":{"degrees":22.5}},{"name":"skip","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":157.5}},{"name":"","delegate":null}],"count":2}},{"name":"skip","delegate":{"distance":20}},{"name":"turn16","delegate":{"degrees":-67.5}},{"name":"","delegate":null}],"count":6}},{"name":"turn16","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":100}},{"name":"turn16","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":150}},{"name":"turn16","delegate":{"degrees":67.5}},{"name":"move","delegate":{"distance":120}},{"name":"","delegate":null}]}
        }
      };

    all.purpleFlower =
      {
        name: "Purple flower",
        work:
        {
          lvl: 4,
          level: "DrawSkipTurn16SetWidthSetColorRepeat",
          drawing: {"instructions":[{"name":"setColorSelect","delegate":{"name":"color","value":"#00c000"}},{"name":"setWidth","delegate":{"name":"weight","value":3}},{"name":"move","delegate":{"distance":100}},{"name":"turn8","delegate":{"degrees":180}},{"name":"skip","delegate":{"distance":16}},{"name":"turn8","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":16}},{"name":"turn8","delegate":{"degrees":90}},{"name":"setColorSelect","delegate":{"name":"color","value":"#cc00cc"}},{"name":"setWidth","delegate":{"name":"weight","value":5}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":80}},{"name":"turn8","delegate":{"degrees":135}},{"name":"","delegate":null}],"count":8}},{"name":"move","delegate":{"distance":35}},{"name":"","delegate":null}]}
        }
      };

    all.blueAndGreenFlower =
      {
        name: "Blue-and-green flower",
        work:
        {
          lvl: 4,
          level: "DrawSkipTurn16SetWidthSetColorRepeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"setColorSelect","delegate":{"name":"color","value":"#00c000"}},{"name":"setWidth","delegate":{"name":"weight","value":3}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":60}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":60}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":60}},{"name":"setColorSelect","delegate":{"name":"color","value":"#0000ff"}},{"name":"setWidth","delegate":{"name":"weight","value":2}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":60}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":60}},{"name":"move","delegate":{"distance":50}},{"name":"turn16","delegate":{"degrees":22.5}},{"name":"","delegate":null}],"count":10}},{"name":"","delegate":null}]}
        }
      };

    all.wagonWheel =
    {
      name: "Wagon wheel",
      work:
      {
        lvl: 5,
        level: "DrawSkipTurn16SetWidthSetColorNestedRepeat",
        drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"setWidth","delegate":{"name":"weight","value":4}},{"name":"setColorSelect","delegate":{"name":"color","value":"#000000"}},{"name":"move","delegate":{"distance":20}},{"name":"sprout","delegate":{"instructions":[{"name":"setWidth","delegate":{"name":"weight","value":2}},{"name":"setColorSelect","delegate":{"name":"color","value":"#ff9900"}},{"name":"turn16","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":90}},{"name":"","delegate":null}],"resetInstruction":{"name":"reset","delegate":{"flag":"flag"}}}},{"name":"move","delegate":{"distance":20}},{"name":"turn16","delegate":{"degrees":22.5}},{"name":"","delegate":null}],"count":16}},{"name":"skip","delegate":{"distance":20}},{"name":"turn16","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":91}},{"name":"turn16","delegate":{"degrees":90}},{"name":"skip","delegate":{"distance":2}},{"name":"turn16","delegate":{"degrees":180}},{"name":"setWidth","delegate":{"name":"weight","value":6}},{"name":"setColorSelect","delegate":{"name":"color","value":"#a00000"}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":4}},{"name":"turn16","delegate":{"degrees":22.5}},{"name":"","delegate":null}],"count":16}},{"name":"","delegate":null}]}
      }
    };

    all.wreath =
      {
        name: "Wreath",
        work:
        {
          lvl: 5,
          level: "DrawSkipTurn16SetWidthSetColorNestedRepeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":20}},{"name":"turn","delegate":{"degrees":90}},{"name":"move","delegate":{"distance":20}},{"name":"turn","delegate":{"degrees":-45}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":100}},{"name":"turn","delegate":{"degrees":-135}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":80}},{"name":"turn","delegate":{"degrees":-135}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}],"count":8}},{"name":"","delegate":null}]}
        }
      };

    all.CCLogo =
      {
        name: "Logo",
        work:
        {
          lvl: 6,
          level: "DrawSkipTurn16SetWidthSetColorNestedRepeat",
          drawing:
          {
            "instructions":
            [
              {
                "name":"loop",
                "delegate":
                {
                  "instructions":
                  [
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#ff0000"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":60}},
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#f48c00"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":60}},
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#dcdc00"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":60}},
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#00ff00"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":60}},
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#0000ff"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":60}},
                    {"name":"setColorSelect","delegate":{"name":"color","value":"#ff00f4"}},
                    {"name":"move","delegate":{"distance":50}},
                    {"name":"turn16","delegate":{"degrees":120}},
                    {"name":"skip","delegate":{"distance":90}},
                    {"name":"","delegate":null}
                  ],
                  "count":6
                }
              },
              {"name":"","delegate":null}
            ]
          }
        }
      };

    all.web =
      {
        name: "Web",
        work:
        {
          lvl: 7,
          level: "DrawSkipTurn16SetAndAdjustWidthAndColorNestedRepeat",
          drawing: {"instructions":[{"name":"setColorRGB","delegate":{"name":"color","value":"#a00000"}},{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":25}},{"name":"turn16","delegate":{"degrees":45}},{"name":"","delegate":null}],"count":8}},{"name":"turn16","delegate":{"degrees":30}},{"name":"adjustColor","delegate":{"redIncrement":-12,"greenIncrement":12,"blueIncrement":12}},{"name":"","delegate":null}],"count":12}},{"name":"","delegate":null}]}
        }
      };

    all.octagons =
      {
        name: "Octagon tube",
        work:
        {
          lvl: 7,
          level: "DrawSkipTurn16SetAndAdjustWidthAndColorNestedRepeat",
          drawing: {"instructions":[{"name":"setColor","delegate":{"name":"color","value":"#a00000"}},{"name":"turn","delegate":{"degrees":90}},{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":50}},{"name":"turn","delegate":{"degrees":45}},{"name":"","delegate":null}],"count":8}},{"name":"skip","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":0,"greenIncrement":1,"blueIncrement":0}},{"name":"","delegate":null}],"count":255}},{"name":"","delegate":null}]}
        }
      };

    all.squares =
      {
        name: "Squares",
        work:
        {
          lvl: 8,
          level: "DrawSkipTurn36SetAndAdjustWidthAndColorNestedRepeat",
          drawing: {"instructions":[{"name":"setColor","delegate":{"name":"color","value":"#0000ff"}},{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":100}},{"name":"turn","delegate":{"degrees":-90}},{"name":"","delegate":null}],"count":4}},{"name":"turn","delegate":{"degrees":-10}},{"name":"","delegate":null}],"count":36}},{"name":"","delegate":null}]}
        }
      };

    all.spirograph =
      {
        name: "Spirograph",
        work:
        {
          lvl: 8,
          level: "DrawSkipTurn36SetAndAdjustWidthAndColorNestedRepeat",
          drawing: {"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":100}},{"name":"turn","delegate":{"degrees":-75}},{"name":"","delegate":null}],"count":36}},{"name":"setColor","delegate":{"name":"color","value":"#00c000"}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":92}},{"name":"turn","delegate":{"degrees":-70}},{"name":"","delegate":null}],"count":36}},{"name":"","delegate":null}]}
        }
      };

    all.colorWheel =
    {
      name: "Color wheel",
      work:
      {
        lvl: 8,
        level: "DrawSkipTurn36SetAndAdjustWidthAndColorNestedRepeat",
        drawing: {"instructions":[{"name":"setWidth","delegate":{"name":"weight","value":6}},{"name":"setColorRGB","delegate":{"name":"color","value":"#ff0000"}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":0,"greenIncrement":4,"blueIncrement":0}},{"name":"","delegate":null}],"count":60}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":-4,"greenIncrement":0,"blueIncrement":0}},{"name":"","delegate":null}],"count":60}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":0,"greenIncrement":0,"blueIncrement":4}},{"name":"","delegate":null}],"count":60}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":0,"greenIncrement":-4,"blueIncrement":0}},{"name":"","delegate":null}],"count":60}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":4,"greenIncrement":0,"blueIncrement":0}},{"name":"","delegate":null}],"count":60}},{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-144}},{"name":"turn36","delegate":{"degrees":45}},{"name":"turn36","delegate":{"degrees":100}},{"name":"move","delegate":{"distance":1}},{"name":"adjustColor","delegate":{"redIncrement":0,"greenIncrement":0,"blueIncrement":-4}},{"name":"","delegate":null}],"count":60}},{"name":"","delegate":null}]}
      }
    };

    all.vine =
    {
      name: "Vine",
      work:
      {
        lvl: 8,
        level: "DrawSkipTurn36SetAndAdjustWidthAndColorNestedRepeat",
        drawing: {"instructions":[{"name":"turn36","delegate":{"degrees":60}},{"name":"setWidth","delegate":{"name":"weight","value":5}},{"name":"setColorRGB","delegate":{"name":"color","value":"#00a000"}},{"name":"loop","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":5}},{"name":"turn36","delegate":{"degrees":10}},{"name":"","delegate":null}],"count":3}},{"name":"adjustWidth","delegate":{"name":"weight","increment":-0.15}},{"name":"sprout","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":-22.5}},{"name":"move","delegate":{"distance":10}},{"name":"","delegate":null}],"count":3}},{"name":"","delegate":null}],"resetInstruction":{"name":"reset","delegate":{"flag":"flag"}}}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":5}},{"name":"turn36","delegate":{"degrees":10}},{"name":"","delegate":null}],"count":3}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":5}},{"name":"turn36","delegate":{"degrees":-10}},{"name":"","delegate":null}],"count":3}},{"name":"adjustWidth","delegate":{"name":"weight","increment":-0.15}},{"name":"sprout","delegate":{"instructions":[{"name":"loop","delegate":{"instructions":[{"name":"turn36","delegate":{"degrees":22.5}},{"name":"move","delegate":{"distance":10}},{"name":"","delegate":null}],"count":3}},{"name":"","delegate":null}],"resetInstruction":{"name":"reset","delegate":{"flag":"flag"}}}},{"name":"loop","delegate":{"instructions":[{"name":"move","delegate":{"distance":5}},{"name":"turn36","delegate":{"degrees":-10}},{"name":"","delegate":null}],"count":3}},{"name":"","delegate":null}],"count":10}},{"name":"","delegate":null}]}
      }
    };


    this.byKey = function(key)
    {
        return all[key];
    };

    this.atLevel = function(level)
    {
        var result = [];
        for (var key in all)
            if (all[key].work.lvl == level)
                result.push(key);

        return result;
    };
}
var gallery = new Gallery();

function reifyBlock(block)
{
    for (var i = 0; i < block.instructions.length; ++i)
    {
        var wrapper = block.instructions[i];
        if (wrapper.name != "")
        {
            wrapper.delegate = createInstruction(wrapper);
            if (wrapper.delegate.hasOwnProperty("instructions"))
                reifyBlock(wrapper.delegate);
        }
    }
}

function initDrawing(canvas, source)
{
    var workOfArt = new Block();
    for (var i = 0; i < source.length; ++i)
        workOfArt.instructions.push(createWrapper(source[i]));
    reifyBlock(workOfArt);

    var context = new Context
        (new Drawing(), new Line(1, "#000000"), 0, 0, 0);
    workOfArt.execute(context);

    var calculator = new BoundsCalculator();
    context.drawing.draw(calculator);

    var scale = 1;
    var xTranslate = 0;
    var yTranslate = 0;

    var drawingWidth = calculator.xMax - calculator.xMin;
    var drawingHeight = calculator.yMax - calculator.yMin;
    if (drawingWidth > canvas.width || drawingHeight > canvas.height)
        scale = Math.min(canvas.width / drawingWidth, canvas.height
                / drawingHeight);
    xTranslate = (canvas.width / scale - calculator.xMax - calculator.xMin) / 2;
    yTranslate = (canvas.height / scale - calculator.yMax - calculator.yMin) / 2;

    var twoDContext = canvas.getContext("2d");
    twoDContext.scale(scale, scale);
    twoDContext.translate(xTranslate, yTranslate);

    return context;
}

function galleryDrawing(key)
{
    var canvas = byID(key);
    initDrawing(canvas, gallery.byKey(key).work.drawing.instructions)
        .drawing.draw(canvas);
}

/** Assumes that every <canvas> on the page is a sample,
 *  with ID to match some gallery key. For use in help pages.
 */
function drawSamples()
{
  var canvases = byTag("canvas");
  for (var i = 0; i < canvases.length; ++i)
      galleryDrawing(canvases[i].id);
}

