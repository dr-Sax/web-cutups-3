//setup some vars used by these
let talkthrough = {
  cmfrom: 0,
  cmto: 0,
  beforeMark: 0,
  afterMark: 0,
  busy: false,
  template: 0,
  current: false,
  changed: true,
  visibles: [],
  zipfiles: [],
  mirrors: [],
  groups: [],
  mirrorSaves: [],
  idletime: 0

};

talkthrough.setupChapters = function () {
  let tt = this;
  var chapters = document.querySelectorAll('.chapter');
  for (let c of chapters) {
    c.addEventListener('click', function (event) {
      if (event.target.dataset.tab) {
        tt.visible(event.target.dataset.tab);
      }
      tt.aud.play(Popcorn.util.toSeconds(event.target.dataset.start));
    });
  }
}
talkthrough.setupChapters();

talkthrough.preview = document.querySelector("iframe");
talkthrough.preview.addEventListener("load", function () {
  if (talkthrough.seekedTo) {
    talkthrough.scrollPreview(talkthrough.seekedTo, false);
  }
});


//if change isn't from a valid line, don't allow it.
talkthrough.lock = function (cm, change) {
  if (change.from.line < cmfrom || change.from.line > cmto) {
    change.cancel();
  }
  //where is the rest of this function?
};


talkthrough.saveFiles = function (files) {
  for (let f of files) {
    this.zipfiles.push(f);
  }
}

//takes content of a line and replaces it with a filter (array of replacements that can include file, mirrors)
talkthrough.filterLine = function (intxt, line, filter) {
  //should be content of line
  let input = line;
  let filtered = this.renderStack(filter);
  let replaced = intxt.replace(input, filtered);
  return replaced;
}

//takes an array of codemirrors to make them an exclusive group
//by default first cm is active
talkthrough.cmGroup = function (title, cms, options = {}) {
  if (!options.active) {
    options.active = cms[0];
  }
  //handle SaveAs
  let group = { name: title, cms: cms };
  talkthrough.groups.push(group);
  let groupDiv = document.createElement("div");
  groupDiv.classList.add("buttonGroup");
  groupDiv.id = title;
  groupDiv.innerHTML = title + ": ";
  document.querySelector("#buttons").insertBefore(groupDiv, document.querySelector("#but_save"));

  for (let cm of cms) {
    cm = this.getMirror(cm);
    if (options.saveAs) {
      this.mirrorSaves.push({ from: cm.name, to: options.saveAs });
    }
    groupDiv.appendChild(cm.button);
    let rad = document.createElement("input");
    rad.type = "radio";
    rad.name = title;
    rad
    cm.button.appendChild(rad);
    rad.addEventListener("change", function (e) {
      let p = e.target.parentNode;
      let rpl = p.id.replace(p.id.split("_")[0] + "_", "");
      talkthrough.groupActive(p.parentNode.id, rpl);

    });
    if (cm.name === options.active) {
      cm.active = true;
      rad.setAttribute("checked", true);
    } else {
      cm.active = false;
      cm.button.classList.add("inactive");
    }

  }
  talkthrough.changed = true;

}

talkthrough.groupActiveAt = function (start, end, title, cm) {
  /*
  talkthrough.aud.cue(time, function () {
    console.log("activating ", title, cm);
    talkthrough.groupActive(title, cm);
  });*/
  this.aud.code({
    start: start, end: end, onStart: function () {
      talkthrough.groupActive(title, cm);
    }, onEnd: function () {
      //not sure if we need to do anything here?
    }
  });
}

talkthrough.groupActive = function (title, cm) {
  //load the group it's in, toggle enabled status based on command
  //make sure to trigger an update in the next cycle
  console.log("ok");
  let group = this.getGroup(title);
  for (let c of group.cms) {
    if (c == cm) {
      this.getMirror(c).active = true;
    } else {
      this.getMirror(c).active = false;
    }
  }

  for (let but of document.querySelector("#" + title).querySelectorAll("button")) {
    if (but.id === "but_" + cm) {
      but.classList.remove("inactive");
      but.querySelector("input").checked = true;
    } else {
      but.classList.remove("active");
      but.classList.add("inactive");
    }
  }
  talkthrough.changed = true;

}

talkthrough.unfoldAll = function (time) {
  if (time) {
    let tt = this;
    talkthrough.aud.cue(time, function () {
      tt.current.execCommand("unfoldAll");
    });
  } else {
    this.current.execCommand("unfoldAll");
  }
  return this;
}

talkthrough.foldAt = function (time, line) {
  let tt = talkthrough;
  talkthrough.aud.cue(time, function () {
    tt.current.foldAt(line)
  });
  return this;
}

talkthrough.foldAll = function (time) {
  if (time) {
    let tt = this;
    talkthrough.aud.cue(time, function () {
      tt.current.execCommand("foldAll");
    });
  } else {
    this.current.execCommand("foldAll");
  }
  return this;
}


/*****************************************************************************************
 * ADDING, REMOVING and RETURNING VIRTUAL MOUSE 
 *
 * addMouse ()
 * removeMouse ()
 * returnMouseToRest ()
 *
 *****************************************************************************************/

/*
 * add virtual mouse to bottom right of the preview window
 */

talkthrough.addMouse = function () {
  var div = document.createElement("div");
  document.getElementById('live').appendChild(div);
  div.setAttribute("id", "mouse");
  var img = document.createElement("img");
  img.src = "img/arrow-cursor1.png";
  img.style.width = 33;
  img.style.height = 50;
  div.appendChild(img);
  div.style.position = "absolute";
  div.style.left = document.getElementById('live').offsetLeft + document.getElementById('live').offsetWidth - +document.getElementById("mouse").offsetWidth + "px";
  div.style.top = (document.getElementById('preview').offsetHeight + document.getElementById("mouse").offsetHeight) + "px";
  this.mouse = div;
  return div;
}

talkthrough.resetMouse = function () {
  let m = this.mouse;
  var newone = m.cloneNode(true);
  m.parentNode.replaceChild(newone, m);

}

/*
 * remove virtual mouse
 */
talkthrough.removeMouse = function () {
  this.mouse = false;
  document.getElementById('live').removeChild(document.getElementById("mouse"));
}

/*
 * move mouse back to bottom left of the window
 */
talkthrough.returnMouseToRest = function () {
  var m = document.getElementById("mouse");
  m.style.left = document.getElementById('preview').offsetLeft + document.getElementById('preview').offsetWidth + "px";
  m.style.top = (document.getElementById('preview').offsetHeight + document.getElementById("mouse").offsetHeight) + "px";
  m.style.animation = "";
}

/*****************************************************************************************
 * FUNCTIONS THAT DON'T MAKE USE OF THE VIRTUAL MOUSE 
 *
 * visible ()
 * scrollToLine (line)
 * highlightLines (from, to)
 * unhighlightLines ()
 * findStringAndHighlight (strToSearchFor, tabid)
 * removeHighlight()
 * centerOnLine (line)
 * lockExcept (from, to)
 * unlock ()
 * foldAt (line) 
 *
 *****************************************************************************************/
////add an image
//function addPng (filename, width, height) {
//	var div = document.createElement("div");
//	document.getElementById('preview').appendChild(div);
//	div.setAttribute("id", "imageInPreview");
//	var img = document.createElement("img");
//    img.src = "img/"+ filename + ".png";
//    img.style.width = width;
//    img.style.height = height;
//	div.appendChild(img);
//	div.style.position = "absolute";
//    
//    div.style.left="0px";
//     div.style.top="0px";
////	div.style.left = document.getElementById('live').offsetLeft + document.getElementById('live').offsetWidth - +document.getElementById("imageInPreview").offsetWidth  +"px";
////    div.style.top = (document.getElementById('preview').offsetHeight +document.getElementById("imageInPreview").offsetHeight) +"px";
//}

/*
 * add images to the preview window
 */
talkthrough.addImage = function (from, to, filename, fileformat, width, height, x_position, y_position) {
  
  talkthrough.cmfrom = from - 1;
  talkthrough.cmto = to - 1;

	var div = document.createElement("div");
	document.getElementById('preview').appendChild(div);
	div.setAttribute("id", "addedImage");
	var img = document.createElement("img");
    img.src = "img/" + filename + "." + fileformat;
    img.style.width = width;
    img.style.height = height;
	document.getElementById('addedImage').appendChild(img);
	div.style.position = "relative";
	div.style.left =   x_position  +"px";
    div.style.top =  y_position +"px";
}
talkthrough.removeImage = function () {
	document.getElementById('imageArea').removeChild(document.getElementById('addedImage'));
}



/*
 * makes specified tab visible
 */
talkthrough.visible = function (name) {

  if (name === undefined) {
    return this.current;
  }
  this.current = this.getMirror(name);
  var outers = document.querySelectorAll('.outer');
  for (var i = 0; i < outers.length; i++) {
    if (outers[i].id == "outer_" + name) {
      outers[i].style.display = "block";
    } else {
      outers[i].style.display = "none";
    }
  }
  for (var mirror of this.mirrors) {
    mirror.refresh();
  }
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].id === 'but_' + name) {
      buttons[i].classList.add('active');
    } else {
      buttons[i].classList.remove('active');
    }
  }
};

//scrolls preview to dom element or line
talkthrough.scrollPreview = function (to, smooth = true) {
  console.log("shshshshshsh");
  this.seekedTo = to;
  if (typeof to === "number") {
    console.log("yay a number")
  } else {
    to = this.preview.contentWindow.document.querySelector(to).offsetTop - 100;
  }
  if (smooth) {
    this.preview.contentWindow.scrollTo({ left: 0, top: to, behavior: "smooth" });
  } else {
    this.preview.contentWindow.scrollTo({ left: 0, top: to });
  }

}
talkthrough.scrollPreviewAt = function (when, to) {
  talkthrough.aud.cue(when, function () {
    talkthrough.scrollPreview(to);
  })
}

talkthrough.scrollToAt = function (when, to) {
  talkthrough.aud.cue(when, function () {
    talkthrough.current.scrollToLine(to);
  })
}


//inserts text after a line
talkthrough.insertAt = function (time, line, text) {

  let tt = this;
  let pos = { // create a new object to avoid mutation of the original selection
    line: line,
    ch: line.length - 1 // set the character position to the end of the line
  };
  tt.aud.cue(time, function () {
    if (!document.querySelector("#nochanges").checked) {
      tt.current.replaceRange("\n" + text + "\n", pos);
    }

  });
  return this;
}

//replaces a line of text 
talkthrough.replaceAt = function (time, line, text) {
  line = line - 1;
  let tt = this;
  let pos = { // create a new object to avoid mutation of the original selection
    line: line,
    ch: 0
  };
  tt.aud.cue(time, function () {
    if (!document.querySelector("#nochanges").checked) {
      tt.current.replaceRange(text, pos, { line: line });
    }

  });
  return this;
}

talkthrough.stringHighlightAt = function (start, end, text, opts) {
  let tt = this;
  this.aud.code({
    start: start, end: end,
    onStart: function () {
      tt.current.findStringAndHighlight(text, opts);
    },
    onEnd: function () {
      tt.current.unhighlightLines();
    }
  });
}


//hmm.. maybe this should actually be a code tho?  maybe visibleAt and visibleThrough (timespan)?
talkthrough.visibleAt = function (start, end, name, mouse = false) {
  let tt = this;
  //tt.visibles.push({start:start, name:name});

  /*this.aud.cue(start, function () {
    if (mouse) {
      tt.visibleWithMouseOnTab(name);
    } else {
      tt.visible(name);
    }
  })
  */

  this.aud.code({
    start: start, end: end, onStart: function () {
      tt.visible(name);
    }, onEnd: function () {
      //not sure if we need to do anything here?
    }
  });
}

/*
 * scrolls to given line number
 */
CodeMirror.defineExtension("scrollToLine", function (line) {
  /*var coords = this.charCoords({
    line: line - 1,
    ch: 0
  }, "local");*/
  //this.scrollIntoView({line: line}));
  this.scrollIntoView({ line: line, ch: 0 });
  //var h = this.getScrollInfo().clientHeight;
  //alert(h);

  /* document.addEventListener("scroll", function(){
     document.getElementById('textareas').scrollIntoView({block: "end", behavior: "smooth"});});*/

  /*$('html, body').animate({
        scrollTop: $("#target-element").offset().top
    }, 1000);*/
});
/*
 * highlights given line number
 */

CodeMirror.defineExtension("highlightLines", function (from, to) {
  talkthrough.cmfrom = from - 1;
  talkthrough.cmto = to - 1;
  //enforce line visibility
  this.centerOnLine(from);
  //enforce correct tab visible
  //talkthrough.visible(this.name);


  talkthrough.beforeMark = this.markText({
    line: 0,
    ch: 0
  }, {
    line: talkthrough.cmfrom,
    ch: 0
  }, {
    className: "unhighlight"
  });
  talkthrough.afterMark = this.markText({
    line: talkthrough.cmto + 1,
    ch: 0
  }, {
    line: this.lastLine(),
    ch: 0
  }, {
    className: "unhighlight"
  });
  talkthrough.currentMark = this.markText({
    line: talkthrough.cmfrom,
    ch: 0
  }, {
    line: talkthrough.cmto,
    ch: 999
  }, {
    className: "highlight"
  });
});

talkthrough.sleep = async function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

talkthrough.glow = async function (element, color, duration) {
  element = document.querySelector(element);
  if (!element) {
    return false;
  }
  //console.log(element);
  let oldborder = element.style.boxShadow;
  element.style.boxShadow = "0px 0px 30px -1px " + color;
  await talkthrough.sleep(duration);
  element.style.boxShadow = oldborder;
}

talkthrough.glowAt = function (time, element, color = "lightgreen", duration = 1500) {
  //console.log(this.aud);
  let tt = this;
  this.aud.cue(time, function () {
    tt.glow(element, color, duration);
  });
}


/*
 * unhighlight lines
 */
CodeMirror.defineExtension("unhighlightLines", function () {
  this.off('beforeChange', talkthrough.lock, false);
  talkthrough.beforeMark.clear();
  talkthrough.afterMark.clear();
  talkthrough.currentMark.clear();
});

//unfinished wrapper to make a popcorn event to highlight and unhighlight in one function.
//optionally use mouse function
talkthrough.highlightLinesUn = function (start, end, from, to = from, mouse = false) {
  console.log("in");
  if (mouse) {

  } else {
    this.aud.code({
      start: start, end: end, onStart: function () {
        talkthrough.current.highlightLines(from, to);
      }, onEnd: function () {
        talkthrough.current.unhighlightLines();
      }
    });
  }
  //tt.aud.code()
}


/*
 * findStringAndHighlight (strToSearchFor, opts)
 * opts: tab (string of tab id), scroll (boolean of whether to scroll to line, default true)
 * search for word and then apply css style for highlighting
 */
CodeMirror.defineExtension("findStringAndHighlight", function (strToSearchFor, opts) {
  if (!opts) {
    opts = {};
  }
  //enforce correct tab visible
  if (!opts.tab) {
    opts.tabid = this.name;
  }
  if (opts.scroll === undefined) {
    opts.scroll = true;
  }
  talkthrough.visible(opts.tabid);
  //enforce correct tab visible
  //visible(this.name);
  // case insensitive --- 
  var regex = new RegExp(strToSearchFor, 'g');
  let lNumber;
  // loop for all content in the specific tab within code mirror, an example is "#outer_Arithmetic span span"
  let outer = document.querySelector("#outer_" + opts.tabid);
  for (let span of outer.querySelector(".CodeMirror-code").querySelectorAll("span")) {
    var re = new RegExp(regex, 'g');
    if (span.textContent.match(re)) {
      if (span.classList.contains('cm-comment')) {
        span.innerHTML = span.innerHTML.replace(regex, "<\/span class='highlight'>" + strToSearchFor + "<\/span>");
        lNumber = span.closest('div').querySelector('.CodeMirror-linenumber').textContent;

      } else {
        span.classList.add("highlight");
      }
      lNumber = span.closest('div').querySelector('.CodeMirror-linenumber').textContent;
    } else {
      //console.log("not found");
    }
  }

  //enforce line visibility
  if (lNumber && opts.scroll) {
    this.centerOnLine(lNumber);
  }
});

/*
 * removeHighlight()
 */
talkthrough.removeHighlight = function () {
  for (let el of document.querySelectorAll(".highlight")) {
    el.classList.remove(".highlight");
  }
}


/*
 * attempts to center editor on line
 */
CodeMirror.defineExtension("centerOnLine", function (line) {
  var h = this.getScrollInfo().clientHeight;
  var coords = this.charCoords({
    line: line - 1,
    ch: 0
  }, "local");
  this.scrollTo(null, (coords.top + coords.bottom - h) / 2);
});

/*
 * makes a small band of content editible, locks the rest 
 *(also hides it based on current css, change 'unmarked' visibility)
 */
CodeMirror.defineExtension("lockExcept", function (from, to) {
  cmfrom = from - 1;
  cmto = to - 1;
  this.centerOnLine(from);
  talkthrough.beforeMark = this.markText({
    line: 0,
    ch: 0
  }, {
    line: cmfrom,
    ch: 0
  }, {
    className: "unmarked"
  });
  talkthrough.afterMark = this.markText({
    line: cmto + 1,
    ch: 0
  }, {
    line: this.lastLine(),
    ch: 0
  }, {
    className: "unmarked"
  });
  talkthrough.currentMark = this.markText({
    line: cmfrom,
    ch: 0
  }, {
    line: cmto,
    ch: 999
  }, {
    className: "marked"
  });
  this.on('beforeChange', lock, false);
});


/*
 * unlock previous lock
 */
CodeMirror.defineExtension("unlock", function () {
  this.off('beforeChange', lock, false);
  beforeMark.clear();
  afterMark.clear();
  currentMark.clear();
});

/*
 * foldAt: uses line number instead of longer nested function, simplification!
 */
CodeMirror.defineExtension("foldAt", function (line) {
  this.foldCode(CodeMirror.Pos(line - 1, 0));
  return this;
});

/*
 * fills a mirror with text from an ajax request
 */
CodeMirror.defineExtension("fillField", async function (url) {
  var cm = this;
  url = "includes/" + url;
  let f = await fetch(url);
  f = await f.text();
  this.setValue(f);
});

/* adds a filter to a line in a mirror */
CodeMirror.defineExtension("addFilter", function (filter) {
  filter.line = this.getLine(filter.line - 1);
  this.filters.push(filter);
});

/*****************************************************************************************
 * FUNCTIONS THAT MAKE USE OF THE VIRTUAL MOUSE 
 *
 * highlightLinesMouse (from, to, tabid)
 * drawMouseCircles (div, animationTime, posTop, posLeft, radius)
 * drawMouseCirclesWord (strToSearchFor, animationTime, tabid)
 * visibleWithMouseOnTab (name)
 *
 *****************************************************************************************/

/*
 * highlights given line number and point with virtual mouse
 */
CodeMirror.defineExtension("highlightLinesMouse", function (from, to, time = "6s") {
  let tt = talkthrough;
  tt.removeHighlight();

  this.scrollToLine(from);

  tt.cmfrom = from - 1;
  tt.cmto = to - 1;

  //enforce line visibility
  this.centerOnLine(from);
  //enforce correct tab visible
  tt.visible(this.name);


  talkthrough.beforeMark = this.markText({
    line: 0,
    ch: 0
  }, {
    line: tt.cmfrom,
    ch: 0
  }, {
    className: "unhighlight"
  });
  talkthrough.afterMark = this.markText({
    line: tt.cmto + 1,
    ch: 0
  }, {
    line: this.lastLine(),
    ch: 0
  }, {
    className: "unhighlight"
  });
  talkthrough.currentMark = this.markText({
    line: tt.cmfrom,
    ch: 0
  }, {
    line: tt.cmto,
    ch: 999
  }, {
    className: "highlight"
  });



  //get positions for beginning of highlight and end of highlight
  var len = document.querySelectorAll(".highlight").length;
  let query = document.querySelectorAll('.highlight');
  var position1, position2;
  position1 = query[0].getBoundingClientRect();
  position2 = query[query.length - 1].getBoundingClientRect();
  /*
  for (let i = 0; i < query.length; i++) {
    if (i == 0) {

      position1 = el.getBoundingClientRect();
    }
    if (i == len - 1) {
      position2 = el.getBoundingClientRect();
    }
  }
  */
  // simulate mouse highlighting lines
  var m = document.getElementById("mouse");

  // find keyframe rule
  var keyframes = findKeyframesRule("twonumbers");

  // remove the existing 25% and 75% rules
  keyframes.deleteRule("0%");
  keyframes.deleteRule("25%");
  keyframes.deleteRule("75%");
  keyframes.deleteRule("100%");

  mouseLeftAtRest = document.getElementById('preview').offsetLeft + document.getElementById('preview').offsetWidth;
  mouseTopAtRest = (document.getElementById('preview').offsetHeight + document.getElementById("mouse").offsetHeight);
  console.log(position1.left, position1.top, position2.right, position2.bottom);
  // create new 25% and 75% rules
  keyframes.appendRule("0% { left:" + mouseLeftAtRest + "px; top:" + mouseTopAtRest + "px; }");
  keyframes.appendRule("25% { left:" + (position1.left) + "px; top:" + (position1.top + window.scrollY) + "px; }");
  keyframes.appendRule("75% { left:" + (position2.right) + "px; top:" + (position2.bottom + window.scrollY) + "px; }");
  keyframes.appendRule("100% { left:" + mouseLeftAtRest + "px; top:" + mouseTopAtRest + "px; }");
  console.log(keyframes.cssRules);
  // assign the animation to our element (which will cause the animation to run)
  m.style.animation = "";

  m.style.animation = "twonumbers " + time + " linear";
  m.addEventListener("animationend", function () {
    m.style.animation = "";
  }, { once: true })

});

/*
 * drawMouseCircles (div, animationTime, posTop, posLeft, radius)
 * draw circle with virtual mouse, given:
 * 		div - either "textarea" or "preview"
 * 		animationTime - in seconds
 * 		posTop and posLeft - in pixels - determines position
 * 		radius - in pixels - determines circle size
 */

talkthrough.circlePreviewElement = function (query, offset = 0) {
  if (!this.mouse) {
    this.addMouse();
  }
  let targetEl = this.preview.contentWindow.document.querySelector(query);
  let multx = 1;
  let multy = 1;
  //this might not be necessary, but looks to see if, say, canvas is resized w/css
  if (targetEl.width) {
    multx = targetEl.offsetWidth / targetEl.width;
    multy = targetEl.offsetHeight / targetEl.height;

  }
  let point = {};
  if (offset) {
    point.x = (offset.x * multx) + targetEl.offsetLeft;
    point.y = (offset.y * multy); + targetEl.offsetTop;
  } else if (!offset) {
    //use element center?
    let x0 = targetEl.offsetLeft;
    let y0 = targetEl.offsetTop;
    let x1 = x0 + targetEl.offsetWidth;
    let y1 = y0 + targetEl.offsetHeight;

    point.x = ((x0 + x1) / 2);
    point.y = ((y0 + y1) / 2);
  }
  point.x = this.preview.offsetLeft + point.x;
  console.log(point.y, point.x)
  this.current.drawMouseCircles(preview, 2, point.y, point.x, 50)
}


CodeMirror.defineExtension("drawMouseCircles", function (div, animationTime, posTop, posLeft, radius) {
  posTop += document.getElementById('live').offsetTop;

  //if div is textarea then add textareas window left offset
  if (div == "textarea") {
    //alert(document.getElementById('textareas').offsetLeft);
    posLeft += document.getElementById('textareas').offsetLeft;
  }

  // if div is preview then add preview window left offset
  if (div == "preview") {
    posLeft += document.getElementById('preview').offsetLeft;
  }

  var m = document.getElementById("mouse");
  m.style.top = posTop;
  m.style.left = posLeft;

  // find keyframe rule
  var keyframes = findKeyframesRule("circularAnimation");

  // remove the existing from and to rules
  keyframes.deleteRule("from");
  keyframes.deleteRule("to");

  // create new from and to rules with random numbers
  keyframes.appendRule("from { transform: rotate(0deg) translateX(" + radius + "px) rotate(0deg); }");
  keyframes.appendRule("to { transform: rotate(360deg)  translateX(" + radius + "px) rotate(-360deg);");

  // assign the animation to our element (which will cause the animation to run)
  m.style.animation = "circularAnimation " + animationTime + "s linear 1";

  // Code for Chrome, Safari and Opera
  m.addEventListener("webkitAnimationEnd", talkthrough.returnMouseToRest, { once: true });
  // Standard syntax

  m.addEventListener("animationend", talkthrough.returnMouseToRest, { once: true });
});


/*
 * drawMouseCirclesWord (strToSearchFor, animationTime, tabid)
 * draw circle with virtual mouse around a word that is searched for, given:
 * 		strToSearchFor - String 
 * 		animationTime - in seconds
 * 		tabid - to ensure correct tab is used
 */


CodeMirror.defineExtension("drawMouseCirclesWord", function (strToSearchFor, animationTime, tabid) {

  //enforce correct tab visible
  visible(this.name);

  // case insensitive --- 
  var regex = new RegExp(strToSearchFor, 'g');
  var position1;
  var positionWidth;
  var lNumber;
  // loop for all content in the specific tab within code mirror, an example is "#outer_Arithmetic span span"
  console.log("#outer_" + tabid + " span span");
  console.log(document.querySelectorAll("#outer_" + tabid + " span span").length);
  for (let span of document.querySelectorAll("#outer_" + tabid + " span span")) {
    var re = new RegExp(regex, 'g');

    if (span.textContent.match(re)) {
      if (span.classList.contains('cm-comment')) {
        console.log("we got a comment");
        span.classList.add("toCircleAround");
        lNumber = span.closest('div').querySelector('.CodeMirror-linenumber').textContent;
        position1 = document.querySelector('.toCircleAround').getBoundingClientRect();
        positionWidth = span.offsetWidth;
      } else {
        span.classList.add('highlight');
        //alert($(this).closest('div').find('.CodeMirror-linenumber').text());
        lNumber = span.closest('div').querySelector('.CodeMirror-linenumber').textContent;
        position1 = span.getBoundingClientRect();
        positionWidth = span.offsetWidth;
      }
    } else { }
  }
  //enforce correct tab visible
  //visible(tabid);
  //enforce line visibility
  console.log(lNumber, positionWidth, position1)
  if (lNumber && position1 && positionWidth) {
    this.centerOnLine(lNumber);

    posTop = position1.top;
    posLeft = position1.left;

    //add textarea window left offset
    posLeft += document.getElementById('textareas').offsetLeft;

    var m = document.getElementById("mouse");
    m.style.top = posTop;
    m.style.left = posLeft + (positionWidth / 2);

    // find keyframe rule
    var keyframes = findKeyframesRule("circularAnimation");

    // remove the existing from and to rules
    keyframes.deleteRule("from");
    keyframes.deleteRule("to");

    // create new from and to rules with random numbers
    keyframes.appendRule("from { transform: rotate(0deg) translateX(" + positionWidth + "px) rotate(0deg); }");
    keyframes.appendRule("to { transform: rotate(360deg)  translateX(" + positionWidth + "px) rotate(-360deg);");

    // assign the animation to our element (which will cause the animation to run)
    m.style.animation = "circularAnimation " + animationTime + "s linear 1";

    // Code for Chrome, Safari and Opera
    m.addEventListener("webkitAnimationEnd", returnMouseToRest);
    // Standard syntax
    m.addEventListener("animationend", returnMouseToRest);
  } else {
    console.log("TARGET NOT FOUND");
  }
});

/*
 * make tab visible
 * also, simulate click using virtual mouse
 */
talkthrough.visibleWithMouseOnTab = function (name) {
  if (!this.mouse) {
    this.addMouse();
  }
  if (name === undefined) {
    return talkthrough.current;
  }
  current = name;
  var outers = document.querySelectorAll('.outer');
  for (var mirror of this.mirrors) {
    mirror.refresh();
  }
  var buttons = document.querySelectorAll('button');
  var posLeft, posTop;
  for (let button of buttons) {
    if (button.id === 'but_' + name) {

      posLeft = button.offsetLeft;
      posTop = button.offsetTop;

      // simulate mouse clicking on tab when changed
      var m = document.getElementById("mouse");

      // find keyframe rule
      var keyframes = findKeyframesRule("onepoint");

      // remove the existing rules
      keyframes.deleteRule("0%");
      keyframes.deleteRule("50%");
      keyframes.deleteRule("100%");

      let mouseLeftAtRest = document.getElementById('preview').offsetLeft + document.getElementById('preview').offsetWidth;
      let mouseTopAtRest = document.getElementById('preview').offsetHeight + document.getElementById("mouse").offsetHeight;

      // create new 25% and 75% rules
      keyframes.appendRule("0% { left:" + mouseLeftAtRest + "px; top:" + mouseTopAtRest + "px; }");
      keyframes.appendRule("50% { left:" + (posLeft) + "px; top:" + (posTop) + "px; }");
      keyframes.appendRule("100% { left:" + mouseLeftAtRest + "px; top:" + mouseTopAtRest + "px; }");


      // add animation to trigger
      m.style.animation = "onepoint 2s linear";
      window.setTimeout(() => {
        button.classList.add('active');
        this.visible(name);
      }, 1000);


      // remove animation in order to call it next time
      // Code for Chrome, Safari and Opera
      m.addEventListener("webkitAnimationEnd", function (e) {
        m.style.animation = "";
      }, false);
      // Standard syntax
      m.addEventListener("animationend", function (e) {
        console.log("ended");
        m.style.animation = "";
      }, false);

    } else {
      button.classList.remove('active');
    }
  }
};



//////// more helper functions

/*
 * loadFile
 */
talkthrough.loadFile = async function (filename) {
  console.log("loading remote:", filename);
  try {
    let txt = await fetch("includes/" + filename + ".txt");
    if (!txt.ok) {
      throw Error(txt.statusText);
    }

    txt = await txt.text();
    var file = {
      'filename': filename,
      'content': txt
    };
    //console.log(txt.length)
    if (!getFile(filename)) {
      files.push(file);
    }

  } catch (e) {
    console.log("could not get file " + e);
    throw (e);
  };
}


timerIncrement = function () {
  //console.log("wat", talkthrough.idletime);
  talkthrough.idletime++;
  if (talkthrough.idletime > 4 && talkthrough.changed) {
    talkthrough.updatePreview();
    talkthrough.changed = false;
  }

}
window.setInterval(timerIncrement, 250);


talkthrough.makeMirror = async function (name, file, opts) {
  var tt = this;
  if (!opts) {
    opts = {};
  }
  let defaults = {
    mode: 'javascript',
    lineNumbers: true,
    foldGutter: true,
    lineWrapping: false,
    gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lint: {
      esversion: 8
    }

  };

  for (let def in defaults) {
    //console.log(def);
    if (!opts.hasOwnProperty(def)) {
      opts[def] = defaults[def];
    }
  }
  //linting isnt working for css/html?
  if (opts.mode !== "javascript") {
    opts.lint = false;
  }
  //console.log(opts);
  if (opts.saveAs) {
    this.mirrorSaves.push({ from: name, to: opts.saveAs });
  }
  //console.dir(defaults);
  //console.dir(opts)

  var parent = document.createElement('div');
  parent.id = "outer_" + name;
  parent.classList.add('outer');
  var te = document.createElement('textarea');
  te.id = "txt_" + name;
  parent.appendChild(te);
  document.querySelector('#textareas').appendChild(parent);
  var button = document.createElement('button');
  button.textContent = name;
  button.id = "but_" + name;
  document.querySelector('#buttons').append(button);
  button.onclick = function () {
    talkthrough.visible(name);
  };
  var mirror = CodeMirror.fromTextArea(te, opts);
  mirror.button = button;
  mirror.name = name;
  mirror.active = true;
  mirror.filters = [];
  mirror.setOption("lineWrapping", true);
  await mirror.fillField(file);
  mirror.refresh();
  mirror.on("keyup", function (cm, event) {
    talkthrough.aud.pause();
    talkthrough.seekedTo = preview.contentWindow.scrollY;
  });
  mirror.on("changes", function () {
    tt.changed = true;
    tt.idletime = 0;
    //clearTimeout(delay);
    //delay = setTimeout(updatePreview(this), 300);
    //fabiola here implementing pausing audio...
    /*alert("in");
    if (skipping1stPlayAndWorkaroundForPlaybackAfterChange == 2 ) {
      skipping1stPlayAndWorkaroundForPlaybackAfterChange = 1;
      audPop.play();
    } else {
      audPop.pause();
    }*/
  });
  this.mirrors.push(mirror);
  return mirror;
};

var getFile = function (name) {
  for (var file of files) {
    if (file.filename === name) {
      return file.content;
    }
  }
  return false;
};

talkthrough.getGroup = function (name) {
  for (let g of this.groups) {
    if (g.name === name) {
      return g;
    }
  }
}

talkthrough.renderStack = function (stack, save = false) {
  //console.log(stack);
  //todo, preparse files
  if (!stack) {
    throw ("oof");
  }
  var body = "";
  for (var thing of stack) {
    if (thing.indexOf("group:") !== -1) {
      let groupName = thing.split(":")[1];
      let group = talkthrough.getGroup(groupName);
      for (let cm of group.cms) {
        if (this.getMirror(cm).active) {
          thing = "mirror:" + cm;
        }
      }
      thing = thing.replace() //
    }
    if (thing.indexOf("mirror:") !== -1) {
      thing = thing.replace("mirror:", "");
      for (var mirror of this.mirrors) {
        if (mirror.name === thing && mirror.active) {
          let val = mirror.getValue();
          //if this is for the preview, filter it.
          if (!save) {
            for (filter of mirror.filters) {
              val = talkthrough.filterLine(val, filter.line, filter.filters);
            }
          }
          //console.log("adding ", val, "from ", thing);
          body = body + val;
        }
      }
    } else if (thing.indexOf("file:") !== -1) {
      thing = thing.replace("file:", "");
      if (!getFile(thing)) {
        console.log("not finding a cache for " + thing);
        console.log(getFile(thing));
        /*
        loadFile(thing).then(function() {
            body = body + getFile(thing);
            return body;
        });
        */
      } else {
        body = body + getFile(thing);

      }

    } else {
      body = body + thing;
    }
  }
  return body;
};


//updates the preview window with code from the 
talkthrough.updatePreview = function (mirror) {
  if (this.current) {
    template = this.renderStack(templateStack);
    var previewFrame = document.getElementById('preview');
    //var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewFrame.srcdoc = template;

    //preview.open();
    //preview.write(template);
    //preview.close();

    //console.log(template);
    busy = false;
  }
}

talkthrough.getMirror = function (name) {
  for (let mirror of this.mirrors) {
    if (mirror.name === name) {
      return mirror;
    }
  }
  throw ("no mirror found named " + name);
  //return false;
}

talkthrough.makeSaveButton = function () {
  var button = document.createElement('button');
  button.innerHTML = '&#x1F4BE';
  button.id = "but_save";
  document.querySelector('#buttons').append(button);
  button.onclick = function () {
    talkthrough.saveFile(talkthrough.savename);
  };
};

talkthrough.saveFile = async function (name, sf = this.zipfiles) {
  //TODO add safeFiles to zip.  handle some edge cases.. images? videos? idk?


  if (this.current) {
    template = this.renderStack(templateStack, true);
    var previewFrame = document.getElementById('preview');
    //var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
    var zip = new JSZip();

    zip.file(name + "/" + name + ".html", template);
    for (let mirsave of this.mirrorSaves) {
      let m = this.getMirror(mirsave.from);
      if (m.active) {

        let filename = name + "/" + mirsave.to;
        let content = this.getMirror(mirsave.from).getValue();
        zip.file(filename, content, { binary: true });
      }
    }

    for (let file of sf) {
      console.log("adding", file)
      // loading a file and add it in a zip file
      let data = await JSZipUtils.getBinaryContent(file);
      zip.file(name + "/" + file, data, {
        binary: true
      });


    }
    zip.generateAsync({
      type: "blob"
    })
      .then(function (content) {
        // see FileSaver.js
        saveAs(content, name + ".zip");
      });
    busy = false;
  }
}


talkthrough.hidePreview = function () {
  document.getElementById('preview').style.visibility = "hidden";
}

talkthrough.showPreview = function () {
  document.getElementById('preview').style.visibility = "visible";
}


talkthrough.loadResources = function () {
  var filequeue = [];
  for (let item of templateStack) {
    if (item.indexOf("file:") !== -1 && !getFile(item.replace("file:", ""))) {
      console.log("must load ", item)
      filequeue.push(item.replace("file:", ""));
    }
  }
  for (let file of filequeue) {
    loadFile(file);
  }

};


//////////////////// functions for changing keyframe animations //////////////
// search the CSSOM for a specific -webkit-keyframe rule
function findKeyframesRule(rule) {
  // gather all stylesheets into an array
  var ss = document.styleSheets;
  // loop through the stylesheets
  for (var i = 0; i < ss.length; ++i) {
    // loop through all the rules
    for (var j = 0; j < ss[i].cssRules.length; ++j) {
      console.log(ss[i].cssRules[j].name);
      // find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
      if (ss[i].cssRules[j].type == window.CSSRule.KEYFRAMES_RULE && ss[i].cssRules[j].name == rule) {
        console.log("found!");
        //alert (ss[i].cssRules[j]);
        return ss[i].cssRules[j];
      }
    }
  }

  // rule not found
  return null;
}

