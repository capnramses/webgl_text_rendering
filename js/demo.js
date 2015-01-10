//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

var font_img = "fonts/atlas.png"
var font_meta = "fonts/atlas.meta"

var canvas;
var gl;
var gl_width;
var gl_height;

var time_id, hello_id;

main ();

function main () {
	canvas = document.getElementById ("canvas");
	gl = WebGLUtils.setupWebGL (canvas);
	canvas_resize ();
	
	//
	// load font shaders etc.
	init_text_rendering (gl_width, gl_height);
	//
	// load the font image and meta-data files
	load_font (font_img, font_meta);
	
	//
	// create a string of text to display
	hello_id = add_text (
		"Hello,\nis it me you're\nlooking for?",
		-0.9, 0.5, 30.0, 0.2, 0.2, 0.2, 1.0);
	
	time_id = add_text (
		"The time is:",
		-1.0, 1.0, 75.0, 1.0, 0.0, 0.0, 1.0);
	set_text_centered_on (time_id, 0.0, 0.0);
	
	gl.clearColor (0.95, 0.9, 0.85, 1.0);
	gl.enable (gl.DEPTH_TEST);
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	update ();
}

function canvas_resize () {
	gl_width = canvas.clientWidth;
	gl_height = canvas.clientHeight;
	gl.viewport (0, 0, gl_width, gl_height);
	console.log ("client canvas size: " + gl_width + "x" + gl_height);
}


function update () {
	draw ();
	window.requestAnimFrame (update, canvas);
}

function draw () {
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//
	// update time here
	var seconds = new Date().getTime() / 1000.0;
	var str = "The time is: " + seconds;
	update_text (time_id, str);
	set_text_centered_on (time_id, 0.0, 0.0);
	var r = Math.abs (Math.sin (seconds));
	var g = Math.abs (Math.sin (seconds + 1.57));
	change_text_colour (time_id, r, g, 0.0, 1.0);
	
	draw_texts ();
}
