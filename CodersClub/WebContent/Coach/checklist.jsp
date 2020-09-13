<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<html>

<head>
<title>Checklists</title>
<link rel="stylesheet" type="text/css" href="../css/Checklist.css" />
</head>

<body>
  <div class="main">

    <c:forEach var="pair" varStatus="coderStatus" items="${coders}">

      <c:set var="coder" value="${pair.coder}" />
      <c:set var="completed" value="${pair.completed}" />
      <h2>${coder.name}-- Checklist</h2>
      <p class="activity" ><em>Check the first box to show that the coder has completed the activity.</em></p>
      <p class="activity" ><em>Check the second box when the activity has been marked complete in the system.</em></p>

      <!-- Show completed level and next two; but, white and yellow fit on one 
           column, and purple is the max starting point, showing blue and black. -->
      <c:set
        var="index"
        value="${service.getHighestCompletedLevel(coder.ID).number - 1}"
      />
      <c:set
        var="startingPoint"
        value="${index > 1 ? (index < 6 ? index : 5) : 0}"
      />

      <table>
        <tr>
          <c:forEach var="column" begin="${startingPoint}" end="${startingPoint + 2}" >
            <td>
              <c:forEach
                var="levelNumber"
                begin="${column == 1 ? 0 : column}"
                end="${column}"
              >
                <c:set var="level" value="${levelService.all[levelNumber]}" />
                <h3>${level.colorCapitalized}-belt activities</h3>
                <c:forEach var="activity" items="${level.activities}" >
                  <c:if test="${activity.inUse}" >
                    <c:if test="${group == null || activity.group.ID != group.ID}" >
                      <c:set var="group" value="${activity.group}" />
                      <h4>${group.name}</h4>
                    </c:if>
                    <c:choose>
                      <c:when test="${completed[activity.ID]}" ><c:set var="checked" value="X" /></c:when>
                      <c:otherwise><c:set var="checked" value="&nbsp;" /></c:otherwise>
                    </c:choose>
                    <p class="activity" >
                      <span class="checkbox" >${checked}</span>
                      <span class="checkbox" >${checked}</span>
                      ${activity.shortName}
                    </p>
                  </c:if>
                </c:forEach>
              </c:forEach>
            </td>
          </c:forEach>
        </tr>
      </table>

      <c:if test="${!coderStatus.last}">
        <p style="page-break-after: always;"></p>
      </c:if>

    </c:forEach>
  </div>
</body>

</html>

