<%@ taglib prefix="tags" tagdir="/WEB-INF/tags" %>

<html>

<head>
  <title>Coders' Club</title>
  <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/CodersClub.css" />
  <style>
    span.help
    {
      margin-left: 40px;
    }

    a
    {
      color: #090;
    }
  </style>
</head>

<body>
<div class="main" >

  <img src="${pageContext.request.contextPath}/img/Penguin.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Coders' Club</h2>

  <tags:loginForm />

  <hr />

  <p>Coders' Club is a parent-supported program of coding activities for elementary-school kids. Kid-coders learn basic to intermediate coding and start to get the big ideas of loops, conditionals, and algorithms -- and that, hey, you can get a computer to do work for you. The individual clubs listed above use this application to support those coding activities and also coaches and administrators who help and teach coders, and can track their progress.</p>

  <p>If you are new to a club, here are some good resources:</p>
  <p>
    <img src="${pageContext.request.contextPath}/img/Blank.png" width="40" height="1" />
    <a href="Docs/codersClub101.html" >Coders' Club 101</a>
    <img src="${pageContext.request.contextPath}/img/Blank.png" width="40" height="1" />
    <a href="Docs/helpForCoaches.html" >Help for coaches</a>
    <img src="${pageContext.request.contextPath}/img/Blank.png" width="40" height="1" />
    <a href="Docs/helpForAdmins.html" >Help for administrators</a>
  </p>

  <p>Members and non-members alike, feel free to <a href="guest.html" >try out the coding activities</a> themselves.</p>
  <p>And, one final note: many pages on this site use newer JavaScript features, and they have only been tested on the <a href="https://www.google.com/chrome" >Chrome</a> web browser.</p>
</div>
</body>

</html>

