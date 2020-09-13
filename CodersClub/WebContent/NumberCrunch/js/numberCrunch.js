import { PYTHON } from "../../js/coding.js";
import { JAVASCRIPT } from "../../js/coding.js";
import { PYTHON_CHEAT } from "../../js/coding.js";
import { JAVASCRIPT_CHEAT } from "../../js/coding.js";
import { Output } from "../../js/coding.js";
import { PythonRunner } from "../../js/coding.js";
import { JavaScriptRunner } from "../../js/coding.js";
import { CodingPage } from "../../js/coding.js";

export const pageSequence = [
  { name: "index.html" },
  { name: "Variables.html" },
  { name: "Operators.html" },
  { name: "SumOf3.html" },         // 1
  { name: "Random.html" },
  { name: "CodeAssist.html" },
  { name: "CutCopyPaste.html" },
  { name: "SumOf3Random.html" },   // 2
  { name: "Conditionals.html" },
  { name: "OneOrTwoDigits.html" }, // 3
  { name: "SecondsPerWeek.html" }, // 4
  { name: "HowManyKids.html" },    // 5

  { name: "RepeatNTimes.html" },
  { name: "Squares.html" },        // 6
  { name: "RepeatUntil.html" },
  { name: "SquaresTo1000.html" },  // 7
  { name: "SumOfSquares.html" },   // 8
  { name: "Factorials.html" },     // 9
  { name: "Honeycomb.html" },      //10
  { name: "Fibonacci.html" },      //11

  { name: "Modulus.html" },
  { name: "Quotients.html" },
  { name: "HoursMinutesSeconds.html" },
  { name: "MakingChange.html" },   //12
  { name: "ForLoop.html" },
  { name: "NestingLoops.html" },
  { name: "LoopsAndConditionals.html" },
  { name: "Factors.html" },        //13
  { name: "Primes.html" },         //14

  { name: "Procedures.html" },
  { name: "Digits.html" },
  { name: "Square.html" },
  { name: "Triangular.html" },
  { name: "Functions.html" },
  { name: "Circles.html" },
  { name: "Cylinders.html" },

  { name: "Arrays.html" },
  { name: "Arrays2.html" },
  { name: "Roll1Die.html" },
  { name: "Roll2Dice.html" },
  { name: "Yahtzee.html" },
  { name: "Yahtzee1.html" },
  { name: "Yahtzee2.html" }
/*
  { name: "Recursion.html" },
  { name: "Exponents.html" },
  { name: "BinaryEncoder.html" },
  { name: "BinaryDecoder.html" },
  { name: "FactorTree.html" },
  { name: "GCF.html" },
  { name: "Money.html" },
  { name: "LowestAndHighest.html" },
  { name: "BattingOrder.html" }
*/
];

export const cheatSheets = new Map();

cheatSheets.set(PYTHON, [ {
      name: "index.html",
      phrases: [ PYTHON_CHEAT.PRINT, PYTHON_CHEAT.PRINT_LINE ]
    }, {
      name: "Variables.html",
      phrases: [ PYTHON_CHEAT.VARIABLE ]
    }, {
      name: "Random.html",
      phrases: [ PYTHON_CHEAT.RANDOM ]
    }, {
      name: "Conditionals.html",
      phrases: [ PYTHON_CHEAT.IF ]
    }, {
      name: "RepeatNTimes.html",
      phrases: [ PYTHON_CHEAT.FOR_MtoN, PYTHON_CHEAT.FOR_1toN ]
    }, {
      name: "RepeatUntil.html",
      phrases: [ PYTHON_CHEAT.WHILE ]
    }, {
      name: "Procedures.html",
      phrases: [ PYTHON_CHEAT.FUNCTION, PYTHON_CHEAT.CALL ]
    }, {
      name: "Arrays.html", //NYI
      phrases: [ PYTHON_CHEAT.ARRAY ]
    }
  ]);

cheatSheets.set(JAVASCRIPT, [ {
      name: "index.html",
      phrases: [ JAVASCRIPT_CHEAT.PRINT, JAVASCRIPT_CHEAT.PRINT_LINE ]
    }, {
      name: "Variables.html",
      phrases: [ JAVASCRIPT_CHEAT.VARIABLE_NUMBER ]
    }, {
      name: "Random.html",
      phrases: [ JAVASCRIPT_CHEAT.RANDOM ]
    }, {
      name: "Conditionals.html",
      phrases: [ JAVASCRIPT_CHEAT.IF ]
    }, {
      name: "RepeatNTimes.html",
      phrases: [ JAVASCRIPT_CHEAT.FOR_1toN ]
    }, {
      name: "RepeatUntil.html",
      phrases: [ JAVASCRIPT_CHEAT.WHILE ]
    }, {
      name: "Procedures.html",
      phrases: [ JAVASCRIPT_CHEAT.FUNCTION, JAVASCRIPT_CHEAT.CALL ]
    }, {
      name: "Arrays.html", //NYI
      phrases: [ JAVASCRIPT_CHEAT.ARRAY ]
    }
  ]);

export class Page extends CodingPage {

  constructor(heading, shouldSaveWork, answer) {
    super("Number Crunch", heading, shouldSaveWork, answer);
  }

  setupNextAndBack(next, back) {
    let position = -1;
    for (let i = 0; i < pageSequence.length; ++i) {
      if (pageSequence[i].name == this.name) {
        position = i;
      }
    }
    if (position == -1) {
      console.log("This page isn't in the sequence!");
    }

    let canGoBack = position > 0;
    this.backButton.disabled = canGoBack ? "" : "disabled";
    if (canGoBack) {
      this.backButton.onclick = ev => {
          window.location.href = pageSequence[position - 1].name;
        };
    }

    let canGoAhead = position != -1 && position != pageSequence.length - 1;
    this.nextButton.disabled = canGoAhead ? "" : "disabled";
    if (canGoAhead) {
      this.nextButton.onclick = ev => {
          window.location.href = pageSequence[position + 1].name;
        };
    }
  }

  compileCheats(language) {
    if (cheatSheets.has(language)) {
      let phraseMap = cheatSheets.get(language);
      let phraseIndex = 0;
      let phrases = [];
      let reachedThisPage = false;

      for (let i = 0; i < pageSequence.length && !reachedThisPage &&
          phraseIndex < phraseMap.length; ++i) {

        if (pageSequence[i].name == phraseMap[phraseIndex].name) {
          phrases.push.apply(phrases, phraseMap[phraseIndex].phrases);
          ++phraseIndex;
        }

        if (pageSequence[i].name == this.name) {
          reachedThisPage = true;
        }
      }

      return {
          title: "Common " + language + " phrases",
          phrases: phrases
        };
    }
  }


  createRunners() {
    let runners = new Map();

    let pyOptions = this.getRunnerOptions();
    pyOptions.cheats = this.compileCheats(PYTHON);
    runners.set(PYTHON, new PythonRunner(this.editor, pyOptions));

    let jsOptions = this.getRunnerOptions();
    jsOptions.cheats = this.compileCheats(JAVASCRIPT);
    runners.set(JAVASCRIPT, new JavaScriptRunner(this.editor, jsOptions));

    return runners;
  }
}

