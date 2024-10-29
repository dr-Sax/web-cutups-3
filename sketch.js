

var sketch = function(p5) {
  var n_gon_array = [];
  var new_shape = false;
  var selected_shape = null;


    p5.setup = function(){
        h = 2000;
        var c = p5.createCanvas(p5.windowWidth, h);
        c.style("z-index: 2");
        c.style(`width: ${p5.windowWidth}px`);
        c.style(`height: ${h}px`);
        p5.strokeWeight(10);
        // Position it
        c.position(0,0);
        p5.clear();

        document.addEventListener('copy', function(e) {
            e.preventDefault(); // Prevent default copy behavior
        });
    }

    // The setup function
    p5.draw = function() {
      // Make a canvas that covers the HTML document up to 2000 pixels high
      //var h = p5.constrain(document.body.clientHeight, 0, 2000);
      for (let shape of n_gon_array){

        if (shape == selected_shape){
            p5.stroke('blue');
        }
        else{
            p5.stroke('orange');
        }

        for (let i = 0; i < shape.length; i++){
            p5.beginShape();
            p5.vertex(shape[i][0], shape[i][1]);
            p5.endShape(p5.CLOSE);

            if (i > 0){
                p5.beginShape();
                p5.line(shape[i - 1][0], shape[i - 1][1], shape[i][0], shape[i][1]);
                p5.endShape(p5.CLOSE);
            }
        }    
        }
    }
  
    // Draw lines if the user drags the mouse
    p5.keyPressed = function() {
      
      if (p5.key == 's'){
        new_shape = true;
        this.shape = [];
        n_gon_array.push([]);

        window.addEventListener('click', event => {
          if (event.target.matches('video')) {
            event.stopPropagation();
          }
        }, true);

      }

      else if (p5.key == 'e'){
        new_shape = false;
      }

      else if (p5.keyIsDown(p5.CONTROL) && p5.key == 'c'){
        // values needed:
        // window width
        window_width = window.innerWidth;
        // window height
        window_height = window.innerHeight;
        // window src
        window_src = window.location.href;
        // clip-path coordinates
        clip_path = 'polygon(';
        first = true;
        for (let vertex of selected_shape){
            abs_x = (vertex[0] / window_width * 100).toFixed(2);
            abs_y = (vertex[1] / window_height * 100).toFixed(2);
            // builds the polygon string
            if (first){
                clip_path = clip_path + abs_x + '% ' + abs_y + '%';
                first = false;
            }
            else{
                clip_path = clip_path + ', '
                clip_path = clip_path + abs_x + '% ' + abs_y + '%';
            }           
        }
        clip_path = clip_path + ')';

        
        cut_json = `{"width": "${window_height}px", "height": "${window_height}px", "src": "${window_src}", "clip_path": "${clip_path}"}`;
        navigator.clipboard.writeText(cut_json);
      }
    }

    p5.mousePressed = function (){
      if (new_shape){
        this.shape.push([p5.mouseX, p5.mouseY]);
        n_gon_array[n_gon_array.length - 1] = this.shape; // update shape vertex in array
      }
      else {
        if (n_gon_array.length > 0){

            let shapes = n_gon_array;

            for (let i = shapes.length - 1; i >= 0; i--) {
                let shape = shapes[i];
                
                if (isPointInPolygon(p5.mouseX, p5.mouseY, shape)) {
                    selected_shape = shape;
                    break;
                }
                else {
                    selected_shape = null;
                }
        }
      }
    }

    function isPointInPolygon(x, y, points) {
        let inside = false;
        
        // Loop through vertices of the polygon
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          let xi = points[i][0], yi = points[i][1];
          let xj = points[j][0], yj = points[j][1];
          
          let intersect = ((yi > y) !== (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              
          if (intersect) inside = !inside;
        }
        
        return inside;
      }
  
  }
}
  
  // The above function closure is passed into a p5 object constructor
  // this starts the sketch.
  var myp5 = new p5(sketch);