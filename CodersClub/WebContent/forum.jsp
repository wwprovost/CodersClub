<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="user" value="${user}" />

<html>

<head>
  <title>Coder's Club Forum</title>
  <link rel="stylesheet" type="text/css" href="css/CodersClub.css" />
  <script src="jquery/jquery.js" ></script>
  <script src="jquery/jquery-ui.min.js" ></script>
</head>

<body>
<div class="main" >

  <img src="img/Penguin_green.jpg" style="float: right; height: 1in; margin-left: 2em;" />
  <h2>Coder's Club Forum</h2>

  <p>
    <input type="button" value="Post" onclick="showPostDialog();" />
    your code here for others to read:
  </p>
  <ul>
    <li>A Sprout-Text program you especially like</li>
    <li>A Secret Coders' Club message for others to try to decode (maybe with some hints)</li>
    <li>Any piece of code you think is interesting</li>
  </ul>

  <div id="posts" >
  </div>

  <div style="display: none;" >
    <div id="post" >
      <p>
        <span></span>
        <span style="float: right;"></span>
      </p>
      <textarea></textarea>
    </div>
    <div id="editButtons" style="text-align: right; margin-top: 6px;" >
      <input type="button" value="Update" onclick="updatePost(this);" />
      <input type="button" value="Delete" onclick="deletePost(this);" />
    </div>
    <hr id="rule" style="margin: 1em 0; height: 2px; background: #363;" ></hr>
  </div>

  <div id="postDialog" class="dialog" >
    <h3>Post New Code</h3>
    <p>Paste your code into the area below:</p>
    <textarea></textarea>
    <p>
      You can type in any explanations or hints, too.
      Then click [OK] to post to the forum.
    </p>
  </div>

  <div id="confirmationDialog" class="dialog" >
    <p>Do you want to remove this post?</p>
  </div>

  <script>
    function adjustHeight(postDiv, text)
    {
      var lines = text.split("\n").length;
      if (lines > 12)
        lines = 12;

      postDiv.children("textarea").height("" + (lines * 4 / 3 + 1) + "em");
    }

    function addPost(post, editable)
    {
      var postDiv = $("#post").clone(true);
      postDiv.attr("id", "post" + post.id);

      var headers = postDiv.children("p").first().children("span");
      headers.first().text(post.coder.name);
      headers.last().text(post.dateAndTime);

      var code = postDiv.children("textarea");
      code.val(post.what);
    adjustHeight(postDiv, post.what);

      if (editable)
      {
        postDiv.append($("#editButtons").clone(true));
      }
      else
      {
        code.attr("readonly", "readonly");
        code.css("border", "none");
      }

      $("#posts").append(postDiv);
      $("#posts").append($("#rule").clone());
    }

    function showPostDialog()
    {
      $("#postDialog").dialog
      ({
        width: "30em",
        buttons:
        [
          {
            text: "OK",
            class: "dialog-button",
            click: function()
              {
                $("#postDialog").dialog("close");
                submitPost();
              }
          },
          {
            text: "Cancel",
            class: "dialog-button",
            click: function()
              {
                $("#postDialog").dialog("close");
              }
          }
        ]
      });
    }

    function submitPost()
    {
      $.post
      ({
        url: "Posts.do",
        data: $("#postDialog").children("textarea").val(),
        contentType: "text/plain",
        success: function(response)
          {
            addPost(response, true);
          }
      });
    }

    function updatePost(element)
    {
      var postDiv = $(element).parent().parent();
      var ID = postDiv.attr("id").replace("post", "");
      var text = postDiv.children("textarea").val();
      $.ajax
      ({
        method: "PUT",
        url: "Posts.do?ID=" + ID,
        data: text,
        contentType: "text/plain",
        dataType: "text",
        success: function(response)
          {
          postDiv.children("p").first().children("span").last().text(response);
          adjustHeight(postDiv, text);
          }
      });
    }

    function deletePost(element)
    {
      var postDiv = $(element).parent().parent();
      var ID = postDiv.attr("id").replace("post", "");

      $("#confirmationDialog").dialog
      ({
        width: "30em",
        buttons:
        [
          {
            text: "OK",
            class: "dialog-button",
            click: function()
              {
                $("#confirmationDialog").dialog("close");
                $.ajax
                ({
                  method: "DELETE",
                  url: "Posts.do?ID=" + ID,
                  success: function()
                    {
                      postDiv.prev().remove();
                      postDiv.remove();
                    }
                });
              }
          },
          {
            text: "Cancel",
            class: "dialog-button",
            click: function()
              {
                $("#confirmationDialog").dialog("close");
              }
          }
        ]
      });
    }

    $(document).ready(function()
      {
        $.get
        ({
          url: "Posts.do",
          success: function(response)
            {
              for (post of response)
              {
                addPost(post, ${user.ID} == post.coder.id);
              }
            }
        });
      });
  </script>

</div>
</body>

</html>

