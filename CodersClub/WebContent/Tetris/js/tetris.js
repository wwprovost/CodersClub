import { PYTHON } from "../../js/coding.js";
import { JAVASCRIPT } from "../../js/coding.js";
import { PYTHON_CHEAT } from "../../js/coding.js";
import { JAVASCRIPT_CHEAT } from "../../js/coding.js";
import { Output } from "../../js/coding.js";
import { PythonRunner } from "../../js/coding.js";
import { JavaScriptRunner } from "../../js/coding.js";
import { CodingError } from "../../js/coding.js";
import { CodingPage } from "../../js/coding.js";
import { getDimension } from "../../js/layout.js";

export const pageSequence = [
  { name: "index.html" },
  { name: "OneRow.html" },
  { name: "MultipleRows.html" },
  { name: "NoOverhangs.html" },
  { name: "SlidesAndRotation.html" }
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
    super("Tetris", heading, shouldSaveWork);
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

const WIDTH = 10;
const HEIGHT = 8;
const BLOCK_WIDTH = 26;
const BLOCK_HEIGHT = 26;

const Phase = {
    START: "You must position the current block before getting another one.",
    NEW: "You must get a new block first.",
    DROPPED: "[Internal] Call dropBlock() before rowComplete().",
    OVER: "The game is over."
  };

export class TetrisGame {

  constructor() {
    this.blocks = [];
    this.rows = [];
    this.position;
    this.phase = Phase.START;
  }

  checkPhase(expected) {
    if (this.phase == Phase.OVER) {
      throw new Error(Phase.OVER);
    }
    if (this.phase != expected) {
      throw new Error(expected);
    }
  }

  update(blocks) {
    if (blocks.length > this.blocks.length) {
      this.checkPhase(Phase.START);
      let newBlock = blocks[blocks.length - 1];
      this.blocks.push(newBlock);
      this.phase = Phase.NEW;
      return newBlock;
    } else {
      return 0;
    }
  }

  dropBlock(position) {
    this.checkPhase(Phase.NEW);

    let size = this.blocks[this.blocks.length - 1];
    if (position < 0 || position + size > WIDTH) {
      throw new Error("Position out of bounds: " + (position + 1));
    }

    let floor = 0;
    for (let row = 0; row < this.rows.length; ++row) {
      for (let col = position; col < position + size; ++col) {
        if (this.rows[row][col]) {
          floor = row + 1;
        }
      }
    }

    if (this.rows.length == floor) {
      let newRow = [];
      for (let i = 0; i < WIDTH; ++i) {
        newRow.push(false);
      }
      this.rows.push(newRow);
    }
    for (let col = position; col < position + size; ++col) {
      this.rows[floor][col] = true;
    }

    this.phase = Phase.DROPPED;
    return floor;
  }

  rowComplete(row) {
    this.checkPhase(Phase.DROPPED);

    let complete = this.rows[row].filter(e => e).length == WIDTH;
    if (complete) {
      this.rows.splice(row, 1);
    }

    this.phase = this.rows.length > HEIGHT ? Phase.OVER : Phase.START;
    return complete;
  }

  gameOver() {
    return this.phase == Phase.OVER;
  }
}

export class TetrisVisualizer {

  constructor() {
    this.game = new TetrisGame();

    this.board = document.getElementById("gameBoard");
    if (this.board) {
      this.board.querySelectorAll("img").forEach(e => e.remove());
    }

    this.blocks = [];
    this.rows = 0;
    this.counter = document.getElementById("counter");
    if (this.counter) {
      this.counter.textContent = "0";
    }
  }

  positionBlock(block, msec) {
    let { row, col, element } = block;
    let boardRect = this.board.getBoundingClientRect();
    let borderWidth = getDimension(this.board, "borderWidth");
    element.style.top =
      boardRect.y + (HEIGHT + 1 - row) * BLOCK_HEIGHT + borderWidth;
    element.style.left =
      boardRect.x + col * BLOCK_WIDTH + borderWidth;
  }

  visualize(vanishingDelay = 500) {

    // new_block() was called
    let newBlock = this.game.update(Sk.globals.__blocks.v.map(e => e.v));
    if (newBlock) {
      let blockElement = document.createElement("img");
      blockElement.src = "img/" + newBlock + ".png";
      blockElement.style.height = "" + BLOCK_HEIGHT + "px";
      blockElement.style.position = "absolute";

      this.newBlock = {
          row: HEIGHT + 0.5,
          col: (WIDTH - newBlock) / 2,
          element: blockElement
        };
      this.positionBlock(this.newBlock);
      this.board.appendChild(blockElement);

    // position() was called
    } else if (Sk.globals.__position) {
      let col = Sk.globals.__position.v - 1;
      let row = this.game.dropBlock(col);
      delete Sk.globals.__position;

      this.newBlock.row = row;
      this.newBlock.col = col;
      this.blocks.push(this.newBlock);
      this.positionBlock(this.newBlock);
      delete this.newBlock;

      if (this.game.rowComplete(row)) {

        setTimeout(() => {
            for (let b = this.blocks.length - 1; b >= 0; --b) {
              if (this.blocks[b].row == row) {
                this.blocks[b].element.remove();
                this.blocks.splice(b, 1);
              } else if (this.blocks[b].row > row) {
                this.blocks[b].row = this.blocks[b].row - 1;
                this.positionBlock(this.blocks[b]);
              }
            }

            ++this.rows;
            this.counter.textContent = "" + this.rows;
          }, vanishingDelay);
      } else if (this.game.gameOver()) {
        Sk.globals.__over = Sk.ffi.remapToPy(true);
      }
    }
  }

  onresize() {
    if (this.newBlock) {
      this.positionBlock(this.newBlock);
    }
    for (let block of this.blocks) {
      this.positionBlock(block);
    }
  }
}

export class TetrisPythonRunner extends PythonRunner {

  constructor(editor, options) {
    super(editor, options);

    this.runBn.value = "Fast";
    this.animateBn.value = "Slow";

    this.visualize = this.visualize.bind(this);
  }

  getPrelude() {
    let result = super.getPrelude();
    result += document.getElementById("prelude").textContent.trim()
        .split("    ").join("\t");
    return result + "\n";
  }

  getPreludeSymbols() {
    let result = super.getPreludeSymbols();
    result.push("__block_ready");
    result.push("__blocks");
    result.push("__over");
    result.push("__position");
    return result;
  }

  // Don't disable buttons
  setStepping(value) {
    this.stepping = value;
  }

  runProgram(code) {
    super.animateProgram(code, 100);
    this.vanishingDelay = 0;
  }

  animateProgram(code) {
    super.animateProgram(code);
    this.vanishingDelay = 500;
  }

  stepProgram(code) {
    if (!this.timer) {
      this.vanishingDelay = 1000;
    }
    super.stepProgram(code);
  }

  start(code) {
    this.visualizer = new TetrisVisualizer();
    super.start(code);
  }

  visualize(state) {
    super.visualize(state);
    if (Sk.globals && Sk.globals.__blocks) {
      this.visualizer.visualize(this.vanishingDelay);
    }
  }
}

export class TetrisJavaScriptRunner extends JavaScriptRunner {

  constructor(editor, options) {
    super(editor, options);
    this.visualizer = new TetrisVisualizer();
    this.visualize = this.visualize.bind(this);
  }

  visualize(state) {
    super.visualize(state);
    if (Sk.globals && Sk.globals.__blocks) {
      this.visualizer.visualize(this.vanishingDelay);
    }
  }
}

export class Game extends Page {

  constructor(heading, shouldSaveWork) {
    super(heading, shouldSaveWork);
  }

  init() {
    super.init()
      .finally(() => {
          this.hSplitterDiv.style.cursor = "default";
          this.hSplitterDiv.onmousedown = ev => {};
          this.hSplitter.container.onmousemove = ev => {};
          this.hSplitter.container.onmouseup = ev => {};
          this.hSplitter.container.onresize = ev => {
              this.hSplitter.totalHeight = getDimension(this.hSplitter.container, "height");
              this.hSplitter.setHeights();

              let proportion = this.hSplitter.leftWidth / this.hSplitter.totalWidth;
              this.hSplitter.updateTotalWidth();
              this.hSplitter.setWidths(this.hSplitter.totalWidth -
                getDimension(this.gameBoard, "width") -
                getDimension(this.gameBoard, "padding") * 2 -
                getDimension(this.gameBoard, "borderWidth") * 2);
            };
          this.hSplitter.container.onresize();
        });

    this.gameBoard = document.createElement("div");
    this.gameBoard.id = "gameBoard";
    this.gameBoard.style.height = "" + ((HEIGHT + 2) * BLOCK_HEIGHT) + "px";
    this.gameBoard.style.width = "" + (WIDTH * BLOCK_WIDTH) + "px";

    this.counter = document.createElement("span");
    this.counter.id = "counter";
    this.counter.style.float = "right";
    this.counter.style.backgroundColor = "#0000";
    this.counter.style.padding = "6px";
    this.gameBoard.appendChild(this.counter);

    this.visualization.appendChild(this.gameBoard);

    let handler = window.onresize;
    window.onresize = ev => {
        handler(ev);
        let runner = this.runners.get(this.activeRunner);
        if ("visualizer" in runner) {
          runner.visualizer.onresize();
        }
      };
  }

  createRunners() {
    let runners = new Map();

    let pyOptions = this.getRunnerOptions();
    pyOptions.cheats = this.compileCheats(PYTHON);
    runners.set(PYTHON, new TetrisPythonRunner(this.editor, pyOptions));
/*
    let jsOptions = this.getRunnerOptions();
    jsOptions.cheats = this.compileCheats(JAVASCRIPT);
    runners.set(JAVASCRIPT, new TetrisJavaScriptRunner(this.editor, jsOptions));
*/
    return runners;
  }
}

