<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<form
  action="j_security_check"
  method="post"
  onsubmit="fixUsername();"
>
  <table>
    <tbody>
      <tr>
        <td>Club name:</td>
        <td><select id="club" ></select></td>
      </tr>
      <tr>
        <td>First name:</td>
        <td><input
              id="firstName"
              type="text"
              value=""
              autofocus="true"
              tabindex="1"
            /></td>
      </tr>
      <tr>
        <td>Last name:</td>
        <td><input
              id="lastName"
              type="text"
              value=""
              tabindex="2"
            /></td>
        <td>
          <input
            id="coach"
            type="checkbox"
            tabindex="5"
            onclick="toggleCoach();"
          >I'm a coach or administrator</input>
        </td>
      </tr>
      <tr id="passwordField" style="display: none;" >
        <td>Password:</td>
        <td><input
              id="password"
              type="password"
              value=""
              tabindex="3"
            /></td>
      </tr>
      <tr>
        <td>
          <input
            id="login"
            class="button"
            type="submit"
            value="Login"
            tabindex="4"
          />
        </td>
      </tr>
    </tbody>
  </table>
  <input type="hidden" id="j_username" name="j_username" />
  <input type="hidden" id="j_password" name="j_password" />

</form>

<script>
  const CLUB_KEY = "clubName";

  window.onload = function()
  {
    let previousClub = localStorage.getItem(CLUB_KEY);
    let clubSelector = document.getElementById("club");
    fetch("${pageContext.request.contextPath}/REST/Clubs")
      .then(response => response.json())
      .then(clubs => clubs.forEach(club => {
              var option = document.createElement("option");
          option.value = "" + club.id;
          option.textContent = club.fullName;
          if (previousClub != null && previousClub == option.value) {
            option.selected = true;
          }
          clubSelector.options.add(option);
        }))
      .catch(console.log);
  }

  function toggleCoach()
  {
    let coach = document.getElementById("coach").checked;
    document.getElementById("password").value = "";

    document.getElementById("passwordField").style.display =
      coach ? "table-row" : "none";
    if (coach) {
      document.getElementById("password").focus();
    }
  }

  function fixUsername()
  {
    var club = document.getElementById("club").value;
    var firstName = document.getElementById("firstName").value.toLowerCase().trim();
    var lastName = document.getElementById("lastName").value.toLowerCase().trim();
    document.getElementById("j_username").value = club + "_" + firstName + "_" + lastName;

    let password = document.getElementById("password").value;
    document.getElementById("j_password").value = password || "NoPassword";

    localStorage.setItem(CLUB_KEY, club);
  }
</script>
