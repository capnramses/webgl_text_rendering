//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

var font_texture;

var font_sp;
var font_vs = "shaders/font.vert";
var font_fs = "shaders/font.frag";
var font_text_colour_loc;

var glyph_widths = new Array ();
var glyph_y_offsets = new Array ();

function init_text_rendering () {
	console.log ("loading font shaders " + font_vs + " " + font_fs);
	font_sp = load_shaders_from_files (font_vs, font_fs);
	font_text_colour_loc = get_uniform_loc (font_sp, "text_colour");
}

function load_font (image, meta) {
	font_texture = create_texture_from_file (image);
	load_font_meta (meta);
}

function load_font_meta (meta) {
	console.log ("loading meta " + meta);
	var str = get_string_from_URL (meta);
	var lines = str.split ('\n');
	
	// skip header line
	// loop through and get each glyph's info
	for (var i = 1; i < lines.length; i++) {
		var toks = lines[i].split (' ');
		// %i %f %f %f %f %f\n
		var ascii = toks[0];
		//var xmin = toks[1];
		var width = toks[2];
		//var ymin = toks[3];
		var height = toks[4];
		var y_offset = toks[5];
		
		glyph_widths[ascii] = width;
		glyph_y_offsets[ascii] = 1.0 - height - y_offset;
	}
}

// TODO
function text_to_vbo (str, at_x, at_y, scale_px, points_vbo, texcoords_vbo,
	point_count) {

}

// TODO
function add_text (str, x, y, size_in_px, r, g, b, a) {

}

// TODO
function update_text (id, str) {

}

// TODO
function change_text_colour (id, r, g, b, a) {

}

// TODO
function draw_texts () {

}

