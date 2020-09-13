<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="f" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<html>

<head>
  <title>History for Coder: ${coder.name}</title>
  <link rel="stylesheet" type="text/css" href="../css/CodersClub.css" />
  <script src="../jquery/jquery.js" ></script>
  <script src="../jquery/jquery-ui.min.js" ></script>
  <style>
    .headerButton {
      text-decoration: none;
      background-color: #EEEEEE;
      color: #333333;
      padding: 2px 6px 2px 6px;
      border-top: 1px solid #CCCCCC;
      border-right: 1px solid #333333;
      border-bottom: 1px solid #333333;
      border-left: 1px solid #CCCCCC;
    }
  </style>
</head>

<body>
<div class="main" >

  <img src="../img/Penguin.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>
    History for Coder: ${coder.name}
    <span style="float: right;" >
      <a class="headerButton" href="Checklist.do?coder=${coder.ID}" >Checklist</a>
      <a class="headerButton" href="shadow.html?shadow=${coder.ID}" target="_blank" >Shadow</a>
    </span>
  </h2>

  <table class="bordered" >
    <thead>
      <tr>
        <th style="width: 8em;" >Level</th>
        <th>Activity</th>
        <th style="width: 6em;" >Complete</th>
        <th>Points</th>
      </tr>
    </thead>
    <c:forEach var="level" items="${levelService.all}" >
      <c:set var="listableActivities" value="0" />
      <c:forEach var="activity" items="${level.activities}" >
        <c:if test="${activity.inUse || completed[activity.ID] != null}" >
          <c:set var="listableActivities" value="${listableActivities + 1}" />
        </c:if>
      </c:forEach>
      <c:forEach var="activity" varStatus="activityStatus" items="${level.activities}" >
        <c:if test="${activity.inUse || completed[activity.ID] != null}" >
          <tr class="level${level.number}" >
            <c:if test="${activityStatus.first}" >
              <td rowspan="${listableActivities}" >
                <table class="level${level.number}" >
                  <tr><td>${level.colorCapitalized}</td></tr>
                  <c:set
                    var="completedThisLevel"
                    value="${service.hasCoderCompletedLevel(coder.ID, level.number)}"
                  />
                  <tr><td>(<span id="pointsAt${level.number}" >${points[level.number]}</span>/<span id="maxPointsAt${level.number}" >${level.points}</span> points)</td></tr>
                  <tr><td>
                    <c:choose>
                      <c:when test="${completedThisLevel}" >
                        <c:set var="completedState" >checked="checked"</c:set>
                      </c:when>
                      <c:otherwise>
                        <c:remove var="completedState" />
                      </c:otherwise>
                    </c:choose>
                    <input
                      id="completedLevel${level.number}"
                      type="checkbox"
                      name="completed"
                      ${completedState}
                      onchange="toggleCompletedLevel(${level.number}, this, !this.checked);"
                    ></input>
                    <span id="dateLevelCompleted${level.number}" >
                      <c:choose>
                        <c:when test="${completedThisLevel}" >
                          <f:formatDate
                            value="${service.getCompletedLevel(coder.ID, level.number).dateCompleted}"
                            pattern="M/d/yy"
                          />
                        </c:when>
                        <c:otherwise>Completed</c:otherwise>
                      </c:choose>
                    </span>
                  </td></tr>
                  <tr><td>
                    <c:choose>
                      <c:when test="${coder.enabledLevel >= level.number}" >
                        <c:set var="enabledState" >checked="checked"</c:set>
                      </c:when>
                      <c:otherwise>
                        <c:remove var="enabledState" />
                      </c:otherwise>
                    </c:choose>
                    <input
                      type="checkbox"
                      name="enabled"
                      ${enabledState}
                      onchange="toggleEnabledLevel(${level.number});"
                    ></input> Enabled
                  </td></tr>
                </table>
              </td>
            </c:if>
            <c:choose>
              <c:when test="${activity.URL != null}" >
                <td><a
                  href="shadow.html?shadow=${coder.ID}&activity=${fn:replace(fn:replace(fn:replace(activity.URL, '?', '%3F'), ' ', '%20'), '=', '%3D')}"
                  target="_blank"
                  style="font-weight: normal"
                >${activity.fullName}</a></td>
              </c:when>
              <c:otherwise>
                <td>${activity.fullName}</td>
              </c:otherwise>
            </c:choose>
            <td>
              <c:choose>
                <c:when test="${completed[activity.ID] != null}" >
                  <c:set var="completedState" >checked="checked"</c:set>
                </c:when>
                <c:otherwise>
                  <c:remove var="completedState" />
                </c:otherwise>
              </c:choose>
              <input
                type="checkbox"
                name="completed"
                ${completedState}
                onchange="toggleCompletedActivity(${level.number}, ${activity.ID}, this, !this.checked);"
              ></input>
              <span id="dateActivityCompleted${activity.ID}" >
                <c:if test="${completed[activity.ID] != null}" >
                  <f:formatDate value="${completed[activity.ID]}" pattern="M/d/yy" />
                </c:if>
              </span>
            </td>
            <td id="pointsFor${activity.ID}" >${activity.points}</td>
          </tr>
        </c:if>
      </c:forEach>
    </c:forEach>
  </table>

  <form id="historyForm" action="History.do" method="post" >
    <input type="hidden" id="coder" name="coder" value="${coder.ID}" />
    <input type="hidden" id="command" name="command" value="" />
    <input type="hidden" id="level" name="level" value="" />
    <input type="hidden" id="activity" name="activity" value="" />
  </form>

  <div id="confirmDecertifyLevel" class="dialog" >
    <p>De-certify this coder at this level?</p>
    <p>
      <input id="decertLevelOK" type="button" value="OK" />
      <input id="decertLevelCancel" type="button" value="Cancel" />
    </p>
  </div>
  <div id="confirmDecertifyActivity" class="dialog" >
    <p>De-certify this coder for this activity?</p>
    <p>
      <input id="decertActivityOK" type="button" value="OK" />
      <input id="decertActivityCancel" type="button" value="Cancel" />
    </p>
  </div>

  <script type="module" crossorigin="use-credentials" >
    import {
        addLoggedInFooter,
        showDialog
      } from "../js/utility.js";

    var historyForm;
    var command;
    var level;
    var activity;

    function updatePoints(levelNumber, delta)
    {
      if ($("#completedLevel" + levelNumber).length == 0)
        return;

      var pointSpan = $("#pointsAt" + levelNumber);

      var points = Number(pointSpan.text());
      var maxPoints = Number($("#maxPointsAt" + levelNumber).text());

      if (delta)
        points += delta;

      var highlight = points >= maxPoints &&
        !$("#completedLevel" + levelNumber)[0].checked;

      pointSpan.text(points);

      var activityRows = $(".level" + levelNumber)
      if (highlight)
      {
          activityRows.addClass("overdue");
            activityRows.addClass("overdueDetail");
      }
      else
      {
        activityRows.removeClass("overdue");
      activityRows.removeClass("overdueDetail");
      }
    }

    window.toggleCompletedLevel = function(levelNumber, checkbox, confirmFirst)
    {
      if (confirmFirst)
      {
        showDialog("confirmDecertifyLevel", [ {
              ID: "decertLevelOK",
              handler: ev => { toggleCompletedLevel(levelNumber, checkbox); }
            }, {
              ID: "decertLevelCancel",
              handler: ev => { checkbox.checked = true; }
            }
          ]);
      } else {
        command.value = "toggleCompletedLevel";
        level.value = "" + levelNumber;
        $.post("History.do", $("#historyForm").serialize(), function(result)
          {
          $("#dateLevelCompleted" + levelNumber).html(result);
          updatePoints(levelNumber, 0);
          });
      }
    }

    window.toggleEnabledLevel = function(levelNumber)
    {
      command.value = "toggleEnabledLevel";
      level.value = "" + levelNumber;
      $.post("History.do", $("#historyForm").serialize());
    }

    window.toggleCompletedActivity = function(levelNumber, activityID, checkbox, confirmFirst)
    {
      if (confirmFirst)
      {
        showDialog("confirmDecertifyActivity", [ {
              ID: "decertActivityOK",
              handler: ev => { toggleCompletedActivity(levelNumber, activityID, checkbox); }
            }, {
              ID: "decertActivityCancel",
              handler: ev => { checkbox.checked = true; }
            }
          ]);
      } else {
        command.value = "toggleCompletedActivity";
        activity.value = "" + activityID;
        $.post("History.do", $("#historyForm").serialize(), function(result)
          {
          $("#dateActivityCompleted" + activityID).html(result);

          var activityPoints = Number($("#pointsFor" + activityID).text());
          updatePoints(levelNumber, activityPoints * (checkbox.checked ? 1 : -1));
          });
      }
    }

    $(document).ready(function()
      {
      addLoggedInFooter(document.querySelector("p.footer"), "${user}", "..");

        historyForm = document.getElementById("historyForm");
        command = document.getElementById("command");
        level = document.getElementById("level");
        activity = document.getElementById("activity");

        for (var i = 1; i <= ${levelService.count}; ++i)
          updatePoints(i, 0);

        $("html, body").scrollTop
          ($("input:checked").last().position().top -
              window.innerHeight / 2);
      });
  </script>

</div>
<p class="footer" ></p>
</body>

</html>

