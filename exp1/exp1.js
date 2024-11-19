var tt = talkthrough;
talkthrough.savename = "Web Cut-Ups";
//files that can be included in the stack -- before and after are defined here.  mirrors are editor contents and files need to be in includes/{filename}.  Note: code will add '.txt' to filename request.

//this example will load in the order of 'includes/b4.txt', the content of mirror tab titled "Canvas", 'includes/aft.txt';
var templateStack = ["mirror:html"];


//initiate probably tie these to a parent object at these point
var audpop;
//this loads the files found in the template stack  
var setup = async function () {
  var result = await talkthrough.loadResources();
  console.log(result);


  //initiate the mirrors with some options. make some of these default!

  //this will load "includes/canvas.js" into Canvas
  var body = await tt.makeMirror("html", "exp1.html", { mode: "htmlmixed" });
  talkthrough.hidePreview();
  //saveAs will save the mirror to an external file with the path designated, creating folders as needed.      
  var CSS = await tt.makeMirror("css", "exp1.css", { saveAs: "exp1.css", mode: "css" });

  var js = await tt.makeMirror("assembler.js", "assembler.js", {saveAs: "assembler.js"});
  var js = await tt.makeMirror("sketch.js", "sketch.js", {saveAs: "sketch.js"});

  //files that should be included in the zip, include individually, relative paths
  //directories will be automatically created
  //examples: images, media, includes that aren't part of the above stack.
  tt.saveFiles(["img/512px-Cinemagraph_de_fleur_de_pommier.gif"]);

  /* this will replace a line in a mirror (in this case, the link tag in the body) with the contents of the array
  this uses the same format as templateStack, taking strings, mirrors, and files */
  body.addFilter({ line: 6, filters: ["<style>", "mirror:css", "</style>"] });
  body.addFilter({ line: 28, filters: ["<script>", "mirror:js", "</script>"] });

  talkthrough.makeSaveButton();

  //this is a workaround for a strange bug that doubles content in the iframe
  //maybe this should fire if there's an event for when the mirror is fully loaded and filled?

  window.setTimeout(function () {
    //make 'html' visible
    tt.visible('html');
    //render the stack
    tt.updatePreview();
  }, 500);

  audPop = document.getElementById("audioclip");


  // add virtual mouse at the bottom left corner
  // stays there until it is removed when editing happens
  //talkthrough.addMouse();

  //initiate popcorn object
  var aud = Popcorn("audio");
  talkthrough.aud = aud;
  var chapters = document.querySelectorAll('.chapter');
  for (var i = 0; i < chapters.length; i++) {
    chapters[i].addEventListener('click', function (event) {
      aud.play(Popcorn.util.toSeconds(event.target.dataset.start));
    });
  }
  talkthrough.visibleAt(0,"2:19", "html");


  talkthrough.glowAt(32, ".outer");
  talkthrough.glowAt(35, "#preview");
  talkthrough.glowAt("1:16", "#but_html", "green");
  talkthrough.glowAt("1:18", "#but_css");
  talkthrough.glowAt("1:19", "#but_js");
  talkthrough.glowAt("1:23", "#but_save", "green", 7000);


  //talkthrough.foldAt("3:33", 4);
  talkthrough.highlightLinesUn("1:55", "1:56", 4, 7);
  talkthrough.highlightLinesUn("1:56", "1:58", 5);
  talkthrough.highlightLinesUn("1:58", "1:60", 6);

  //tds
  talkthrough.highlightLinesUn("2:01", "2:05", 9, 29);
  talkthrough.highlightLinesUn("2:05", "2:12", 10, 27);

  talkthrough.foldAt("2:08", 14, 24);
  talkthrough.unfoldAll("2:10");

  talkthrough.highlightLinesUn("2:12", "2:19", 28);

  talkthrough.visibleAt("2:19","3:25", "css");

  //switch to css tab
  talkthrough.glowAt("2:19", "#but_css");
  talkthrough.visibleAt("2:19",aud.duration(), "css");
  talkthrough.highlightLinesUn("2:49", "3:01", 1, 3);


  let blueCSS = ` background-color: blue;`;

  cssBlue = false;
  cssBlack = false;
  if (!cssBlue) {
    talkthrough.replaceAt("2:55", 2, blueCSS);
    cssBlue = true;
  }

  let blackCSS = ` background-color: black;`;
  if (!cssBlack) {
    talkthrough.replaceAt("2:57", 2, blackCSS);
    cssBlack = true;
  }


  talkthrough.highlightLinesUn("3:04", "3:09", 6);


  let borderCSS10 = `   border: 10px solid rgb(0,0,255);`;

  cssBorder10 = false;
  cssBorder3 = false;
  if (!cssBorder10) {
    talkthrough.replaceAt("3:05", 6, borderCSS10);
    cssBorder10 = true;
  }

  let borderCSS3 = `   border: 3px solid rgb(0,0,255);   `;
  if (!cssBorder3) {
    talkthrough.replaceAt("3:07", 6, borderCSS3);
    cssBorder3 = true;
  }

  talkthrough.highlightLinesUn("3:09", "3:15", 10);
  talkthrough.highlightLinesUn("3:15", "3:25", 14);

  //switch to js tab
  talkthrough.glowAt("3:25", "#but_js");
  talkthrough.visibleAt("3:25",aud.duration(), "js");
  talkthrough.glowAt("3:30", "#but_save", "green", 7000);

  talkthrough.visibleAt("3:45","4:02", "html");
  talkthrough.glowAt("3:45", "#index", "green", 4000);


  //option for checkbox preventing
  //talkthrough.glowAt("1:15", "#checkbox", "green", 4000);

  /*
  //fold head & bod
  talkthrough.foldAt("2:27", 4).foldAt("2:27", 9);

  talkthrough.highlightLinesUn("2:32", "2:35", 1);
  talkthrough.highlightLinesUn("2:37", "2:40", 2);


  //unfold head
  talkthrough.foldAt("2:41", 4);
  */

  //talkthrough.visibleAt()

  //talkthrough.hidePreview();
  talkthrough.addImage ("1:00", "4:01", "Cursor_Hand", "png", 600, 580, 40, 5);



}

setup();
