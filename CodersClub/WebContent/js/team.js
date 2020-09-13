import { checkHTTPStatus, getBasePath } from "./utility.js";

function getBaseURL() {
  return getBasePath() + "REST/Team";
}

/**
 * Set up with IDs for HTML elements and a callback function,
 * which will be called with an array of other coder's IDs --
 * meaning that in one position there will be a null, and that's you!
 */
export class TeamerUpper {

    constructor(pageID, createBn, teamCodeLabel, teamCodeInput, joinBn,
      teamUpPanel, codePanel, onTeamFormed) {

    this.pageID = pageID;
    this.createBn = document.getElementById(createBn);
    this.teamCodeLabel = document.getElementById(teamCodeLabel);
    this.teamCodeInput = document.getElementById(teamCodeInput);
    this.joinBn = document.getElementById(joinBn);
    this.teamUpPanel = document.getElementById(teamUpPanel);
    this.codePanel = document.getElementById(codePanel);
    this.onTeamFormed = onTeamFormed;

    this.teamUpPanel.style.display = "block";
    this.teamCodeLabel.style.visibility = "hidden";

    this.codePanel.style.display = "none";

    this.showTeamCode = this.showTeamCode.bind(this);
    this.findTeam = this.findTeam.bind(this);

    this.createBn.onclick = this.createTeam.bind(this);
    this.joinBn.onclick = this.joinTeam.bind(this);

    this.findTeamTimeout = 5000;
    this.findTeam();
  }

  showTeamCode(teamCode) {
    this.createBn.disabled = "disabled";

    this.teamCodeLabel.innerHTML =
      "Tell your teammate to enter this code: <strong>" +
        teamCode + "</strong>.";
    this.teamCodeLabel.style.visibility = "visible";
  }

  findTeam() {
    let URL = getBaseURL() + "/" + this.pageID;
    let shadow = sessionStorage.getItem("shadowID");
    if (shadow) {
      URL += "?shadow=" + shadow;
    }

    fetch(URL)
      .then(response => checkHTTPStatus(200, response))
      .then(response => response.json())
      .then(team => {
          if (team.length > 1) {
            this.teamUpPanel.style.display = "none";
            this.codePanel.style.display = "block";

            this.onTeamFormed(team);
          } else {
            if (team.length == 1) {
              this.showTeamCode(team[0].teamCode);
            }

            setTimeout(this.findTeam, this.findTeamTimeout);
          }
        })
      .catch(console.log);
  }

  createTeam() {
    return fetch(getBaseURL() + "?pageID=" + this.pageID, {
          method: "POST",
          credentials: "same-origin"
        })
      .then(response => checkHTTPStatus(201, response))
      .then(response => response.text())
      .then(this.showTeamCode)
      .catch(console.log);
  }

  joinTeam() {
    this.findTeamTimeout = 1000;
    return fetch(getBaseURL() + "/" + this.teamCodeInput.value, {
          method: "PUT",
          credentials: "same-origin"
        })
      .then(response => checkHTTPStatus(200, response))
      .then(response => response.text())
      .then(ordinal => {
          this.createBn.disabled = "disabled";
          this.joinBn.disabled = "disabled";
        })
      .catch(console.log);
  }
}
