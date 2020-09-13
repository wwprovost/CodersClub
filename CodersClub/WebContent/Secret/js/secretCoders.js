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
  { name: "StringOperators.html" },
  { name: "HoursAndMinutes.html" },
  { name: "CodeAssist.html" },
  { name: "JJJS.html" },
  { name: "Loops.html" },
  { name: "StringBuilding.html" },
  { name: "Count.html" },
  { name: "Reverse.html" },
  { name: "Conditionals.html" },
  { name: "AndOr.html" },
  { name: "PleaseTickleMe.html" },
  { name: "CountMatches.html" },
  { name: "Replace.html" },
  { name: "Toggling.html" },
  { name: "Alternate.html" },
  { name: "NumbersForLetters.html" },
  { name: "LetterCodes.html" },
  { name: "SecretCodes.html" },
  { name: "FirstCipher.html" },
  { name: "StrongerCipher.html" },
  { name: "Decoding.html" },
  { name: "Messages.html" },
  { name: "BruteForce.html" },
  { name: "RotatingShift.html" },
  { name: "DecodeRotating.html" },
  { name: "DecodeAdaptive.html" },
  { name: "Maps.html" },
  { name: "Substitution.html" },
  { name: "DecodeSubstitution.html" },
  { name: "InvertAndDecode.html" }  ,
  { name: "CountEach.html" },
  { name: "Frequency.html" }
];

export const cheatSheets = new Map();

cheatSheets.set(PYTHON, [ {
      name: "index.html",
      phrases: [ PYTHON_CHEAT.PRINT, PYTHON_CHEAT.PRINT_LINE ]
    }, {
      name: "StringOperators.html",
      phrases: [ PYTHON_CHEAT.VARIABLE ]
    }, {
      name: "Loops.html",
      phrases: [ PYTHON_CHEAT.FOR_LTR, PYTHON_CHEAT.FOR_MtoN, PYTHON_CHEAT.FOR_1toN ]
    }, {
      name: "Conditionals.html",
      phrases: [ PYTHON_CHEAT.IF ]
    }, {
      name: "Arrays.html", //NYI
      phrases: [ PYTHON_CHEAT.ARRAY ]
    }
  ]);

cheatSheets.set(JAVASCRIPT, [ {
      name: "index.html",
      phrases: [ JAVASCRIPT_CHEAT.PRINT, JAVASCRIPT_CHEAT.PRINT_LINE ]
    }, {
      name: "StringOperators.html",
      phrases: [
        JAVASCRIPT_CHEAT.VARIABLE_STRING,
        JAVASCRIPT_CHEAT.VARIABLE_NUMBER
      ]
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
      name: "Digits.html",
      phrases: [ JAVASCRIPT_CHEAT.FUNCTION, JAVASCRIPT_CHEAT.CALL ]
    }, {
      name: "Arrays.html", //NYI
      phrases: [ JAVASCRIPT_CHEAT.ARRAY ]
    }
  ]);

/**
 * For Secret Coders' Club, we enhance the prelude with
 * code() and letter() functions.
 */
class SCCPythonRunner extends PythonRunner {

  constructor(editor, options) {
    super(editor, options);

    Sk.builtins.code = function code (ltr) {
        Sk.builtin.pyCheckArgs("code", arguments, 1, 1);

        if (!Sk.builtin.checkString(ltr)) {
            throw new Sk.builtin.TypeError("code() expected a string of length 1, but " + Sk.abstr.typeName(ltr) + " found");
        } else if (ltr.v.length !== 1) {
            throw new Sk.builtin.TypeError("code() expected a character, but string of length " + ltr.v.length + " found");
        }

        return new Sk.builtin.int_
          ((ltr.v).match(/[A-Za-z]/) ? ((ltr.v).toUpperCase().charCodeAt(0) - 64) : 0);
    };

    Sk.builtins.letter = function letter (code) {
        Sk.builtin.pyCheckArgs("letter", arguments, 1, 1);
        if (!Sk.builtin.checkInt(code)) {
            throw new Sk.builtin.TypeError("letter() requires an integer");
        }
        code = Sk.builtin.asnum$(code);


        return new Sk.builtin.str(String.fromCharCode
          (code > 0 && code < 27 ? code + 64 : 32));
    };
  }
}

/**
 * For Secret Coders' Club, we enhance the prelude with
 * code() and letter() functions.
 */
class SCCJavaScriptRunner extends JavaScriptRunner {

  getPrelude() {
    return super.getPrelude() +
      "window.code = function(letter) { if (letter.length == 0) return 0; letter = letter.toUpperCase().charAt(0); return letter.match(/[A-Z]/) ? letter.charCodeAt(0) - 64 : 0; }\n" +
      "window.letter = function(code) { return (code > 0 && code < 27) ? String.fromCharCode(code + 64) : ' '; }\n";
  }

  getPreludeSymbols() {
    let result = super.getPreludeSymbols();
    result.push("letter");
    result.push("code");
    return result;
  }

  /**
   * Clean functions up from global scope.
   */
  getCoda() {
    return  "\ndelete window.code; delete window.letter;";
        + super.getCoda();
  }
}

export class Page extends CodingPage {

  constructor(heading, shouldSaveWork, answer) {
    super("Secret Coders' Club", heading, shouldSaveWork, answer);
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
    runners.set(PYTHON, new SCCPythonRunner(this.editor, pyOptions));

    let jsOptions = this.getRunnerOptions();
    jsOptions.cheats = this.compileCheats(JAVASCRIPT);
    runners.set(JAVASCRIPT, new SCCJavaScriptRunner(this.editor, jsOptions));

    return runners;
  }
}

