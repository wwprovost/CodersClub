import { PYTHON } from "../../js/coding.js";
import { JAVASCRIPT } from "../../js/coding.js";
import { PYTHON_CHEAT } from "../../js/coding.js";
import { JAVASCRIPT_CHEAT } from "../../js/coding.js";
import { Output } from "../../js/coding.js";
import { PythonRunner } from "../../js/coding.js";
import { JavaScriptRunner } from "../../js/coding.js";
import { CodingError } from "../../js/coding.js";
import { CodingPage } from "../../js/coding.js";

export const pageSequence = [
  { name: "index.html" },
  { name: "Runs.html" },
  { name: "Bases.html" },
  { name: "Bases2.html" },
  { name: "Hits.html" },
  { name: "Average.html" },
  { name: "Inning.html" },
  { name: "Game.html" }
];

export const cheatSheets = new Map();

cheatSheets.set(PYTHON, [ {
      name: "index.html",
      phrases: [
          PYTHON_CHEAT.PRINT,
          PYTHON_CHEAT.PRINT_LINE,
          PYTHON_CHEAT.VARIABLE,
          PYTHON_CHEAT.RANDOM,
          PYTHON_CHEAT.IF,
          PYTHON_CHEAT.FOR_MtoN,
          PYTHON_CHEAT.FOR_1toN,
          PYTHON_CHEAT.WHILE,
          PYTHON_CHEAT.FUNCTION,
          PYTHON_CHEAT.CALL,
          PYTHON_CHEAT.ARRAY
        ]
    }
  ]);

cheatSheets.set(JAVASCRIPT, [ {
      name: "index.html",
      phrases: [
          JAVASCRIPT_CHEAT.PRINT,
          JAVASCRIPT_CHEAT.PRINT_LINE,
          JAVASCRIPT_CHEAT.VARIABLE_NUMBER,
          JAVASCRIPT_CHEAT.RANDOM,
          JAVASCRIPT_CHEAT.IF,
          JAVASCRIPT_CHEAT.FOR_1toN,
          JAVASCRIPT_CHEAT.WHILE,
          JAVASCRIPT_CHEAT.FUNCTION,
          JAVASCRIPT_CHEAT.CALL,
          JAVASCRIPT_CHEAT.ARRAY
        ]
    }
  ]);

export class Page extends CodingPage {

  constructor(heading, shouldSaveWork) {
    super("Baseball Simulation", heading, shouldSaveWork);
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
}

export class BaseballVisualizer {

  visualize(state, strip) {
    let stateToShow = { runs: "", hits: "", outs: "" };
    for (let prop in state) {
      if (prop in stateToShow || !strip) {
        stateToShow[prop] = state[prop];
      }
    }

    if ("on_base" in state) {
      let onBase = state.on_base;
      let stranded = 0;
      if ("length" in onBase) {
        if (onBase.length > 2) {
          let filename = "img/diamond";
          for (let i = 0; i < 3; ++i) {
            if (onBase[i].v) {
              filename += (i + 1);
              ++stranded;
            }
          }
          filename += ".png";
          document.getElementById("diamond").src = filename;
        } else {
          throw new CodingError("on_base must have three elements.");
        }
      } else {
        throw new CodingError("on_base must be a list.");
      }

      if (stateToShow.outs == 3) {
        stateToShow.stranded = stranded;
      }
    }

    return stateToShow;
  }
}

export class BaseballPythonRunner extends PythonRunner {

  constructor(editor, options) {
    super(editor, options);
    this.visualizer = new BaseballVisualizer();
    this.visualize = this.visualize.bind(this);
  }

  runProgram(code) {
    super.runProgram(code);

    // Like visualizeSkGlobals() but with no preExisting filter ...
    let variables = {};
    for (let prop in Sk.globals) {
      variables[prop] = Sk.globals[prop].v;
    }

    // ... since all but a few will get stripped out now:
    this.visualize(variables);
  }

  visualize(state) {
    super.visualize(this.visualizer.visualize
      (state, !this.stepping || this.timer));
  }
}

export class BaseballJavaScriptRunner extends JavaScriptRunner {

  constructor(editor, options) {
    super(editor, options);
    this.visualizer = new BaseballVisualizer();
    this.visualize = this.visualize.bind(this);
  }

  visualize(state) {
    super.visualize(this.visualizer.visualize
      (state, !this.stepping || this.timer));
  }
}

export class Simulation extends Page {

  constructor(heading, shouldSaveWork) {
    super(heading, shouldSaveWork);
  }

  init() {
    super.init();

    this.diamond = document.createElement("img");
    this.diamond.id = "diamond";
    this.diamond.src = "img/diamond.png";
    this.diamond.style.float = "right";
    this.diamond.style.height = "80px";
    this.diamond.style.margin = "4px";

    this.visualization.appendChild(this.diamond);
    this.visualization.style.minHeight = "88px";
  }

  createRunners() {
    let runners = new Map();

    let pyOptions = this.getRunnerOptions();
    pyOptions.cheats = this.compileCheats(PYTHON);
    runners.set(PYTHON, new BaseballPythonRunner(this.editor, pyOptions));
/*
    let jsOptions = this.getRunnerOptions();
    jsOptions.cheats = this.compileCheats(JAVASCRIPT);
    runners.set(JAVASCRIPT, new BaseballJavaScriptRunner(this.editor, jsOptions));
*/
    return runners;
  }
}

