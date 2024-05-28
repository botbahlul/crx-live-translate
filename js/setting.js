var select_src_language, select_src_dialect;
var src, src_language_index, src_dialect, src_dialect_index, show_src;
var select_dst_language, select_dst_dialect;
var dst, dst_language_index, dst_dialect, dst_dialect_index, show_dst;
var src_fonts, dst_fonts;

var select_src_font, input_src_font_size, input_src_font_color;
var src_selected_font_index, src_selected_font, src_font_size, src_font_color;
var input_src_container_width_factor, input_src_container_height_factor;
var src_container_width_factor, src_container_height_factor;
var input_src_container_top_factor, input_src_container_left_factor, checkbox_centerize_src;
var src_container_top_factor, src_container_left_factor, centerize_src;
var src_container_color, src_container_opacity;

var select_dst_font, input_dst_font_size, input_dst_font_color;
var dst_selected_font_index, dst_selected_font, dst_font_size, dst_font_color;
var input_dst_container_width_factor, input_dst_container_height_factor;
var dst_container_width_factor, dst_container_height_factor;
var input_dst_container_top_factor, input_dst_container_left_factor, checkbox_centerize_dst;
var dst_container_top_factor, dst_container_left_factor, centerize_dst;
var dst_container_color, dst_container_opacity;

var src_textarea_container, src_textarea;
var dst_text_container, dst_text;
var sample_video_frame, column2_frame;
var sample_video_frame_width_factor, sample_video_frame_height_factor, sample_video_frame_top_factor, sample_video_frame_left_factor;

var input_pause_threshold;
var pause_threshold;

select_src_language = document.querySelector("#select_src_language");
select_src_dialect = document.querySelector("#select_src_dialect");

select_src_font = document.querySelector("#select_src_font");
input_src_font_size = document.querySelector("#input_src_font_size");
input_src_font_color = document.querySelector("#input_src_font_color");

src_fonts = getAvailableFonts();
src_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    select_src_font.appendChild(option);
});

input_src_container_width_factor = document.querySelector("#input_src_container_width_factor");
input_src_container_height_factor = document.querySelector("#input_src_container_height_factor");

input_src_container_top_factor = document.querySelector("#input_src_container_top_factor");
input_src_container_left_factor = document.querySelector("#input_src_container_left_factor");
checkbox_centerize_src = document.querySelector("#checkbox_centerize_src");

input_src_container_color = document.querySelector("#input_src_container_color");
input_src_container_opacity = document.querySelector("#input_src_container_opacity");

select_dst_language = document.querySelector("#select_dst_language");
select_dst_dialect = document.querySelector("#select_dst_dialect");

select_dst_font = document.querySelector("#select_dst_font");
input_dst_font_size = document.querySelector("#input_dst_font_size");
input_dst_font_color = document.querySelector("#input_dst_font_color");

dst_fonts = getAvailableFonts();
dst_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    select_dst_font.appendChild(option);
});

input_dst_container_width_factor = document.querySelector("#input_dst_container_width_factor");
input_dst_container_height_factor = document.querySelector("#input_dst_container_height_factor");

input_dst_container_top_factor = document.querySelector("#input_dst_container_top_factor");
input_dst_container_left_factor = document.querySelector("#input_dst_container_left_factor");
checkbox_centerize_dst = document.querySelector("#checkbox_centerize_dst");

input_dst_container_color = document.querySelector("#input_dst_container_color");
input_dst_container_opacity = document.querySelector("#input_dst_container_opacity");

input_pause_threshold = document.querySelector("#input_pause_threshold");


column2_frame = document.querySelector("#column2");
sample_video_frame = document.querySelector("#sample_video_frame");
src_textarea_container = document.querySelector("#src_textarea_container");
src_textarea = document.querySelector("#src_textarea");
dst_textarea_container = document.querySelector("#dst_textarea_container");
dst_textarea = document.querySelector("#dst_textarea");

sample_video_frame_width_factor = sample_video_frame.getBoundingClientRect().height/window.innerWidth;
console.log('sample_video_frame_width_factor = ', sample_video_frame_width_factor);
console.log('sample_video_frame.getBoundingClientRect().width = ', sample_video_frame.getBoundingClientRect().width);

sample_video_frame_height_factor = sample_video_frame.getBoundingClientRect().height/window.innerHeight;
console.log('sample_video_frame_height_factor = ', sample_video_frame_height_factor);
console.log('sample_video_frame.getBoundingClientRect().height = ', sample_video_frame.getBoundingClientRect().height);

sample_video_frame_top_factor = sample_video_frame.getBoundingClientRect().top/window.innerHeight;
console.log('sample_video_frame_top_factor = ', sample_video_frame_top_factor);
console.log('sample_video_frame.getBoundingClientRect().top = ', sample_video_frame.getBoundingClientRect().top);

sample_video_frame_left_factor = sample_video_frame.getBoundingClientRect().left/window.innerWidth;
console.log('sample_video_frame_left_factor = ', sample_video_frame_left_factor);
console.log('sample_video_frame.getBoundingClientRect().left = ', sample_video_frame.getBoundingClientRect().left);


document.addEventListener('DOMContentLoaded', (event) => {
	CheckStoredValues();
});

function CheckStoredValues() {

	chrome.storage.sync.get(['src'], function(result) {
		src = result.src;
		console.log('src =', src);
	});

	chrome.storage.sync.get(['src_language_index'], function(result) {
		src_language_index = result.src_language_index;
		console.log('src_language_index =', src_language_index);
		if (!src_language_index) src_language_index='1';
		select_src_language.selectedIndex = src_language_index;
		update_src_country();
	});

	chrome.storage.sync.get(['src_dialect'], function(result) {
		src_dialect = result.src_dialect;
		console.log('src_dialect =', src_dialect);
		if (!src_dialect) src_dialect='en-US';
		if (src_langs[src_language_index].length>2)
			for (j=0;j<select_src_dialect.length;j++) {
				if (select_src_dialect[j].value===src_dialect) {
					src_dialect_index = j;
					break;
				}
			}
		select_src_dialect.selectedIndex = src_dialect_index;
	});

	chrome.storage.sync.get(['dst'], function(result) {
		dst = result.dst;
		console.log('dst =', dst);
	});

	chrome.storage.sync.get(['dst_language_index'], function(result) {
		dst_language_index = result.dst_language_index;
		console.log('dst_language_index =', dst_language_index);
		if (!dst_language_index) dst_language_index='6';
		select_dst_language.selectedIndex = dst_language_index;
		update_dst_country();
	});

	chrome.storage.sync.get(['dst_dialect'], function(result) {
		dst_dialect = result.dst_dialect;
		console.log('dst_dialect =', dst_dialect);
		if (!dst_dialect) dst_dialect='en-US';
		if (dst_langs[dst_language_index].length>2)
			for (j=0;j<select_dst_dialect.length;j++) {
				if (select_dst_dialect[j].value===dst_dialect) {
					dst_dialect_index = j;
					break;
				}
			}
		select_dst_dialect.selectedIndex = dst_dialect_index;
	});

	chrome.storage.sync.get(['show_src'], function(result) {
		show_src = result.show_src;
		console.log('show_src =', show_src);
		if (show_src) checkbox_show_src.checked=true;
	});

	chrome.storage.sync.get(['show_dst'], function(result) {
		show_dst = result.show_dst;
		console.log('show_dst =', show_dst);
		if (show_dst) checkbox_show_dst.checked=true;
	});

	chrome.storage.sync.get(['pause_threshold'], function(result) {
		pause_threshold = result.pause_threshold;
		console.log('CheckStoredValues before if: result.pause_threshold =', result.pause_threshold);
		if (result.pause_threshold) {
			input_pause_threshold.value = pause_threshold;
		}
		console.log('CheckStoredValues after if: pause_threshold =', pause_threshold);
	});

	chrome.storage.sync.get(['src_selected_font_index'], function(result) {
		src_selected_font_index = result.src_selected_font_index;
		console.log('CheckStoredValues before if: result.src_selected_font_index =', result.src_selected_font_index);
		if (!src_selected_font_index) src_selected_font_index=0;
		select_src_font.selectedIndex = src_selected_font_index;
		console.log('CheckStoredValues after if: src_selected_font_index =', src_selected_font_index);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_selected_font'], function(result) {
		src_selected_font = result.src_selected_font;
		console.log('CheckStoredValues before if: result.src_selected_font =', result.src_selected_font);
		if (result.src_selected_font) {
			select_src_font.value = src_selected_font;
		}
		console.log('CheckStoredValues after if: src_selected_font =', src_selected_font);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_font_size'], function(result) {
		src_font_size = result.src_font_size;
		console.log('CheckStoredValues before if: result.src_font_size =', result.src_font_size);
		if (result.src_font_size) {
			input_src_font_size.value = src_font_size;
		}
		console.log('CheckStoredValues after if: src_font_size =', src_font_size);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_font_color'], function(result) {
		src_font_color = result.src_font_color;
		console.log('CheckStoredValues before if: result.src_font_color =', result.src_font_color);
		if (result.src_font_color) {
			input_src_font_color.value = src_font_color;
		}
		console.log('CheckStoredValues after if: src_font_color =', src_font_color);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_width_factor'], function(result) {
		src_container_width_factor = result.src_container_width_factor;
		console.log('CheckStoredValues before if: result.src_container_width_factor =', result.src_container_width_factor);
		if (result.src_container_width_factor) {
			input_src_container_width_factor.value = src_container_width_factor;
		} else {
			input_src_container_width_factor.value = 0.8;
		}
		console.log('CheckStoredValues after if: src_container_width_factor =', src_container_width_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_height_factor'], function(result) {
		src_container_height_factor = result.src_container_height_factor;
		console.log('CheckStoredValues before if: result.src_container_height_factor =', result.src_container_height_factor);
		if (result.src_container_height_factor) {
			input_src_container_height_factor.value = src_container_height_factor;
		} else {
			input_src_container_height_factor.value = 0.15;
		}
		console.log('CheckStoredValues after if: src_container_height_factor =', src_container_height_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_top_factor'], function(result) {
		src_container_top_factor = result.src_container_top_factor;
		console.log('CheckStoredValues before if: result.src_container_top_factor =', result.src_container_top_factor);
		if (result.src_container_top_factor) {
			input_src_container_top_factor.value = src_container_top_factor;
		} else {
			input_src_container_top_factor.value = 0.02;
		}
		console.log('CheckStoredValues after if: src_container_top_factor =', src_container_top_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['centerize_src'], function(result) {
		centerize_src = result.centerize_src;
		console.log('CheckStoredValues before if: result.centerize_src =', result.centerize_src);
		if (centerize_src) {
			checkbox_centerize_src.checked = centerize_src;
		} else {
			checkbox_centerize_src.checked = true;
		}
		console.log('CheckStoredValues after if: centerize_src =', centerize_src);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_left_factor'], function(result) {
		src_container_left_factor = result.src_container_left_factor;
		console.log('CheckStoredValues before if: result.src_container_left_factor =', result.src_container_left_factor);
		if (result.src_container_left_factor) {
			input_src_container_left_factor.value = src_container_left_factor;
		} else {
			input_src_container_left_factor.value = 0.1;
		}
		console.log('CheckStoredValues after if: src_container_left_factor =', src_container_left_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_color'], function(result) {
		src_container_color = result.src_container_color;
		console.log('CheckStoredValues before if: result.src_container_color =', result.src_container_color);
		if (result.src_container_color) {
			input_src_container_color.value = src_container_color;
		} else {
			input_src_container_color.value = "#000000";
		}
		console.log('CheckStoredValues after if: src_container_color =', src_container_color);
		update_sample_text();
	});

	chrome.storage.sync.get(['src_container_opacity'], function(result) {
		src_container_opacity = result.src_container_opacity;
		console.log('CheckStoredValues before if: result.src_container_opacity =', result.src_container_opacity);
		if (result.src_container_opacity) {
			input_src_container_opacity.value = src_container_opacity;
		} else {
			input_src_container_opacity.value = 0.3;
		}
		console.log('CheckStoredValues after if: src_container_opacity =', src_container_opacity);
		update_sample_text();
	});



	chrome.storage.sync.get(['dst_selected_font_index'], function(result) {
		dst_selected_font_index = result.dst_selected_font_index;
		console.log('CheckStoredValues before if: result.dst_selected_font_index =', result.dst_selected_font_index);
		if (!dst_selected_font_index) dst_selected_font_index=0;
		select_dst_font.selectedIndex = dst_selected_font_index;
		console.log('CheckStoredValues after if: dst_selected_font_index =', dst_selected_font_index);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_selected_font'], function(result) {
		dst_selected_font = result.dst_selected_font;
		console.log('CheckStoredValues before if: result.dst_selected_font =', result.dst_selected_font);
		if (result.dst_selected_font) {
			select_dst_font.value = dst_selected_font;
		}
		console.log('CheckStoredValues after if: dst_selected_font =', dst_selected_font);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_font_size'], function(result) {
		dst_font_size = result.dst_font_size;
		console.log('CheckStoredValues before if: result.dst_font_size =', result.dst_font_size);
		if (result.dst_font_size) {
			input_dst_font_size.value = dst_font_size;
		}
		console.log('CheckStoredValues after if: dst_font_size =', dst_font_size);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_font_color'], function(result) {
		dst_font_color = result.dst_font_color;
		console.log('CheckStoredValues before if: result.dst_font_color =', result.dst_font_color);
		if (result.dst_font_color) {
			input_dst_font_color.value = dst_font_color;
		}
		console.log('CheckStoredValues after if: dst_font_color =', dst_font_color);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_width_factor'], function(result) {
		dst_container_width_factor = result.dst_container_width_factor;
		console.log('CheckStoredValues before if: result.dst_container_width_factor =', result.dst_container_width_factor);
		if (result.dst_container_width_factor) {
			input_dst_container_width_factor.value = dst_container_width_factor;
		} else {
			input_dst_container_width_factor.value = 0.8;
		}
		console.log('CheckStoredValues after if: dst_container_width_factor =', dst_container_width_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_height_factor'], function(result) {
		dst_container_height_factor = result.dst_container_height_factor;
		console.log('CheckStoredValues before if: result.dst_container_height_factor =', result.dst_container_height_factor);
		if (result.dst_container_height_factor) {
			input_dst_container_height_factor.value = dst_container_height_factor;
		} else {
			input_dst_container_height_factor.value = 0.15;
		}
		console.log('CheckStoredValues after if: dst_container_height_factor =', dst_container_height_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_top_factor'], function(result) {
		dst_container_top_factor = result.dst_container_top_factor;
		console.log('CheckStoredValues before if: result.dst_container_top_factor =', result.dst_container_top_factor);
		if (result.dst_container_top_factor) {
			input_dst_container_top_factor.value = dst_container_top_factor;
		} else {
			input_dst_container_top_factor.value = 0.65;
		}
		console.log('CheckStoredValues after if: dst_container_top_factor =', dst_container_top_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['centerize_dst'], function(result) {
		centerize_dst = result.centerize_dst;
		console.log('centerize_dst =', centerize_dst);
		if (centerize_dst) {
			checkbox_centerize_dst.checked = centerize_dst;
		} else {
			checkbox_centerize_dst.checked = true;
		}
		console.log('CheckStoredValues after if: centerize_dst =', centerize_dst);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_left_factor'], function(result) {
		dst_container_left_factor = result.dst_container_left_factor;
		console.log('CheckStoredValues before if: result.dst_container_left_factor =', result.dst_container_left_factor);
		if (result.dst_container_left_factor) {
			input_dst_container_left_factor.value = dst_container_left_factor;
		} else {
			input_dst_container_left_factor.value = 0.1;
		}
		console.log('CheckStoredValues after if: dst_container_top_factor =', dst_container_top_factor);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_color'], function(result) {
		dst_container_color = result.dst_container_color;
		console.log('CheckStoredValues before if: result.dst_container_color =', result.dst_container_color);
		if (result.dst_container_color) {
			input_dst_container_color.value = dst_container_color;
		} else {
			input_dst_container_color.value = "#000000";
		}
		console.log('CheckStoredValues after if: dst_container_color =', dst_container_color);
		update_sample_text();
	});

	chrome.storage.sync.get(['dst_container_opacity'], function(result) {
		dst_container_opacity = result.dst_container_opacity;
		console.log('CheckStoredValues before if: result.dst_container_opacity =', result.dst_container_opacity);
		if (result.dst_container_opacity) {
			input_dst_container_opacity.value = dst_container_opacity;
		} else {
			input_dst_container_opacity.value = 0.3;
		}
		console.log('CheckStoredValues after if: dst_container_opacity =', dst_container_opacity);
		update_sample_text();
	});
};


select_src_language.addEventListener('change', function(){
	update_src_country()
	chrome.storage.sync.set({'src' : src},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "src", data: { value: src } })
	console.log('src =', src);
	chrome.storage.sync.set({'src_language_index' : select_src_language.value},(()=>{}));
});

select_src_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'src' : src},(()=>{}));
	chrome.storage.sync.set({'src_dialect' : select_src_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "src_dialect", data: { value: src_dialect } })
	console.log('src_dialect =', src_dialect);
});

select_dst_language.addEventListener('change', function(){
	update_dst_country();
	chrome.storage.sync.set({'dst' : dst},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "dst", data: { value: dst } })
	chrome.storage.sync.set({'dst_language_index' : select_dst_language.value},(()=>{}));
});

select_dst_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'dst' : dst},(()=>{}));
	console.log('dst =', dst);
	chrome.storage.sync.set({'dst_dialect' : select_dst_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "dst_dialect", data: { value: dst_dialect } })
	console.log('dst_dialect =', dst_dialect);
});

checkbox_show_src.addEventListener('change', function(){
	chrome.storage.sync.set({'show_src' : checkbox_show_src.checked},(()=>{}));
	console.log('checkbox_show_src.checked =', checkbox_show_src.checked);
});

checkbox_show_dst.addEventListener('change', function(){
	chrome.storage.sync.set({'show_dst' : checkbox_show_dst.checked},(()=>{}));
	console.log('checkbox_show_dst.checked =', checkbox_show_dst.checked);
});

input_pause_threshold.addEventListener('change', function(){
	chrome.storage.sync.set({'pause_threshold' : input_pause_threshold.value},(()=>{}));
	console.log('pause_threshold =', pause_threshold);
});


// Add event listeners for changes in font select and font size input
select_src_font.addEventListener("change", update_sample_text);
input_src_font_size.addEventListener("input", update_sample_text);
input_src_font_size.addEventListener("change", update_sample_text);
input_src_font_color.addEventListener("input", update_sample_text);
input_src_font_color.addEventListener("change", update_sample_text);
input_src_container_width_factor.addEventListener("input", update_sample_text);
input_src_container_width_factor.addEventListener("change", update_sample_text);
input_src_container_height_factor.addEventListener("input", update_sample_text);
input_src_container_height_factor.addEventListener("change", update_sample_text);
input_src_container_top_factor.addEventListener("input", update_sample_text);
input_src_container_top_factor.addEventListener("change", update_sample_text);
checkbox_centerize_src.addEventListener("change", update_sample_text);
input_src_container_left_factor.addEventListener('input', function(){
	checkbox_centerize_src.checked = false;
	update_sample_text();
});
input_src_container_left_factor.addEventListener('change', function(){
	checkbox_centerize_src.checked = false;
	update_sample_text();
});
input_src_container_color.addEventListener("input", update_sample_text);
input_src_container_color.addEventListener("change", update_sample_text);
input_src_container_opacity.addEventListener("input", update_sample_text);
input_src_container_opacity.addEventListener("change", update_sample_text);

select_dst_font.addEventListener("change", update_sample_text);
input_dst_font_size.addEventListener("input", update_sample_text);
input_dst_font_size.addEventListener("change", update_sample_text);
input_dst_font_color.addEventListener("input", update_sample_text);
input_dst_font_color.addEventListener("change", update_sample_text);
input_dst_container_width_factor.addEventListener("input", update_sample_text);
input_dst_container_width_factor.addEventListener("change", update_sample_text);
input_dst_container_height_factor.addEventListener("input", update_sample_text);
input_dst_container_height_factor.addEventListener("change", update_sample_text);
input_dst_container_top_factor.addEventListener("input", update_sample_text);
input_dst_container_top_factor.addEventListener("change", update_sample_text);
checkbox_centerize_dst.addEventListener("change", update_sample_text);
input_dst_container_left_factor.addEventListener('input', function(){
	checkbox_centerize_dst.checked = false;
	update_sample_text();
});
input_dst_container_left_factor.addEventListener('change', function(){
	checkbox_centerize_dst.checked = false;
	update_sample_text();
});
input_dst_container_color.addEventListener("input", update_sample_text);
input_dst_container_color.addEventListener("change", update_sample_text);
input_dst_container_opacity.addEventListener("input", update_sample_text);
input_dst_container_opacity.addEventListener("change", update_sample_text);

save_button.addEventListener('click', function(){
	chrome.storage.sync.set({
		'src': src,
		'dst': dst,
		'src_language_index': select_src_language.value,
		'src_dialect': select_src_dialect.value,
		'dst_language_index': select_dst_language.value,
		'dst_dialect': select_dst_dialect.value,
		'show_src': checkbox_show_src.checked,
		'show_dst': checkbox_show_dst.checked,
		'pause_threshold': input_pause_threshold.value,

		'src_selected_font_index': select_src_font.selectedIndex,
		'src_selected_font': select_src_font.value,
		'src_font_size': input_src_font_size.value,
		'src_font_color': input_src_font_color.value,
		'src_container_width_factor': input_src_container_width_factor.value,
		'src_container_height_factor': input_src_container_height_factor.value,
		'src_container_top_factor': input_src_container_top_factor.value,
		'src_container_left_factor': input_src_container_left_factor.value,
		'centerize_src': checkbox_centerize_src.value,
		'src_container_color': input_src_container_color.value,
		'src_container_opacity': input_src_container_opacity.value,

		'dst_selected_font_index': select_dst_font.selectedIndex,
		'dst_selected_font': select_dst_font.value,
		'dst_font_size': input_dst_font_size.value,
		'dst_font_color': input_dst_font_color.value,
		'dst_container_width_factor': input_dst_container_width_factor.value,
		'dst_container_height_factor': input_dst_container_height_factor.value,
		'dst_container_top_factor': input_dst_container_top_factor.value,
		'dst_container_left_factor': input_dst_container_left_factor.value,
		'centerize_dst': checkbox_centerize_dst.value,
		'dst_container_color': input_dst_container_color.value,
		'dst_container_opacity': input_dst_container_opacity.value,

	}, function() {
		console.log('save src = ', src);
		console.log('save dst = ', dst);
		console.log('save src_language_index = ', select_src_language.value);
		console.log('save src_dialect = ', select_src_dialect.value);
		console.log('save dst_language_index = ', select_dst_language.value);
		console.log('save dst_dialect = ', select_dst_dialect.value);
		console.log('save show_src = ', checkbox_show_src.checked);
		console.log('save show_dst = ', checkbox_show_dst.checked);
		console.log('save pause_threshold = ', input_pause_threshold.value);
		console.log('save src_selected_font_index = ', select_src_font.selectedIndex);
		console.log('save src_selected_font = ', select_src_font.value);
		console.log('save src_font_size = ', input_src_font_size.value);
		console.log('save src_font_color = ', input_src_font_color.value);
		console.log('save src_container_width_factor = ', input_src_container_width_factor.value);
		console.log('save src_container_height_factor = ', input_src_container_height_factor.value);
		console.log('save src_container_top_factor = ', input_src_container_top_factor.value);
		console.log('save src_container_left_factor = ', input_src_container_left_factor.value);
		console.log('save centerize_src = ', checkbox_centerize_src.value);
		console.log('save src_container_color = ', input_src_container_color.value);
		console.log('save src_container_opacity = ', input_src_container_opacity.value);
		console.log('save dst_selected_font_index = ', select_dst_font.selectedIndex);
		console.log('save dst_selected_font = ', select_dst_font.value);
		console.log('save dst_font_size = ', input_dst_font_size.value);
		console.log('save dst_font_color = ', input_dst_font_color.value);
		console.log('save dst_container_width_factor = ', input_dst_container_width_factor.value);
		console.log('save dst_container_height_factor = ', input_dst_container_height_factor.value);
		console.log('save dst_container_top_factor = ', input_dst_container_top_factor.value);
		console.log('save dst_container_left_factor = ', input_dst_container_left_factor.value);
		console.log('save centerize_dst = ', checkbox_centerize_dst.value);
		console.log('save dst_container_color = ', input_dst_container_color.value);
		console.log('save dst_container_opacity = ', input_dst_container_opacity.value);
	});
	CheckStoredValues();
});

var src_langs =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
 ['Arabic',          ['ar-AE', 'Uni Arab Emirates'],
                     ['ar-BH', 'Bahrain'],
                     ['ar-DZ', 'Algeria'],
                     ['ar-EG', 'Egypt'],
                     ['ar-IQ', 'Iraq'],
                     ['ar-JO', 'Jordan'],
                     ['ar-KW', 'Kuwait'],
                     ['ar-LB', 'Lebanon'],
                     ['ar-LY', 'Libya'],
                     ['ar-MA', 'Maroco'],
                     ['ar-OM', 'Oman'],
                     ['ar-QA', 'Qatar'],
                     ['ar-SA', 'Saudi Arabia'],
                     ['ar-SY', 'Syria'],
                     ['ar-TN', 'Tunisia'],
                     ['ar-YE', 'Yemen']],
 ['Armenian',        ['hy-AM']],
 ['Azerbaijani',     ['az-AZ']],
 ['Bangla',          ['bn-BD', 'Bangladesh'],
                     ['bn-IN', 'India']],
 ['Basque',          ['eu-ES']],
 ['Bulgarian',       ['bg-BG']],
 ['Catalan',         ['ca-ES']],
 ['Chinese',         ['cmn-Hans-CN', 'Chinese Mandarin (Mainland China)'],
                     ['cmn-Hans-HK', 'Chinese Mandarin (Hongkong)'],
                     ['cmn-Hant-TW', 'Chinese (Taiwan)'],
                     ['yue-Hant-HK', 'Chinese Cantonese (Hongkong)']],
 ['Croatian',        ['hr-HR']],
 ['Czech',           ['cs-CZ']],
 ['Dansk',           ['da-DK']],
 ['Deutsch',         ['de-DE']],
 ['Dutch',           ['nl-NL']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-KE', 'Kenya'],
                     ['en-TZ', 'Tanzania'],
                     ['en-GH', 'Ghana'],
                     ['en-NZ', 'New Zealand'],
                     ['en-NG', 'Nigeria'],
                     ['en-ZA', 'South Africa'],
                     ['en-PH', 'Philippines'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Filipino',        ['fil-PH']],
 ['Finland',         ['fi-FI']],
 ['French',          ['fr-FR']],
 ['Galician',        ['gl-ES']],
 ['Georgian',        ['ka-GE']],
 ['Greek',           ['el-GR']],
 ['Gujarati',        ['gu-IN']],
 ['Hindi',           ['hi-IN']],
 ['Hungarian',       ['hu-HU']],
 ['Icelandic',       ['is-IS']],
 ['Indonesian',      ['id-ID']],
 ['Italian',         ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Japanese',        ['ja-JP']],
 ['Javanese',        ['jv-ID']],
 ['Kannada',         ['kn-IN']],
 ['Khmer',           ['km-KH']],
 ['Kiswahili',       ['sw-TZ', 'Tanzania'],
                     ['sw-KE', 'Kenya']],
 ['Korean',          ['ko-KR']],
 ['Lao',             ['lo-LA']],
 ['Latvian',         ['lv-LV']],
 ['Lithuanian',      ['lt-LT']],
 ['Malay',           ['ms-MY']],
 ['Malayalam',       ['ml-IN']],
 ['Marathi',         ['mr-IN']],
 ['Myanmar',         ['my-MM']],
 ['Nepali',          ['ne-NP']],
 ['Norwegian Bokmål',['nb-NO']],
 ['Polish',          ['pl-PL']],
 ['Portuguese',      ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Romania',         ['ro-RO']],
 ['Russian',         ['ru-RU']],
 ['Serbian',         ['sr-RS']],
 ['Sinhala',         ['si-LK']],
 ['Slovene',         ['sl-SI']],
 ['Slovak',          ['sk-SK']],
 ['Spanish',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Sundanese',       ['su-ID']],
 ['Swedish',         ['sv-SE'],
                     ['sw-KE', 'Kenya']],
 ['Tamil',           ['ta-IN', 'India'],
                     ['ta-SG', 'Singapore'],
                     ['ta-LK', 'Sri Lanka'],
                     ['ta-MY', 'Malaysia']],
 ['Telugu',          ['te-IN']],
 ['Thai',            ['th-TH']],
 ['Turkish',         ['tr-TR']],
 ['Urdu',            ['ur-PK', 'Pakistan'],
                     ['ur-IN', 'India']],
 ['Vietnamese',      ['vi-VN']],
 ['Ukrainian',       ['uk-UA']],
 ['Zulu',            ['zu-ZA']]];

for (var i = 0; i < src_langs.length; i++) {
    select_src_language.options[i] = new Option(src_langs[i][0], i);
}

function update_src_country() {
    for (var i = select_src_dialect.options.length - 1; i >= 0; i--) {
        select_src_dialect.remove(i);
    }
    var list = src_langs[select_src_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_src_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_src_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
	//console.log('select_src_dialect.value =',select_src_dialect.value);
	//console.log(select_src_dialect);
	//select_dialect_value=document.getElementById('select_src_dialect').value;
	//console.log('select_dialect_value =', select_dialect_value);
    src=select_src_dialect.value.split('-')[0];
}

var dst_langs =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
 ['Arabic',          ['ar-AE', 'Uni Arab Emirates'],
                     ['ar-BH', 'Bahrain'],
                     ['ar-DZ', 'Algeria'],
                     ['ar-EG', 'Egypt'],
                     ['ar-IQ', 'Iraq'],
                     ['ar-JO', 'Jordan'],
                     ['ar-KW', 'Kuwait'],
                     ['ar-LB', 'Lebanon'],
                     ['ar-LY', 'Libya'],
                     ['ar-MA', 'Maroco'],
                     ['ar-OM', 'Oman'],
                     ['ar-QA', 'Qatar'],
                     ['ar-SA', 'Saudi Arabia'],
                     ['ar-SY', 'Syria'],
                     ['ar-TN', 'Tunisia'],
                     ['ar-YE', 'Yemen']],
 ['Armenian',        ['hy-AM']],
 ['Azerbaijani',     ['az-AZ']],
 ['Bangla',          ['bn-BD', 'Bangladesh'],
                     ['bn-IN', 'India']],
 ['Basque',          ['eu-ES']],
 ['Bulgarian',       ['bg-BG']],
 ['Catalan',         ['ca-ES']],
 ['Chinese',         ['cmn-Hans-CN', 'Chinese Mandarin (Mainland China)'],
                     ['cmn-Hans-HK', 'Chinese Mandarin (Hongkong)'],
                     ['cmn-Hant-TW', 'Chinese (Taiwan)'],
                     ['yue-Hant-HK', 'Chinese Cantonese (Hongkong)']],
 ['Croatian',        ['hr-HR']],
 ['Czech',           ['cs-CZ']],
 ['Dansk',           ['da-DK']],
 ['Deutsch',         ['de-DE']],
 ['Dutch',           ['nl-NL']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-KE', 'Kenya'],
                     ['en-TZ', 'Tanzania'],
                     ['en-GH', 'Ghana'],
                     ['en-NZ', 'New Zealand'],
                     ['en-NG', 'Nigeria'],
                     ['en-ZA', 'South Africa'],
                     ['en-PH', 'Philippines'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Filipino',        ['fil-PH']],
 ['Finland',         ['fi-FI']],
 ['French',          ['fr-FR']],
 ['Galician',        ['gl-ES']],
 ['Georgian',        ['ka-GE']],
 ['Greek',           ['el-GR']],
 ['Gujarati',        ['gu-IN']],
 ['Hindi',           ['hi-IN']],
 ['Hungarian',       ['hu-HU']],
 ['Icelandic',       ['is-IS']],
 ['Indonesian',      ['id-ID']],
 ['Italian',         ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Japanese',        ['ja-JP']],
 ['Javanese',        ['jv-ID']],
 ['Kannada',         ['kn-IN']],
 ['Khmer',           ['km-KH']],
 ['Kiswahili',       ['sw-TZ', 'Tanzania'],
                     ['sw-KE', 'Kenya']],
 ['Korean',          ['ko-KR']],
 ['Lao',             ['lo-LA']],
 ['Latvian',         ['lv-LV']],
 ['Lithuanian',      ['lt-LT']],
 ['Malay',           ['ms-MY']],
 ['Malayalam',       ['ml-IN']],
 ['Marathi',         ['mr-IN']],
 ['Myanmar',         ['my-MM']],
 ['Nepali',          ['ne-NP']],
 ['Norwegian Bokmål',['nb-NO']],
 ['Polish',          ['pl-PL']],
 ['Portuguese',      ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Romania',         ['ro-RO']],
 ['Russian',         ['ru-RU']],
 ['Serbian',         ['sr-RS']],
 ['Sinhala',         ['si-LK']],
 ['Slovene',         ['sl-SI']],
 ['Slovak',          ['sk-SK']],
 ['Spanish',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Sundanese',       ['su-ID']],
 ['Swedish',         ['sv-SE'],
                     ['sw-KE', 'Kenya']],
 ['Tamil',           ['ta-IN', 'India'],
                     ['ta-SG', 'Singapore'],
                     ['ta-LK', 'Sri Lanka'],
                     ['ta-MY', 'Malaysia']],
 ['Telugu',          ['te-IN']],
 ['Thai',            ['th-TH']],
 ['Turkish',         ['tr-TR']],
 ['Urdu',            ['ur-PK', 'Pakistan'],
                     ['ur-IN', 'India']],
 ['Vietnamese',      ['vi-VN']],
 ['Ukrainian',       ['uk-UA']],
 ['Zulu',            ['zu-ZA']]];

for (var j = 0; j < dst_langs.length; j++) {
    select_dst_language.options[j] = new Option(dst_langs[j][0], j);
	if(select_dst_dialect.value.split('-')[0]==dst)
		dstIndex=j;
}

function update_dst_country() {
    for (var j = select_dst_dialect.options.length - 1; j >= 0; j--) {
        select_dst_dialect.remove(j);
    }
    var list = dst_langs[select_dst_language.selectedIndex];
    for (var j = 1; j < list.length; j++) {
        select_dst_dialect.options.add(new Option(list[j][1], list[j][0]));
    }
    select_dst_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    dst=select_dst_dialect.value.split('-')[0];
}


function getAvailableFonts() {
    var fontList = [];
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    // Set some text to measure the width of
    var text = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Measure the width of the text for each font
    var defaultWidth = ctx.measureText(text).width;

    // List of commonly available src_fonts in most browsers
    var fontFamilies = [
      "Arial", "Arial Black", "Calibri", "Cambria", "Candara", "Comic Sans MS",
      "Consolas", "Courier New", "Georgia", "Impact", "Lucida Console", "Lucida Sans Unicode",
      "Microsoft Sans Serif", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"
    ];

    // Check if each font is available
    fontFamilies.forEach(function(font) {
      ctx.font = "40px " + font + ", sans-serif";
      var width = ctx.measureText(text).width;
      if (width !== defaultWidth) {
        fontList.push(font);
      }
    });

    return fontList;
}


function update_sample_text() {
    src_selected_font = select_src_font.value;
	console.log('src_selected_font =', src_selected_font);
	saveData('src_selected_font', src_selected_font);

	src_selected_font_index = select_src_font.selectedIndex;
	console.log('src_selected_font_index =', src_selected_font_index);
	saveData('src_selected_font_index', src_selected_font_index);

    src_font_size = input_src_font_size.value;
	console.log('src_font_size =', src_font_size);
	saveData('src_font_size', src_font_size);

	src_font_color = input_src_font_color.value;
	console.log('src_font_color =', src_font_color);
	saveData('src_font_color', src_font_color);

	src_container_width_factor = input_src_container_width_factor.value;
	console.log('src_container_width_factor =', src_container_width_factor);
	saveData('src_container_width_factor', src_container_width_factor);

	src_container_height_factor = input_src_container_height_factor.value;
	console.log('src_container_height_factor =', src_container_height_factor);
	saveData('src_container_height_factor', src_container_height_factor);

	src_container_top_factor = input_src_container_top_factor.value;
	console.log('src_container_top_factor =', src_container_top_factor);
	saveData('src_container_top_factor', src_container_top_factor);

	centerize_src = checkbox_centerize_src.checked;
	console.log('centerize_src =', centerize_src);
	saveData('centerize_src', centerize_src);

	if (centerize_src) {
		src_left = sample_video_frame.getBoundingClientRect().left + 0.5*(sample_video_frame.getBoundingClientRect().width - src_container_width_factor*sample_video_frame.getBoundingClientRect().width);
		console.log('src_left =', src_left);
		src_container_left_factor = (src_left - sample_video_frame.getBoundingClientRect().left)/sample_video_frame.getBoundingClientRect().width;
		console.log('src_container_left_factor =', src_container_left_factor);
		document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
		saveData('src_container_left_factor', src_container_left_factor);
	} else {
		src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
		console.log('src_container_left_factor =', src_container_left_factor);
		saveData('src_container_left_factor', src_container_left_factor);
	}

	src_container_color = input_src_container_color.value;
	console.log('src_container_color =', src_container_color);
	saveData('src_container_color', src_container_color);

	src_container_opacity = input_src_container_opacity.value;
	console.log('src_container_opacity =', src_container_opacity);
	saveData('src_container_opacity', src_container_opacity);


    dst_selected_font = select_dst_font.value;
	console.log('dst_selected_font =', dst_selected_font);
	saveData('dst_selected_font', dst_selected_font);

	dst_selected_font_index = select_dst_font.selectedIndex;
	console.log('dst_selected_font_index =', dst_selected_font_index);
	saveData('dst_selected_font_index', dst_selected_font_index);

    dst_font_size = input_dst_font_size.value;
	console.log('dst_font_size =', dst_font_size);
	saveData('dst_font_size', dst_font_size);

	dst_font_color = input_dst_font_color.value;
	console.log('dst_font_color =', dst_font_color);
	saveData('dst_font_color', dst_font_color);

	dst_container_width_factor = input_dst_container_width_factor.value;
	console.log('dst_container_width_factor =', dst_container_width_factor);
	saveData('dst_container_width_factor', dst_container_width_factor);

	dst_container_height_factor = input_dst_container_height_factor.value;
	console.log('dst_container_height_factor =', dst_container_height_factor);
	saveData('dst_container_height_factor', dst_container_width_factor);

	dst_container_top_factor = input_dst_container_top_factor.value;
	console.log('dst_container_top_factor =', dst_container_top_factor);
	saveData('dst_container_top_factor', dst_container_top_factor);

	centerize_dst = checkbox_centerize_dst.checked;
	console.log('centerize_dst =', centerize_dst);
	saveData('centerize_dst', centerize_dst);

	if (centerize_dst) {
		dst_left = sample_video_frame.getBoundingClientRect().left + 0.5*(sample_video_frame.getBoundingClientRect().width - dst_container_width_factor*sample_video_frame.getBoundingClientRect().width);
		console.log('dst_left =', dst_left);
		dst_container_left_factor = (dst_left - sample_video_frame.getBoundingClientRect().left)/sample_video_frame.getBoundingClientRect().width;
		console.log('dst_container_left_factor =', dst_container_left_factor);
		document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
		saveData('dst_container_left_factor', dst_container_left_factor);
	} else {
		dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
		console.log('dst_container_left_factor =', dst_container_left_factor);
		saveData('dst_container_left_factor', dst_container_left_factor);
	}

	dst_container_color = input_dst_container_color.value;
	console.log('dst_container_color =', dst_container_color);
	saveData('dst_container_color', dst_container_color);

	dst_container_opacity = input_dst_container_opacity.value;
	console.log('dst_container_opacity =', dst_container_opacity);
	saveData('dst_container_opacity', dst_container_opacity);

	regenerate_textarea();
}


document.addEventListener('fullscreenchange', function(event) {
	regenerate_textarea();
});


window.addEventListener('resize', function(event){
	regenerate_textarea();
});

window.addEventListener('fullscreenchange', function(event){
	regenerate_textarea();
});


function hexToRgba(hex, opacity) {
	let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


var debounceTimeout;
function saveData(key, data) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        chrome.storage.sync.set({ key: data }, () => {
            console.log('Data saved.');
        });
    }, 1000); // Adjust the timeout as needed
}


function get_textarea_rect() {
	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	var sample_video_frame_rect = document.querySelector("#sample_video_frame").getBoundingClientRect();

	//console.log("top =", sample_video_frame_rect.top);
	//console.log("left =", sample_video_frame_rect.left);
	//console.log("width =", sample_video_frame_rect.width);
	//console.log("height =", sample_video_frame_rect.height);

	src_width = document.querySelector("#input_src_container_width_factor").value*sample_video_frame_rect.width;
	//console.log('src_width =', src_width);

	src_height = document.querySelector("#input_src_container_height_factor").value*sample_video_frame_rect.height;
	//console.log('src_height =', src_width);

	src_top = sample_video_frame_rect.top + document.querySelector("#input_src_container_top_factor").value*sample_video_frame_rect.height;
	//console.log('src_top =', src_top);

	if (document.querySelector("#checkbox_centerize_src").checked) {
		src_left = sample_video_frame_rect.left + 0.5*(sample_video_frame_rect.width-src_width);
		//console.log('src_left =', src_left);
	} else {
		src_left = sample_video_frame_rect.left + document.querySelector("#input_src_container_left_factor").value*sample_video_frame_rect.width;
		//console.log('src_left =', src_left);
	}

	dst_width = document.querySelector("#input_dst_container_width_factor").value*sample_video_frame_rect.width;
	//console.log('dst_width =', dst_width);
		
	dst_height = document.querySelector("#input_dst_container_height_factor").value*sample_video_frame_rect.height;
	//console.log('dst_height =', dst_height);

	dst_top = sample_video_frame_rect.top + document.querySelector("#input_dst_container_top_factor").value*sample_video_frame_rect.height;
	//console.log('dst_top =', dst_top);

	if (document.querySelector("#checkbox_centerize_dst").checked) {
		dst_left = sample_video_frame_rect.left + 0.5*(sample_video_frame_rect.width-dst_width);
		//console.log('dst_left =', dst_left);
	} else {
		dst_left = sample_video_frame_rect.left + document.querySelector("#input_dst_container_left_factor").value*sample_video_frame_rect.width;
		//console.log('dst_left =', dst_left);
	}

	return {
		src_width: src_width,
		src_height: src_height,
		src_top: src_top,
		src_left: src_left,
		dst_width: dst_width,
		dst_height: dst_height,
		dst_top: dst_top,
		dst_left: dst_left
	}
}


function regenerate_textarea() {

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	src_width = src_container_width_factor*sample_video_frame.getBoundingClientRect().width;
	console.log('src_width = ', src_width);
	src_height = src_container_height_factor*sample_video_frame.getBoundingClientRect().height;
	console.log('src_height = ', src_height);
	src_top = sample_video_frame.getBoundingClientRect().top + src_container_top_factor*sample_video_frame.getBoundingClientRect().height;
	console.log('src_top = ', src_top);
	
	if (centerize_src) {
		src_left = sample_video_frame.getBoundingClientRect().left + 0.5*(sample_video_frame.getBoundingClientRect().width - src_container_width_factor*sample_video_frame.getBoundingClientRect().width);
		console.log('centerize_src = true : src_left = ', src_left);
	} else {
		src_left = sample_video_frame.getBoundingClientRect().left + src_container_left_factor*sample_video_frame.getBoundingClientRect().width;
		console.log('centerize_src = false : src_left = ', src_left);
	}

	src_textarea_container.style.position = 'absolute';
	src_textarea_container.style.width = String(src_container_width_factor*sample_video_frame.getBoundingClientRect().width) + "px";
	src_textarea_container.style.height = String(src_height) + "px";
	src_textarea_container.style.top = String(src_top) + "px";
	src_textarea_container.style.left = String(src_left) + "px";
    src_textarea.style.fontFamily = src_selected_font + ", sans-serif";
    src_textarea.style.fontSize = String(src_font_size) + "px";
	src_textarea.style.color = src_font_color;
	src_textarea.innerHTML = "Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text";
	src_textarea.scrollTop = document.querySelector("#src_textarea").scrollHeight;
	src_textarea.style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);
	src_textarea.style.width = "100%";
	src_textarea.style.height = "100%";

	var src_textarea_container$=$('<div id="src_textarea_container"><div id="src_textarea"></div></div>')
		.width(src_width)
		.height(src_height)
		.resizable().draggable({
			cancel: 'text',
			start: function (){
				$('#src_textarea').focus();
			},
			stop: function (){
				$('#src_textarea').focus();
			}
		})
		.css({
			'position': 'absolute',
			'fontFamily': src_selected_font + ', sans-serif',
			'fontSize': src_font_size,
			'color': src_font_color,
			'backgroundColor': hexToRgba(input_src_container_color.value, input_src_container_opacity.value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		.offset({top:src_top, left:src_left})

	document.querySelector("#src_textarea").style.width = '100%';
	document.querySelector("#src_textarea").style.height = '100%';
	document.querySelector("#src_textarea").style.border = 'none';
	document.querySelector("#src_textarea").style.display = 'inline-block';
	document.querySelector("#src_textarea").style.overflow = 'hidden';
	document.querySelector("#src_textarea").style.allow = "fullscreen";

	document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
	document.querySelector("#src_textarea").style.color = src_font_color;
	document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);
	document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';
	document.querySelector("#src_textarea").offsetParent.onresize = (function(){
		document.querySelector("#src_textarea").style.position='absolute';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';

		console.log('src_width = ', document.querySelector("#src_textarea").getBoundingClientRect().width);
		src_container_width_factor = document.querySelector("#src_textarea").getBoundingClientRect().width/sample_video_frame.getBoundingClientRect().width;
		console.log('src_container_width_factor = ', src_container_width_factor);
		input_src_container_width_factor.value = src_container_width_factor;
		chrome.storage.sync.set({'src_container_width_factor' : src_container_width_factor},(()=>{}));

		console.log('src_height = ', document.querySelector("#src_textarea").getBoundingClientRect().height);
		src_container_height_factor = document.querySelector("#src_textarea").getBoundingClientRect().height/sample_video_frame.getBoundingClientRect().height;
		console.log('src_container_height_factor = ', src_container_height_factor);
		input_src_container_height_factor.value = src_container_height_factor;
		chrome.storage.sync.set({'src_container_height_factor' : src_container_height_factor},(()=>{}));

	});


	dst_width = dst_container_width_factor*sample_video_frame.getBoundingClientRect().width;
	console.log('dst_width = ', dst_width);
	dst_height = dst_container_height_factor*sample_video_frame.getBoundingClientRect().height;
	console.log('dst_height = ', dst_height);
	dst_top = sample_video_frame.getBoundingClientRect().top + dst_container_top_factor*sample_video_frame.getBoundingClientRect().height;
	console.log('dst_top = ', dst_top);
	
	if (centerize_dst) {
		dst_left = sample_video_frame.getBoundingClientRect().left + 0.5*(sample_video_frame.getBoundingClientRect().width - dst_container_width_factor*sample_video_frame.getBoundingClientRect().width);
		console.log('centerize_dst = true : dst_left = ', dst_left);
	} else {
		dst_left = sample_video_frame.getBoundingClientRect().left + dst_container_left_factor*sample_video_frame.getBoundingClientRect().width;
		console.log('centerize_dst = false : dst_left = ', dst_left);
	}

	dst_textarea_container.style.position = 'absolute';
	dst_textarea_container.style.width = String(dst_width) + "px";
	dst_textarea_container.style.height = String(dst_height) + "px";
	dst_textarea_container.style.top = String(dst_top) + "px";
	dst_textarea_container.style.left = String(dst_left) + "px";
    dst_textarea.style.fontFamily = dst_selected_font + ", sans-serif";
    dst_textarea.style.fontSize = String(dst_font_size) + "px";
	dst_textarea.style.color = dst_font_color;
	dst_textarea.innerHTML = "Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text";
	dst_textarea.scrollTop = document.querySelector("#dst_textarea").scrollHeight;
	dst_textarea.style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);
	dst_textarea.style.width = "100%";
	dst_textarea.style.height = "100%";

	var dst_textarea_container$=$('<div id="dst_textarea_container"><div id="dst_textarea"></div></div>')
		.width(dst_width)
		.height(dst_height)
		.resizable().draggable({
			cancel: 'text',
			start: function (){
				$('#dst_textarea').focus();
			},
			stop: function (){
				$('#dst_textarea').focus();
			}
		})
		.css({
			'position': 'absolute',
			'fontFamily': dst_selected_font + ', sans-serif',
			'fontSize': dst_font_size,
			'color': dst_font_color,
			'backgroundColor': hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		.offset({top:dst_top, left:dst_left})

	document.querySelector("#dst_textarea").style.width = '100%';
	document.querySelector("#dst_textarea").style.height = '100%';
	document.querySelector("#dst_textarea").style.border = 'none';
	document.querySelector("#dst_textarea").style.display = 'inline-block';
	document.querySelector("#dst_textarea").style.overflow = 'hidden';
	document.querySelector("#dst_textarea").style.allow = "fullscreen";

	document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
	document.querySelector("#dst_textarea").style.color = dst_font_color;
	document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);
	document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';
	document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
		document.querySelector("#dst_textarea").style.position='absolute';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';

		console.log('dst_width = ', document.querySelector("#dst_textarea").getBoundingClientRect().width);
		dst_container_width_factor = document.querySelector("#dst_textarea").getBoundingClientRect().width/sample_video_frame.getBoundingClientRect().width;
		console.log('dst_container_width_factor = ', dst_container_width_factor);
		input_dst_container_width_factor.value = dst_container_width_factor;
		chrome.storage.sync.set({'dst_container_width_factor' : dst_container_width_factor},(()=>{}));

		console.log('dst_height = ', document.querySelector("#dst_textarea").getBoundingClientRect().height);
		dst_container_height_factor = document.querySelector("#dst_textarea").getBoundingClientRect().height/sample_video_frame.getBoundingClientRect().height;
		console.log('dst_container_height_factor = ', dst_container_height_factor);
		input_dst_container_height_factor.value = dst_container_height_factor;
		chrome.storage.sync.set({'dst_container_height_factor' : dst_container_height_factor},(()=>{}));
	});
}
