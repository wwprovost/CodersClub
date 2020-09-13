<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:set var="coder" value="${user}" />

<html>

<head>
  <title>Coder's Notebook</title>
  <link rel="stylesheet" type="text/css" href="css/CodersClub.css" />
  <script src="jquery/jquery.js" ></script>
  <script src="jquery/jquery-ui.min.js" ></script>
</head>

<body>
<div class="main" >

  <img src="img/Penguin_${service.getHighestCompletedLevel(coder.ID).color}.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Coder's Notebook</h2>

  <p>Copy and paste into this text area anything that you want to save for next session:</p>

  <form id="notesForm" >
    <textarea name="notes" >${coder.notes}</textarea>

    <p class="footer" >
      <span style="float: right; margin-right: .2in;" >
        <span id="confirmation" style="display: none;" >Saved your notes.</span>
        <input type="button" id="saveButton" value="Save" onclick="saveNotes();" />
      </span>
      Logged in as ${user}
    </p>
</form>
</div>

  <script type="module" crossorigin="use-credentials" >
    import { addLoggedInFooter, burnInBackground } from "./js/utility.js";

    $(document).ready(function()
      {
        addLoggedInFooter(document.querySelector("p.footer"), "${user}");
        burnInBackground("${service.getHighestCompletedLevel(coder.ID).color}");
      });

    function saveNotes()
    {
      $.post("Notebook.do", $("#notesForm").serialize(),
        function()
        {
        $("#confirmation").fadeIn(500).delay(1000).fadeOut(500);
        });
    }
  </script>


</body>

</html>

