import { getDimension } from "../js/layout.js";
import { VerticalSplitter } from "../js/layout.js";
import { HorizontalSplitter } from "../js/layout.js";

import { Storage } from "../js/save.js";
import { AceAutoSaver } from "../js/save.js";
import {
    checkFor200,
    getShadowingStatement,
    pollAndFollow
  } from "../js/utility.js";

export const PYTHON = "Python";
export const JAVASCRIPT = "JavaScript";

/**
 * Manages program output by attaching to a paragraph element
 * and "printing" to it. Defaults to an element with the ID "output"
 * or will accept a reference to an HTML component.
 *
 * By default, prints error messages to the output area and colors red
 * (which means any non-error output goes red, too).
 * You can pass an error-handling function which will be used instead.
 */
export class Output {

  constructor(outputArea = document.getElementById("output"), errorHandler = null) {
    this.print = this.print.bind(this);
    this.println = this.println.bind(this);
    this.error = this.error.bind(this);

    this.outputArea = outputArea;
    this.errorHandler = errorHandler;
  }

  clear() {
    this.outputArea.textContent = "";
    this.outputArea.style.color = "black";
  }

  print(text) {
    this.outputArea.textContent = this.outputArea.textContent + text;
  }

  println(text = "") {
    this.print(text + "\n");
  }

  error(text) {
    if (typeof this.errorHandler == "function") {
      this.errorHandler(text);
    } else {
      this.println(text);
      this.outputArea.style.color = "red";
    }
  }
}

function countRowsAndTrailingCols(text) {
  let result = {
    rows: 0,
    cols: 0
  };

  for (let i = 0; i < text.length; ++i) {
    if (text.charAt(i) == '\n') {
      ++result.rows;
      result.cols = 0;
    }
    ++result.cols;
  }

  return result;
}

const RUN_PROGRAM_COMMAND = "RunProgram";
const CHEAT_SHEET_COMMAND = "CodeAssist";

/**
 * Manages a dialog with common phrases that can prompt the user,
 * and also spports direct pasting of code into the parent editor.
 */
export class CheatSheet {

  constructor(title, phrases, editor) {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.insert = this.insert.bind(this);

    this.editor = editor;
    this.visible = false;

    this.parsed = phrases.map(phrase => {

        let parsedPhrase = {
            start: phrase.indexOf("<select>"),
            end: phrase.indexOf("</select>") - "<select>".length,
            display: phrase.replace(/<\/?select>/g, ""),
          };

        if (parsedPhrase.start != -1) {
          parsedPhrase.startOffset = countRowsAndTrailingCols
              (parsedPhrase.display.substring(0, parsedPhrase.start));
          parsedPhrase.endOffset = countRowsAndTrailingCols
            (parsedPhrase.display.substring
              (parsedPhrase.start, parsedPhrase.end));
        }

        return parsedPhrase;
      });

    let content = document.createElement("div");

    let titleHeading = document.createElement("h3");
    titleHeading.appendChild(document.createTextNode(title));
    content.appendChild(titleHeading);

    let explainerPara = document.createElement("p");
    explainerPara.appendChild(document.createTextNode
      ("Double-click or select with arrow keys and hit ENTER to insert code:"));
    content.appendChild(explainerPara);

    this.selector = document.createElement("select");
    this.selector.size = 9;
    this.selector.style.width = "100%";

    this.parsed.forEach(parsedPhrase => {
        let choice = document.createElement("option");
        choice.textContent = parsedPhrase.display;
        this.selector.add(choice);
      });

    content.appendChild(this.selector);

    this.closer = document.createElement("input");
    this.closer.type = "button";
    this.closer.value = "Close";
    content.appendChild(this.closer);

    this.dialog = document.createElement("div");
    this.dialog.classList.add("dialog");
    this.dialog.appendChild(content);
    document.body.appendChild(this.dialog);

    this.selector.ondblclick = this.insert;
    this.closer.onclick = this.hide;
    this.selector.onkeyup = ev => {
        if (ev.keyCode == 13) { // ENTER
          this.insert();
        } else if (ev.keyCode == 27) { // ESCAPE
          this.hide();
        }
      };
  }

  attach() {
    this.editor.commands.addCommand({
        name: CHEAT_SHEET_COMMAND,
        exec: this.show,
        bindKey: {mac: "ctrl-space", win: "ctrl-space"}
      });
  }

  detach() {
    this.editor.commands.removeCommand(CHEAT_SHEET_COMMAND);
  }

  show() {
    if (!this.visible) {
      this.dialog.style.display = "block";
      this.selector.focus();
      if (this.selector.options.length != 0) {
        this.selector.selectedIndex = 0;
      }

      this.visible = true;
    }
  }

  hide() {
    if (this.visible) {
      this.dialog.style.display = "none";
      this.editor.focus();

      this.visible = false;
    }
  }

  insert() {
    let range = this.editor.selection.getRange();
    let parsedPhrase = this.parsed[this.selector.selectedIndex];
    let text = parsedPhrase.display;
    // Adjust insertable text to indent it appropriately
    if (range.start.column != 0) {
      let upToHere = {
          start: {
              row: range.start.row,
              column: 0
            },
          end: {
              row: range.start.row,
              column: range.start.column
            }
        };

      // Select and sample text from start of line to cursor
      this.editor.selection.setRange(upToHere);
      let leadingText = this.editor.getSelectedText();

      // If it's all whitespace, use it in successive lines in inserted text,
      if (leadingText.trim() == "") {
        text = text.replace(/\n/g, "\n" + leadingText);
      }

      // Reset position/selection, regardless
      upToHere.start.column = upToHere.end.column;
      this.editor.selection.setRange(upToHere);
    }

    // Insert text
    this.editor.session.insert(this.editor.getCursorPosition(), text);

    // Select substring if indicated
    if (parsedPhrase.start != -1) {
      range.start.row += parsedPhrase.startOffset.rows;
      if (parsedPhrase.startOffset.rows != 0) {
        range.start.column = 0;
      }
      range.start.column += parsedPhrase.startOffset.cols;

      range.end.row = range.start.row + parsedPhrase.endOffset.rows;
      if (parsedPhrase.endOffset.rows != 0) {
        range.end.column = 0;
      } else {
        range.end.column = range.start.column;
      }
      range.end.column += parsedPhrase.endOffset.cols;
    }

    this.editor.session.selection.setRange(range);

    this.hide();
  }
}

export const PYTHON_CHEAT = {
  PRINT: "print(\"<select>Hello</select>\")\n",
  PRINT_LINE: "print()\n",
  VARIABLE: "<select>var-name</select> = 1\n",
  RANDOM: "randint(<select>min,max</select>)",
  IF: "if <select>x == 1</select>:\n    # code here\n",
  FOR_MtoN: "for i in range(<select>1,10</select>):\n    # code here\n",
  FOR_1toN: "for i in range(<select>9</select>):\n    # code here\n",
  FOR_LTR: "for ltr in <select>message</select>):\n    # code here\n",
  WHILE: "while <select>value <= 10</select>:\n    # code here\n",
  FUNCTION: "def <select>proc-name</select>(param1, param2):\n    # code here\n",
  CALL: "<select>proc-name</select>(arg1, arg2)\n",
  ARRAY: "<select>var-name</select> = [1, 2, 3]\n"
};

export const JAVASCRIPT_CHEAT = {
  PRINT: "print(\"<select>Hello</select>\");\n",
  PRINT_LINE: "print();\n",
  VARIABLE_NUMBER: "let <select>var-name</select> = 1;\n",
  VARIABLE_STRING: "let <select>var-name</select> = \"Hello\";\n",
  RANDOM: "random(<select>min,max</select>)",
  IF: "if (<select>x == 1</select>)\n{\n  \n}\n",
  FOR_1toN: "for (let i = 0; i < <select>N</select>; ++i)\n{\n  \n}\n",
  WHILE: "while (<select>value <= 10</select>)\n{\n  \n}\n",
  FUNCTION: "function <select>proc-name</select>(param1, param2)\n{\n  \n}\n",
  CALL: "<select>proc-name</select>(arg1, arg2);\n",
  ARRAY: "let <select>var-name</select> = [1, 2, 3];\n"
};


/**
 * Standard error used by the base runner in reporting.
 */
export class CodingError extends Error{
  constructor(message, lineNumber) {
    super(message);
    this.lineNumber = lineNumber;
  }
}


/**
 * Abstract base for program runners. A runner attaches to a text area
 * where the user's code is written. It attaches an event handler to the
 * text area so that Ctrl-Enter will trigger execution.
 *
 * By default it attaches to an area with the ID "code"; creates its own
 * Output component; and also reacts to clicks on a button with the ID "run".
 * You can pass a different code-area component, a different Output object,
 * and a different button (or null).
 */
export /* abstract */ class Runner {

  constructor(editor, options) {

    this.output = options.output || new Output();
    this.visualization = options.visualization;

    this.runBn = options.runBn || document.getElementById("run");
    this.animateBn = options.animateBn || document.getElementById("animate");
    this.stepBn = options.stepBn || document.getElementById("step");
    this.stopBn = options.stopBn || document.getElementById("stop");

    this.onRunProgram = options.onRunProgram || function() {};

    this.editor = editor;
    this.editor.setTheme("ace/theme/eclipse");
    this.editor.setOptions({
        fontSize: getComputedStyle(this.output.outputArea).fontSize
      });

    if (typeof options.cheats != "undefined") {
      this.cheatSheet = new CheatSheet
          (options.cheats.title, options.cheats.phrases, this.editor);
    }

    this.runProgram = this.runProgram.bind(this, null);
    this.animateProgram = this.animateProgram.bind(this, null);
    this.stepProgram = this.stepProgram.bind(this, null);
    this.stopProgram = this.stopProgram.bind(this);
    this.unvisualize = this.unvisualize.bind(this);
    this.visualize = this.visualize.bind(this);
    this.onError = this.onError.bind(this);
  }

  activate() {
    this.editor.commands.addCommand({
        name: RUN_PROGRAM_COMMAND,
        exec: this.runProgram,
        bindKey: {mac: "ctrl-enter", win: "ctrl-enter"}
      });

    let canStep = typeof this.step == "function";
    if (typeof this.runBn != "undefined" && this.runBn instanceof HTMLElement) {
      this.runBn.onclick = this.runProgram;
    }
    if (canStep && typeof this.animateBn != "undefined" &&
        this.animateBn instanceof HTMLElement) {
      this.animateBn.onclick = ev => this.animateProgram();
    }
    if (canStep && typeof this.stepBn != "undefined" &&
        this.stepBn instanceof HTMLElement) {
      this.stepBn.onclick = this.stepProgram;
    }
    if (canStep && typeof this.stopBn != "undefined" &&
        this.stopBn instanceof HTMLElement) {
      this.stopBn.onclick = this.stopProgram;
    }

    this.animateBn.disabled = !canStep;
    this.stepBn.disabled = !canStep;
    this.stopBn.disabled = !canStep;
    this.setStepping(false);

    if (typeof this.cheatSheet != "undefined") {
      this.cheatSheet.attach();
    }
  }

  deactivate() {
    this.editor.commands.removeCommand(RUN_PROGRAM_COMMAND);

    if (typeof this.runBn != "undefined" && this.runBn instanceof HTMLElement) {
      this.runBn.onclick = null;
    }

    if (typeof this.cheatSheet != "undefined") {
      this.cheatSheet.detach();
    }
  }

  getProgram() {
    return this.editor.getValue();
  }

  setProgram(code) {
    this.editor.setValue(code, -1);
  }

  getPrelude() {
    return "";
  }

  getCoda() {
    return "";
  }

  onError(err) {
    let message = err.message;
    if ("lineNumber" in err) {
      this.editor.gotoLine(err.lineNumber, Infinity);
    }

    this.output.error(message);
  }

  getFullProgram(code) {
    let body = code !== null ? code : this.getProgram();
    this.onRunProgram(body);
    this.preludeLines = this.getPrelude().split("\n").length - 1;
    return this.getPrelude() + body + this.getCoda();
  }

  runProgram(code = null) {
    this.output.clear();

    this.execute(this.getFullProgram(code))
      .then(this.output.print.bind(this.output))
      .catch(this.onError);
  }

  setStepping(value) {
    this.stepping = value;

    this.runBn.disabled = this.stepping;
    this.stopBn.disabled = !this.stepping;
  }

  animateProgram(code = null, interval = 1000) { console.log(interval);
    this.stepProgram(code);
    this.timer = setInterval(this.step, interval);
  }

  stepProgram(code) {
    if (this.timer) {
      clearInterval(this.timer);
      delete this.timer;
    }

    if (!this.stepping) {
      this.editor.setReadOnly(true);
      this.start(this.getFullProgram(code));
    } else {
      this.step();
    }

    this.setStepping(true);
  }

  stopProgram(completed) {
    this.stop();

    if (completed) {
      this.highlight(this.editor.session.getLength() + 1);
    }

    if (this.timer) {
      clearInterval(this.timer);
      delete this.timer;
    }

    this.setStepping(false);
    this.editor.setReadOnly(false);
  }

  highlight(lineNumber) {
    if (this.highlighted) {
      this.editor.gotoLine(null);
    }

    this.highlighted = lineNumber;
    if (lineNumber) {
      this.editor.gotoLine(lineNumber, Infinity);
    }
  }

  unvisualize(state) {
    this.visualization.querySelectorAll("p").forEach(p => p.remove());
    window.onresize();
  }

  visualize(state) {
    this.visualization.querySelectorAll("p").forEach(p => p.remove());
    for (let prop in state) {
      let p = document.createElement("p");
      p.classList.add("visualization");

      let value = state[prop];
      if (typeof value !== "undefined") {
        if (value.constructor === Array)
        {
          let rep = "[";
          if (value.length != 0)
            rep += " ";
          rep += value.map(v => v.v).join(", ")
          if (value.length != 0)
            rep += " ";
          rep += "]";

          p.textContent = prop + " = " + rep;
        }
        else
          p.textContent = prop + " = " + value;
      }

      this.visualization.appendChild(p);
    }

    window.onresize();
  }

  // Return a Promise, please ...
  execute(code) {
    alert("You must subclass Runner and implement execute(code).");
  }
}


/**
 * A program runner that interprets the user's code as Python 3,
 * using the Skulpt library (which must be included by the HTML page).
 */
export class PythonRunner extends Runner {

  constructor(editor, options) {
    super(editor, options);

    this.gatherOutput = this.gatherOutput.bind(this);
    this.convertError = this.convertError.bind(this);
    this.start = this.start.bind(this);
    this.step = this.step.bind(this);
    this.stepVisibleLine = this.stepVisibleLine.bind(this);
    this.stop = this.stop.bind(this);

  }

  activate() {
    super.activate();
    this.editor.session.setMode("ace/mode/python");
  }

  /**
   * Stock resolver for "file inputs" that Skulpt supplies with
   * built-in content.
   */
  readBuiltinFiles(filename) {
    if (Sk.builtinFiles === undefined ||
        Sk.builtinFiles["files"][filename] === undefined) {
      throw "File not found: '" + filename + "'";
    }

    return Sk.builtinFiles["files"][filename];
  }

  /**
   * Skulpt likes to push program output to a function, so we gather it here.
   */
  gatherOutput(text) {
    this.programOutput += text;
  }

  /**
   * All programs get the randint() function.
   */
  getPrelude() {
    return "from random import randint\n";
  }

  getPreludeSymbols() {
    return [ "randint" ];
  }

  getPreludeLines() {
    return this.getPrelude().split("\n").length - 1;
  }

  convertError(err) {
    if ("traceback" in err) {
      let lineNumber = -1;
      for (let line of err.traceback) {
        if (line.lineno > this.getPreludeLines()) {
          lineNumber = line.lineno - this.getPreludeLines();
          break;
        }
      }
      let message = err.toString().replace("Exception: ", "")
          .replace(/on line [0-9]+/g, "on line " + lineNumber);
      return new CodingError(message, lineNumber);
    } else {
      return err;
    }
  }

  /**
   * Clear our program output and run the Python interpreter.
   * Transform a successful result into our gathered program output,
   * and return the resulting Promise to the caller.
   * (Error messages will pass through as well and can be handled with
   * a catch() call on the promise.)
   */
  execute(code) {
    this.programOutput = "";
    this.unvisualize();
    Sk.configure({
        read: this.readBuiltinFiles,
        output: this.gatherOutput,
        debugging: false
      });

    return Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, code, true);
      }).then(mod => this.programOutput)
        .catch(err => { throw this.convertError(err); });
  }

  start(code) {
    this.output.clear();
    this.unvisualize();
    this.parentSuspension = null;
    this.childSuspension = null;

    this.debugger = new Sk.Debugger("<stdin>", {
        print: text => {},
        get_source_line: number => "line of code " + number
      });
    this.debugger.enable_step_mode();

    // Hack based on https://github.com/skulpt/skulpt/issues/824
    // that allows tracing *over* function calls; can't trace into
    // functions, but without this trick, step mode fails completely.
    this.debugger.suspension_handler = (susp1) => {
        return new Promise((resolve, reject) => {
            try {
              let susp2 = susp1.resume();
              if(susp2 && susp2.child && susp2.child.isSuspension) {
                this.parentSuspension = susp2;
                this.childSuspension = susp2.child;
              } else {
                this.parentSuspension = null;
                this.childSuspension = null;
              }
              resolve(susp2);
            } catch(ex) {
              reject(ex);
            }
        });
      };

    Sk.configure({
        read: this.readBuiltinFiles,
        output: this.output.print,
        debugger: this.debugger,
        debugging: true
      });

    this.debugger.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, code, true);
      }, null, this.debugger)
      .catch(err => { throw this.convertError(err); });
    this.preExisting = new Set(Object.keys(Sk.globals));
    this.getPreludeSymbols().forEach(symbol => this.preExisting.add(symbol));
    this.step();
  }

  visualizeSkGlobals() {
    let variables = {};
    for (let prop in Sk.globals) {
      if (!this.preExisting.has(prop)) {
        variables[prop] = Sk.globals[prop].v;
      }
    }
    this.visualize(variables);
  }

  debugStep() {
    // See comments on suspension_handler()
    if(this.childSuspension) {
      let stack = this.debugger.suspension_stack;
      stack[stack.length - 1] = this.parentSuspension;
    }

    return this.debugger.suspension_handler
        (this.debugger.get_active_suspension());
  }

  // Recurse until past the prelude
  step(response) {
    if (response && "filename" in response) {
      this.debugger.set_suspension(response);
    }

    if (this.debugger.get_active_suspension().lineno <=
        this.preludeLines) {
      this.debugStep()
        .then(this.step)
        .catch(err => {
            this.onError(this.convertError(err));
            this.stopProgram();
          });
    } else {
      this.stepVisibleLine();
    }

    return response;
  }

  stepVisibleLine() {
    return this.debugStep()
      .then(response => {
          if (response instanceof Sk.misceval.Suspension) {
            this.highlight(this.debugger.get_active_suspension().lineno -
                this.preludeLines);
            this.visualizeSkGlobals();
            this.debugger.set_suspension(response);
          } else {
            this.stopProgram(true);
          }
        })
      .catch(err => {
          this.onError(this.convertError(err));
          this.stopProgram();
        });
  }

  stop() {
    try {
      this.visualizeSkGlobals();
    } catch (err) {
      // Really, it's okay. Anything thrown by that function
      // would be a repeat of an error reported in the prior step.
    }
  }
}


/**
 * A program runner that interprets the code as JavaScript.
 * A simple print() function is pre-defined for program output.
 */
export class JavaScriptRunner extends Runner {

  constructor(editor, options) {
    super(editor, options);
  }

  activate() {
    super.activate();
    this.editor.session.setMode("ace/mode/javascript");
  }

  /**
   * All programs get:
   *   * A print function (like "print line")
   *   * A random() function that returns a random in in the given range
   */
  getPrelude() {
    return "window.random = function(min,max)\n{\nreturn Math.floor(Math.random() * (max - min + 1)) + min;\n}\nwindow.print = function(text) { this.results += text + '\\n'; }.bind(this);\n";
  }

  /**
   * Clean functions up from global scope.
   */
  getCoda() {
    return "\ndelete window.print; delete window.random;";
  }

  /*
  Skating on thin ice here ... the SCCJavaScriptRunner introduces a
  code() function at global scope. 'theCode' below used to be just 'code' ...
  but that shadowed the SCC function! so the var name here matters. Ick.
  */
  execute(theCode) {

    return new Promise((resolve, reject) => {
        let context = { results: "" };
        function pleaseRun() {
          eval(theCode);
        }
        try {
          pleaseRun.call(context);
          resolve(context.results);
        } catch (err) {
          let message = err.toString();
          let lineNumber;
          let trace = err.stack.toString();
          let anonIndex = trace.indexOf("<anonymous>:");
          if (anonIndex != -1) {
            let remainder = trace.substring(anonIndex + "<anonymous>:".length);
            let colonIndex = remainder.indexOf(":");
            lineNumber = parseInt(remainder.substring(0, colonIndex)) -
                 this.getPrelude().split("\n").length + 1;
             message = "In line " + lineNumber + ":\n" + message;
          }

          throw new CodingError(message, lineNumber);
        }
      });
  }
}

/**
 * We assume that the text begins with one or more line breaks,
 * and then some number of spaces on the first line; and that the
 * rest of the text is indented at least as much as the first line.
 */
export function cleanUp(code) {

  let spaceCount = 0;

  let i = 0;
  for (; i < code.length && code.charAt(i) == '\n'; ++i);
  code = code.substring(i);

  for (i = 0; i < code.length && code.charAt(i) == ' '; ++i);
  let loseIt = "\n" + code.substring(0, i);
  code = code.substring(i);

  return code.replace(new RegExp(loseIt, "g"), "\n").trim() + "\n";
}

export class CodingPage {

  constructor(application, heading, shouldSaveWork, answer) {
    this.compileCheats = this.compileCheats.bind(this);

    this.name = window.location.pathname.split("/").pop();
    this.application = application;
    this.heading = heading;
    this.shouldSaveWork = shouldSaveWork;
    this.answer = answer;
    this.resizing = false;

    this.storage = new Storage();

    window.onload = this.init.bind(this);

    // Could block propagation in the element's event handler,
    // but that's skating on thin ice: if the handler isn't there at all,
    // we'd still get a nasty infinite loop. Better to block it at the source:
    let resizing = false;
    window.onresize = function() {
        if (!this.resizing) {
          this.resizing = true;
          this.mainDiv.dispatchEvent(new Event("resize"));
          this.resizing = false;
        }
      }.bind(this);
  }

  addAnswerElements(parent) {
    const PROMPT = "What's the answer?";

    let label = document.createElement("span");
    label.style.fontWeight = "normal";
    label.textContent = PROMPT;

    let input = document.createElement("input");
    input.type = "text";
    input.onkeyup = ev => {
        if (ev.keyCode == 13) {
          if ("" + this.answer == input.value) {
            label.textContent = "Correct!";
          } else {
            label.textContent = "Hmm, no ...";
            setTimeout(() => {
                label.textContent = PROMPT;
              }, 2500);
          }
        }
      };

    parent.appendChild(label);
    parent.appendChild(input);
  }

  init() {

    this.mainDiv = document.body.querySelector("div");
    this.talkingDiv = document.getElementById("talking");
    this.doingDiv = document.getElementById("doing");
    this.codeDiv = document.getElementById("code");

    let startTalking = this.talkingDiv.firstChild;

    // Insert title bar
    let titleBar = document.createElement("h2");
    titleBar.id = "title";

    let buttons = document.createElement("span");
    buttons.style.float = "right";

    this.selector = document.createElement("select");
    this.selector.id = "language";

    this.runButton = document.createElement("input");
    this.runButton.type = "button";
    this.runButton.value = "Run";
    this.runButton.classList.add("CCButton");

    this.animateButton = document.createElement("input");
    this.animateButton.type = "button";
    this.animateButton.value = "Animate";
    this.animateButton.classList.add("CCButton");

    this.stepButton = document.createElement("input");
    this.stepButton.type = "button";
    this.stepButton.value = "Step";
    this.stepButton.classList.add("CCButton");

    this.stopButton = document.createElement("input");
    this.stopButton.type = "button";
    this.stopButton.value = "Stop";
    this.stopButton.classList.add("CCButton");

    this.backButton = document.createElement("input");
    this.backButton.type = "button";
    this.backButton.value = "Back";
    this.backButton.style.marginLeft = "30px";
    this.backButton.classList.add("CCButton");

    this.nextButton = document.createElement("input");
    this.nextButton.type = "button";
    this.nextButton.value = "Next";
    this.nextButton.classList.add("CCButton");

    buttons.appendChild(this.selector);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.runButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.animateButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.stepButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.stopButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.backButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(this.nextButton);

    titleBar.appendChild(buttons);
    titleBar.appendChild(document.createTextNode
        (this.application + " -- " + getShadowingStatement()));

    this.talkingDiv.insertBefore(titleBar, startTalking);

    // Insert title bar
    let subtitleBar = document.createElement("h3");
    subtitleBar.id = "subtitle";
    //TODO move margin 0 to CSS

    let subtitleRight = document.createElement("span");
    subtitleRight.style.float = "right";

    this.moreOrLessButton = document.createElement("input");
    this.moreOrLessButton.id = "moreOrLessTalking";
    this.moreOrLessButton.type = "button";
    this.moreOrLessButton.value = "Hide";
    this.moreOrLessButton.classList.add("CCButton");

    if (this.answer) {
      this.addAnswerElements(subtitleRight);
    }
    subtitleRight.appendChild(this.moreOrLessButton);

    subtitleBar.appendChild(subtitleRight);
    subtitleBar.appendChild(document.createTextNode(this.heading));

    this.talkingDiv.insertBefore(subtitleBar, startTalking);

    // insert splitters and output area
    this.vSplitterRule = document.createElement("hr");
    this.vSplitterRule.classList.add("vsplitter");
    this.mainDiv.insertBefore(this.vSplitterRule, this.doingDiv);

    this.outputDiv = document.createElement("div");
    this.outputDiv.id = "output";

    this.visualization = document.createElement("div");

    this.outputEnclosure = document.createElement("div");
    this.outputEnclosure.appendChild(this.visualization);
    this.outputEnclosure.appendChild(this.outputDiv);
    this.outputEnclosure.style.float = "right";
    this.doingDiv.appendChild(this.outputEnclosure);

    this.hSplitterDiv = document.createElement("div");
    this.hSplitterDiv.classList.add("hsplitter");
    this.doingDiv.appendChild(this.hSplitterDiv);

    this.mainDiv.style.height = "100%";

    this.setupNextAndBack(this.nextButton, this.backButton);

    this.moreOrLessButton.onclick = ev => {
        let collapsing =
          this.vSplitter.upperHeight > this.vSplitter.upperMin;
        this.vSplitter.setHeights(collapsing
          ? this.vSplitter.upperMin
          : this.naturalTalkingHeight);
        ev.target.value = collapsing ? "Show" : "Hide";
      };

    // Code runners
    this.editor = ace.edit(this.codeDiv.id);
    this.runners = this.createRunners();

    // Switch code runner, and if there's sample code, swap it out
    this.code = new Map();
    for (let [ language ] of this.runners) {
      let sampleDiv = document.getElementById(language);
      if (sampleDiv != null) {
        this.code.set(language, cleanUp(sampleDiv.textContent));
      }

      let option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      this.selector.options.add(option);
    }
    this.selector.onchange = ev => {
        let language = this.selector.options[this.selector.selectedIndex].value;
        this.setLanguage(language);
        this.storage.save(this.getLanguageKey(), language);
      };

    // Get user's preferred language, and set that or set the default
    return fetch(this.storage.getBaseURL() + this.getLanguageKey(),
        { credentials: "same-origin" })
      .then(this.storage.checkFor200)
      .then(response => response.text())
      .then(language => {
          this.setLanguage(language || this.runners.keys().next().value);
        })
      .catch(err => {
          this.setLanguage(this.runners.keys().next().value);
        })
      .finally(() => {

          // Set natural height and splitters last, because language choice
          // can affect what paragraphs are visible
          this.naturalTalkingHeight = getDimension(this.talkingDiv, "height");
          let minimumHeadHeight =
            this.moreOrLessButton.getBoundingClientRect().bottom -
              getDimension(document.body, "margin");

          // Apparently necessary in order to resize Ace after splitter moves
          this.codeDiv.onresize = ev => this.editor.resize();

          // Adjust output area to visualization size
          this.outputEnclosure.onresize = ev => {
              this.outputDiv.style.width =
                 (getDimension(this.outputEnclosure, "width") -
                  getDimension(this.outputDiv, "padding") * 2 -
                  getDimension(this.outputDiv, "borderWidth") * 2 -
                  getDimension(this.outputDiv, "margin") * 2) + "px";

              let paras = this.visualization.querySelectorAll("p");
              let paraMargin = 0;
              if (paras.length != 0) {
                paraMargin = getDimension(paras[0], "margin");
              }

              this.outputDiv.style.height =
                 (getDimension(this.outputEnclosure, "height") -
                  getDimension(this.visualization, "height") -
                  getDimension(this.visualization, "padding") * 2 -
                  getDimension(this.visualization, "borderWidth") * 2 -
                  getDimension(this.visualization, "margin") * 2 -
                  paraMargin * 2 -
                  getDimension(this.outputDiv, "padding") * 2 -
                  getDimension(this.outputDiv, "borderWidth") * 2 -
                  getDimension(this.outputDiv, "margin") * 2) + "px";
            }

          this.vSplitter = new VerticalSplitter
            (this.talkingDiv, this.doingDiv, this.vSplitterRule,
               minimumHeadHeight, 200, this.naturalTalkingHeight);
          this.hSplitter = new HorizontalSplitter
            (this.codeDiv, this.outputEnclosure, this.hSplitterDiv, 40, 40, 60, true);

          for (let option of this.selector.options) {
            if (option.value == this.activeRunner) {
              option.selected = true;
            }
          }

          if(this.shouldSaveWork) {
            this.autoSaver = new AceAutoSaver(this.editor,
                [ this.nextButton, this.backButton, this.runButton,
                  this.animateButton, this.stepButton, this.stopButton ]);

            let saver = this.autoSaver.save.bind(this.autoSaver);
            this.runners.forEach(runner => {
                runner.onRunProgram = saver;
              });
          }

          if (sessionStorage.getItem("tracking")) {
            pollAndFollow();
          }
        });
  }

  getRunnerOptions() {
    return {
        output: new Output(this.outputDiv),
        visualization: this.visualization,
        runBn: this.runButton,
        animateBn: this.animateButton,
        stepBn: this.stepButton,
        stopBn: this.stopButton
      };
  }

  createRunners() {
    let options = this.getRunnerOptions();

    let runners = new Map();
    runners.set(PYTHON, new PythonRunner(this.editor, options));
    runners.set(JAVASCRIPT, new JavaScriptRunner(this.editor, options));
    return runners;
  }

  getLanguageKey() {
    let path = window.location.pathname.split("/");
    path.pop();
    return path.pop() + ":language";
  }

  setLanguage(language) {

    if (this.runners.has(this.activeRunner)) {
      this.runners.get(this.activeRunner).deactivate();
    }

    this.activeRunner = language;
    this.runners.get(this.activeRunner).activate();

    if (this.code.has(language)) {
      this.runners.get(this.activeRunner).setProgram(this.code.get(this.activeRunner));
    }
    this.editor.focus();
    this.editor.getSession().setUndoManager(new ace.UndoManager());

    document.querySelectorAll(".language").forEach(element => {
        element.style.display = "none";
      });
    document.querySelectorAll("." + this.activeRunner).forEach(element => {
        element.style.display = "block";
      });
  }
}

