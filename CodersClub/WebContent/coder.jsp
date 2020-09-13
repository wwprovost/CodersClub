<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:set var="coder" value="${user}" />

<html>

<head>
  <title>Welcome, Coder!</title>
  <link rel="stylesheet" type="text/css" href="css/CodersClub.css" />
  <script src="jquery/jquery.js" ></script>
  <script src="jquery/jquery-ui.min.js" ></script>
</head>

<body>
<div class="main" >

  <img src="img/Penguin_${service.getHighestCompletedLevel(coder.ID).color}.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Welcome, Coder!</h2>

  <table class="bordered" >
    <thead>
      <tr>
        <th>Level</th>
        <th>Activity</th>
        <th>Completed?</th>
      </tr>
    </thead>
    <c:set var="highest" value="${service.getHighestCompletedLevel(coder.ID).number}" />
    <c:forEach var="level" items="${levelService.all}" >
      <c:if test="${level.number <= highest + 1 || level.number <= coder.enabledLevel}" >
        <c:set var="listableActivities" value="0" />
        <c:forEach var="activity" items="${level.activities}" >
          <c:if test="${activity.inUse || completed[activity.ID] != null}" >
            <c:set var="listableActivities" value="${listableActivities + 1}" />
          </c:if>
        </c:forEach>
        <tr>
          <td id="header${level.number}" rowspan="${listableActivities + 2}" >${level.colorCapitalized}</td>
          <td id="flash${level.number}" colspan="2" class="${level.color}" >
            <span style="float: right;" >
              <input id="more${level.number}" type="button" value="More" onclick="showMore(${level.number});" />
              <input id="less${level.number}" type="button" value="Less" onclick="showLess(${level.number});" />
              <input id="density${level.number}" type="hidden" value="1" />
            </span>
            <p class="summary${level.number}" >
              <c:choose>
                <c:when test="${service.hasCoderCompletedLevel(coder.ID, level.number)}" >
                You have earned a ${level.color} belt.
                </c:when>
                <c:otherwise>
                  ${level.colorCapitalized}-belt activities
                </c:otherwise>
              </c:choose>
            </p>
            <p class="detail${level.number}" >${level.description}<p>
            <p class="detail${level.number}" >Try out the activities shown below. Be sure to <strong>show your coach</strong> when you finish an activity.<p>
            <p class="detail${level.number}" >To earn a ${level.color} belt, you must complete activities worth a total of ${level.points} points.<p>
          </td>
        </tr>
        <c:forEach var="activity" items="${level.activities}" >
          <c:if test="${activity.inUse || completed[activity.ID] != null}" >
            <c:set var="isCompleted" value="${completed[activity.ID] != null}" />
            <tr class="${level.color} detail${level.number} ${isCompleted || activity.optional ? 'minorDetail' : 'outstandingDetail'}${level.number}" >
              <td><c:choose><c:when test="${activity.inUse}" ><span
                    class="clickable"
                    onclick="showActivity('${level.colorCapitalized}',
                      '${activity.fullName}',
                      '${activity.descriptionEscaped}',
                      '${activity.URL}');"
                  >${activity.fullName}</span></c:when><c:otherwise>${activity.fullName}</c:otherwise></c:choose></td>
              <td>
                <c:choose>
                  <c:when test="${isCompleted}" >
                    <em>Did it!
                    <fmt:formatDate value="${completed[activity.ID]}" pattern="M/d/yy" /></em>
                  </c:when>
                  <c:otherwise>
                    <input
                      type="button"
                      value="Do it!"
                      onclick="showActivity('${level.colorCapitalized}',
                        '${activity.fullName}',
                        '${activity.descriptionEscaped}',
                        '${activity.URL}');"
                    ></input>
                  </c:otherwise>
                </c:choose>
                <span style="float: right;" >for ${activity.points} point(s)</span>
              </td>
            </tr>
          </c:if>
        </c:forEach>
        <tr id="points${level.number}" class="${level.color} detail${level.number}" >
          <td colspan="2" >
            <span style="float: right;" >Total ${points[level.number]} point(s)</span>
          </td>
        </tr>
      </c:if>
    </c:forEach>
  </table>

  <div id="welcome" class="dialog" >
    <h3>Welcome to Coders' Club!</h3>
    <p>This home page will come up each time you log in. It shows coding activities
       that you can try, and has links to take you to them. The activities are grouped
       into levels -- white, yellow, orange, and so on -- and when you complete
       the requirements for a given level, you earn a belt of that color.</p>
    <p>When you complete an activity -- finish a program to draw a shape in Sprout,
       or solve a level of the Maze Game -- be sure to tell your coach.
       Your coach will mark your progress, and the next time you log in you'll
       see that it shows what you've done. As you complete one level, the next
       one will appear on this page and you'll have a new bunch of activities to
       try out.</p>
    <p>You can review this anytime by clicking the <strong>Show Intro</strong>
       button at the bottom of the page. Okay -- let's get coding!
       Click <strong>Close</strong> below and get started.</p>
     <p><input id="closeWelcome" type="button" value="Close" /></p>
  </div>
  <script type="module" crossorigin="use-credentials" >
    import { showDialog } from "./js/utility.js";

    window.showWelcome = function() {
      showDialog("welcome", [ { ID: "closeWelcome" } ]);
    }
  </script>

  <div id="notebook" class="dialog" >
    <h3>Coders' Notebook</h3>
    <p>Now that you'll be working with textual languages, you may want to use the new coders'-notebook feature. Click the <strong>Notebook</strong> button at the bottom of the page to go your personal notebook. You can copy programs that you like from NumberCrunch, Sprout Text, and Secret Coders' Club, and paste them here; then grab them and paste them back into those coding applications when you want to work on them again.</p>
    <p>Code placed in your notebook is not visible to other coders, but it is visible to coaches.</p>
  </div>
  <script type="module" crossorigin="use-credentials" >
    import { showDialog } from "./js/utility.js";

    window.showNotebook = function() {
      showDialog("notebook", [ { ID: "closeNotebook" } ]);
    }
  </script>

  <div id="activityDetail" class="dialog" >
    <h3>Coding Activity</h3>
    <table>
      <tr>
        <td>Level:</td>
        <td id="activityLevel" ></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td id="activityName" ></td>
      </tr>
      <tr id="activityInstructions" >
        <td>Instructions:</td>
        <td id="activityDescription" ></td>
      </tr>
      <tr id="activityLink">
        <td>Link:</td>
        <td><a id="activityURL" ></a></td>
      </tr>
    </table>
    <p><input id="closeActivityDetail" type="button" value="Close" /></p>
  </div>

  <script type="module" crossorigin="use-credentials" >
    import { showDialog } from "./js/utility.js";

    window.hideActivity = function(ev) {
      document.getElementById("activityDetail").style.display = "none";
    }

    window.showActivity = function(level, name, description, URL)
    {
      $("#activityLevel").text(level);
      $("#activityName").text(name);
      $("#activityDescription").text(description);

      if (description.length != 0)
      {
        $("#activityDescription").text(description);
        $("#activityInstructions").show();
      }
      else
        $("#activityInstructions").hide();

      if (URL.length != 0)
      {
        $("#activityURL").attr("href", URL);
        $("#activityURL").attr("target", "_blank");
        $("#activityURL").text(URL);
        $("#activityURL").click(hideActivity);
        $("#activityLink").show();
      }
      else
        $("#activityLink").hide();

      showDialog("activityDetail", [ { ID: "closeActivityDetail" } ]);
    }
  </script>

</div>
<p class="footer" >
  <span style="float: right; margin-right: .2in;" >
    <c:if test="${highest > 2}" >
      <input type="button" value="Notebook" onclick="window.location.href='Notebook.do';" />
    </c:if>
    <input type="button" value="Show Intro" onclick="showWelcome();" />
  </span>
</p>

  <script type="module" crossorigin="use-credentials" >
    import {
        addLoggedInFooter,
        burnInBackground,
        burnInRowBackground
      } from "./js/utility.js";

    $(document).ready(function()
    {
      addLoggedInFooter(document.querySelector("p.footer"), "${user}");

      var beltColor = "${service.getHighestCompletedLevel(coder.ID).color}";
      var highest = ${service.getHighestCompletedLevel(coder.ID).number};
      var levels = ${levelService.count};

      for (var level = 1; level <= levels; ++level)
      {
        $("#flash" + level).attr("temp", $("#flash" + level).attr("class"));

        let density = level + 1 - highest;
        if (density < 0)
          density = 0;
        showAtLevel(level, density);

        if (level > highest)
        {
          $("#more" + level).hide();
          $("#less" + level).hide();
        }
      }

      burnInBackground(beltColor);
      burnInRowBackground(beltColor,
        ($("tr.outstandingDetail" + highest).length == 0 ? "#flash" : "#points")
          + highest);

      <c:choose>
        <c:when test="${coder.firstLogin}" >
          setTimeout(function() { showWelcome(); }, 1000);
        </c:when>
        <c:when test="${showNotebook}" >
          setTimeout(function() { showNotebook(); }, 1000);
        </c:when>
      </c:choose>

      $("span.clickable").css('cursor', 'pointer');
    });

    function showAtLevel(level, density)
    {
      let activityCount = $("tr.detail" + level).length;
      let outstandingCount = $("tr.outstandingDetail" + level).length;
      if (outstandingCount == 0)
      {
        let oldDensity = parseInt($("#density" + level).val() || "2");
        density = oldDensity == 0 ? 2 : 0;
      }

      $("#density" + level).val(density);

      var moreButton = $("#more" + level);
      var lessButton = $("#less" + level);

      switch(density)
      {
        case 0:
          $("#header" + level).attr("rowspan", 1);
          $("#flash" + level).attr("class", $("#flash" + level).attr("temp"));
          $(".summary" + level).show();
          $(".detail" + level).hide();
          lessButton.prop("disabled", true);
          moreButton.prop("disabled", false);
          break;

        case 1:
          $("#header" + level).attr("rowspan", outstandingCount + 2);
          $("#flash" + level).attr("class", "");
          $(".summary" + level).hide();
          $(".detail" + level).show();
          $(".minorDetail" + level).hide();
          lessButton.prop("disabled", false);
          moreButton.prop("disabled", false);
          break;

        case 2:
          $("#header" + level).attr("rowspan", activityCount + 1);
          $("#flash" + level).attr("class", "");
          $(".summary" + level).hide();
          $(".detail" + level).show();
          $(".minorDetail" + level).show();
          lessButton.prop("disabled", false);
          moreButton.prop("disabled", true);
          break;
      }
    }

    window.showMore = function(level)
    {
      let density = parseInt($("#density" + level).val());
      if (density < 2)
        showAtLevel(level, density + 1);
    }

    window.showLess = function(level)
    {
      let density = parseInt($("#density" + level).val());
      if (density > 0)
        showAtLevel(level, density - 1);
    }
  </script>

</body>

</html>

