import * as THREE from './three.js';
import { TrackballControls } from './TrackballControls.js';
import {CSS3DObject} from "./CSS3DRenderer.js";
import {CSS3DRenderer} from "./CSS3DRenderer.js";

let camera, scene, renderer;
let controls;

//https://www.youtube.com/watch?v=KRm_GICiPIQ



function getRandomInt(min, max) {
	// Generate a random integer between min (inclusive) and max (inclusive)
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; 
  }
  

function Element( id, x, y, z, rx, ry, rz, top, src) {

	const div = document.createElement( 'div' );
	div.style.width = '1232px';
	div.style.height = '1232px';
	//div.style.backgroundColor = '#000';
	let i = getRandomInt(0, 100);
	const iframe = document.createElement( 'iframe' );
	iframe.style.width = '1232px';
	iframe.style.height = '1325px';
	iframe.style.border = '0px';
	if (top){
		iframe.style.clipPath = `polygon(15% 50%,20% 37%,36% 33%,51% 40%,60% 33%,66% 40%,65% 51%,51% 55%,45% 50%,34% 49%,25% 53%,18% 53%)`;
	}
	else {
		iframe.style.clipPath = `polygon(0 0, 25% 25%, 100% 100%, 100% 0)`
	}
	
	//iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0&autoplay=1' ].join( '' );
	iframe.src = src
	iframe.allow = 'autoplay';
	div.appendChild( iframe );

	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;
	object.rotation.x = rx
	object.rotation.x = rz
	

	return object;

}

init();
animate();

function init() {

	const container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 500, 350, 750 );

	scene = new THREE.Scene();

	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	const group = new THREE.Group();
	var src = 'https://en.wikipedia.org/wiki/Horror_film';
	var src2 = 'https://www.youtube.com/embed/AGKcM1bXlXA?autoplay=1&mute=1';
	group.add( new Element( 'pQM0Q2eNoOg', 0, 0, 240, 0, 0, 0, true, src2) );

	//group.add( new Element( 'aHZdDmYFZN0', 0, 0, 240, Math.PI/2, 0, 0, false, src2) );
	//group.add( new Element( 'pQM0Q2eNoOg', 0, 0, 240, 0, Math.PI/2, 0, true, src2) );
	//group.add( new Element( 'aHZdDmYFZN0', 0, 0, 240, Math.PI/2, Math.PI/2, 0, false, src) );
	

	scene.add( group );

	controls = new TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 4;

	window.addEventListener( 'resize', onWindowResize );

	// Block iframe events when dragging camera

	const blocker = document.getElementById( 'blocker' );
	blocker.style.display = 'none';

	controls.addEventListener( 'start', function () {

		blocker.style.display = '';

	} );
	controls.addEventListener( 'end', function () {

		blocker.style.display = 'none';

	} );
	
	if (navigator.requestMIDIAccess){
		navigator.requestMIDIAccess().then(success, failure);
	}
	
	function success(midiAccess){
		midiAccess.addEventListener('statechange', updateDevices)
	
		const inputs = midiAccess.inputs;
		inputs.forEach((input) => {
			console.log(input);
			input.onmidimessage = handleInput;
		});
	
	}
	
	function handleInput(event){
		var val = event.data[2];
		
		group.children.forEach((element) => {
			var pre_val = element.position.x;
			console.log(val, pre_val);
			if (val > pre_val)
				element.rotation.x += .01;
			else
				element.rotation.x -= .01;
				
		});
	}
	
	function updateDevices(event){
		console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
		
	}
	
	function failure(){
		console.log('Could not connect MIDI');
	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );

}