var buffer = "";
var outputID = 'output';

function showOutput (text)
{
  var lines = text.split ('\n').length;
  for (var i = lines; i < 4; ++i)
    text = text + "\r\n";

  var outputArea = document.getElementById (outputID);
  outputArea.innerHTML = "";
  outputArea.appendChild (document.createTextNode (text));
}

function execute (expression)
{
  buffer = "";
  eval (expression);
  showGlobalOutput ();
}

function showGlobalOutput ()
{
  showOutput (buffer);
}

function clearOutput ()
{
  showOutput ("");
}

function print (text)
{
  buffer += text;
}

function println (text)
{
  buffer += text;
  printBlankLine ();
}

function printBlankLine ()
{
  buffer += " \n\r";
}

