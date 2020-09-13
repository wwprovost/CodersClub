import { checkFor200, getBasePath } from "./utility.js";

/*
This class just knows how to GET from and PUT to the server.
Timing, dirty flag, figuring a pageID, etc. is in the AutoSaver.
*/
export function Storage() {

  this.getBaseURL = function() {
    return getBasePath() + "REST/Work/";
  }

  this.shadow = sessionStorage.getItem("shadowID");

  this.loadingURL = function(pageID) {
    URL = this.getBaseURL() + pageID;
    if (this.shadow) {
      URL = URL + "?shadow=" + this.shadow;
    }

    return URL;
  }

  this.filterLoginPage = function(text) {
    return text.includes("j_security_check") ? "" : text;
  }

  /**
   * Asynchronous -- pass your own handler.
   */
  this.load = function(pageID, handler) {
      fetch(this.loadingURL(pageID), { credentials: "same-origin" })
        .then(checkFor200)
        .then(response => response.text())
        .then(this.filterLoginPage)
        .then(handler)
        .catch(err => {
            console.log("Coldn't load prior work from the server. " +
              "If you opened the activity as a file, rather than by " +
              "logging into Coders' Club, this is normal. " +
              "The error was: " + err);
            console.log(err);
          });
    };

  /**
   * Asynchronous -- pass your own handler.
   * Loads a teammate's code.
   */
  this.loadTeammate = function(pageID, teamCode, teammateID, handler) {
      let URL = this.getBaseURL() + pageID +
        (this.shadow
          ? "?shadow=" + teammateID
          : "?teamCode=" + teamCode + "&teammate=" + teammateID);
      fetch(URL, { credentials: "same-origin" })
        .then(checkFor200)
        .then(response => response.text())
        .then(this.filterLoginPage)
        .then(data => { if (data) handler(data); })
        .catch(err => {
            console.log("Coldn't load prior work from the server. " +
              "If you opened the activity as a file, rather than by " +
              "logging into Coders' Club, this is normal. " +
              "The error was: " + err);
            console.log(err);
          });
    };

  /**
   * Synchronous, returning the full response body directly.
   */
  this.loadNow = function(pageID) {
      let result = "no response";
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            result = xhr.responseText;
          }
        };
      xhr.open("GET", this.loadingURL(pageID), false);
      xhr.send();

      return this.filterLoginPage(result);
    };

  this.save = this.shadow
    ? function(pageID, work) {}
    : function(pageID, work) {
        fetch(this.getBaseURL() + pageID, {
            method: "PUT",
            credentials: "same-origin",
            body: work
          });
      }
}

export const defaultInterval = 5000;

export function getDefaultPageID() {
  let tokens = window.location.pathname.split("/");
  let pageName = tokens.pop();
  let appName = tokens.pop();
  return appName + ":" + pageName.replace(".html", "");
}

/*
Core functionality, generally to be wrapped by a UI- and style-specific object.
*/
export class AutoSaver {

  constructor(loader, saver, triggers, pageID, interval, manualStart) {
    this.makeDirty = this.makeDirty.bind(this);
    this.save = this.save.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.loader = loader;
    this.saver = saver;
    this.interval = interval || defaultInterval;

    this.dirty = false;
    this.saveTimer = null;

    this.pageID = pageID || getDefaultPageID();

    this.storage = new Storage();

    if (typeof triggers != "undefined" ) {
      for (let trigger of triggers) {
        trigger.addEventListener("click", this.save);
      }
    }

    if (!manualStart)
      this.start();
  }

  makeDirty() {
    this.dirty = true;
  }

  save() {
    if (this.dirty) {
      this.storage.save(this.pageID, "" + this.saver());
      this.dirty = false;
    }
  }

  start(postRetrieve) {
    this.storage.load(this.pageID, data => {

      if (data.length != 0) {
        this.loader(data);

        // In case we got any feedback events from changing state in the
        // editor, blockly canvas, etc.
        this.dirty = false;
      }

      if (typeof postRetrieve == "function") {
        postRetrieve();
      }
    });

    if (this.storage.shadow) {
      setTimeout(() => this.start(postRetrieve), this.interval);
    } else {
      this.saveTimer = setInterval(this.save, this.interval);
      window.onbeforeunload = this.stop;
    }
  }

  stop() {
    window.onbeforeunload = null;
    clearInterval(this.saveTimer);
  }
}

/*
Connects an AutoSaver to a text-based coding page.
*/
export class TextAutoSaver extends AutoSaver {

  constructor(workElementID, triggers, pageID, interval) {

    super
    (
      data => { document.getElementById(workElementID).value = data;  },
      () => document.getElementById(workElementID).value,
      triggers,
      pageID,
      interval
    );
    let workElement = document.getElementById(workElementID);
    workElement.onchange = workElement.onkeyup = this.makeDirty;
  }
}

/*
Connects an AutoSaver to an Ace editor.
*/
export class AceAutoSaver extends AutoSaver {

  constructor(editor, triggers, pageID, interval) {

    super(
      data => { editor.setValue(data, -1);  },
      editor.getValue.bind(editor),
      triggers,
      pageID,
      interval
    );

    editor.on("change", this.makeDirty);
  }
}

/*
Connects an AutoSaver to a Blockly workspace.
*/
export class BlocklyAutoSaver extends AutoSaver {

  constructor(workspace, triggers, pageID, interval) {
    super(
      data => {
          if (data && data.length) {
            workspace.clear();
            Blockly.Xml.domToWorkspace
              (Blockly.Xml.textToDom(data), workspace);
          }
        },
      () => Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
      triggers,
      pageID,
      interval
    );

    this.workspace = workspace;
    this.workspace.addChangeListener(this.makeDirty);
  }
}

