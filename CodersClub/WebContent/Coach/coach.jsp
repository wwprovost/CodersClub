<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="coach" value="${user}" />

<html>

<head>
  <title>Welcome, Coach!</title>
  <link rel="stylesheet" type="text/css" href="../css/CodersClub.css" />
  <script src="../jquery/jquery.js" ></script>
  <script src="../jquery/jquery-ui.min.js" ></script>
</head>

<body>
<div class="main" >

  <img src="../img/Penguin.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Welcome, Coach!</h2>

  <p class="errorMessage" >${errorMessage}</p>

  <c:forEach var="group" items="${coderService.getGroups(coach.club)}" >
    <h3>Group ${group} (show <a href="Checklist.do?group=${group}" >Checklists</a>)</h3>
      <!-- no workie on Chrome:
      <div style="-moz-columns: 3 12em;" >
        <c:forEach var="coder" items="${coderService.getGroupOfCoders(coach.club, group)}" >
          <p style="margin: 4px;" >
            <a href="History.do?coder=${coder.ID}" >${coder.name}</a>
          </p>
        </c:forEach>
      </div>
      -->
      <c:set var="coders" value="${coderService.getGroupOfCoders(coach.club, group)}" />
      <c:set var="count" value="${coders.size()}" />
      <c:set var="third" value="${(count + 2) / 3}" />
      <table>
        <c:forEach var="row" begin="0" end="${third-1}" >
          <tr>
            <c:forEach var="col" begin="0" end="${third*2}" step="${third}" >
              <c:if test="${row + col < count}" >
                <c:set var="classes" >
                  <c:if test="${!coders[row + col].overdue || !coders[row + col].attendedThisWeek}" >class="</c:if>
                  <c:choose>
                    <c:when test="${coders[row + col].overdue}" >overdue overdueSummary</c:when>
                    <c:when test="${!coders[row + col].attendedThisWeek}" >absent</c:when>
                  </c:choose>
                  <c:if test="${!coders[row + col].overdue || !coders[row + col].attendedThisWeek}" >"</c:if>
                </c:set>
                <td>
                  <a
                    href="History.do?coder=${coders[row + col].ID}"
                    ${classes}
                  >${coders[row + col].name}</a>
                </td>
              </c:if>
            </c:forEach>
          </tr>
        </c:forEach>
      </table>
  </c:forEach>

  <c:if test="${coach.admin}" >
    <hr/>
    <p><a href="../Staff/coders.html" >Club membership</a></p>
  </c:if>

</div>
<p class="footer" ></p>
<script type="module" crossorigin="use-credentials" >
  import { addLoggedInFooter } from "../js/utility.js";
  window.onload = function() {
    addLoggedInFooter(document.querySelector("p.footer"), "${user}", "..");
    };
</script>
</body>

</html>

