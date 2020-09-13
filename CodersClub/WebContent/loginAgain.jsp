
<%@ taglib prefix="tags" tagdir="/WEB-INF/tags" %>

<html>

<head>
  <title>Coders' Club</title>
  <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/CodersClub.css" />
</head>

<body>
<div class="main" >

  <img src="${pageContext.request.contextPath}/img/Penguin.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Coders' Club &#8212; Please Log In</h2>

  <p 
    id="errorMessage" 
    style="color: red; font-weight: bold;" 
  >The server could not authenticate you.  Please try again:</p>
  
  <tags:loginForm />

</div>
</body>

</html>

