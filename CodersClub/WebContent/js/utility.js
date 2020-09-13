// Requires jQuery and jQuery-UI

import { getDimension } from "./layout.js";

//////////////////////////////////////////////
// Colors and effects for CC pages
//

export const palette = {
  white: {
      intense: "#eee",
      normal: "#fff",
      border: "#000" // not used yet
    },
  green: {
      intense: "#eee",
      normal: "#fff",
      border: "#000" // not used yet
    },
  yellow: {
      intense: "#ff8",
      normal: "#ffc",
      border: "#000" // not used yet
    },
  orange: {
      intense: "#fb6",
      normal: "#fc8",
      border: "#000"
    },
  brown: {
      intense: "#994d00",
      normal: "#c60",
      border: "#000"
    },
  red: {
      intense: "#e44",
      normal: "#faa",
      border: "#800"
    },
  purple: {
      intense: "#c6c",
      normal: "#f8f",
      border: "#808"
    },
  blue: {
      intense: "#89c",
      normal: "#bcf",
      border: "#008"
    },
  black: {
      intense: "#000",
      normal: "#444",
      border: "#000"
    }
};

export function burnInBackground(beltColor)
{
    var beltPalette = palette[beltColor];
    $("body").animate
      (
        { backgroundColor: beltPalette.intense },
        1500,
        function()
        {
          $("body").animate({ backgroundColor: beltPalette.normal }, 750);
        }
      );
}

export function burnInRowBackground(beltColor, rowID)
{
    var beltPalette = palette[beltColor];
    $(rowID).animate
      (
        { backgroundColor: beltPalette.intense },
        1500,
        function()
        {
          $(rowID).animate
            (
              { backgroundColor: beltPalette.normal },
              750,
              function() { $(rowID).css("backgroundColor", ""); }
          );
        }
      );
}

export const colorTable = [ "#bfd", "#ffd", "#fdd", "#9ff", "#eee", "#fda" ];


//////////////////////////////////////////////
// HTTP request support
//

export function getBasePath() {
  return window.location.href.indexOf("CodersClub") != -1
    ? "/CodersClub/"
    : "/";
}

export function checkHTTPStatus(expected, response) {
  if (response.status == expected) {
    return response;
  } else {
    throw "Unexpected HTTP status of " + response.status;
  }
}

export const checkFor200 = checkHTTPStatus.bind(null, 200);

export function requestParams() {

  let result = {}
  let queryString = window.location.search;
  if (queryString.length > 1) {
    for (let nameAndValue of queryString.substring(1).split("&")) {
      let [ name, value ] = nameAndValue.split("=");
      result[name] = value;
    }
  }

  return result;
}


//////////////////////////////////////////////
// Authentication and authorization
//

export function addLoggedInFooter(parent, username, pathToRoot) {

  let params = requestParams();
  if (params.shadow) {
    return fetch((pathToRoot || ".") + "/REST/Staff/Coders/" + params.shadow)
      .then(checkFor200)
      .then(response => response.json())
      .then(coder => {
          addLoggedInFooterWithShadow(parent, username, coder.name, pathToRoot);
          sessionStorage.setItem("shadowID", params.shadow);
          sessionStorage.setItem("shadowName", coder.name);
        })
      .catch(console.log);
  } else {
    addLoggedInFooterWithShadow(parent, username, null, pathToRoot);
    return Promise.resolve("dummy");
  }
}

export function addLoggedInFooterWithShadow(parent, username, shadowname, pathToRoot) {
  let text1 = document.createTextNode("Logged in as ");

  let profileLink = document.createElement("span");
  profileLink.style.fontWeight = "bold";
  profileLink.textContent = username;
  profileLink.style.cursor = "pointer";
  profileLink.onclick = ev => {
      window.location = "../Staff/profile.html";
    };

  let text2 = document.createTextNode(" ... that is, until you ");

  let logoutLink = document.createElement("span");
  logoutLink.style.fontWeight = "bold";
  logoutLink.textContent = "logout";
  logoutLink.style.cursor = "pointer";
  logoutLink.onclick = ev => {
      let form = document.createElement("form");
      form.setAttribute("method", "post");
      form.setAttribute("action", (pathToRoot || ".") + "/Logout.do");
      document.body.appendChild(form);
      form.submit();
    };

  let text3 = document.createTextNode(".");

  parent.appendChild(text1);
  parent.appendChild(profileLink);
  if (shadowname) {
      let shadowSpan = document.createElement("span");
      shadowSpan.textContent = " (shadowing " + shadowname + ")";
      parent.appendChild(shadowSpan);
    }
  parent.appendChild(text2);
  parent.appendChild(logoutLink);
  parent.appendChild(text3);
}


export function enableActions(user) {
  if (user.coach) {
    document.querySelectorAll(".RoleEnabled.Coach").forEach(element => {
        element.style.display = "block";
      });
  }
  if (user.admin) {
    document.querySelectorAll(".RoleEnabled.Admin").forEach(element => {
        element.style.display = "block";
      });
  }
}

export function selfDiscover(footer, pathToRoot) {
  return fetch(pathToRoot + "/REST/Staff/Profile")
    .then(checkFor200)
    .then(response => response.json())
    .then(user => {
        return addLoggedInFooter(footer, user.name, pathToRoot)
          .then(dummy => {
              enableActions(user);
              return user;
            });
      })
    .catch(console.log);
}

export class AdminPage {

  // Call from window.onload or similar
  constructor(navID, footer, pathToRoot, userFunction) {

    let nav = document.getElementById(navID);
    let main = document.querySelector(".main");

    window.onresize = function() {
        let mainMargin = getDimension(main, "margin");
        let mainBorder = getDimension(main, "border-width");
        let mainPadding = getDimension(main, "padding");
        let footerHeight = getDimension(footer, "height");
        let footerMargin = getDimension(footer, "margin");
        let inset = mainMargin + mainBorder + mainPadding;

        let mainHeight = getDimension(main, "height");
        let windowHeight = document.body.clientHeight - inset * 2;
        let height = windowHeight > mainHeight
          ? mainHeight : windowHeight;

        nav.style.height = "" + (height - footerHeight - footerMargin) + "px";
      };
    window.onresize();

    selfDiscover(footer, pathToRoot).then(userFunction || (user => {}));
  }
}

export function getShadowingStatement() {
  let shadowName = sessionStorage.getItem("shadowName");
  if (shadowName) {
    if (sessionStorage.getItem("tracking")) {
      return "shadowing " + shadowName;
    } else {
      return "reviewing " + shadowName;
    }
  }
  return "";
}

export function navigateTo(activity) {

  if (activity != null) {
    let base = getBasePath();
    let currentPath = window.location.pathname.replace(base, "") +
        window.location.search;
    if (currentPath != activity) {
      window.location.href = window.location.protocol + "//" +
          window.location.host + base + activity;
      return true;
    }
  }

  return false;
}

export function pollAndFollow() {

  let poller = () => {
      let navigating = false;
      fetch(getBasePath() + "REST/Staff/Activity/" + sessionStorage.getItem("shadowID"))
        .then(checkFor200)
        .then(response => response.json())
        .then(activity => { navigating = navigateTo(activity.location); })
        .catch(console.log)
        .finally(() => {
            if (!navigating) {
              setTimeout(poller, 5000);
            }
          });
    };

  poller();
}


export function showDialog(dialogID, buttonsAndHandlers) {

  for (let { ID, handler } of buttonsAndHandlers) {
    document.getElementById(ID).onclick = ev => {
        document.getElementById(dialogID).style.display = "none";
        if (typeof handler == "function") {
          handler(ev);
        }
      };
  }

  document.getElementById(dialogID).style.display = "block";
}

export function askTheUser(dialogID, OKHandler, OKID, cancelID) {
  return new Promise((resolve, reject) => {
      document.getElementById(OKID).onclick = ev => {
          document.getElementById(dialogID).style.display = "none";
          resolve(OKHandler());
        };
      document.getElementById(cancelID).onclick = ev => {
          document.getElementById(dialogID).style.display = "none";
          reject(null);
        };

      document.getElementById(dialogID).style.display = "block";
    });
}

export function showMessage(dialogID, messageID, message) {
  document.getElementById(messageID).innerHTML = message;
  showDialog(dialogID, [{ ID: "errorOK", handler: () => {} }]);
}

class EMailMessage {
  constructor(recipient, URL, subject, body) {
    this.recipient = recipient;
    this.URL = URL;
    this.subject = subject;
    this.body = body;
  }
}

export class EMailToParent extends EMailMessage {
  constructor(coder, subject, body) {
    super(coder.parentEMail, "Coders/" + coder.id, subject, body);
  }
}

export class EMailToGroup extends EMailMessage {
  constructor(group, subject, body) {
    super("Group: " + group, "Coders?group=" + group, subject, body);
  }
}

export class EMailToActiveCoders extends EMailMessage {
  constructor(coders, subject, body) {
    super("Active coders", "Coders?active", subject, body);
  }
}

export class EMailToAllCoders extends EMailMessage {
  constructor(name, coders, subject, body) {
    super("All coders", "Coders", subject, body);
  }
}

export class EMailToAllStaff extends EMailMessage {
  constructor(name, coders, subject, body) {
    super("All coaches and administrators", "Staff", subject, body);
  }
}

export class EMailToAllCoaches extends EMailMessage {
  constructor(name, coders, subject, body) {
    super("All coaches", "Staff?coach", subject, body);
  }
}

export class EMailToAllAdmins extends EMailMessage {
  constructor(name, coders, subject, body) {
    super("All administrators", "Staff?admin", subject, body);
  }
}

export const SEND_FAILED = "The server was unable to send this message.";
export const SOME_SENDS_FAILED = "Some messages could not be sent:<br/>";

export class EMailDialog {

  constructor(root, emails) {
    this.root = root;
    this.emails = emails;
    this.index = 0;

    this.recipient = document.getElementById("emailRecipient");
    this.subject = document.getElementById("emailSubject");
    this.body = document.getElementById("emailBody");
    this.BCC = document.getElementById("emailBCC");
    this.BCCAddress = document.getElementById("emailBCCAddress");
    this.busy = document.getElementById("emailBusy");

    this.send = this.send.bind(this);
    this.skip = this.skip.bind(this);
    this.cancel = this.cancel.bind(this);
    this.cancelOnEscape = this.cancelOnEscape.bind(this);

    this.subject.onkeyup = this.cancelOnEscape;
    this.body.onkeyup = this.cancelOnEscape;
  }

  showResult(message) {
    showMessage("errorDialog", "errorMessage", message);
  }

  showEMail() {
    this.recipient.textContent = this.emails[this.index].recipient;
    this.subject.value = this.emails[this.index].subject || "";
    this.body.value = this.emails[this.index].body || "";

    this.subject.focus();
  }

  send() {
    fetch("../REST/EMail/Config")
      .then(checkFor200)
      .then(response => response.json())
      .then(configAndStatus => configAndStatus.passwordSet
        ? Promise.resolve("dummy")
        : askTheUser("passwordDialog",
              () => document.getElementById("password").value,
              "passwordOK", "passwordCancel")
            .then(password => fetch("../REST/EMail/Password", {
                  method: "PUT",
                  body: password
                })
              .then(checkHTTPStatus.bind(null, 204))))
      .then(dummy => {
          this.BCC.style.visibility = "hidden";
          this.BCCAddress.style.visibility = "hidden";
          this.busy.style.visibility = "visible";
          return dummy;
        })
      .then(dummy => fetch("../REST/EMail/" + this.emails[this.index].URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
            body: JSON.stringify({
                subject: this.subject.value,
                body: this.body.value,
                BCC: this.BCC.checked ? user.email : null
              })
          }))
      .then(response => {
          response.json()
            .then(body => {
                if (response.status == 200) {
                  if ("outcome" in body) {
                    if (body.outcome == "SENT") {
                      this.skip();
                    } else {
                      this.showResult(SEND_FAILED + " " + body.errorMessage);
                    }
                  } else {
                    let failures =
                        body.filter(result => result.outcome != "SENT");
                    let numberSent = body.length - failures.length;
                    let message = numberSent != 0
                      ? "Sent " + numberSent + " messages. "
                      : "";
                    if (failures.length != 0) {
                      message += SOME_SENDS_FAILED + failures.map(result =>
                            result.recipient + ": " + result.errorMessage)
                          .join("<br/>");
                    } else {
                      this.skip();
                    }

                    this.showResult(message);
                  }
                } else {
                  this.showResult("outcome" in body
                    ? body.errorMessage
                    : body[0].errorMessage);
                }
              })
            .catch(err => {
                this.showResult(SEND_FAILED);
                console.log(err);
              });
        })
      .catch(console.log)
      .finally(dummy => {
          this.BCC.style.visibility = "visible";
          this.BCCAddress.style.visibility = "visible";
          this.busy.style.visibility = "hidden";
        });
  }

  skip() {
    ++this.index;
    if (this.index < this.emails.length) {
      this.showEMail();
    } else {
      this.cancel();
    }
  }

  cancel() {
    document.getElementById(this.root).style.display = "none";
  }

  cancelOnEscape(ev) {
        if (ev.keyCode == 27) {
          this.cancel();
        }
  }

  show() {
    this.BCCAddress.textContent = "BCC " + user.email;

    this.BCC.style.visibility = "visible";
    this.BCCAddress.style.visibility = "visible";
    this.busy.style.visibility = "hidden";
    document.getElementById(this.root).style.display = "block";

    document.getElementById("emailSend").onclick = this.send;
    let skipBn = document.getElementById("emailSkip");
    if (skipBn) {
      skipBn.onclick = this.skip;
    }
    document.getElementById("emailCancel").onclick = this.cancel;

    this.showEMail();
  }
}

