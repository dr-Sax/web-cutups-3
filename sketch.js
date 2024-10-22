

var sketch = function(p5) {
  var n_gon_array = [];
  var new_shape = false;

    // The setup function
    p5.setup = function() {
      // Make a canvas that covers the HTML document up to 2000 pixels high
      //var h = p5.constrain(document.body.clientHeight, 0, 2000);
      h = 2000;
      var c = p5.createCanvas(p5.windowWidth, h);
      c.style("z-index: 2");
      c.style(`width: ${p5.windowWidth}px`);
      c.style(`height: ${h}px`);
      p5.strokeWeight(10);
      p5.stroke('orange');
      // Position it
      c.position(0,0);
      p5.clear();
    }
  
    // Draw lines if the user drags the mouse
    p5.keyPressed = function() {
      
      if (p5.key == 's'){
        new_shape = true;
        this.t = p5.beginShape(p5.POINTS);

        window.addEventListener('click', event => {
          if (event.target.matches('video')) {
            event.stopPropagation();
          }
        }, true);

      }

      else if (p5.key == 'e'){
        new_shape = false;
        p5.endShape();
        n_gon_array.push(this.t);
      }
    }

    p5.mousePressed = function (){
      if (new_shape){
        p5.vertex(p5.mouseX, p5.mouseY);
      }
    }
  
  }
  
  // The above function closure is passed into a p5 object constructor
  // this starts the sketch.
  var myp5 = new p5(sketch);