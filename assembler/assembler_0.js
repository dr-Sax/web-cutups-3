import * as THREE from '../libraries/three.js';
import {CSS3DObject} from "../libraries/CSS3DRenderer.js";
import {CSS3DRenderer} from "../libraries/CSS3DRenderer.js";
//web-ext run --target=chromium       

let camera, scene, renderer;
let selected_frames;
let frame = 0;
let design_history = {};
let group;
let design_history_iter = 0;

function Element(x, y, z, rx, ry, rz, scale, width, height, src, clip_path) {

	const div = document.createElement( 'div' );
	//div.style.width = width;
	//div.style.height = height;

	const overlayDiv = document.createElement('div');
	overlayDiv.style.position = 'absolute';
	overlayDiv.style.top = '0';
	overlayDiv.style.left = '0';
	overlayDiv.style.width = '100%';
	overlayDiv.style.height = '100%';
	overlayDiv.style.backgroundColor = 'transparent';
	overlayDiv.style.pointerEvents = 'none';
	overlayDiv.style.zIndex = '1';
	overlayDiv.style.transition = 'background-color 0.3s';
	overlayDiv.style.clipPath = clip_path;
	div.appendChild(overlayDiv);

	const iframe = document.createElement( 'iframe' );
	iframe.style.width = width;
	iframe.style.height = height;
	iframe.style.border = '0px';
	iframe.style.clipPath = clip_path;
	iframe.src = src;
	iframe.allow = 'autoplay; encrypted-media';
	iframe.allowFullscreen = 'true';
	
	div.appendChild( iframe );	
	

	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;
	object.rotation.x = rx
	object.rotation.x = rz
	object.src = src;
	object.scale.set(scale, scale, scale);

	return object;

}

init();
animate();

function init() {

	const container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 0, 0, 100);
	selected_frames = [];

	scene = new THREE.Scene();

	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	group = new THREE.Group();

	document.addEventListener('paste', function(e) {
		e.preventDefault(); // Prevent default copy behavior
	});
	

	scene.add( group );

	window.addEventListener( 'resize', onWindowResize );

	window.addEventListener('keydown', onCtrlV);
	window.addEventListener('keydown', translate);
	window.addEventListener('keyup', stop_translate);

	// Block iframe events when dragging camera

	const blocker = document.getElementById( 'blocker' );
	blocker.style.display = 'none';



	let keysPressed = {};
	let translate_scale = 1;
	let rotate_scale = 0.1;
	let scale_scale = .005;

	async function translate(event){
		keysPressed[event.key] = true;
		// rotation:
		if (keysPressed['r'] && keysPressed['x'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(translate_scale, 0, 0, rotate_scale, 0, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['x'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(-translate_scale, 0, 0, -rotate_scale, 0, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['y'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, translate_scale, 0, 0, rotate_scale, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['y'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, -translate_scale, 0, 0, -rotate_scale, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['z'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, 0, translate_scale, 0, 0, rotate_scale, 0);
		}
		else if (keysPressed['r'] && keysPressed['z'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, 0, -translate_scale, 0, 0, -rotate_scale, 0);
		}

		// translation:
		else if (keysPressed['x'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(translate_scale, 0, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['x'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(-translate_scale, 0, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['y'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, translate_scale, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['y'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, -translate_scale, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['z'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, 0, translate_scale, 0, 0, 0, 0);
		}
		else if (keysPressed['z'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, 0, -translate_scale, 0, 0, 0, 0);
		} 

		// scale
		else if (keysPressed['s'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, 0, 0, 0, 0, 0, scale_scale);
		}
		else if (keysPressed['s'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, 0, 0, 0, 0, 0, -scale_scale);
		} 
		
		else if (keysPressed['p']){

			const designHistory = JSON.stringify(design_history, null, 2);

            // Create a Blob
            const blob2 = new Blob([designHistory], { type: 'application/json' });

            // Create a download link
            const link2 = document.createElement('a');
            link2.href = URL.createObjectURL(blob2);
            link2.download = 'designHistory.json';
            
            // Trigger download
            link2.click();

            // Clean up
            URL.revokeObjectURL(link2.href);
		}

		else if (keysPressed[' ']){
			let frame_cnt = Object.keys(design_history[0]).length;
			design_history_player(frame_cnt);
		}
	}

	function design_history_player(frame_cnt){
		let x0;
		let y0;
		let z0;
		let rx0;
		let ry0;
		let rz0;
		let scale0;
		Object.keys(design_history).forEach(tile => {

			// get design history data at for that tile and frame idx:
			let tile_frame_data = design_history[tile][design_history_iter.toString()];
			
			try{
				x0 = tile_frame_data['pos-rot']['x'];
				y0 = tile_frame_data['pos-rot']['y'];
				z0 = tile_frame_data['pos-rot']['z'];
				rx0 = tile_frame_data['pos-rot']['rx'];
				ry0 = tile_frame_data['pos-rot']['ry'];
				rz0 = tile_frame_data['pos-rot']['rz'];
				scale0 = tile_frame_data['pos-rot']['s'];
			}
			catch (exception){ //frame doesnt exist for this tile, so it should be hidden
				x0 = 0;
				y0 = 0;
				z0 = 0;
				rx0 = 0;
				ry0 = 0;
				rz0 = 0;
				scale0 = 0;
			}

			// set values for existing tile on screen:
			group.children[tile].position.set(x0, y0, z0);
			group.children[tile].rotation.set(rx0, ry0, rz0);
			group.children[tile].scale.set(scale0, scale0, scale0);
		});

		if (design_history_iter < frame_cnt - 1){
			design_history_iter += 1;
		}
		else{
			design_history_iter = 0;
		}
		
		
	}  	  


	// helper function to translate
	function selected_frame_modifier(x, y, z, rx, ry, rz, scale){
		for (let i = 0; i < selected_frames.length; i++){
			let x0 = selected_frames[i].position.x;
			let y0 = selected_frames[i].position.y;
			let z0 = selected_frames[i].position.z;
			let rx0 = selected_frames[i].rotation.x;
			let ry0 = selected_frames[i].rotation.y;
			let rz0 = selected_frames[i].rotation.z;
			let scale0 = selected_frames[i].scale.x
			
			selected_frames[i].position.set(x0 + x, y0 + y, z0 + z);
			selected_frames[i].rotation.set(rx0 + rx, ry0 + ry, rz0 + rz);
			selected_frames[i].scale.set(scale0 + scale, scale0 + scale, scale0 + scale);
		}

		for (var i = 0; i < group.children.length; i++){
			
			design_history[i][frame] = JSON.parse(JSON.stringify(design_history[i][frame - 1]));
			design_history[i][frame]['pos-rot'] = {
				"x": group.children[i].position.x,
				"y": group.children[i].position.y,
				"z": group.children[i].position.z,
				"rx": group.children[i].rotation.x,
				"ry": group.children[i].rotation.y,
				"rz": group.children[i].rotation.z,
				"s": group.children[i].scale.x
			}
		}

		frame = frame + 1;
	}

	async function stop_translate(event){
		delete keysPressed[event.key];
	}

	async function onCtrlV(event){
		if (event.ctrlKey && event.key == "v"){
			var jsonString = await navigator.clipboard.readText();
			var jsonObject = JSON.parse(jsonString);

			// update current objects to repeat last frame on copy/paste of new object
			Object.keys(design_history).forEach(tile => {
				design_history[tile][frame] = design_history[tile][frame - 1];
			});

			// loop through each object in the design history json clipping
			Object.keys(jsonObject).forEach(key => {
				
				// last value, used to generate last state in design history
				var frame_idx = Object.keys(jsonObject[key]).length - 1;
				// extract positionality values and src info:
				var width = jsonObject[key][frame_idx].width;
				var height = jsonObject[key][frame_idx].height;
				var src = jsonObject[key][frame_idx].src;
				var clip_path = jsonObject[key][frame_idx].clip_path;
				var x = jsonObject[key][frame_idx]["pos-rot"]["x"];
				var y = jsonObject[key][frame_idx]["pos-rot"]["y"];
				var z = jsonObject[key][frame_idx]["pos-rot"]["z"];
				var rx = jsonObject[key][frame_idx]["pos-rot"]["rx"];
				var ry = jsonObject[key][frame_idx]["pos-rot"]["ry"];
				var rz = jsonObject[key][frame_idx]["pos-rot"]["rz"];
				var scale = jsonObject[key][frame_idx]["pos-rot"]["s"];

				// add element to screen:
				group.add( new Element(x, y, z, rx, ry, rz, scale, width, height, src, clip_path));

				// totals the number of objects onscreen:
				// allows us to know where to place new objects in the design history json
				var cur_obj_count = group.children.length;

				// transpose frames to match current paste:
				// this is needed for pastes occuring after the initial (when frame = 0)
				console.log(Object.keys(key))
				if (Object.keys(key)[0] != '0' | frame != 0){
					let transposed = {};
					Object.keys(jsonObject[key]).forEach(t => {
						transposed[frame.toString()] = jsonObject[key][t];
					});
					design_history[cur_obj_count - 1]= JSON.parse(JSON.stringify(transposed));

				}
				else{
					design_history[cur_obj_count - 1]= JSON.parse(JSON.stringify(jsonObject[key]));
				}

			  });
			frame = frame + 1;
		}
	}


		// First, request MIDI access
	navigator.requestMIDIAccess()
		.then(onMIDISuccess, onMIDIFailure);

	let currentDialValue = 0;
	let isDrumPadPressed = false;
	
	function onMIDISuccess(midiAccess) {
        const inputs = midiAccess.inputs.values();
        
        for (const input of inputs) {
            console.log(`Input port: ${input.name}`);
            input.onmidimessage = onMIDIMessage;
        }

        midiAccess.onstatechange = (event) => {
            console.log(`MIDI port ${event.port.name} ${event.port.state}`);
        };
    }

	function onMIDIFailure(error) {
		console.error("Failed to get MIDI access:", error);
	}

    function onMIDIMessage(message) {
		const [command, number, value] = message.data;
		
		// Handle dial rotation (CC messages)
		if (command === 176 && number === 70) {
			// Map the MIDI value (0-127) to the range of available elements
			const numElements = group.children.length;
			if (numElements > 0) {
				// Clear previous dial indicator
				if (currentDialValue !== null) {
					const prevElement = group.children[currentDialValue];
					// Only reset to transparent if it's not selected (yellow)
					if (prevElement.element.children[0].style.backgroundColor === 'rgba(255, 0, 0, 0.5)') {
						prevElement.element.children[0].style.backgroundColor = 'transparent';
					}
				}
	
				// Map 0-127 to 0-(numElements-1)
				const newDialValue = Math.floor((value / 127) * numElements);
				currentDialValue = Math.min(newDialValue, numElements - 1);
				
				// Show red highlight on current dial position
				const currentElement = group.children[currentDialValue];
				// Only set to red if it's not already selected (yellow)
				if (currentElement.element.children[0].style.backgroundColor === 'transparent') {
					currentElement.element.children[0].style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
				}
				
				console.log(`Dial value ${value} mapped to element index: ${currentDialValue}`);
			}
		}
		
		// Handle drum pad press (Note On typically 144, Note Off 128)
		if (command === 153 && number === 36) {
			if (value > 0) { // Note On with velocity > 0
				isDrumPadPressed = true;
				console.log('drum pressed, selecting element:', currentDialValue);
				toggleElementSelection(currentDialValue);
			} else { // Note Off
				isDrumPadPressed = false;
			}
		}
	}
	
	function toggleElementSelection(index) {
		if (index >= group.children.length || index < 0) {
			console.log('Invalid element index:', index);
			return;
		}
		
		const element = group.children[index];
		const frameBgColor = element.element.children[0].style.backgroundColor;
		
		if (frameBgColor === 'transparent' || frameBgColor === 'rgba(255, 0, 0, 0.5)') {
			// Select the element - change from either transparent or red to yellow
			element.element.children[0].style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
			selected_frames.push(element);
			console.log(`Selected element ${index}`);
		} else {
			// Deselect the element - change from yellow to red (since it's still under the dial)
			element.element.children[0].style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
			const elementIdx = selected_frames.indexOf(element);
			if (elementIdx !== -1) {
				selected_frames.splice(elementIdx, 1);
				console.log(`Deselected element ${index}`);
			}
		}
		
		console.log(`Total selected frames: ${selected_frames.length}`);
	}

	document.addEventListener('keydown', handleNumberPress);

	// Function to handle number press
	function handleNumberPress(event) {
	// Check if the pressed key is a number
	if (isNumber(event.key)) {
		console.log(`You pressed the number: ${event.key}`);
		// Add your custom logic here
		performNumberPressActions(event.key);
	}
	}

	// Helper function to check if a string is a number
	function isNumber(str) {
	return !isNaN(str) && !isNaN(parseFloat(str));
	}

	// Example function to perform actions on number press
	function performNumberPressActions(number) {
		var element = group.children[number];
		var frame_bg_color = element.element.children[0].style.backgroundColor
		console.log(selected_frames);
		if (frame_bg_color == 'transparent'){
			element.element.children[0].style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
			selected_frames.push(element);
			
		}
		else{
			element.element.children[0].style.backgroundColor = 'transparent';
			let element_idx = selected_frames.indexOf(element);
			selected_frames.splice(element_idx, 1);
		}
		
	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	//controls.update();
	renderer.render( scene, camera );

}


