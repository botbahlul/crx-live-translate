var recognizing = false;

chrome.action.onClicked.addListener((tab) => {

	recognizing=!recognizing;

	if (recognizing) {
		var icon_text_listening = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_listening') {
				icon_text_listening = request.data.value;
				chrome.action.setIcon({path: 'mic-listening.png'});
				chrome.action.setBadgeText({text: icon_text_listening});
			};
		});

		var icon_text_no_mic = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_no_mic') {
				icon_text_no_mic = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			};
		});

		var icon_text_blocked = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_blocked') {
				icon_text_blocked = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			};
		});

		var icon_text_denied = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_denied') {
				icon_text_denied = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			};
		});

		console.log('Start button clicked to start: recognizing =', recognizing);
		chrome.storage.sync.set({'recognizing' : recognizing},(()=>{}));
		chrome.action.setIcon({path: 'mic-listening.png'});

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tab.id, 'start');
		});

		chrome.scripting.insertCSS({
			target:{tabId:tab.id},
			files:['js/jquery-ui.css']}),
		chrome.scripting.executeScript({
			target:{tabId:tab.id},
			files:['js/jquery.min.js']}),
		chrome.scripting.executeScript({
			target:{tabId:tab.id},
			files:['js/jquery-ui.min.js']}),
		chrome.scripting.executeScript({
			target:{tabId:tab.id},
			files:['js/moment.min.js']}),
		chrome.scripting.executeScript({
			target: {tabId: tab.id},
			func: onLoad
		});

	} else {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tab.id,'stop');
		});
		chrome.storage.sync.set({'recognizing' : recognizing},(()=>{}));
		chrome.action.setBadgeText({text: ''});
		chrome.action.setIcon({path: 'mic.png'});
		console.log('Start button clicked to end: recognizing =', recognizing);
		return;
	};
});


function onLoad() {

	var action, recognition, recognizing, src, dst, src_dialect, dst_dialect;
	var show_src, show_dst, show_timestamp_src, show_timestamp_dst;

	var src_selected_font, src_font_size, src_font_color;
	var src_container_width_factor, src_container_height_factor;
	var src_container_top_factor, src_container_left_factor, centerize_src;
	var src_width, src_height, src_top, src_left;
	var src_container_color, src_container_opacity;

	var dst_selected_font, dst_font_size, dst_font_color;
	var dst_container_width_factor, dst_container_height_factor;
	var dst_container_top_factor, dst_container_left_factor, centerize_dst;
	var dst_width, dst_height, dst_top, dst_left;
	var dst_container_color, dst_container_opacity;

	var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript;
	var interim_started = false;
	var pause_timeout, pause_threshold = 5000, input_pause_threshold; // 5 seconds artificial pause threshold;
	var all_final_transcripts = [], formatted_all_final_transcripts;
	var all_translated_transcripts = [], formatted_all_translated_transcripts;
	var transcript_is_final = false;

	var video_info;
	var timestamp_separator = "-->";
	var session_start_time, session_end_time;

	function formatTimestamp(timestamp) {
		// Convert timestamp to string
		const timestampString = timestamp.toISOString();

		// Extract date and time parts
		const datePart = timestampString.slice(0, 10);
		const timePart = timestampString.slice(11, 23);

		// Concatenate date and time parts with a space in between
		return `${datePart} ${timePart}`;
	}


	session_start_time = formatTimestamp(new Date());
	console.log('session_start_time =', session_start_time);

	chrome.runtime.onMessage.addListener(function (response, sendResponse) {
		console.log('onload: response =', response);
	});

	chrome.storage.sync.get([ 'recognizing', 'src_dialect', 'dst_dialect', 'show_src', 'show_dst', 
			'show_timestamp_src', 'show_timestamp_dst', 'pause_threshold', 
			'src_selected_font', 'src_font_size', 'src_font_color', 'src_container_width_factor', 'src_container_height_factor', 
			'src_container_top_factor', 'src_container_left_factor', 'centerize_src', 'src_container_color', 'src_container_opacity', 
			'dst_selected_font', 'dst_font_size', 'dst_font_color', 'dst_container_width_factor', 'dst_container_height_factor', 
			'dst_container_top_factor', 'dst_container_left_factor', 'centerize_dst', 'dst_container_color', 'dst_container_opacity'], function(result) {

		recognizing = result.recognizing;
		console.log('onLoad: recognizing =', recognizing);

		src_dialect = result.src_dialect;
		if (!src_dialect) src_dialect='en-US';
		//console.log('src_dialect =',src_dialect);
		src = src_dialect.split('-')[0];
		if (src_dialect == "yue-Hant-HK") {
			src = "zh-TW";
		};
		if (src_dialect == "cmn-Hans-CN") {
			src = "zh-CN";
		};
		if (src_dialect == "cmn-Hans-HK") {
			src = "zh-CN";
		};
		if (src_dialect == "cmn-Hant-TW") {
			src = "zh-TW";
		};
		console.log('src = ', src);

		dst_dialect = result.dst_dialect;
		if (!dst_dialect) dst_dialect='en-US';
		//console.log('dst_dialect', dst_dialect);
		dst = dst_dialect.split('-')[0];
		if (dst_dialect == "yue-Hant-HK") {
			dst = "zh-TW";
		};
		if (dst_dialect == "cmn-Hans-CN") {
			dst = "zh-CN";
		};
		if (dst_dialect == "cmn-Hans-HK") {
			dst = "zh-CN";
		};
		if (dst_dialect == "cmn-Hant-TW") {
			dst = "zh-TW";
		};
		console.log('dst = ', dst);

		show_src = result.show_src;
		//console.log('show_src =', result.show_src);
		show_dst = result.show_dst;
		//console.log('show_dst', result.show_dst);

		show_timestamp_src = result.show_timestamp_src;
		//console.log('show_timestamp_dst =', result.show_timestamp_dst);
		show_timestamp_dst = result.show_timestamp_dst;
		//console.log('show_timestamp_dst', result.show_timestamp_dst);

		pause_threshold = result.pause_threshold;
		//console.log('pause_threshold =', result.pause_threshold);


		src_selected_font = result.src_selected_font;
		//console.log('src_selected_font =', result.src_selected_font);

		src_font_size = result.src_font_size;
		//console.log('src_font_size =', result.src_font_size);

		src_font_color = result.src_font_color;
		//console.log('src_font_color =', result.src_font_color);

		src_container_width_factor = result.src_container_width_factor;
		//console.log('result.src_container_width_factor =', result.src_container_width_factor);

		src_container_height_factor = result.src_container_height_factor;
		//console.log('result.src_container_height_factor =', result.src_container_height_factor);

		src_container_top_factor = result.src_container_top_factor;
		//console.log('result.src_container_top_factor =', result.src_container_top_factor);

		src_container_left_factor = result.src_container_left_factor;
		//console.log('result.src_container_left_factor =', result.src_container_left_factor);

		centerize_src = result.centerize_src;
		//console.log('result.centerize_src =', result.centerize_src);

		src_container_color = result.src_container_color;
		//console.log('result.src_container_color =', result.src_container_color);

		src_container_opacity = result.src_container_opacity;
		//console.log('result.src_container_opacity =', result.src_container_opacity);


		dst_selected_font = result.dst_selected_font;
		//console.log('dst_selected_font =', result.dst_selected_font);

		dst_font_size = result.dst_font_size;
		//console.log('dst_font_size =', result.dst_font_size);

		dst_font_color = result.dst_font_color;
		//console.log('dst_font_color =', result.dst_font_color);

		dst_container_width_factor = result.dst_container_width_factor;
		//console.log('result.dst_container_width_factor =', result.dst_container_width_factor);

		dst_container_height_factor = result.dst_container_height_factor;
		//console.log('result.dst_container_height_factor =', result.dst_container_height_factor);

		dst_container_top_factor = result.dst_container_top_factor;
		//console.log('result.dst_container_top_factor =', result.dst_container_top_factor);

		dst_container_left_factor = result.dst_container_left_factor;
		//console.log('result.dst_container_left_factor =', result.dst_container_left_factor);

		centerize_dst = result.centerize_dst;
		//console.log('result.centerize_dst =', result.centerize_dst);

		dst_container_color = result.dst_container_color;
		//console.log('result.dst_container_color =', result.dst_container_color);

		dst_container_opacity = result.dst_container_opacity;
		//console.log('result.dst_container_opacity =', result.dst_container_opacity);


		// create_modal_textarea
		video_info = getVideoPlayerInfo();
		//console.log("video_info = ", video_info);
		if (video_info) {
			console.log('Extension is starting');
			console.log("Video player found!");
			console.log("video_info.id = ", video_info.id);
			//console.log("Top:", video_info.top);
			//console.log("Left:", video_info.left);
			//console.log("Width:", video_info.width);
			//console.log("Height:", video_info.height);
			console.log("video_info.position = ", video_info.position);
			console.log("video_info.zIndex = ", video_info.zIndex);

			src_width = src_container_width_factor*video_info.width;
			//console.log('src_width =', src_width);

			src_height = src_container_height_factor*video_info.height;
			//console.log('src_height =', src_height);

			src_top = video_info.top + src_container_top_factor*video_info.height;
			//console.log('src_top =', src_top);

			if (centerize_src) {
				src_left = video_info.left + 0.5*(video_info.width-src_width);
				//console.log('src_left =', src_left);
			} else {
				src_left = src_container_left_factor*video_info.width;;
			}

			dst_width = dst_container_width_factor*video_info.width;
			//console.log('dst_width =', dst_width);

			dst_height = dst_container_height_factor*video_info.height;
			//console.log('dst_height =', dst_height);

			dst_top = video_info.top + dst_container_top_factor*video_info.height;
			//console.log('dst_top =', dst_top);

			if (centerize_dst) {
				dst_left = video_info.left + 0.5*(video_info.width-dst_width);
				//console.log('dst_left =', dst_left);
			} else {
				dst_left = dst_container_left_factor*video_info.width;;
			}

		} else {
			console.log("No video player found on this page.");

			src_width = src_container_width_factor*window.innerWidth;
			//console.log('src_width =', src_width);

			src_height = src_container_height_factor*window.innerHeight;
			//console.log('src_height =', src_height);

			src_top = src_container_top_factor*window.innerHeight;
			//console.log('src_top =', src_top);

			if (centerize_src) {
				src_left = 0.5*(window.innerWidth-src_width);
				//console.log('src_left =', src_left);
			} else {
				src_left = src_container_left_factor*video_info.width;;
			}

			dst_width = dst_container_width_factor*window.innerWidth;
			//console.log('dst_width =', dst_width);

			dst_height = dst_container_height_factor*window.innerHeight;
			//console.log('dst_height =', dst_height);

			dst_top = dst_container_top_factor*window.innerHeight;
			//console.log('dst_top =', dst_top);

			if (centerize_dst) {
				dst_left = 0.5*(window.innerWidth-dst_width);
				//console.log('dst_left =', dst_left);
			} else {
				dst_left = dst_container_left_factor*video_info.width;
			}
		}


		var icon_text_listening = src.toUpperCase()+':'+dst.toUpperCase();

		chrome.runtime.sendMessage({ cmd: 'icon_text_listening', data: { value: icon_text_listening } });

		//var vContainer = document.querySelector('#' + video_info.id).parentElement;
		var vContainer = video_info.element.parentElement;
		//console.log('vContainer = ', vContainer);

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
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
				'backgroundColor': hexToRgba(src_container_color, src_container_opacity),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:src_top, left:src_left})

		if (!document.querySelector("#src_textarea_container")) {
			console.log('appending src_textarea_container to html body');
			src_textarea_container$.appendTo('body');
			//src_textarea_container$.appendTo(vContainer);
		} else {
			console.log('src_textarea_container has already exist');
		};

		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea").style.color = src_font_color;
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(src_container_color, src_container_opacity);
		document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';

		document.querySelector("#src_textarea").offsetParent.onresize = (function(){

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
				centerize_src = false;
			}

			document.querySelector("#src_textarea").style.position='absolute';
			document.querySelector("#src_textarea").style.width = '100%';
			document.querySelector("#src_textarea").style.height = '100%';

			video_info = getVideoPlayerInfo();
			if (video_info) {
				//console.log('src_width = ', getRect(document.querySelector("#src_textarea")).width);
				//console.log('video_info.width = ', video_info.width);
				src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/video_info.width;
				if (src_container_width_factor < 0) {
					src_container_width_factor = 0;
				}
				//console.log('src_container_width_factor = ', src_container_width_factor);
				saveData('src_container_width_factor', src_container_width_factor);

				//console.log('src_height = ', getRect(document.querySelector("#src_textarea")).height);
				//console.log('video_info.height = ', video_info.height);
				src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/video_info.height;
				if (src_container_height_factor < 0) {
					src_container_height_factor = 0;
				}
				//console.log('src_container_height_factor = ', src_container_height_factor);
				saveData('src_container_height_factor', src_container_height_factor);
			} else {
				//console.log('src_width = ', getRect(document.querySelector("#src_textarea")).width);
				//console.log('window.innerWidth = ', window.innerWidth);
				src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/window.innerWidth;
				if (src_container_width_factor < 0) {
					src_container_width_factor = 0;
				}
				//console.log('src_container_width_factor = ', src_container_width_factor);
				saveData('src_container_width_factor', src_container_width_factor);

				//console.log('src_height = ', getRect(document.querySelector("#src_textarea")).height);
				//console.log('window.innerHeight = ', window.innerHeight);
				src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/window.innerHeight;
				if (src_container_height_factor < 0) {
					src_container_height_factor = 0;
				}
				//console.log('src_container_height_factor = ', src_container_height_factor);
				saveData('src_container_height_factor', src_container_height_factor);
			}

		});


		document.querySelector("#src_textarea").offsetParent.ondrag = (function(){

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
				centerize_src = false;
			}

			document.querySelector("#dst_textarea").style.position='absolute';

			video_info = getVideoPlayerInfo();
			if (video_info) {
				src_container_top_factor = (getRect(document.querySelector("#src_textarea_container")).top - video_info.top)/video_info.height;
				if (src_container_top_factor < 0) {
					src_container_top_factor = 0;
				}
				//console.log('src_container_top_factor = ', src_container_top_factor);
				saveData("src_container_top_factor", src_container_top_factor);

				src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/video_info.width;
				if (src_container_left_factor < 0) {
					src_container_left_factor = 0;
				}
				//console.log('src_container_left_factor = ', src_container_left_factor);
				saveData("src_container_left_factor", src_container_left_factor);
			} else {
				src_container_top_factor = getRect(document.querySelector("#src_textarea_container")).top/window.innerHeight;
				if (src_container_top_factor < 0) {
					src_container_top_factor = 0;
				}
				//console.log('src_container_top_factor = ', src_container_top_factor);
				saveData("src_container_top_factor", src_container_top_factor);

				src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/window.innerWidth;
				if (src_container_left_factor < 0) {
					src_container_left_factor = 0;
				}
				//console.log('src_container_left_factor = ', src_container_left_factor);
				saveData("src_container_left_factor", src_container_left_factor);
			}
		});


		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
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
				'backgroundColor': hexToRgba(dst_container_color, dst_container_opacity),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:dst_top, left:dst_left})

		if (!document.querySelector("#dst_textarea_container")) {
			console.log('appending dst_textarea_container to html body');
			dst_textarea_container$.appendTo('body');
			//dst_textarea_container$.appendTo(vContainer);
		} else {
			console.log('src_textarea_container has already exist');
		};

		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif"
		document.querySelector("#dst_textarea").style.color = dst_font_color;
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);
		document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';

		document.querySelector("#dst_textarea").offsetParent.onresize = (function(){

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
				centerize_dst = false;
			}

			document.querySelector("#dst_textarea").style.position='absolute';
			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';

			video_info = getVideoPlayerInfo();
			if (video_info) {
				//console.log('dst_width = ', getRect(document.querySelector("#dst_textarea")).width);
				//console.log('video_info.width = ', video_info.width);
				dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/video_info.width;
				if (dst_container_width_factor < 0) {
					dst_container_width_factor = 0;
				}
				//console.log('dst_container_width_factor = ', dst_container_width_factor);
				saveData('dst_container_width_factor', dst_container_width_factor);

				//console.log('dst_height = ', getRect(document.querySelector("#dst_textarea")).height);
				//console.log('video_info.height = ', video_info.height);
				dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/video_info.height;
				if (dst_container_height_factor < 0) {
					dst_container_height_factor = 0;
				}
				//console.log('dst_container_height_factor = ', dst_container_height_factor);
				saveData('dst_container_height_factor', dst_container_height_factor);
			} else {
				//console.log('dst_width = ', getRect(document.querySelector("#dst_textarea")).width);
				//console.log('window.innerWidth = ', window.innerWidth);
				dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/window.innerWidth;
				if (dst_container_width_factor < 0) {
					dst_container_width_factor = 0;
				}
				//console.log('dst_container_width_factor = ', dst_container_width_factor);
				saveData('dst_container_width_factor', dst_container_width_factor);

				//console.log('dst_height = ', getRect(document.querySelector("#dst_textarea")).height);
				//console.log('video_info.height = ', video_info.height);
				dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/window.innerHeight;
				if (dst_container_height_factor < 0) {
					dst_container_height_factor = 0;
				}
				//console.log('dst_container_height_factor = ', dst_container_height_factor);
				saveData('dst_container_height_factor', dst_container_height_factor);
			}
		});


		document.querySelector("#dst_textarea").offsetParent.ondrag = (function(){

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
				centerize_dst = false;
			}

			document.querySelector("#dst_textarea").style.position='absolute';

			if (video_info) {
				dst_container_top_factor = (getRect(document.querySelector("#dst_textarea_container")).top - video_info.top)/video_info.height;
				if (dst_container_top_factor < 0) {
					dst_container_top_factor = 0;
				}
				//console.log('dst_container_top_factor = ', dst_container_top_factor);
				saveData("dst_container_top_factor", dst_container_top_factor);

				dst_container_left_factor = (getRect(document.querySelector("#dst_textarea_container")).left - video_info.left)/video_info.width;
				if (dst_container_left_factor < 0) {
					dst_container_left_factor = 0;
				}
				//console.log('dst_container_left_factor = ', dst_container_left_factor);
				saveData("dst_container_left_factor", dst_container_left_factor);
			} else {
				dst_container_top_factor = getRect(document.querySelector("#dst_textarea_container")).top/window.innerHeight;
				if (dst_container_top_factor < 0) {
					dst_container_top_factor = 0;
				}
				//console.log('dst_container_top_factor = ', dst_container_top_factor);
				saveData("dst_container_top_factor", dst_container_top_factor);

				dst_container_left_factor = getRect(document.querySelector("#dst_textarea_container")).left/window.innerWidth;
				if (dst_container_left_factor < 0) {
					dst_container_left_factor = 0;
				}
				//console.log('dst_container_left_factor = ', dst_container_left_factor);
				saveData("dst_container_left_factor", dst_container_left_factor);
			}
		});


		window.addEventListener('resize', function(event){
			regenerate_textarea();
		});


		document.addEventListener('fullscreenchange', function(event) {
			regenerate_textarea();
		});

		if (document.querySelector("#dst_textarea")) {
			document.addEventListener('DOMContentLoaded', (event) => {
				document.querySelector("#dst_textarea").addEventListener('input', () => {
					const value = document.querySelector("#dst_textarea").value;
					if (value.includes('%20')) {
						console.log('dst_textarea contains %20');
						value = value.replace('\\%20/g', ' ');
						document.querySelector("#dst_textarea").value = formattedText(value);
					}
					if (value.includes('%3E')) {
						console.log('dst_textarea contains %3E');
						value = value.replace('\\%3E/g', '>');
						document.querySelector("#dst_textarea").value = formattedText(value);
					}
					value = value.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
				});
			});
		};



		if (!recognizing) {
			final_transcript = '';
			interim_transcript = '';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('onload: stopping because recognizing =', recognizing);
			return;
		};

		console.log('initializing recognition: recognizing =', recognizing);

		document.documentElement.scrollTop = video_info.top; // For modern browsers
		document.body.scrollTop = video_info.top; // For older browsers

		var final_transcript = '';
		var interim_transcript = '';
		document.querySelector("#src_textarea_container").style.display = 'none';
		document.querySelector("#dst_textarea_container").style.display = 'none';
		var start_timestamp = Date.now();
		var translate_time = Date.now();

		if (!(('webkitSpeechRecognition'||'SpeechRecognition') in window)) {
			alert('Web Speech API is not supported by this browser. upgrade_info to Chrome version 25 or later');
		} else {
			var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = src_dialect;


//---------------------------------------------------------------ONSTART--------------------------------------------------------------//


			recognition.onstart = function() {
				final_transcript = '';
				interim_transcript = '';

				startTimestamp = formatTimestamp(new Date());
				resetpause_timeout();

				if (!recognizing) {
					//recognizing = false;
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					console.log('recognition.onstart: stopping because recognizing =', recognizing);
					return;
				} else {
					console.log('recognition.onstart: recognizing =', recognizing);
					recognition.lang = src_dialect;
				}
			};


			recognition.onspeechstart = function(event) {
				console.log('recognition.onspeechstart: recognizing =', recognizing);
				final_transcript = '';
				interim_transcript = '';
				start_timestamp = Date.now();
				translate_time = Date.now();
			};

			recognition.onspeechend = function(event) {
				console.log('recognition.onspeechend: recognizing =', recognizing);
				final_transcript = '';
				interim_transcript = '';
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				start_timestamp = Date.now();
				translate_time = Date.now();
			};


//---------------------------------------------------------------ONERROR--------------------------------------------------------------//

			recognition.onerror = function(event) {
				resetpause_timeout(); // Reset timeout on error as well
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

				if (event.error == 'no-speech') {
					console.log('recognition.no-speech: recognizing =', recognizing);
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';

				}
				if (event.error == 'audio-capture') {
					alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
					var icon_text_no_mic = 'NOMIC';
					chrome.runtime.sendMessage({ cmd: 'icon_text_no_mic', data: { value: icon_text_no_mic } })
					console.log('recognition.audio-capture: recognizing =', recognizing);
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
				}
				if (event.error == 'not-allowed') {
					if (Date.now() - start_timestamp < 100) {
						var icon_text_blocked = 'BLOCKED';
						chrome.runtime.sendMessage({ cmd: 'icon_text_blocked', data: { value: icon_text_blocked } })
						alert('Permission to use microphone is blocked, go to chrome://settings/contentExceptions#media-stream to change it');
					} else {
						var icon_text_denied = 'DENIED';
						chrome.runtime.sendMessage({ cmd: 'icon_text_denied', data: { value: icon_text_denied } })
						alert('Permission to use microphone was denied');
					}
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					console.log('recognition.not-allowed: recognizing =', recognizing);
				}
			};

//---------------------------------------------------------------ONEND---------------------------------------------------------------//

			recognition.onend = function() {
				final_transcript='';
				interim_transcript='';
				if (!recognizing) {
					console.log('recognition.onend: stopping because recognizing =', recognizing);

					session_end_time = formatTimestamp(new Date());
					console.log('session_end_time =', session_end_time);

					var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
					if (t) {
						// Split text into an array of lines
						var lines = t.trim().split('\n');
						// Use a Set to filter out duplicate lines
						var uniqueLines = [...new Set(lines)];
						//console.log('uniqueLines = ', uniqueLines);

						// Join the unique lines back into a single string
						var uniqueText;
						var newUniqueLines = [];
						var timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

						if (uniqueLines.length===1 && uniqueLines[0] != '' && uniqueLines[0] != 'undefined') {
							const timestamps = uniqueLines[0].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
							if (!timestamps) {
								var lastUniqueLines = `${session_start_time} ${timestamp_separator} ${session_end_time} : ${uniqueLines[0]}`;
								console.log('lastUniqueLines = ', lastUniqueLines);
								uniqueLines[0] = lastUniqueLines;
								uniqueText = newUniqueLines.join('\n');
								uniqueText = uniqueText + '\n';
							}
						}
						else if (uniqueLines.length>1 && uniqueLines[uniqueLines.length-1] != '' && !timestamps.test(uniqueLines[uniqueLines.length-1])) {
							var lastUniqueLines = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${uniqueLines[uniqueLines.length-1]}`;
							console.log('lastUniqueLines = ', lastUniqueLines);
							uniqueLines[uniqueLines.length-1] = lastUniqueLines;
							for (var i=0; i<uniqueLines.length; i++) {
								newUniqueLines.push(uniqueLines[i]);
							}
							console.log('newUniqueLines = ', newUniqueLines);
							uniqueText = newUniqueLines.join('\n');
							uniqueText = uniqueText + '\n';
						}
						else if (uniqueLines.length>1 && uniqueLines[uniqueLines.length-1] != '' && timestamps.test(uniqueLines[uniqueLines.length-1])) {
							uniqueText = uniqueLines.join('\n');
							uniqueText = uniqueText + '\n';
						}

						//if (uniqueText) saveTranscript(uniqueText);
						if (show_timestamp_src) {
							if (uniqueText) saveTranscript(uniqueText);
						} else {
							if (uniqueText) saveTranscript(removeTimestamps(uniqueText));
						}


						if (uniqueText) var tt=gtranslate(uniqueText,src,dst).then((result => {
							result = result.replace();
							result = result.replace(/(\d+),(\d+)/g, '$1.$2');
							result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
							result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
							result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
							result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');
							result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
							result = capitalizeSentences(result);
							result = formatText(result);
							result = result.replace(/\n\s*$/, '');
							timestamped_translated_final_and_interim_transcript = result + "\n";
							//if (timestamped_translated_final_and_interim_transcript) saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
							if (show_timestamp_dst) {
								if (timestamped_translated_final_and_interim_transcript) saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
							} else {
								if (timestamped_translated_final_and_interim_transcript) saveTranslatedTranscript(removeTimestamps(timestamped_translated_final_and_interim_transcript));
							}
						}));
					}

					saveChangedSettings();

					return;

				} else {
					console.log('recognition.onend: keep recognizing because recognizing =', recognizing);
					recognition.start();
					start_timestamp = Date.now();
					translate_time =  Date.now();
				}
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			};

//---------------------------------------------------------------ONRESULT--------------------------------------------------------------//

			recognition.onresult = function(event) {
				console.log('recognition.onresult: recognizing =', recognizing);
				resetpause_timeout();

				if (!recognizing) {
					final_transcript='';
					interim_transcript='';
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					console.log('recognition.onresult: stopping because recognizing =', recognizing);
					return;
				} else {
					recognition.lang=src_dialect;
					interim_transcript = '';

					for (var i = event.resultIndex; i < event.results.length; ++i) {
						if (event.results[i].isFinal) {
							transcript_is_final = true;
							interim_transcript = '';
							interim_started = false;
							endTimestamp = formatTimestamp(new Date());
							final_transcript += `${startTimestamp} ${timestamp_separator} ${endTimestamp} : ${capitalize(event.results[i][0].transcript)}`;
							final_transcript = final_transcript + '.\n'
							all_final_transcripts.push(`${final_transcript}`);
							formatted_all_final_transcripts = all_final_transcripts.join("");
						} else {
							transcript_is_final = false;
							if (!interim_started) {
								// Capture the timestamp only when the interim result starts
								startTimestamp = formatTimestamp(new Date());
								interim_started = true; // Set the flag to true
							}
							interim_transcript += event.results[i][0].transcript;
							interim_transcript = remove_linebreak(interim_transcript);
							interim_transcript = capitalize(interim_transcript);
						}
					}

					timestamped_final_and_interim_transcript = final_transcript + interim_transcript;
					if (containsColon(timestamped_final_and_interim_transcript)) {
						timestamped_final_and_interim_transcript = capitalizeSentences(timestamped_final_and_interim_transcript);
						//console.log('capitalizeSentences(timestamped_final_and_interim_transcript) = ', timestamped_final_and_interim_transcript);
					}

					formatted_all_final_transcripts = all_final_transcripts.join("");
					//console.log('formatted_all_final_transcripts = ', formatted_all_final_transcripts);

					if (show_src) {
						document.querySelector("#src_textarea_container").style.display = 'block';
						var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
						//console.log('t = ', t);
						if (t) {
							// Split text into an array of lines
							var lines = t.trim().split('\n');
							// Use a Set to filter out duplicate lines
							var uniqueLines = [...new Set(lines)];
							// Join the unique lines back into a single string
							var uniqueText = uniqueLines.join('\n');
							uniqueText = uniqueText.replace('undefined', '');
							document.querySelector("#src_textarea").value = uniqueText;
						}

						//if (uniqueText && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = uniqueText;
						if (show_timestamp_src) {
							if (uniqueText && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = uniqueText;
						} else {
							if (uniqueText && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = removeTimestamps(uniqueText);
						}

						if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;

					} else {
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					}


					if (show_dst) {
						var  t = uniqueText;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							if (t) var tt=gtranslate(t,src,dst).then((result => {
								if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';
								result = result.replace(/(\d+),(\d+)/g, '$1.$2');
								result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
								result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
								result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
								result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
								result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');
								result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
								result = capitalizeSentences(result);
								result = formatText(result);
								result = result.replace(/\n\s*$/, '');

								const timestamps = result.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
								if (transcript_is_final) {
									all_translated_transcripts.push(`${result}`);
									//console.log('all_translated_transcripts = ', all_translated_transcripts);
									formatted_all_translated_transcripts = all_translated_transcripts.join("");
									//console.log('formatted_all_translated_transcripts = ', formatted_all_translated_transcripts);
									var translated_lines = formatted_all_translated_transcripts.trim().split('\n');
									var translated_uniqueLines = [...new Set(translated_lines)];
									var translated_uniqueText = translated_uniqueLines.join('\n');
								}
								if (formatted_all_translated_transcripts) var tt = formatted_all_translated_transcripts;
								//console.log('tt = ', tt);
								if (tt) {
									var translated_lines = tt.trim().split('\n');
									var translated_uniqueLines = [...new Set(translated_lines)];
									var translated_uniqueText = translated_uniqueLines.join('\n');
									//console.log('translated_uniqueText = ', translated_uniqueText);
								}

								var displayed_translation = translated_uniqueText + result;
								displayed_translation = formatText(displayed_translation);

								if (getFirstWord(displayed_translation).includes('undefined')) displayed_translation = displayed_translation.replace('undefined', '');

								if (all_translated_transcripts.length == 1) {

									//if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = result;
									if (show_timestamp_dst) {
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = result;
									} else {
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = removeTimestamps(result);
									}

								} else {

									//if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = displayed_translation;
									if (show_timestamp_dst) {
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = displayed_translation;
									} else {
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = removeTimestamps(displayed_translation);
									}

								}

								//if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value=result;
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;

							}));
							translate_time = Date.now();
						};
					} else {
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					}
					timestamped_translated_final_and_interim_transcript = document.querySelector("#dst_textarea").value;
				}
			};


			if (recognizing) {
				console.log('starting recognition: recognizing =', recognizing);
				recognition.start();
				start_timestamp = Date.now();
				translate_time =  Date.now();
			}


			chrome.runtime.onMessage.addListener(function (response, sendResponse) {
				console.log('on initializing: response =', response);
				if (response = 'start') {
					recognizing=true;
				}
				if (response = 'stop') {
					console.log('removing src_textarea_container from html body');
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
					console.log('removing dst_textarea_container from html body');
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
					recognizing=false;
					final_transcript = '';
					interim_transcript = '';
					try{
						if (recognition) recognition.stop()
					}
					catch(t){
						console.log("recognition.stop() failed",t)
					}
					return;
				}
			});
		};


		var two_line = /\n\n/g;
		var one_line = /\n/g;
		function linebreak(s) {
			return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
		};

		function remove_linebreak(s) {
			return s.replace(two_line, '').replace(one_line, '');
		};

		var first_char = /\S/;
		function capitalize(s) {
			//return s.replace(first_char, function(m) { return m.toUpperCase(); });

			// Check if the sentence is not empty
			if (s && s.length > 0) {
				// Capitalize the first character and concatenate it with the rest of the sentence
				return (s.trimLeft()).charAt(0).toUpperCase() + (s.trimLeft()).slice(1);
			} else {
				// If the sentence is empty, return it as is
				return s;
			}

		};


		function capitalizeSentences(transcription) {
			// Split the transcription into individual lines
			const lines = transcription.split('\n');
    
			// Iterate over each line
			for (let i = 0; i < lines.length; i++) {
				// Split each line by colon to separate startTimestamp and sentence
				const parts = lines[i].split(' : ');
				//console.log('parts[0] = ', parts[0]);
				//console.log('parts[1] = ', parts[1]);

				// If the line is in the correct format (startTimestamp : sentence)
				if (parts.length === 2) {
					// Capitalize the first character of the sentence
					const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);

					// Replace the original sentence with the capitalized one
					lines[i] = parts[0] + ' : ' + capitalizedSentence;
					//console.log('i = ', i );
					//console.log('lines[i] = ', lines[i] );
				}
			}
    
			// Join the lines back into a single string and return
			//console.log('lines.join("\n") = ', lines.join('\n'));
			return lines.join('\n');
		}


		function saveTranscript(timestamped_final_and_interim_transcript) {
			console.log('Saving all transcriptions');
			
			// Create a Blob with the transcript content
			const blob = new Blob([timestamped_final_and_interim_transcript], { type: 'text/plain' });

			// Create a URL for the Blob
			const url = URL.createObjectURL(blob);

			// Create an anchor element
			const a = document.createElement('a');
			a.href = url;
			a.download = 'transcript.txt';

			// Programmatically click the anchor element to trigger download
			a.click();

			// Cleanup
			URL.revokeObjectURL(url);
		}


		function saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript) {
			console.log('Saving translated transcriptions');
			
			// Create a Blob with the transcript content
			const blob = new Blob([timestamped_translated_final_and_interim_transcript], { type: 'text/plain' });

			// Create a URL for the Blob
			const url = URL.createObjectURL(blob);

			// Create an anchor element
			const a = document.createElement('a');
			a.href = url;
			a.download = 'translated_transcript.txt';

			// Programmatically click the anchor element to trigger download
			a.click();

			// Cleanup
			URL.revokeObjectURL(url);
		}


		function formatTimestamp(startTimestamp) {
			// Convert startTimestamp to string
			const timestampString = startTimestamp.toISOString();

			// Extract date and time parts
			const datePart = timestampString.slice(0, 10);
			const timePart = timestampString.slice(11, 23);

			// Concatenate date and time parts with a space in between
			return `${datePart} ${timePart}`;
		}


		function resetpause_timeout() {
			clearTimeout(pause_timeout);
			pause_timeout = setTimeout(function() {
				console.log("No speech detected for " + pause_threshold / 1000 + " seconds, stopping recognition");
				recognition.stop();
			}, pause_threshold);
		}


		function containsColon(sentence) {
			// Check if the sentence includes the colon character
			return sentence.includes(':');
		}


		function containsSpaceCharacter(sentence) {
			// Check if the sentence includes the colon character
			return sentence.includes('\%20');
		}


		function regenerate_textarea() {
			var textarea_rect = get_textarea_rect();

			if (document.querySelector("#src_textarea_container")) {
				document.querySelector("#src_textarea_container").style.fontFamily = src_selected_font + ", sans-serif";
				document.querySelector("#src_textarea_container").style.width = String(textarea_rect.src_width)+'px';
				document.querySelector("#src_textarea_container").style.height = String(textarea_rect.src_height)+'px';
				document.querySelector("#src_textarea_container").style.top = String(textarea_rect.src_top)+'px';
				document.querySelector("#src_textarea_container").style.left = String(textarea_rect.src_left)+'px';

				var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
					.width(textarea_rect.src_width)
					.height(textarea_rect.src_height)
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
						'backgroundColor': hexToRgba(src_container_color, src_container_opacity),
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:textarea_rect.src_top, left:textarea_rect.src_left})

				document.querySelector("#src_textarea").style.width = String(textarea_rect.src_width)+'px';
				document.querySelector("#src_textarea").style.height = String(textarea_rect.src_height)+'px';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';
				document.querySelector("#src_textarea").style.border = 'none';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").style.overflow = 'hidden';

				document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
				document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';
				document.querySelector("#src_textarea").style.color = src_font_color;
				document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(src_container_color, src_container_opacity);

			} else {
				console.log('src_textarea_container has already exist');
			}


			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.fontFamily = dst_selected_font + ", sans-serif";
				document.querySelector("#dst_textarea_container").style.width = String(textarea_rect.dst_width)+'px';
				document.querySelector("#dst_textarea_container").style.height = String(textarea_rect.dst_height)+'px';
				document.querySelector("#dst_textarea_container").style.top = String(textarea_rect.dst_top)+'px';
				document.querySelector("#dst_textarea_container").style.left = String(textarea_rect.dst_left)+'px';

				var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
					.width(textarea_rect.dst_width)
					.height(textarea_rect.dst_height)
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
						'color': dst_font_color.value,
						'backgroundColor': hexToRgba(dst_container_color, dst_container_opacity),
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:textarea_rect.dst_top, left:textarea_rect.dst_left})

				document.querySelector("#dst_textarea").style.width = String(textarea_rect.dst_width)+'px';
				document.querySelector("#dst_textarea").style.height = String(textarea_rect.dst_height)+'px';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				document.querySelector("#dst_textarea").style.border = 'none';
				document.querySelector("#dst_textarea").style.display = 'inline-block';
				document.querySelector("#dst_textarea").style.overflow = 'hidden';

				document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
				document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';
				document.querySelector("#dst_textarea").style.color = dst_font_color.value;
				document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);

			} else {
				console.log('dst_textarea_container has already exist');
			}
		}


		function getRect(element) {
			const rect = element.getBoundingClientRect();
			const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			return {
				width: rect.width,
				height: rect.height,
				top: rect.top + scrollTop,
				left: rect.left + scrollLeft
			};
		}


		function getVideoPlayerInfo() {
			var elements = document.querySelectorAll('video, iframe');
			//console.log('elements = ',  elements);
			var largestVideoElement = null;
			var largestSize = 0;

			for (var i=0; i<elements.length; i++) {
				var rect = getRect(elements[i]);
				
				//console.log('rect', rect);
				if (rect.width > 0) {
					var size = rect.width * rect.height;
					if (size > largestSize) {
						largestSize = size;
						largestVideoElement = elements[i];
					}
					var videoPlayer = elements[i];
					if (videoPlayer) {
						// Check if the video player has a container
						var videoPlayerContainer = videoPlayer.parentElement;
						while (videoPlayerContainer && videoPlayerContainer !== document.body) {
							var style = window.getComputedStyle(videoPlayerContainer);
							//if (style.position !== 'static') {
							//	break;
							//}
							videoPlayerContainer = videoPlayerContainer.parentElement;
						}
 
						// Default to the video player if no suitable container found
						if (!videoPlayerContainer || videoPlayerContainer === document.body) {
							videoPlayerContainer = videoPlayer;
						}

						// Get the position and size of the container
						var container_rect = getRect(videoPlayerContainer);
						// Get the computed style of the container
						var container_style = window.getComputedStyle(videoPlayerContainer);
						// Check if position and z-index are defined, else set default values
						var container_position = container_style.position !== 'static' ? container_style.position : 'relative';
						var container_zIndex = container_style.zIndex !== 'auto' && container_style.zIndex !== '0' ? parseInt(container_style.zIndex) : 1;
					}

					return {
						element: elements[i],
						id: elements[i].id,
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height,
						position: elements[i].style.position,
						zIndex: elements[i].style.zIndex,
						container: videoPlayerContainer,
						container_id: videoPlayerContainer.id,
						container_top: container_rect.top,
						container_left: container_rect.left,
						container_width: container_rect.width,
						container_height: container_rect.height,
						container_position: container_position,
						container_zIndex: container_zIndex,
					};
				}
			}
			//console.log('No video player found');
			return null;
		}


		function get_textarea_rect() {
			video_info = getVideoPlayerInfo();
			if (video_info) {
				console.log("Video player found");
				console.log("video_info.id = ", video_info.id);
				//console.log("Top:", video_info.top);
				//console.log("Left:", video_info.left);
				//console.log("Width:", video_info.width);
				//console.log("Height:", video_info.height);

				src_width = src_container_width_factor*video_info.width;
				//console.log('src_width =', src_width);

				src_height = src_container_height_factor*video_info.height;
				//console.log('src_height =', src_width);

				src_top = video_info.top + src_container_top_factor*video_info.height;
				//console.log('src_top =', src_top);

				if (centerize_src) {
					src_left = video_info.left + 0.5*(video_info.width-src_width);
					//console.log('src_left =', src_left);
				} else {
					src_left = video_info.left + src_container_left_factor*video_info.width;
					//console.log('src_left =', src_left);
				}

				dst_width = dst_container_width_factor*video_info.width;
				//console.log('dst_width =', dst_width);
		
				dst_height = dst_container_height_factor*video_info.height;
				//console.log('dst_height =', dst_height);

				dst_top = video_info.top + dst_container_top_factor*video_info.height;
				//console.log('dst_top =', dst_top);

				if (centerize_dst) {
					dst_left = video_info.left + 0.5*(video_info.width-dst_width);
					//console.log('dst_left =', dst_left);
				} else {
					dst_left = video_info.left + dst_container_left_factor*video_info.width;
					//console.log('dst_left =', dst_left);
				}

			} else {
				console.log("No video player found on this page");

				src_width = src_container_width_factor*window.innerWidth;
				//console.log('src_width =', src_width);

				src_height = src_container_height_factor*window.innerHeight;
				//console.log('src_height =', src_width);

				src_top = src_container_top_factor*window.innerHeight;
				//console.log('src_top =', src_top);

				if (centerize_src) {
					src_left = 0.5*(window.innerWidth-src_width);
					//console.log('src_left =', src_left);
				} else {
					src_left = src_container_left_factor*window.innerWidth;
					//console.log('src_left =', src_left);
				}


				dst_width = dst_container_width_factor*window.innerWidth;
				//console.log('dst_width =', dst_width);

				dst_height = dst_container_height_factor*window.innerHeight;
				//console.log('dst_height =', dst_height);

				dst_top = dst_container_top_factor*window.innerHeight;
				//console.log('dst_top =', dst_top);

				if (centerize_dst) {
					dst_left = 0.5*(window.innerWidth-dst_width);
					//console.log('dst_left =', dst_left);
				} else {
					dst_left = dst_container_left_factor*window.innerWidth;
					//console.log('dst_left =', dst_left);
				}
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


		function getVideoPlayerId() {
			var elements = document.querySelectorAll('video, iframe');
			var largestVideoElement = null;
			var largestSize = 0;
			for (var i=0; i<elements.length; i++) {
				if (getRect(elements[i]).width > 0) {
					var size = getRect(elements[i]).width * getRect(elements[i]).height;
					if (size > largestSize) {
						largestSize = size;
						largestVideoElement = elements[i].id;
					}
					return elements[i].id;
				}
			}
			// If no video player found, return null
			return null;
		}


		function findLargestVideoElement() {
			var videoAndIframes = document.querySelectorAll('video, iframe');
			var largestVideoElement = null;
			var largestSize = 0;

			// Iterate through selected elements
			videoAndIframes.forEach(function(element) {
				// Check if the element is a video element or an iframe containing a video
				//if (element.tagName === 'VIDEO' || (element.tagName === 'IFRAME' && element.src && element.src.includes('youtube.com/embed'))) {
				if (getRect(element).width > 0) {
					// Calculate size of the video element (using area as size metric)
					var size;
					size = getRect(element).width * getRect(element).height;

					// Check if this video element is larger than the current largest
					if (size > largestSize) {
						largestSize = size;
						largestVideoElement = element;
					}
				}
			});
			// Return the largest video element found
			return largestVideoElement;
		}


		function getVideoPlayerContainerInfo() {
			// Check for <video> elements
			var videoPlayer = document.querySelector('video');
    

			//if (!videoPlayer) {
			//	// If no <video> element found, check for <iframe> elements
			//	videoPlayer = document.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"]');
			//}
    
			if (!videoPlayer) {
				// If no <video> element found, check for <iframe> elements
				videoPlayer = document.querySelectorAll('video, iframe');
			}

			if (videoPlayer) {
				// Check if the video player has a container
				var container = videoPlayer.parentElement;
				while (container && container !== document.body) {
					var style = window.getComputedStyle(container);
					//if (style.position !== 'static') {
					//	break;
					//}
					container = container.parentElement;
				}
        
				// Default to the video player if no suitable container found
				if (!container || container === document.body) {
					container = videoPlayer;
				}

				// Get the position and size of the container
				var rect = getRect(container);
				// Get the computed style of the container
				var style = window.getComputedStyle(container);

				// Check if position and z-index are defined, else set default values
				var position = style.position !== 'static' ? style.position : 'relative';
				var zIndex = style.zIndex !== 'auto' && style.zIndex !== '0' ? parseInt(style.zIndex) : 1;

				// Return the position, size, z-index, and the container element itself
				return {
					top: rect.top,
					left: rect.left,
					width: rect.width,
					height: rect.height,
					zIndex: zIndex,
					position: position,
					element: container
				};
			} else {
				// If no video player found, return null
				return null;
			}
		}


		function updateContainerStyle(containerInfo) {
			if (containerInfo) {
				// Set the container's position to relative if not already set
				if (containerInfo.position === 'static') {
					containerInfo.element.style.position = 'relative';
				}
        
				// Increment the container's z-index to ensure it is above other elements
				containerInfo.element.style.zIndex = containerInfo.zIndex + 1;

				// Return the updated z-index for further use
				return parseInt(containerInfo.element.style.zIndex);
			} else {
				return null;
			}
		}


		function detectFullscreenButtonClick(videoElement, callback) {
			document.addEventListener("fullscreenchange", function () {
				if (document.fullscreenElement === videoElement ||
					document.mozFullScreenElement === videoElement ||
					document.webkitFullscreenElement === videoElement) {
					// Fullscreen mode is activated for the video element
					callback(true);
				} else {
					// Fullscreen mode is exited for the video element
					callback(false);
				}
			});
		}


		function formatText(text) {
			// Replace URL-encoded spaces with regular spaces
			text = text.replace(/%20/g, ' ');

			// Match timestamps in the text
			const timestamps = text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);

			if (timestamps) {
				// Split the text based on timestamps
				const lines = text.split(/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);

				let formattedText = "";
				for (let line of lines) {
					// Replace the separator format in the timestamps
					line = line.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) *--> *(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/, '$1 --> $2');
            
					// Add the formatted line to the result
					formattedText += line.trim() + "\n";
				}
        
				return formattedText.trim(); // Trim any leading/trailing whitespace from the final result

			} else {
				return text;
			}
		}


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


		function saveChangedSettings() {
			chrome.storage.sync.set({
				'src_selected_font': src_selected_font,
				'src_font_size': src_font_size,
				'src_container_width_factor': src_container_width_factor,
				'src_container_height_factor': src_container_height_factor,
				'src_container_top_factor': src_container_top_factor,
				'src_container_left_factor': src_container_left_factor,
				'centerize_src': centerize_src,

				'dst_selected_font': dst_selected_font,
				'dst_font_size': dst_font_size,
				'dst_container_width_factor': dst_container_width_factor,
				'dst_container_height_factor': dst_container_height_factor,
				'dst_container_top_factor': dst_container_top_factor,
				'dst_container_left_factor': dst_container_left_factor,
				'centerize_dst': centerize_dst,

			}, function() {
				console.log('save src_container_width_factor = ', src_container_width_factor);
				console.log('save src_container_height_factor = ', src_container_height_factor);
				console.log('save src_container_top_factor = ', src_container_top_factor);
				console.log('save src_container_left_factor = ', src_container_left_factor);
				console.log('save centerize_src = ', centerize_src);

				console.log('save dst_container_width_factor = ', dst_container_width_factor);
				console.log('save dst_container_height_factor = ', dst_container_height_factor);
				console.log('save dst_container_top_factor = ', dst_container_top_factor);
				console.log('save dst_container_left_factor = ', dst_container_left_factor);
				console.log('save centerize_dst = ', centerize_dst);

				if (chrome.runtime.lastError) {
					console.error("Error setting data: ", chrome.runtime.lastError);
				} else {
					console.log("Data saved successfully.");
				}
			});
		}



		function updateContainerStyle(containerInfo) {
			if (containerInfo) {
				// Set the container's position to relative if not already set
				if (containerInfo.position === 'static') {
					containerInfo.element.style.position = 'relative';
				}

				// Increment the container's z-index to ensure it is above other elements
				containerInfo.element.style.zIndex = containerInfo.zIndex + 1;

				// Return the updated z-index for further use
				return parseInt(containerInfo.element.style.zIndex);
			} else {
				return null;
			}
		}


		function createOverlayTextarea(containerInfo) {
			if (containerInfo) {
				// Update the container's style
				var updatedZIndex = updateContainerStyle(containerInfo);
        
				// Create the textarea element
				var textarea = document.createElement('textarea');
        
				// Style the textarea to overlay on top of the container
				textarea.style.position = 'absolute';
				textarea.style.top = `${containerInfo.top}px`;
				textarea.style.left = `${containerInfo.left}px`;
				textarea.style.width = `${containerInfo.width}px`;
				textarea.style.height = '100px'; // Adjust height as needed
				textarea.style.zIndex = updatedZIndex + 1; // Ensure it is above the container
				textarea.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent background
				textarea.style.resize = 'none';
				textarea.value = 'TESTING';
        
				// Append the textarea to the body
				document.body.appendChild(textarea);

				// Listen for fullscreen change events
				document.addEventListener('fullscreenchange', () => adjustForFullscreen(containerInfo, textarea));
				document.addEventListener('webkitfullscreenchange', () => adjustForFullscreen(containerInfo, textarea));
				document.addEventListener('mozfullscreenchange', () => adjustForFullscreen(containerInfo, textarea));
				document.addEventListener('MSFullscreenChange', () => adjustForFullscreen(containerInfo, textarea));
			} else {
				console.log("No video player found on this page.");
			}
		}


		function adjustForFullscreen(containerInfo, textarea) {
			if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
				// If in fullscreen mode, adjust the textarea
				textarea.style.position = 'fixed';
				textarea.style.top = '0';
				textarea.style.left = '0';
				textarea.style.width = '100%';
				textarea.style.height = '100px'; // Adjust height as needed
				textarea.style.zIndex = containerInfo.zIndex + 1; // Ensure it is above the fullscreen element
			} else {
				// If exiting fullscreen mode, reset the textarea position
				textarea.style.position = 'absolute';
				textarea.style.top = `${containerInfo.top}px`;
				textarea.style.left = `${containerInfo.left}px`;
				textarea.style.width = `${containerInfo.width}px`;
				textarea.style.height = '100px'; // Adjust height as needed
				textarea.style.zIndex = containerInfo.zIndex + 1; // Ensure it is above the container
			}
		}


		function getFirstWord(sentence) {
			// Trim the sentence to remove any leading or trailing whitespace
			let trimmedSentence = sentence.trim();

			// Split the sentence into an array of words
			let words = trimmedSentence.split(/\s+/);

			// Return the first word
			return words[0];
		}


		function removeTimestamps(transcript) {
			var timestampPattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : /;
			var lines = transcript.split('\n');
			var cleanedLines = lines.map(line => line.replace(timestampPattern, ''));
			return cleanedLines.join('\n');
		}


		var translate = async (t, src, dst) => {
			return new Promise((resolve, reject) => {
				const url = 'https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=' 
							+ src + '&tl=' + dst + '&q=' + encodeURIComponent(t);
				var xmlHttp = new XMLHttpRequest();

				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState === 4) {
						if (xmlHttp.status === 200) {
							try {
								let response = JSON.parse(xmlHttp.responseText);
								let translatedText = response.sentences.map(sentence => sentence.trans).join('');
								resolve(translatedText);
							} catch (e) {
								reject('Error parsing response: ' + e.message);
							}
						} else {
							reject('Request failed with status: ' + xmlHttp.status);
						}
					}
				};

				xmlHttp.open('GET', url, true);
				xmlHttp.send();
			});
		};


		var gtranslate = async (t, src, dst) => {
			return new Promise((resolve, reject) => {
				const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + src + '&tl=' + dst + '&dt=t&q=' + encodeURIComponent(t);
				var xmlHttp = new XMLHttpRequest();

				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState === 4) {
						if (xmlHttp.status === 200) {
							try {
								let response = JSON.parse(xmlHttp.responseText)[0];
								let translatedText = response.map(segment => segment[0]).join('');
								resolve(translatedText);
							} catch (e) {
								reject('Error parsing response: ' + e.message);
							}
						} else {
							reject('Request failed with status: ' + xmlHttp.status);
						}
					}
				};

				xmlHttp.open('GET', url, true);
				xmlHttp.send();
			});
		};

	});

}