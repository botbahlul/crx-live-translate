var recognizing = false;
function onLoad() {
	var recognition, recognizing;
	var src, src_dialect, show_src, show_timestamp_src, save_src;
	var dst, dst_dialect, show_dst, show_timestamp_dst, save_dst;
	var icon_text_listening, icon_text_no_mic, icon_text_blocked, icon_text_blocked, icon_text_denied;

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

	var timestamp_separator = "-->";
	var session_start_time, session_end_time;
	var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript;
	var interim_started = false;
	var transcript_is_final = false;
	var pause_timeout, pause_threshold = 5000, input_pause_threshold; // 5 seconds artificial pause threshold;
	var array_all_final_transcripts = [], array_all_translated_final_transcripts = [];
	var displayed_translation;

	var video_info;

	var settings_has_changed = false;

	var changed_src_dialect, changed_show_src, changed_show_timestamp_src, changed_save_src;
	var changed_dst_dialect, changed_show_dst, changed_show_timestamp_dst, changed_save_dst;
	var changed_pause_threshold;

	var changed_src_selected_font, changed_src_font_size, changed_src_font_color;
	var changed_src_container_width_factor, changed_src_container_height_factor;
	var changed_src_container_top_factor, changed_src_container_left_factor, changed_centerize_src;
	var changed_src_container_color, changed_src_container_opacity;

	var changed_dst_selected_font, changed_dst_font_size, changed_dst_font_color;
	var changed_dst_container_width_factor, changed_dst_container_height_factor;
	var changed_dst_container_top_factor, changed_dst_container_left_factor, changed_centerize_dst;
	var changed_dst_container_color, changed_dst_container_opacity;

	var final_transcript = '';
	var interim_transcript = '';

	var fullscreenElement;
	const button_ytp_fullscreen = document.querySelector('#ytp-fullscreen-button');

	var original_video_top, original_video_left, original_video_width, original_video_height;

	var originalContent;


	window.onkeydown, function(event) {
		if (event.keyCode === 122) {
			event.preventDefault();
			//alert('F11 key was pressed!');
			console.log('F11 key was pressed!');

			originalContent = document.body.innerHTML;
			//toggleFullscreen(document.documentElement);
			//toggleFullscreen(get_video_player_info().element.parentElement);
			if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
				toggleFullscreen(document.documentElement);
			}
			else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
				toggleFullscreen(document.body);
				//toggleFullscreen(document.documentElement);
			}
			else {
				toggleFullscreen(get_video_player_info().element.parentElement);
			}

			window.onresize = (function() {
				console.log('window.onkeydown: window.onresize');
				const video_info = get_video_player_info();
				if (video_info) {
					if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
						video_info.element.style.position = 'absolute';
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';
					}
					else {
						maintain_video_size();
					}
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}
				regenerate_textarea();
			});
		}
	};


	function formatTimestampToISOLocalString(timestamp) {
		// Convert timestamp to string
		const timestampString = timestamp.toISOString();

		// Extract date and time parts
		const datePart = timestampString.slice(0, 10);
		const timePart = timestampString.slice(11, 23);

		// Concatenate date and time parts with a space in between
		return `${datePart} ${timePart}`;
	}


	session_start_time = formatTimestampToISOLocalString(new Date());
	console.log('session_start_time =', session_start_time);
	//originalContent = document.body.innerHTML;

	// LISTENONG MESSAGES FROM chrome.action.onClicked.addListener((tab)
	// WITHOUT THIS LISTENER WE WILL GET THE ERROR : Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		console.log('onload: message =', message);
		sendResponse('OK');
		if (message === 'start') {
			recognizing = true;
			chrome.storage.local.set({'recognizing' : recognizing}, (() => {}));
			return true; //return true MEANS that sendResponse() CAN BE CALLED LATER ASYNCRONOUSLY, AND  return false OR JUST return MEANS sendResponse() SHOULD BE CALLED IMMEDIATELLY
		}
		else if (message === 'stop') {
			recognizing = false;
			chrome.storage.local.set({'recognizing' : recognizing}, (() => {}));
			return true;
		}
	});

	console.log('Reading all saved settings');
	chrome.storage.local.get(['recognizing',
			'src_dialect', 'show_src', 'show_timestamp_src', 'save_src', 
			'src_selected_font', 'src_font_size', 'src_font_color', 'src_container_width_factor', 'src_container_height_factor', 
			'src_container_top_factor', 'src_container_left_factor', 'centerize_src', 'src_container_color', 'src_container_opacity', 
			'dst_dialect', 'show_dst', 'show_timestamp_dst', 'save_dst', 
			'dst_selected_font', 'dst_font_size', 'dst_font_color', 'dst_container_width_factor', 'dst_container_height_factor', 
			'dst_container_top_factor', 'dst_container_left_factor', 'centerize_dst', 'dst_container_color', 'dst_container_opacity', 
			'pause_threshold'], function(result) {


		console.log('onLoad: recognizing =', recognizing);
		console.log('onLoad: result.recognizing =', result.recognizing);

		if (!recognizing) {

			final_transcript = '';
			interim_transcript = '';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('onload: stopping because recognizing =', recognizing);
			console.log('removing src_textarea_container from html body');
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
			console.log('removing dst_textarea_container from html body');
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
			console.log('removing fullscreen button from html body');
			if (document.querySelector("#button_fullscreen")) document.querySelector("#button_fullscreen").parentElement.removeChild(document.querySelector("#button_fullscreen"));
			console.log('removing mouse-move-catcher from html body');
			if (document.querySelector(".mouse-move-catcher")) document.querySelector(".mouse-move-catcher").parentElement.removeChild(document.querySelector(".mouse-move-catcher"));
			return;

		} else {

			src_dialect = result.src_dialect;
			//console.log('result.src_dialect =', result.src_dialect);
			if (!src_dialect) src_dialect = 'id-ID';
			//console.log('src_dialect =', src_dialect);
			src = src_dialect.split('-')[0];
			if (src_dialect === "yue-Hant-HK") src = "zh-TW";
			if (src_dialect === "cmn-Hans-CN") src = "zh-CN";
			if (src_dialect === "cmn-Hans-HK") src = "zh-CN";
			if (src_dialect === "cmn-Hant-TW") src = "zh-TW";
			console.log('src =', src);

			dst_dialect = result.dst_dialect;
			//console.log('result.dst_dialect =', result.dst_dialect);

			if (!dst_dialect) dst_dialect = 'en-US';
			//console.log('dst_dialect', dst_dialect);
			dst = dst_dialect.split('-')[0];
			if (dst_dialect === "yue-Hant-HK") dst = "zh-TW";
			if (dst_dialect === "cmn-Hans-CN") dst = "zh-CN";
			if (dst_dialect === "cmn-Hans-HK") dst = "zh-CN";
			if (dst_dialect === "cmn-Hant-TW") dst = "zh-TW";
			console.log('dst =', dst);

			var icon_text_listening = src.split('-')[0].toUpperCase() + ':' + dst.split('-')[0].toUpperCase();
			chrome.runtime.sendMessage({
				cmd: 'icon_text_listening',
				data: {
					value: icon_text_listening
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});

			show_src = result.show_src;
			//console.log('result.show_src =', result.show_src);
			if (typeof result.show_src === "undefined") show_src = true;
			//console.log('show_src =', show_src);

			show_timestamp_src = result.show_timestamp_src;
			//console.log('result.show_timestamp_src =', result.show_timestamp_dst);
			if (typeof result.show_timestamp_src === 'undefined') show_timestamp_src = true;
			//console.log('show_timestamp_dst =', show_timestamp_dst);

			src_selected_font = result.src_selected_font;
			//console.log('result.src_selected_font =', result.src_selected_font);
			if (!result.src_selected_font) src_selected_font = 'Arial';
			//console.log('src_selected_font =', src_selected_font);

			src_font_size = result.src_font_size;
			//console.log('result.src_font_size =', result.src_font_size);
			if (!result.src_font_size) src_font_size = 18;
			//console.log('src_font_size =', src_font_size);

			src_font_color = result.src_font_color;
			//console.log('result.src_font_color =', result.src_font_color);
			if (!result.src_font_color) src_font_color = '#AAFF00';
			//console.log('src_font_color =', src_font_color);

			src_container_width_factor = result.src_container_width_factor;
			console.log('result.src_container_width_factor =', result.src_container_width_factor);
			if (!result.src_container_width_factor) src_container_width_factor = 0.795;
			console.log('src_container_width_factor =', src_container_width_factor);

			src_container_height_factor = result.src_container_height_factor;
			console.log('result.src_container_height_factor =', result.src_container_height_factor);
			if (!result.src_container_height_factor) src_container_height_factor = 0.18;
			console.log('src_container_height_factor =', src_container_height_factor);

			src_container_top_factor = result.src_container_top_factor;
			console.log('result.src_container_top_factor =', result.src_container_top_factor);
			if (!result.src_container_top_factor) src_container_top_factor = 0.01;
			console.log('src_container_top_factor =', src_container_top_factor);

			centerize_src = result.centerize_src;
			console.log('result.centerize_src =', result.centerize_src);
			if (typeof result.centerize_src === 'undefined') centerize_src = true;
			console.log('centerize_src =', centerize_src);

			src_container_left_factor = result.src_container_left_factor;
			console.log('result.src_container_left_factor =', result.src_container_left_factor);
			if (!result.src_container_left_factor) src_container_left_factor = 0.1;
			console.log('src_container_left_factor =', src_container_left_factor);

			src_container_color = result.src_container_color;
			//console.log('result.src_container_color =', result.src_container_color);
			if (!result.src_container_color) src_container_color = '#000000';
			//console.log('src_container_color =', src_container_color);

			src_container_opacity = result.src_container_opacity;
			//console.log('result.src_container_opacity =', result.src_container_opacity);
			if (!result.src_container_opacity) src_container_opacity = 0.3;
			//console.log('src_container_opacity =', src_container_opacity);

			save_src = result.save_src;
			//console.log('result.save_src =', result.save_src);
			if (typeof result.save_src === "undefined") save_src = true;
			//console.log('save_src =', save_src);


			show_dst = result.show_dst;
			//console.log('result.show_dst =', result.show_dst);
			if (typeof result.show_dst === 'undefined') show_dst = true;
			//console.log('show_dst =', show_dst);

			show_timestamp_dst = result.show_timestamp_dst;
			//console.log('result.show_timestamp_dst', result.show_timestamp_dst);
			if (typeof result.show_timestamp_dst === 'undefined') show_timestamp_dst = true;
			//console.log('show_timestamp_dst', show_timestamp_dst);

			dst_selected_font = result.dst_selected_font;
			//console.log('result.dst_selected_font =', result.dst_selected_font);
			if (!result.dst_selected_font) dst_selected_font = 'Arial';
			//console.log('dst_selected_font =', dst_selected_font);

			dst_font_size = result.dst_font_size;
			//console.log('result.dst_font_size =', result.dst_font_size);
			if (!result.dst_font_size) dst_font_size = 18;
			//console.log('dst_font_size =', dst_font_size);

			dst_font_color = result.dst_font_color;
			//console.log('result.dst_font_color =', result.dst_font_color);
			if (!result.dst_font_color) dst_font_color = '#FFFF00';
			//console.log('dst_font_color =', dst_font_color);

			dst_container_width_factor = result.dst_container_width_factor;
			//console.log('result.dst_container_width_factor =', result.dst_container_width_factor);
			if (!result.dst_container_width_factor) dst_container_width_factor = 0.795;
			//console.log('dst_container_width_factor =', dst_container_width_factor);

			dst_container_height_factor = result.dst_container_height_factor;
			//console.log('result.dst_container_height_factor =', result.dst_container_height_factor);
			if (!result.dst_container_height_factor) dst_container_height_factor = 0.225;
			//console.log('dst_container_height_factor =', dst_container_height_factor);

			dst_container_top_factor = result.dst_container_top_factor;
			//console.log('result.dst_container_top_factor =', result.dst_container_top_factor);
			if (!result.dst_container_top_factor) dst_container_top_factor = 0.65;
			//console.log('dst_container_top_factor =', dst_container_top_factor);

			centerize_dst = result.centerize_dst;
			//console.log('result.centerize_dst =', result.centerize_dst);
			if (typeof result.centerize_dst === 'undefined') centerize_dst = true;
			//console.log('centerize_dst =', centerize_dst);

			dst_container_left_factor = result.dst_container_left_factor;
			//console.log('result.dst_container_left_factor =', result.dst_container_left_factor);
			if (!result.dst_container_left_factor) dst_container_left_factor = 0.1;
			//console.log('dst_container_left_factor =', dst_container_left_factor);

			dst_container_color = result.dst_container_color;
			//console.log('result.dst_container_color =', result.dst_container_color);
			if (!result.dst_container_color) dst_container_color = '#000000';
			//console.log('dst_container_color =', dst_container_color);

			dst_container_opacity = result.dst_container_opacity;
			//console.log('result.dst_container_opacity =', result.dst_container_opacity);
			if (!result.dst_container_opacity) dst_container_opacity = 0.3;
			//console.log('dst_container_opacity =', dst_container_opacity);

			save_dst = result.save_dst;
			//console.log('result.save_dst =', result.save_dst);
			if (typeof result.save_dst === "undefined") save_dst = true;
			//console.log('save_dst =', save_dst);

			pause_threshold = result.pause_threshold;
			//console.log('result.pause_threshold =', result.pause_threshold);
			if (!result.pause_threshold) pause_threshold = 5000;
			//console.log('pause_threshold =', pause_threshold);

			saveAllChangedSettings();

			console.log('removing src_textarea_container from html body if exist to create a fresh new one');
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
			console.log('removing dst_textarea_container from html body if exist to create a fresh new one');
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
			console.log('removing fullscreen button from html body if exist to create a fresh new one');
			if (document.querySelector("#button_fullscreen")) document.querySelector("#button_fullscreen").parentElement.removeChild(document.querySelector("#button_fullscreen"));
			console.log('removing mouse-move-catcher from html body if exist to create a fresh new one');
			if (document.querySelector(".mouse-move-catcher")) document.querySelector(".mouse-move-catcher").parentElement.removeChild(document.querySelector(".mouse-move-catcher"));

			create_modal_textarea();

			create_button_fullscreen();

			//create_mouse_move_catcher();

			window.onresize = (event) => {
				document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
				document.body.scrollTop = get_video_player_info().top; // For older browsers
				console.log('Scrolling');
				regenerate_textarea();
			};


			document.onfullscreenchange = (event) => {
				console.log('document.onfullscreenchange = (event)');
				fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

				var video_info = get_video_player_info();
				console.log('video_info =', video_info);
				if (video_info) {
					var video_outer_info = get_video_outer_info();
					console.log('video_outer_info =', video_outer_info);
					console.log('(video_outer_info && !video_info.src.includes("youtube")) =', (video_outer_info && !video_info.src.includes('youtube')));
					console.log('(video_outer_info && video_info.src.includes("youtube")) =', (video_outer_info && video_info.src.includes('youtube')));
					if (fullscreenElement) {
						console.log('fullscreenElement =', fullscreenElement);
						console.log('video_info.element =', video_info.element);
						//video_info.element.style.width = '100vw';
						video_info.element.style.width = screen.width;
						//video_info.element.style.height = '100vh';
						video_info.element.style.height = screen.height;
						video_info.element.style.left = '0px';
						video_info.element.style.top = '0px';
						if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
						if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
						if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
						regenerate_textarea();
					}
					else {
						video_info.element.style.width = original_video_width + 'px';
						video_info.element.style.height = original_video_height + 'px';
						video_info.element.style.top = video_info.element.parentElement.style.top;
						video_info.element.style.left = video_info.element.parentElement.style.left;

						if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
							video_info.element.style.width = '100%';
							video_info.element.style.height = '100%';

							window.onresize = (function(){
								console.log('document.onfullscreenchange: window.onresize');
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							});
						}
						else {
							maintain_video_size();
						}
					}

					if (video_info.src !== '') {
						document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
						document.body.scrollTop = get_video_player_info().top; // For older browsers
						console.log('Scrolling');
						regenerate_textarea();
					}
				}
			};


			window.onresize = (event) => {
				console.log('window.onresize');
				maintain_video_size();
				video_info = get_video_player_info();
				if (video_info && video_info.src !== '') {
					document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
					document.body.scrollTop = get_video_player_info().top; // For older browsers
					console.log('Scrolling');
					regenerate_textarea();
				}
			};


			//document.addEventListener('keydown', function(event) {
			window.onkeydown, function(event) {
				if (event.keyCode === 122) {
					event.preventDefault();
					//alert('F11 key was pressed!');
					console.log('F11 key was pressed!');

					originalContent = document.body.innerHTML;
					//toggleFullscreen(document.documentElement);
					//toggleFullscreen(get_video_player_info().element.parentElement);
					if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
						toggleFullscreen(document.documentElement);
					}
					else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
						toggleFullscreen(document.body);
						//toggleFullscreen(document.documentElement);
					}
					else {
						toggleFullscreen(get_video_player_info().element.parentElement);
					}

					window.onresize = (function() {
						console.log('window.onkeydown: window.onresize');
						const video_info = get_video_player_info();
						if (video_info) {
							if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							}
							else {
								maintain_video_size();
							}
							if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
							if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
							if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
						}
						regenerate_textarea();
					});
				}
			};


			// INTERCEPT ANY UNWANTED CHARACTERS FROM GOOGLE TRANSLATE
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
			}

			console.log('initializing recognition: recognizing =', recognizing);

			document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
			document.body.scrollTop = get_video_player_info().top; // For older browsers

			document.querySelector("#src_textarea_container").style.display = 'none';
			document.querySelector("#dst_textarea_container").style.display = 'none';
			var speech_start_time = Date.now();
			var translate_time = Date.now();

			if (!(('webkitSpeechRecognition'||'SpeechRecognition') in window)) {

				alert('Web Speech API is not supported by this browser. upgrade_info to Chrome version 25 or later');

			} else {

				console.log('starting recognition: recognizing =', recognizing);
				var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.lang = src_dialect;
				recognition.start();
				speech_start_time = Date.now();
				translate_time =  Date.now();



//---------------------------------------------------------------ONSTART--------------------------------------------------------------//


				recognition.onstart = function() {

					startTimestamp = formatTimestampToISOLocalString(new Date());
					resetPauseTimeout();

					if (!recognizing) {
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
						console.log('recognition.onstart: stopping because recognizing =', recognizing);
						return;
					} else {
						console.log('recognition.onstart: recognizing =', recognizing);
						recognition.lang = src_dialect;
						console.log('settings_has_changed =', settings_has_changed);
						if (settings_has_changed) {
							regenerate_textarea();
							settings_has_changed = false;
						}
					}

				};


//---------------------------------------------------------------ONERROR--------------------------------------------------------------//


				recognition.onerror = function(event) {
					resetPauseTimeout(); // Reset timeout on error as well
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

					console.log('event.error =', event.error);
					if (event.error === 'no-speech') {
						console.log('recognition.no-speech: recognizing =', recognizing);
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					}
					if (event.error === 'audio-capture') {
						alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
						var icon_text_no_mic = 'NO-MIC';
						chrome.runtime.sendMessage({
							cmd: 'icon_text_no_mic',
							data: {
								value: icon_text_no_mic
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
						console.log('recognition.audio-capture: recognizing =', recognizing);
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					}
					if (event.error === 'not-allowed') {
						if (Date.now() - speech_start_time < 100) {
							var icon_text_blocked = 'BLOCKED';
							chrome.runtime.sendMessage({
								cmd: 'icon_text_blocked',
								data: {
									value: icon_text_blocked
								}, function(response) {
									console.log('response.status =', response.status);
								}
							});
							alert('Permission to use microphone is blocked, go to chrome://settings/contentExceptions#media-stream to change it');
						} else {
							var icon_text_denied = 'DENIED';
							chrome.runtime.sendMessage({
								cmd: 'icon_text_denied',
								data: {
									value: icon_text_denied
								}, function(response) {
									console.log('response.status =', response.status);
								}
							});
							alert('Permission to use microphone was denied');
						}
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
						console.log('recognition.not-allowed: recognizing =', recognizing);
					}
				};


//---------------------------------------------------------------ONEND---------------------------------------------------------------//


				recognition.onend = function() {

					session_end_time = formatTimestampToISOLocalString(new Date());
					//console.log('session_end_time =', session_end_time);

					if (!recognizing) {
						final_transcript = '';
						interim_transcript = '';

						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

						console.log('recognition.onend: stopping because recognizing =', recognizing);

						if (timestamped_final_and_interim_transcript) {

							timestamped_final_and_interim_transcript = formatTranscript(timestamped_final_and_interim_transcript);

							// Split text into an array of lines
							var lines = timestamped_final_and_interim_transcript.trim().split('\n');

							var new_unique_lines = [];
							var last_line;
							var translated_last_line;
							var translated_unique_text;

							lines.forEach(line => {
								const timestamped_line = line.match(/(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: .*[\.\。]$/);
								if (timestamped_line) {
									new_unique_lines.push(line);
								// Give timestamp to last interim transcript
								} else {
									if (line !== '' && line !== '.') {
										line = line + '.';
										last_line = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${line}`;
										new_unique_lines.push(last_line);
									}
								}
								unique_text = new_unique_lines.join('\n');
								unique_text = unique_text + '\n';
							});

							//console.log('unique_text =', unique_text);
							if (unique_text) {
								// Move every timestamps to a new line for ISO Date format
								unique_text = unique_text.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
								unique_text = removeEmptySentences(unique_text);
								unique_text = removePeriodOnlySentences(unique_text);
								unique_text = formatTranscript(unique_text);
								unique_text = unique_text + '\n';
								//console.log('unique_text =', unique_text);

								//saveTemporaryTranscript(unique_text) for debug;
								//saveTranscriptAsFile(unique_text, 'tmp_transcript.txt')

								// SAVING TRANSCRIPTIONS
								if (save_src) {
									if (show_timestamp_src) {
										saveTranscript(unique_text);
									} else {
										saveTranscript(removeTimestamps(unique_text));
									}
								}
								

								// SAVING TRANSLATION
								if (save_dst) {
									var tt = translateText(unique_text, src, dst).then(result => {
										timestamped_translated_final_and_interim_transcript = result + '\n';
										//console.log('timestamped_translated_final_and_interim_transcript =', timestamped_translated_final_and_interim_transcript);

										if (timestamped_translated_final_and_interim_transcript) {
											// Move every timestamps to a new line for ISO Date format
											timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
											// Move every timestamps to a new line for Local Date format
											timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

											timestamped_translated_final_and_interim_transcript = removeEmptySentences(timestamped_translated_final_and_interim_transcript);
											timestamped_translated_final_and_interim_transcript = removePeriodOnlySentences(timestamped_translated_final_and_interim_transcript);

											if (show_timestamp_dst) {
												saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
											} else {
												saveTranslatedTranscript(removeTimestamps(timestamped_translated_final_and_interim_transcript));
											}
											array_all_translated_final_transcripts = [];
											timestamped_translated_final_and_interim_transcript = '';
										}

									}).catch(error => {
										console.error('Error:', error);
									});
								}
							}
						}

						lines = '';
						unique_lines = [];
						new_unique_lines = [];
						unique_text = '';
						timestamped_final_and_interim_transcript = '';

						console.log('Saving all changed settings');
						saveAllChangedSettings();
						return;

					} else {
						console.log('recognition.onend: keep recognizing because recognizing =', recognizing);
						recognition.start();
						speech_start_time = Date.now();
						translate_time =  Date.now();
					}
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
				};


//---------------------------------------------------------------ONRESULT--------------------------------------------------------------//


				recognition.onresult = function(event) {
					console.log('recognition.onresult: recognizing =', recognizing);
					resetPauseTimeout();

					if (typeof(event.results) === 'undefined') {
						recognition.onend = null;

						try{
							if (recognition) recognition.stop();
							}
						catch(t){
							console.log("recognition.stop() failed",t);
						};

						return;
					}

					if (!recognizing) {

						final_transcript = '';
						interim_transcript = '';
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
						console.log('recognition.onresult: stopping because recognizing =', recognizing);
						return;

					} else {

						recognition.lang = src_dialect;
						interim_transcript = '';

						for (var i = event.resultIndex; i < event.results.length; ++i) {
							if (event.results[i].isFinal) {
								transcript_is_final = true;
								interim_transcript = '';
								interim_started = false;
								endTimestamp = formatTimestampToISOLocalString(new Date());
								final_transcript += `${startTimestamp} ${timestamp_separator} ${endTimestamp} : ${capitalize(event.results[i][0].transcript)}`;
								final_transcript = final_transcript + '.\n';
								array_all_final_transcripts.push(`${final_transcript}`);
								array_all_final_transcripts = arrayRemoveDuplicates(array_all_final_transcripts);
							} else {
								transcript_is_final = false;
								if (!interim_started) {
									// Capture the timestamp only when the interim result starts
									startTimestamp = formatTimestampToISOLocalString(new Date());
									interim_started = true; // Set the flag to true
								}
								interim_transcript += event.results[i][0].transcript;
								interim_transcript = remove_linebreak(interim_transcript);
								interim_transcript = capitalize(interim_transcript);
							}
						}

						timestamped_final_and_interim_transcript = final_transcript + interim_transcript;

						if (show_src) {
							if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'block';
							if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'inline-block';

							if (show_timestamp_src) {
								if (timestamped_final_and_interim_transcript && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = timestamped_final_and_interim_transcript;
							} else {
								if (timestamped_final_and_interim_transcript && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = removeTimestamps(timestamped_final_and_interim_transcript);
							}
							if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
						} else {
							if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						}


						if (show_dst) {
							// IF WE TRANSLATE ALL OF unique_text WE WILL GET 400 RESPONSE CODE FROM GOOGLE TRANSLATE SERVER
							// SO WE CAN ONLY TRANSLATE last_final_transcript + interim_transcript;
							var transcript_to_translate = '';
							if (array_all_final_transcripts.length > 0) {
								array_all_final_transcripts = arrayRemoveDuplicates(array_all_final_transcripts);
								//console.log('array_all_final_transcripts =', array_all_final_transcripts);
								last_final_transcript = array_all_final_transcripts[array_all_final_transcripts.length - 1] + '\n';
								//console.log('last_final_transcript =', last_final_transcript);
								transcript_to_translate = last_final_transcript + interim_transcript;
								//console.log('transcript_to_translate =', transcript_to_translate);
							} else {
								transcript_to_translate = interim_transcript;
								//console.log('transcript_to_translate =', transcript_to_translate);
							}

							if (transcript_to_translate) transcript_to_translate = transcript_to_translate.replace('undefined', '');

							//var  t = unique_text; // CAN'T BE USED BECAUSE GOOGLE TRANSLATE SERVER WILL RESPOND WITH 400 AFTER SOME REQUESTS
							var t = transcript_to_translate;
							if ((Date.now() - translate_time > 1000) && recognizing) {
								if (t) {
									var tt = gtranslate(t, src, dst).then(result => {
										if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';

										result = formatTranscript(result);

										if (result.match(/(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: .*[\.\。]\n/gm) 
												|| result.match(/(\d{2})-(\d{2})-(\d{4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2})-(\d{2})-(\d{4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: .*[\.\。]\n/gm)) {
											var buffer = getTimestampedLines(result);
											//console.log('getTimestampedLines(result) =', getTimestampedLines(result));
											buffer = arrayRemoveDuplicates(buffer);
											//console.log('arrayRemoveDuplicates(buffer) =', arrayRemoveDuplicates(buffer));
											//console.log('buffer[0] =', buffer[0]);
											array_all_translated_final_transcripts.push(buffer[0]);
											//console.log('array_all_translated_final_transcripts =', array_all_translated_final_transcripts);
											array_all_translated_final_transcripts = arrayRemoveDuplicates(array_all_translated_final_transcripts);
											//console.log('array_all_translated_final_transcripts =', array_all_translated_final_transcripts);
										}

										if (array_all_translated_final_transcripts.length > 0) {
											array_all_translated_final_transcripts = arrayRemoveDuplicates(array_all_translated_final_transcripts);
											//console.log('array_all_translated_final_transcripts =', array_all_translated_final_transcripts);
											displayed_translation = array_all_translated_final_transcripts.join('\n') + result;
											//console.log('displayed_translation =', displayed_translation);
											displayed_translation = formatTranscript(displayed_translation);
											//console.log('formatTranscript(displayed_translation) =', formatTranscript(displayed_translation));
											displayed_translation = removeDuplicateTimestamps(displayed_translation);
											//console.log('removeDuplicateTimestamps(displayed_translation) =', removeDuplicateTimestamps(displayed_translation));
											var lines = displayed_translation.trim().split('\n');
											var unique_lines = [...new Set(lines)];
											var unique_text = unique_lines.join('\n');
											// Remove duplicate of translated last_final_transcript to get interim_translation only
											var interim_translation = result.replace(/^\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3}\s*[:：] .*[\.\。]\n/gm, '');

											if (!transcript_is_final) {
												displayed_translation = unique_text + '\n' + interim_translation;
												//console.log('!transcript_is_final: displayed_translation =', displayed_translation);
											} else {
												displayed_translation = unique_text;
												//console.log('transcript_is_final: displayed_translation =', displayed_translation);
											}
										} else {
											displayed_translation = result;
											//console.log('array_all_translated_final_transcripts.length <= 0: displayed_translation =', displayed_translation);
										}

										if (show_timestamp_dst) {
											//console.log('displayed_translation =', displayed_translation);
											if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = displayed_translation;
										} else {
											if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = removeTimestamps(displayed_translation);
										}
										if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;

									}).catch(error => {
										console.log('error =', error);
									});
									translate_time = Date.now();
								}
							};
						} else {
							if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
						}
					}
				};


				// WE NEED TO DO THIS chrome.runtime.onMessage.addListener() 'start' 'stop' AGAIN HERE TO SPEED UP THAT recognition.stop() PROCESS
				chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
					console.log('onresult: message =', message);
					if (message === 'stop') {
						sendResponse('OK STOP from onresult');
						recognizing = false;
						try{
							if (recognition) recognition.stop();
						}
						catch(t){
							console.log("recognition.stop() failed",t);
						}

						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
						console.log('onload: stopping because recognizing =', recognizing);
						console.log('removing src_textarea_container from html body');
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
						console.log('removing dst_textarea_container from html body');
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
						console.log('removing fullscreen button from html body');
						if (document.querySelector("#button_fullscreen")) document.querySelector("#button_fullscreen").parentElement.removeChild(document.querySelector("#button_fullscreen"));
						console.log('removing mouse-move-catcher from html body');
						if (document.querySelector(".mouse-move-catcher")) document.querySelector(".mouse-move-catcher").parentElement.removeChild(document.querySelector(".mouse-move-catcher"));

						return;
					}

					if (typeof message === 'object' && message !== null && message.hasOwnProperty('variable_name') && message.hasOwnProperty('variable_value')) {
						const {variable_name, variable_value} = message;

						if (variable_name === 'changed_src_dialect') {
							sendResponse({status: 'changed_src_dialect processed'});
							console.log('changed_src_dialect =', variable_value);
							src_dialect = variable_value;
							saveData('src_dialect', src_dialect);
							src = src_dialect.split('-')[0];
							saveData('src', src);
							regenerate_textarea();
							recognition.lang = src_dialect;

							try{
								if (recognition) recognition.stop();
								}
							catch(t){
								console.log("recognition.stop() failed",t);
							}

							if (recognizing) {
								icon_text_listening = src.toUpperCase() + ':' + dst.toUpperCase();
								chrome.runtime.sendMessage({
									cmd: 'icon_text_listening',
									data: {
										value: icon_text_listening
									}, function(response) {
										console.log('response.status =', response.status);
									}
								});
							}
						}

						if (variable_name === 'changed_show_src') {
							sendResponse({status: 'changed_show_src processed'});
							console.log('changed_show_src =', variable_value);
							show_src = variable_value;
							saveData('show_src', show_src);
							regenerate_textarea();
						}

						if (variable_name === 'changed_show_timestamp_src') {
							sendResponse({status: 'changed_show_timestamp_src processed'});
							console.log('changed_show_timestamp_src =', variable_value);
							show_timestamp_src = variable_value;
							saveData('show_timestamp_src', show_timestamp_src);
							regenerate_textarea();
						}


						if (variable_name === 'changed_src_selected_font') {
							sendResponse({status: 'changed_src_selected_font processed'});
							settings_has_changed = true;
							console.log('changed_src_selected_font =', variable_value);
							src_selected_font = variable_value;
							saveData('src_selected_font', src_selected_font);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_font_size') {
							sendResponse({status: 'changed_src_font_size processed'});
							settings_has_changed = true;
							console.log('changed_src_font_size =', variable_value);
							src_font_size = variable_value;
							saveData('src_font_size', src_font_size);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_font_color') {
							sendResponse({status: 'changed_src_font_color processed'});
							settings_has_changed = true;
							console.log('changed_src_font_color =', variable_value);
							src_font_color = variable_value;
							saveData('src_font_color', src_font_color);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_width_factor') {
							sendResponse({status: 'changed_src_container_width_factor processed'});
							settings_has_changed = true;
							console.log('changed_src_container_width_factor =', variable_value);
							src_container_width_factor = variable_value;
							saveData('src_container_width_factor', src_container_width_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_height_factor') {
							sendResponse({status: 'changed_src_container_height_factor processed'});
							settings_has_changed = true;
							console.log('changed_src_container_height_factor =', variable_value);
							src_container_height_factor = variable_value;
							saveData('src_container_height_factor', src_container_height_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_top_factor') {
							sendResponse({status: 'changed_src_container_top_factor processed'});
							settings_has_changed = true;
							console.log('changed_src_container_top_factor =', variable_value);
							src_container_top_factor = variable_value;
							saveData('src_container_top_factor', src_container_top_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_left_factor') {
							sendResponse({status: 'changed_src_container_left_factor processed'});
							settings_has_changed = true;
							console.log('changed_src_container_left_factor =', variable_value);
							src_container_left_factor = variable_value;
							saveData('src_container_left_factor', src_container_left_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_centerize_src') {
							sendResponse({status: 'changed_centerize_src processed'});
							settings_has_changed = true;
							console.log('changed_centerize_src =', variable_value);
							centerize_src = variable_value;
							saveData('centerize_src', centerize_src);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_color') {
							sendResponse({status: 'changed_src_container_color processed'});
							settings_has_changed = true;
							console.log('changed_src_container_color =', variable_value);
							src_container_color = variable_value;
							saveData('src_container_color', src_container_color);
							regenerate_textarea();
						}

						if (variable_name === 'changed_src_container_opacity') {
							sendResponse({status: 'changed_src_container_opacity processed'});
							settings_has_changed = true;
							console.log('changed_src_container_opacity =', variable_value);
							src_container_opacity = variable_value;
							saveData('src_container_opacity', src_container_opacity);
							regenerate_textarea();
						}

						if (variable_name === 'changed_save_src') {
							sendResponse({status: 'changed_save_src processed'});
							console.log('changed_save_src =', variable_value);
							save_src = variable_value;
							saveData('save_src', save_src);
							regenerate_textarea();
						}


						if (variable_name === 'changed_dst_dialect') {
							sendResponse({status: 'changed_dst_dialect processed'});
							console.log('changed_dst_dialect =', variable_value);
							dst_dialect = variable_value;
							saveData('dst_dialect', dst_dialect);
							dst = dst_dialect.split('-')[0];
							saveData('dst', dst);
							regenerate_textarea();
							recognition.lang = dst_dialect;

							try{
								if (recognition) recognition.stop();
								}
							catch(t){
								console.log("recognition.stop() failed",t);
							}


							if (recognizing) {
								icon_text_listening = src.toUpperCase() + ':' + dst.toUpperCase();
								chrome.runtime.sendMessage({
									cmd: 'icon_text_listening',
									data: {
										value: icon_text_listening
									}, function(response) {
										console.log('response.status =', response.status);
									}
								});
							}
						}

						if (variable_name === 'changed_show_dst') {
							sendResponse({status: 'changed_show_dst processed'});
							console.log('changed_show_dst =', variable_value);
							show_dst = variable_value;
							saveData('show_dst', show_dst);
							regenerate_textarea();
						}

						if (variable_name === 'changed_show_timestamp_dst') {
							sendResponse({status: 'changed_show_timestamp_dst processed'});
							console.log('changed_show_timestamp_dst =', variable_value);
							show_timestamp_dst = variable_value;
							saveData('show_timestamp_dst', show_timestamp_dst);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_selected_font') {
							sendResponse({status: 'changed_dst_selected_font processed'});
							settings_has_changed = true;
							console.log('changed_dst_selected_font =', variable_value);
							dst_selected_font = variable_value;
							saveData('dst_selected_font', dst_selected_font);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_font_size') {
							sendResponse({status: 'changed_dst_font_size processed'});
							settings_has_changed = true;
							console.log('changed_dst_font_size =', variable_value);
							dst_font_size = variable_value;
							saveData('dst_font_size', dst_font_size);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_font_color') {
							sendResponse({status: 'changed_dst_font_color processed'});
							settings_has_changed = true;
							console.log('changed_dst_font_color =', variable_value);
							dst_font_color = variable_value;
							saveData('dst_font_color', dst_font_color);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_width_factor') {
							sendResponse({status: 'changed_dst_container_width_factor processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_width_factor =', variable_value);
							dst_container_width_factor = variable_value;
							saveData('dst_container_width_factor', dst_container_width_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_height_factor') {
							sendResponse({status: 'changed_dst_container_height_factor processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_height_factor =', variable_value);
							dst_container_height_factor = variable_value;
							saveData('dst_container_height_factor', dst_container_height_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_top_factor') {
							sendResponse({status: 'changed_dst_container_top_factor processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_top_factor =', variable_value);
							dst_container_top_factor = variable_value;
							saveData('dst_container_top_factor', dst_container_top_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_left_factor') {
							sendResponse({status: 'changed_dst_container_left_factor processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_left_factor =', variable_value);
							dst_container_left_factor = variable_value;
							saveData('dst_container_left_factor', dst_container_left_factor);
							regenerate_textarea();
						}

						if (variable_name === 'changed_centerize_dst') {
							sendResponse({status: 'changed_centerize_dst processed'});
							settings_has_changed = true;
							console.log('changed_centerize_dst =', variable_value);
							centerize_dst = variable_value;
							saveData('centerize_dst', centerize_dst);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_color') {
							sendResponse({status: 'changed_dst_container_color processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_color =', variable_value);
							dst_container_color = variable_value;
							saveData('dst_container_color', dst_container_color);
							regenerate_textarea();
						}

						if (variable_name === 'changed_dst_container_opacity') {
							sendResponse({status: 'changed_dst_container_opacity processed'});
							settings_has_changed = true;
							console.log('changed_dst_container_opacity =', variable_value);
							dst_container_opacity = variable_value;
							saveData('dst_container_opacity', dst_container_opacity);
							regenerate_textarea();
						}

						if (variable_name === 'changed_save_dst') {
							sendResponse({status: 'changed_save_dst processed'});
							console.log('changed_save_dst =', variable_value);
							save_dst = variable_value;
							saveData('save_dst', save_dst);
							regenerate_textarea();
						}

						if (variable_name === 'changed_pause_threshold') {
							sendResponse({status: 'changed_pause_threshold processed'});
							console.log('changed_pause_threshold =', variable_value);
							pause_threshold = variable_value;
							saveData('pause_threshold', pause_threshold);
							regenerate_textarea();
						}
					}
				});
			}
		}



		// FUNCTIONS
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
			// Check if the sentence is not empty
			if (s && s.length > 0) {
				// Capitalize the first character and concatenate it with the rest of the sentence
				return (s.trimLeft()).charAt(0).toUpperCase() + (s.trimLeft()).slice(1);
			} else {
				// If the sentence is empty, return it as is
				return s;
			}

		};


		function containsTimestamp(sentence) {
			const timestamp = sentence.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /);
			// Check if the sentence includes the timestamp pattern
			return sentence.includes(timestamp);
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
			var timestampPattern = /(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /;
			var lines = transcript.split('\n');
			var cleanedLines = lines.map(line => line.replace(timestampPattern, ''));
			return cleanedLines.join('\n');
		}


		function removeTimestampsForChinese(transcript) {
			// Regular expression pattern to match the timestamps, accommodating Chinese full-width colon
			//const timestampPattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\s*：/g;
			const timestampPattern = /\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3}\s*：/g;
    
			// Replace the matched timestamps with an empty string
			return transcript.replace(timestampPattern, '');
		}


		function formatTranscript(transcript) {
			// Give space between colon and sentence
			transcript = transcript.replace(/：/g, ": ");
		//transcript = transcript.replace(/(\d{2}[:：]\d{2}[:：]\d{2}\.\d{3}\s*[:：])/g, '$1 ');
			// Give space between timestamp and colon
			transcript = transcript.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})(:)/g, '$1 :');
			// Replace commas with periods in timestamps
			transcript = transcript.replace(/(\d+),(\d+)/g, '$1.$2');
			// Remove spaces within timestamps for ISO Date format
			transcript = transcript.replace(/(\d{4}-\d{2}-\d{2} \d{2}[:：]\d{2})[:：] (\d{2}\.\d+)/g, '$1:$2');
			// Remove spaces within timestamps for Local Date format
			transcript = transcript.replace(/(\d{2}-\d{2}-\d{4} \d{2}[:：]\d{2})[:：] (\d{2}\.\d+)/g, '$1:$2');
			// Remove any spaces between the date components for ISO Date format
			transcript = transcript.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
			// Remove any spaces between the date components for Local Date format
			transcript = transcript.replace(/(\d{2})-\s?(\d{2})-\s?(\d{4})/g, '$1-$2-$3');
			// Ensure the timestamp format follows "yyyy-mm-dd hh:mm.ddd" format and remove spaces around the hyphens
			transcript = transcript.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
			// Ensure the timestamp format follows "dd-mm-yyyy hh:mm.ddd" format and remove spaces around the hyphens
			transcript = transcript.replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})/g, '$1-$2-$3');
			// Remove any spaces around the colons in the time component (both half-width and full-width)
			transcript = transcript.replace(/(\d{2})\s*[:：]\s*(\d{2})\s*[:：]\s*(\d{2}\.\d{3})/g, '$1:$2:$3');
			// Replace the time_separator with correct strings "-->" for ISO Date format
			transcript = transcript.replace(/(\d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/g, `$1 --> $2`);
			// Replace the time_separator with correct strings "-->" for Local Date format
			transcript = transcript.replace(/(\d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})[^0-9]+(\d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/g, `$1 --> $2`);
			// Move every timestamps to a new line for Local Date format
			transcript = transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/gm, '\n$1');
			// Move every timestamps to a new line for ISO Date format
			transcript = transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/gm, '\n$1');
    
			transcript = transcript.replace('.,', '.');
			transcript = transcript.replace(',.', ',');
			transcript = transcript.replace('. .', '.');
    
			transcript = convertDatesToISOFormat(transcript);
    
			// Remove last blank line
			transcript = transcript.replace(/\n\s*$/, '');
			transcript = removeEmptyLines(transcript);
			// Replace URL-encoded spaces with regular spaces
			transcript = transcript.replace(/%20/g, ' ');
			transcript = transcript.trim();
			// Give space between time part and colon (both half-width and full-width)
			transcript = transcript.replace(/(\d{2}[:：]\d{2}[:：]\d{2}\.\d{3}[:：]) /g, '$1 ');
			// Give space between time part and colon
			transcript = transcript.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})(:)/g, '$1 :');

			// Move every timestamps to a new line for Local Date format
			transcript = transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/gm, '\n$1');
			// Move every timestamps to a new line for ISO Date format
			transcript = transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}[:：]\d{2}[:：]\d{2}\.\d{3})/gm, '\n$1');
    
			// Match timestamps in the transcript
			const timestamps = transcript.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}[:：]\d{2}[:：]\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}[:：]\d{2}[:：]\d{2}\.\d{3}\s*[:：] /);
    
			if (timestamps) {
				// Split the transcript based on timestamps
				const lines = transcript.split(timestamps);
        
				let formattedTranscript = "";
				for (let line of lines) {
					line = line.trim();
					// Replace the separator format in the timestamps
					line = line.replace(timestamps, '$1 --> $2');
					// Replace colons
					line = line.replace(/：/g, ": ");
					const colon = line.match(/\s*[:：] /);
					const parts = line.split(colon);
					if (parts.length === 2) {
						const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);
						line = parts[0] + colon + capitalizedSentence;
					}
            
					// Add the formatted line to the result
					if (line !== '') formattedTranscript += line.trim() + "\n";
				}
        
				const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [:：][^]+?)(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} -->|\s*$)/g;
				const matches = formattedTranscript.match(regex);
				if (regex && formattedTranscript) formattedTranscript = matches.join('');
				formattedTranscript = formattedTranscript.replace(/：/g, ": ");
				return formattedTranscript.trim(); // Trim any leading/trailing whitespace from the final result

			} else {
				transcript = transcript.replace(/：/g, ": ");
				return transcript.trim();
			}
		}


		function getTimestampedLines(transcript) {
			// Split the transcript into individual lines
			const lines = transcript.split('\n');
			// Regular expression to match lines with timestamps and periods
			const regex = /(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: .*[\.\。]$/;
			// Filter lines that match the regular expression
			const filteredLines = lines.filter(line => regex.test(line));
			// Return the filtered lines
			return filteredLines;
		}


		function removeDuplicateTimestamps(transcript) {
			// Split the transcript into lines
			const lines = transcript.split('\n');
			// Create a Set to keep track of unique timestamps
			const seenTimestamps = new Set();
			// Array to store the unique lines
			const uniqueLines = [];

			lines.forEach(line => {
				// Extract the timestamp part of the line (assumes format is consistent)
				const timestamp = line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/);
				if (timestamp) {
					const timestampStr = timestamp[0];
					if (!seenTimestamps.has(timestampStr)) {
						seenTimestamps.add(timestampStr);
						uniqueLines.push(line);
					}
				}
			});

			// Join the unique lines back into a single string
			return uniqueLines.join('\n');
		}


		function removeDuplicateLines(transcript) {
			const lines = transcript.split('\n'); // Split the input into individual lines
			const seen = {}; // Object to track unique lines
			const result = [];

			lines.forEach(line => {
				const parts = line.split(' : '); // Split line into timestamp and sentence
				if (parts.length === 2) {
					const timestamp = parts[0].trim(); // Extract and trim the timestamp
					const sentence = parts[1].trim(); // Extract and trim the sentence
					const key = `${timestamp} : ${sentence}`; // Create a unique key

					if (!seen[key]) { // Check if the key is already seen
						seen[key] = true; // Mark the key as seen
						result.push(line); // Add the unique line to the result
					}
				}
			});

			return result.join('\n'); // Join the unique lines back into a single string
		}


		function removeEmptyLines(transcript) {
			// Split the transcript into individual lines
			const lines = transcript.split('\n');
			// Filter out empty lines and join the remaining lines back into a single string
			const nonEmptyLines = lines.filter(line => line.trim() !== '');
			return nonEmptyLines.join('\n');
		}


		function removePeriodOnlyLines(transcript) {
			// Split the transcript into individual lines
			const lines = transcript.split('\n');
			// Filter out empty lines and join the remaining lines back into a single string
		const nonEmptyLines = lines.filter(line => line.trim() !== ('.' || '。'));
			return nonEmptyLines.join('\n');
		}


		function removeEmptySentences(transcript) {
			const lines = transcript.split('\n'); // Split the input into individual lines
			const result = lines.filter(line => {
				//const parts = line.split(' : '); // Split line into timestamp and sentence
				//return parts.length === 2 && parts[1].trim() !== ''; // Keep lines with non-empty sentences
				const parts = line.split(' : ');
				if (parts.length === 2) {
					const sentence = parts[1].trim().replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
					//console.log(`Sentence: "${sentence}" Length: ${sentence.length}`);
					return sentence !== '';
				}
				return true;
			});
			return result.join('\n'); // Join the remaining lines back into a single string
		}


		function removePeriodOnlySentences(transcript) {
			// Split the transcript into individual lines
			const lines = transcript.split('\n');
    
			// Filter out lines where the sentence part contains only a period character
			const result = lines.filter(line => {
				const parts = line.split(' : ');
				if (parts.length === 2) {
					const sentence = parts[1].trim().replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
					//console.log(`Sentence: "${sentence}" Length: ${sentence.length}`);
					return sentence !== '.';
				}
				return true;
			});
			return result.join('\n'); // Join the remaining lines back into a single string
		}


		function arrayRemoveDuplicates(transcript_array) {
			// Create a Set to keep track of unique timestamps
			const seenTimestamps = new Set();

			// Array to store the unique lines
			const uniqueLines = [];

			// Iterate through each transcript
			transcript_array.forEach(transcript => {
				// Split the transcript by newline to get individual lines
				let lines = transcript.split('\n');

				// Add each line to the Set (Sets automatically handle duplicates)
				lines.forEach(line => {
					if (line !== '') {
						const timestamp1 = line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/);
						const timestamp2 = line.match(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3}/);
						if (timestamp1) {
							const timestampStr = timestamp1[0];
							if (!seenTimestamps.has(timestampStr)) {
								seenTimestamps.add(timestampStr);
								uniqueLines.push(line);
							}
						}
						else if (timestamp2) {
							const timestampStr = timestamp2[0];
							if (!seenTimestamps.has(timestampStr)) {
								seenTimestamps.add(timestampStr);
								uniqueLines.push(line);
							}
						}
					}
				});
			});
			return uniqueLines;
		}


		function formatTimestampToISOLocalString(timestamp_value) {
			// Function to convert a single timestamp from GMT to local time
			function convertTimestamp(timestamp) {
				// Create a Date object from the GMT timestamp
				let date = new Date(timestamp + ' GMT');
				// Return the local time in the same format as the original
				return date.getFullYear() + '-' +
					String(date.getMonth() + 1).padStart(2, '0') + '-' +
					String(date.getDate()).padStart(2, '0') + ' ' +
					String(date.getHours()).padStart(2, '0') + ':' +
					String(date.getMinutes()).padStart(2, '0') + ':' +
					String(date.getSeconds()).padStart(2, '0') + '.' +
					String(date.getMilliseconds()).padStart(3, '0');
			}

			// Convert timestamp_value to string
			const timestamp_string = timestamp_value.toISOString();

			// Extract date and time parts
			const date_part = timestamp_string.slice(0, 10);
			const time_part = timestamp_string.slice(11, 23);
			const timestamp_ISO_String = `${date_part} ${time_part}`;

			// Regular expression to match the timestamps in the string
			const time_regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g;
			const local_timestamp_string = timestamp_ISO_String.replace(time_regex, match => convertTimestamp(match));

			// Concatenate date and time parts with a space in between
			return local_timestamp_string.trim();
		}


		function convertDatesToISOFormat(transcript) {
			// Function to convert a single date from "dd-mm-yyyy" to "yyyy-mm-dd" format
			function convertDate(date) {
				const [day, month, year] = date.split('-');
				return `${year}-${month}-${day}`;
			}

			// Regular expression to match the dates in the transcript
			const dateRegex = /\b(\d{2})-(\d{2})-(\d{4})\b/g;

			// Replace each date in the transcript with its ISO format equivalent
			const modifiedTranscript = transcript.replace(dateRegex, match => convertDate(match));

			return modifiedTranscript;
		}


		const splitText = (text, maxLength) => {
			const chunks = [];
			let start = 0;

			while (start < text.length) {
				let end = start + maxLength;
				if (end > text.length) end = text.length;

				// Find the last occurrence of ".\n" before the end of the chunk
				let chunkEnd = text.lastIndexOf('.\n', end);
				if (chunkEnd === -1 || chunkEnd <= start) {
					chunkEnd = end;
				} else {
					chunkEnd += 2; // Include the ".\n"
				}

				chunks.push(text.substring(start, chunkEnd));
				start = chunkEnd;
			}

			return chunks;
		};


		const translateText = async (text, src, dst, maxLength = 10000) => {
			// WE SHOULD SPLIT LARGE TRANSCRIPTION INTO SMALLER PARTS TO AVOID 400 STATUS RESPONSE FROM GOOGLE TRANSLATE SERVER
			var chunks = splitText(text, maxLength);
			var translatedChunks = [];

			for (var chunk of chunks) {
				//console.log('chunk =', chunk);
				try {
					var translatedChunk = await gtranslate(chunk, src, dst);
					// Give space between colon and sentence
					//translatedChunk = translatedChunk.replace(/：/g, ": ");
					//translatedChunk = translatedChunk.replace(/(\d{2}[:：]\d{2}[:：]\d{2}\.\d{3}[:：])/g, '$1 ');
					// Give space between timestamp and colon
					//translatedChunk = translatedChunk.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})(:)/g, '$1 :');
					translatedChunk = formatTranscript(translatedChunk);
					translatedChunks.push(translatedChunk);

				} catch (error) {
					console.error('Error translating chunk:', error);
					translatedChunks.push(''); // Handle error gracefully by pushing an empty string or handle it as needed
				}
			}
			//return translatedChunks.join(' ');
			//console.log('translatedChunks =', translatedChunks.join('\n'));
			return translatedChunks.join('\n');
		};


		function saveTranscriptAsFile(timestamped_final_and_interim_transcript, filename) {
			console.log('Saving transcript as ' + filename);
			
			// Create a Blob with the transcript content
			const blob = new Blob([timestamped_final_and_interim_transcript], { type: 'text/plain' });

			// Create a URL for the Blob
			const url = URL.createObjectURL(blob);

			// Create an anchor element
			const a = document.createElement('a');
			a.href = url;
			a.download = `${filename}`;

			// Programmatically click the anchor element to trigger download
			a.click();

			// Cleanup
			URL.revokeObjectURL(url);
		}


		function saveTemporaryTranscript(timestamped_final_and_interim_transcript) {
			console.log('Saving temporary transcriptions');
			
			// Create a Blob with the transcript content
			const blob = new Blob([timestamped_final_and_interim_transcript], { type: 'text/plain' });

			// Create a URL for the Blob
			const url = URL.createObjectURL(blob);

			// Create an anchor element
			const a = document.createElement('a');
			a.href = url;
			a.download = 'tmp_transcript.txt';

			// Programmatically click the anchor element to trigger download
			a.click();

			// Cleanup
			URL.revokeObjectURL(url);
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


		function resetPauseTimeout() {
			clearTimeout(pause_timeout);
			pause_timeout = setTimeout(function() {
				console.log("No speech detected for " + pause_threshold / 1000 + " seconds, stopping recognition");

				//recognition.stop();
				try{
					if (recognition) recognition.stop();
					}
				catch(t){
					console.log("recognition.stop() failed",t);
				};

			}, pause_threshold);
		}


		function create_modal_textarea() {
			console.log("create_modal_textarea");
			video_info = get_video_player_info();
			//console.log("video_info = ", video_info);
			if (video_info) {
				//console.log('Extension is starting');
				console.log("video player found");
				//console.log("video_info.id = ", video_info.id);
				console.log("video_info.element = ", video_info.element);
				original_video_top = video_info.top;
				original_video_left = video_info.left;
				original_video_width = video_info.width;
				original_video_height = video_info.height;
				//console.log("video_info.src= ", video_info.src);
				console.log("original_video_top =", original_video_top);
				console.log("original_video_left =", original_video_left);
				console.log("original_video_width =", original_video_width);
				console.log("original_video_height =", original_video_height);
				//console.log("video_info.position = ", video_info.position);
				//console.log("video_info.zIndex = ", video_info.zIndex);

				src_width = src_container_width_factor*video_info.width;
				console.log('src_width =', src_width);

				src_height = src_container_height_factor*video_info.height;
				console.log('src_height =', src_height);

				src_top = video_info.top + src_container_top_factor*video_info.height;
				console.log('src_top =', src_top);

				if (centerize_src) {
					src_left = video_info.left + 0.5*(video_info.width-src_width);
					console.log('src_left =', src_left);
				} else {
					src_left = src_container_left_factor*video_info.width;;
					console.log('src_left =', src_left);
				}

				dst_width = dst_container_width_factor*video_info.width;
				console.log('dst_width =', dst_width);

				dst_height = dst_container_height_factor*video_info.height;
				console.log('dst_height =', dst_height);

				dst_top = video_info.top + dst_container_top_factor*video_info.height;
				console.log('dst_top =', dst_top);

				if (centerize_dst) {
					dst_left = video_info.left + 0.5*(video_info.width-dst_width);
					console.log('dst_left =', dst_left);
				} else {
					dst_left = dst_container_left_factor*video_info.width;;
					console.log('dst_left =', dst_left);
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


			// APPENDING src_textarea
			if (!document.querySelector("#src_textarea_container")) {
				console.log('appending src_textarea_container to html body');
				//src_textarea_container$.appendTo(document.documentElement);
				//document.documentElement.appendChild(src_textarea_container$[0]);
				//get_video_player_info().element.parentElement.appendChild(src_textarea_container$[0]);
				if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
					//document.documentElement.appendChild(src_textarea_container$[0]);
					src_textarea_container$.appendTo(document.documentElement);
				}
				else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
					//document.documentElement.appendChild(src_textarea_container$[0]);
					src_textarea_container$.appendTo(document.body);
					//src_textarea_container$.appendTo(document.documentElement);
				}
				else {
					//get_video_player_info().element.parentElement.appendChild(src_textarea_container$[0]);
					src_textarea_container$.appendTo(get_video_player_info().element.parentElement);
				}
			} else {
				console.log('src_textarea_container has already exist');
			}

			//document.querySelector("#src_textarea").style.top = src_top + 'px';
			//document.querySelector("#src_textarea").style.left = src_left + 'px';
			document.querySelector("#src_textarea").style.width = '100%';
			document.querySelector("#src_textarea").style.height = '100%';
			document.querySelector("#src_textarea").style.border = 'none';
			document.querySelector("#src_textarea").style.display = 'inline-block';
			document.querySelector("#src_textarea").style.overflow = 'hidden';
			//document.querySelector("#src_textarea").style.zIndex = 2147483647;

			document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
			document.querySelector("#src_textarea").style.color = src_font_color;
			document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(src_container_color, src_container_opacity);
			document.querySelector("#src_textarea").style.fontSize = String(src_font_size)+'px';

			document.querySelector("#src_textarea").offsetParent.onresize = (function(){

				document.querySelector("#src_textarea").style.position='absolute';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';

				if (getRect(document.querySelector("#src_textarea_container")).left !== video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
					centerize_src = false;
					saveData('centerize_src', centerize_src);
					// SENDING MESSAGES TO settings.js
					chrome.runtime.sendMessage({
						cmd: 'background_centerize_src',
						data: {
							value: centerize_src
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
				}

				video_info = get_video_player_info();
				if (video_info) {
					src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/video_info.width;
					src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
					//console.log('onresize: src_container_width_factor =', src_container_width_factor);
					saveData('src_container_width_factor', src_container_width_factor);

					src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/video_info.height;
					src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
					//console.log('src_container_height_factor =', src_container_height_factor);
					saveData('src_container_height_factor', src_container_width_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_width_factor',
							data: {
								value: src_container_width_factor
							}
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						});
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_height_factor',
							data: {
								value: src_container_height_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);

				} else {
					src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/window.innerWidth;
					src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
					//console.log('src_container_width_factor =', src_container_width_factor);
					saveData('src_container_width_factor', src_container_width_factor);

					src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/window.innerHeight;
					src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
					//console.log('src_container_height_factor =', src_container_height_factor);
					saveData('src_container_height_factor', src_container_height_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_width_factor',
							data: {
								value: src_container_width_factor
							}
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						});
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_height_factor',
							data: {
								value: src_container_height_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);
				}

				// After do saveData() to save a single data into settings we need to do saveAllChangedSettings() to make them written correctly in chrome storage
				saveAllChangedSettings();

			});

			document.querySelector("#src_textarea").offsetParent.ondrag = (function(){

				document.querySelector("#src_textarea").style.position='absolute';

				if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
					centerize_src = false;
					saveData('centerize_src', centerize_src);
					// SENDING MESSAGES TO settings.js
					chrome.runtime.sendMessage({
						cmd: 'background_centerize_src',
						data: {
							value: centerize_src
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
				}

				video_info = get_video_player_info();
				if (video_info) {
					src_container_top_factor = (getRect(document.querySelector("#src_textarea_container")).top - video_info.top)/video_info.height;
					src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
					//console.log('src_container_top_factor =', src_container_top_factor);
					saveData("src_container_top_factor", src_container_top_factor);

					src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/video_info.width;
					src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
					//console.log('src_container_left_factor =', src_container_left_factor);
					saveData("src_container_left_factor", src_container_left_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_top_factor',
							data: {
								value: src_container_top_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_left_factor',
							data: {
								value: src_container_left_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);

				} else {
					src_container_top_factor = getRect(document.querySelector("#src_textarea_container")).top/window.innerHeight;
					src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
					//console.log('src_container_top_factor =', src_container_top_factor);
					saveData("src_container_top_factor", src_container_top_factor);

					src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/window.innerWidth;
					src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
					//console.log('src_container_left_factor =', src_container_left_factor);
					saveData("src_container_left_factor", src_container_left_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_top_factor',
							data: {
								value: src_container_top_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_src_container_left_factor',
							data: {
								value: src_container_left_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);
				}

				// After do saveData() to save a single data into settings we need to do saveAllChangedSettings() to make them written correctly in chrome storage
				saveAllChangedSettings();
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


			// APPENDING dst_textarea
			if (!document.querySelector("#dst_textarea_container")) {
				console.log('appending dst_textarea_container to html body');
				//dst_textarea_container$.appendTo(document.documentElement);
				//document.documentElement.appendChild(dst_textarea_container$[0]);
				//get_video_player_info().element.parentElement.appendChild(dst_textarea_container$[0]);
				if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
					//document.documentElement.appendChild(dst_textarea_container$[0]);
					dst_textarea_container$.appendTo(document.documentElement);
				}
				else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
					//document.documentElement.appendChild(dst_textarea_container$[0]);
					dst_textarea_container$.appendTo(document.body);
				//	dst_textarea_container$.appendTo(document.documentElement);
				}
				else {
					//get_video_player_info().element.parentElement.appendChild(dst_textarea_container$[0]);
					dst_textarea_container$.appendTo(get_video_player_info().element.parentElement);
				}
			} else {
				console.log('dst_textarea_container has already exist');
			};

			//document.querySelector("#dst_textarea").style.top = dst_top + 'px';
			//document.querySelector("#dst_textarea").style.left = dst_left + 'px';
			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';
			document.querySelector("#dst_textarea").style.border = 'none';
			document.querySelector("#dst_textarea").style.display = 'inline-block';
			document.querySelector("#dst_textarea").style.overflow = 'hidden';
			//document.querySelector("#dst_textarea").style.zIndex = 2147483647;

			document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif"
			document.querySelector("#dst_textarea").style.color = dst_font_color;
			document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);
			document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size)+'px';

			document.querySelector("#dst_textarea").offsetParent.onresize = (function(){

				document.querySelector("#dst_textarea").style.position='absolute';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';

				if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
					centerize_dst = false;
					saveData('centerize_dst', centerize_dst);
					// SENDING MESSAGES TO settings.js
					chrome.runtime.sendMessage({
						cmd: 'background_centerize_dst',
						data: {
							value: centerize_dst
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
				}

				video_info = get_video_player_info();
				if (video_info) {
					dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/video_info.width;
					dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
					//console.log('dst_container_width_factor =', dst_container_width_factor);
					saveData('dst_container_width_factor', dst_container_width_factor);

					dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/video_info.height;
					dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
					//console.log('dst_container_height_factor =', dst_container_height_factor);
					saveData('dst_container_height_factor', dst_container_height_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_width_factor',
							data: {
								value: dst_container_width_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_height_factor',
							data: {
								value: dst_container_height_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);

				} else {
					dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/window.innerWidth;
					dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
					//console.log('dst_container_width_factor =', dst_container_width_factor);
					saveData('dst_container_width_factor', dst_container_width_factor);

					dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/window.innerHeight;
					dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
					//console.log('dst_container_height_factor =', dst_container_height_factor);
					saveData('dst_container_height_factor', dst_container_height_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_width_factor',
							data: {
								value: dst_container_width_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_height_factor',
							data: {
								value: dst_container_height_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);
				}

				// After do saveData() to save a single data into settings we need to do saveAllChangedSettings() to make them written correctly in chrome storage
				saveAllChangedSettings();
			});

			document.querySelector("#dst_textarea").offsetParent.ondrag = (function(){

				document.querySelector("#dst_textarea").style.position='absolute';

				video_info = get_video_player_info();
				if (video_info) {
					dst_container_top_factor = (getRect(document.querySelector("#dst_textarea_container")).top - video_info.top)/video_info.height;
					dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
					//console.log('dst_container_top_factor =', dst_container_top_factor);
					saveData("dst_container_top_factor", dst_container_top_factor);

					dst_container_left_factor = (getRect(document.querySelector("#dst_textarea_container")).left - video_info.left)/video_info.width;
					dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
					//console.log('dst_container_left_factor =', dst_container_left_factor);
					saveData("dst_container_left_factor", dst_container_left_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_top_factor',
							data: {
								value: dst_container_top_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_left_factor',
							data: {
								value: dst_container_left_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);

				} else {
					dst_container_top_factor = getRect(document.querySelector("#dst_textarea_container")).top/window.innerHeight;
					dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
					//console.log('dst_container_top_factor =', dst_container_top_factor);
					saveData("dst_container_top_factor", dst_container_top_factor);

					dst_container_left_factor = getRect(document.querySelector("#dst_textarea_container")).left/window.innerWidth;
					dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
					//console.log('dst_container_left_factor =', dst_container_left_factor);
					saveData("dst_container_left_factor", dst_container_left_factor);

					// SENDING MESSAGES TO settings.js
					setTimeout(function() {
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_top_factor',
							data: {
								value: dst_container_top_factor
							}, function(response) {
								console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
							}
						});
						chrome.runtime.sendMessage({
							cmd: 'background_dst_container_left_factor',
							data: {
								value: dst_container_left_factor
							}, function(response) {
								console.log('response.status =', response.status);
							}
						});
					}, 1000);
				}

				if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
					centerize_dst = false;
					saveData('centerize_dst', centerize_dst);
					// SENDING MESSAGES TO settings.js
					chrome.runtime.sendMessage({
						cmd: 'background_centerize_dst',
						data: {
							value: centerize_dst
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
				}

				// After do saveData() to save a single data into settings we need to do saveAllChangedSettings() to make them written correctly in chrome storage
				saveAllChangedSettings();
			});

			window.onresize = (function(){
				console.log('create_modal_text_area: window.onresize');
				maintain_video_size();
				regenerate_textarea();
			});
		}


		function regenerate_textarea() {
			console.log('regenerate_textarea');
			//var textarea_rect = get_textarea_rect();

			video_info = get_video_player_info();
			//console.log("video_info = ", video_info);
			if (video_info) {

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


			if (document.querySelector("#src_textarea_container")) {
				document.querySelector("#src_textarea_container").style.fontFamily = src_selected_font + ", sans-serif";
				document.querySelector("#src_textarea_container").style.width = String(src_width) + 'px';
				document.querySelector("#src_textarea_container").style.height = String(src_height) + 'px';
				document.querySelector("#src_textarea_container").style.top = String(src_top) + 'px';
				document.querySelector("#src_textarea_container").style.left = String(src_left) + 'px';

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

				//document.querySelector("#src_textarea").style.width = String(src_width) + 'px'; // DON'T USE THIS!!!
				//document.querySelector("#src_textarea").style.height = String(src_height) + 'px'; // DON'T USE THIS!!!
				//document.querySelector("#src_textarea").style.top = String(src_top) + 'px'; // DON'T USE THIS!!!
				//document.querySelector("#src_textarea").style.left = String(src_left) + 'px'; // DON'T USE THIS!!!
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';
				document.querySelector("#src_textarea").style.border = 'none';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").style.overflow = 'hidden';

				document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
				document.querySelector("#src_textarea").style.fontSize = String(src_font_size)+'px';
				document.querySelector("#src_textarea").style.color = src_font_color;
				document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(src_container_color, src_container_opacity);

			} else {
				console.log('src_textarea_container has already exist');
			}


			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.fontFamily = dst_selected_font + ", sans-serif";
				document.querySelector("#dst_textarea_container").style.width = String(dst_width) + 'px';
				document.querySelector("#dst_textarea_container").style.height = String(dst_height) + 'px';
				document.querySelector("#dst_textarea_container").style.top = String(dst_top) + 'px';
				document.querySelector("#dst_textarea_container").style.left = String(dst_left) + 'px';

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
						'color': dst_font_color.value,
						'backgroundColor': hexToRgba(dst_container_color, dst_container_opacity),
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:dst_top, left:dst_left})

				//document.querySelector("#dst_textarea").style.width = String(dst_width)+'px'; // DON'T USE THIS!!!
				//document.querySelector("#dst_textarea").style.height = String(dst_height)+'px'; // DON'T USE THIS!!!
				//document.querySelector("#dst_textarea").style.top = String(dst_top) + 'px'; // DON'T USE THIS!!!
				//document.querySelector("#dst_textarea").style.left = String(dst_left) + 'px'; // DON'T USE THIS!!!
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				document.querySelector("#dst_textarea").style.border = 'none';
				document.querySelector("#dst_textarea").style.display = 'inline-block';
				document.querySelector("#dst_textarea").style.overflow = 'hidden';

				document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
				document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size)+'px';
				document.querySelector("#dst_textarea").style.color = dst_font_color.value;
				document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);

			} else {
				console.log('dst_textarea_container has already exist');
			}

			if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (get_video_player_info().left + get_video_player_info().width - 48)  + 'px';
			if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (get_video_player_info().top + get_video_player_info().height - 44) + 'px';
			if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;

		}


		function getRect(element) {
			const rect = element.getBoundingClientRect();
			const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			return {
				width: rect.width,
				height: rect.height,
				top: rect.top + scrollTop,
				left: rect.left + scrollLeft,
				right: rect.right + scrollLeft,
				bottom: rect.bottom + scrollTop
			};
		}


		function isPlayableVideoElement(element) {
			// Check if the element is a video element
			if (element.tagName.toLowerCase() === 'video') {
				return true;
			}
	
			// Check if the element is an iframe with embedded video content
			if (element.tagName.toLowerCase() === 'iframe') {
				const iframeSrc = element.src || element.getAttribute('src');
				if (iframeSrc) {
					// Example check for common video hosting platforms (YouTube, Vimeo, etc.)
					const videoPlatforms = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
					return videoPlatforms.some(platform => iframeSrc.includes(platform));
				}
			}
	
			// Check if the element has video-related attributes and methods
			const videoMethods = ['play', 'pause', 'canPlayType'];
			const hasVideoMethods = videoMethods.every(method => typeof element[method] === 'function');
			const videoAttributes = ['src', 'currentTime', 'duration'];
			const hasVideoAttributes = videoAttributes.every(attr => attr in element);
	
			return hasVideoMethods && hasVideoAttributes;
		}


		function get_video_player_info() {
			console.log('get_video_player_info()');
			if (document.querySelector("video") || document.querySelector("iframe")) {
				console.log('document.querySelector("video") || document.querySelector("iframe")');
				var largestVideoElement = null;
				var largestSize = 0;
				var elements = document.querySelectorAll('video, iframe');

				console.log('elements.length =', elements.length);
				for (var i = 0; i < elements.length; i++) {
					console.log('getRect(elements[' + i + ']).width =', getRect(elements[i]).width);
					if (getRect(elements[i]).width > 0) {
						//console.log('elements[' + i + '] =', elements[i].tagName.toLowerCase());
						var size = getRect(elements[i]).width * getRect(elements[i]).height;
						//console.log('size =', size);
						if (size > largestSize) {
							largestSize = size;
							largestVideoElement = elements[i];
							//console.log('largestVideoElement =', largestVideoElement);

							var videoPlayerContainer = largestVideoElement.parentElement;
							while (videoPlayerContainer && videoPlayerContainer !== document.body) {
								var style = window.getComputedStyle(videoPlayerContainer);
								videoPlayerContainer = videoPlayerContainer.parentElement;
							}

							// Default to the video player if no suitable container found
							if (!videoPlayerContainer || videoPlayerContainer === document.body) {
								videoPlayerContainer = largestVideoElement;
							}

							// Get the position and size of the container
							var container_rect = getRect(videoPlayerContainer);
							// Get the computed style of the container
							var container_style = window.getComputedStyle(videoPlayerContainer);
							// Check if position and z-index are defined, else set default values
							var container_position = container_style.position !== 'static' ? container_style.position : 'relative';
							var container_zIndex = container_style.zIndex !== 'auto' && container_style.zIndex !== '0' ? parseInt(container_style.zIndex) : 1;
						}
					}
				}
				if (largestVideoElement) {
					return {
						element: largestVideoElement,
						id: largestVideoElement.id,
						tagName: largestVideoElement.tagName.toLowerCase(),
						top: getRect(largestVideoElement).top,
						left: getRect(largestVideoElement).left,
						bottom: getRect(largestVideoElement).bottom,
						right: getRect(largestVideoElement).right,
						width: getRect(largestVideoElement).width,
						height: getRect(largestVideoElement).height,
						position: largestVideoElement.style.position,
						zIndex: largestVideoElement.style.zIndex,
						container: videoPlayerContainer,
						container_id: videoPlayerContainer.id,
						container_top: container_rect.top,
						container_left: container_rect.left,
						container_bottom: container_rect.bottom,
						container_right: container_rect.right,
						container_width: container_rect.width,
						container_height: container_rect.height,
						container_position: container_position,
						container_zIndex: container_zIndex,
						src: largestVideoElement.src,
					};
				}
			}
			else if (!document.querySelector("video") && !document.querySelector("iframe")) {
				console.log('No video player found');
				return null;
			}
		}


		function get_textarea_rect() {
			video_info = get_video_player_info();
			if (video_info) {
				console.log("get_textarea_rect");
				//console.log("Video player found");
				//console.log("video_info.element = ", video_info.element);
				//console.log("video_info.id = ", video_info.id);
				//console.log("Top:", video_info.top);
				//console.log("Left:", video_info.left);
				//console.log("Width:", video_info.width);
				//console.log("Height:", video_info.height);
				//console.log("src_container_width_factor:", src_container_width_factor);
				//console.log("src_container_left_factor:", src_container_left_factor);

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


		function hexToRgba(hex, opacity) {
			let r = parseInt(hex.slice(1, 3), 16);
			let g = parseInt(hex.slice(3, 5), 16);
			let b = parseInt(hex.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}


		function saveData(key, data) {
			chrome.storage.local.get(['settings'], (result) => {
				let settings = result.settings || {};
				settings[key] = data;
				chrome.storage.local.set({ 'settings': settings }, () => {
					console.log(key + ' = ' + data + ' saved within settings.');
					verifyData(key, data, 'settings');
				});
			});
		}

		function verifyData(key, data, parentKey = null) {
			chrome.storage.local.get([parentKey || key], (result) => {
				if (parentKey) {
					console.log(result[parentKey][key] === data ? key + ' = ' + data + ' data verified.' : key + ' = ' + data + ' data verification failed.');
				} else {
					console.log(result[key] === data ? key + ' = ' + data + ' data verified.' : key + ' = ' + data + ' data verification failed.');
				}
			});
		}


		function saveChangedSetting(key, value, callback) {
			let setting = {};
			setting[key] = value;
			chrome.storage.local.set(setting, function() {
				if (chrome.runtime.lastError) {
					console.error("Error setting data for key", key, ":", chrome.runtime.lastError);
				} else {
					console.log(`saving ${key} = `, value);
				}
				if (callback) {
					callback();
				}
			});
		}


		function saveAllChangedSettings() {
			const settings = {
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
			}

			const keys = Object.keys(settings);
			let index = 0;

			function saveNext() {
				if (index < keys.length) {
					const key = keys[index];
					const value = settings[key];
					saveChangedSetting(key, value, function() {
						index++;
						setTimeout(saveNext, 100); // Adjust the delay as necessary
					});
				} else {
					console.log("All data saved successfully.");
				}
			}
			saveNext();
		}


		function create_button_fullscreen() {
			const video_info = get_video_player_info();
			var button_fullscreen = document.createElement('button');
			button_fullscreen.id = 'button_fullscreen';
			button_fullscreen.style.position = 'absolute';
			button_fullscreen.style.top = (video_info.top + video_info.height - 40) + 'px';
			button_fullscreen.style.left = (video_info.left + video_info.width - 44) + 'px';
			button_fullscreen.style.zIndex = 2147483647;
			button_fullscreen.style.padding = '10px';
			button_fullscreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
			button_fullscreen.style.color = '#fff';
			button_fullscreen.style.border = 'none';
			button_fullscreen.style.cursor = 'pointer';
			button_fullscreen.style.borderRadius = '5px';
			button_fullscreen.style.display = 'none'; // Initially hidden

			// Create the SVG icon
			var fullscreenIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			fullscreenIcon.setAttribute('width', '12');
			fullscreenIcon.setAttribute('height', '12');
			fullscreenIcon.setAttribute('viewBox', '0 0 24 24');
			fullscreenIcon.setAttribute('fill', 'none');
			fullscreenIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('fill-rule', 'evenodd');
			path.setAttribute('clip-rule', 'evenodd');
			path.setAttribute('d', 'M7 10H3V3H10V7H5V10ZM21 3H14V7H19V10H21V3ZM17 17H21V21H14V17H19V14H21V17ZM3 14H7V19H10V21H3V14Z');
			path.setAttribute('fill', 'currentColor');

			fullscreenIcon.appendChild(path);
			button_fullscreen.appendChild(fullscreenIcon);

			//document.documentElement.appendChild(button_fullscreen);
			//get_video_player_info().element.parentElement.appendChild(button_fullscreen);
			if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
				document.documentElement.appendChild(button_fullscreen);
			}
			else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
				document.body.appendChild(button_fullscreen);
			}
			else {
				get_video_player_info().element.parentElement.appendChild(button_fullscreen);
			}

			document.querySelector('#button_fullscreen').onclick = () => {
				console.log('button_fullscreen clicked');
				originalContent = document.body.innerHTML;
				//toggleFullscreen(document.documentElement);
				//toggleFullscreen(get_video_player_info().element.parentElement);
				if (get_video_player_info().element.src.includes('youtube' || 'youtu.be')) {
					toggleFullscreen(document.documentElement);
				}
				else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
					toggleFullscreen(document.body);
					//toggleFullscreen(document.documentElement);
				}
				else {
					toggleFullscreen(get_video_player_info().element.parentElement);
				}
			}

			window.onkeydown = (event) => {
				console.log('create_button_fullscreen: document.onkeydown: event.keyCode =', event.keyCode);
				if (event.keyCode === 122) {
					event.preventDefault();
					console.log('F11 key was pressed');
					if (get_video_player_info().element.src.includes('youtube') || get_video_player_info().element.src.includes('youtu.be')) {
						toggleFullscreen(document.documentElement);
					}
					else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
						toggleFullscreen(document.body);
					}
					else {
						toggleFullscreen(get_video_player_info().element.parentElement);
					}

					window.onresize = (function(){
					console.log('create_button_fullscreen: document.onkeydown: window.onresize');
						maintain_video_size();
					});
				}
			};

			window.onresize = function() {
				if (document.querySelector('#button_fullscreen')) {
					document.querySelector('#button_fullscreen').style.top = (get_video_player_info().top + get_video_player_info().height - 44) + 'px';
					document.querySelector('#button_fullscreen').style.left = (get_video_player_info().left + get_video_player_info().width - 48) + 'px';
					document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}
				maintain_video_size();
				regenerate_textarea();
			};


			document.documentElement.onmousemove = function(){
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};

			document.body.onmousemove = function(){
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};

			var video_element = get_video_player_info().element;
			video_element.onmousemove = function() {
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};

			video_element.parentElement.onmousemove = function() {
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};


			document.querySelector("#src_textarea").onmousemove = function() {
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};

			document.querySelector("#dst_textarea").onmousemove = function() {
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						if (document.querySelector('#button_fullscreen')) document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};
		}


		function create_mouse_move_catcher(){
			var mouseMoveCatcher = document.createElement('div');
			mouseMoveCatcher.className = 'mouse-move-catcher';
			mouseMoveCatcher.style.display = 'block';
			mouseMoveCatcher.style.zIndex = 1;
			mouseMoveCatcher.style.position = 'absolute';
			mouseMoveCatcher.style.top = get_video_player_info().top;
			mouseMoveCatcher.style.left = get_video_player_info().left;
			mouseMoveCatcher.style.width = '100%';
			mouseMoveCatcher.style.height = '100%';
			document.documentElement.appendChild(mouseMoveCatcher);

			document.documentElement.onmousemove = function(){
				//console.log('onmousemove');
				if (document.querySelector("#button_fullscreen")) {
					var timeout;
					document.querySelector("#button_fullscreen").style.display = 'block';
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						document.querySelector("#button_fullscreen").style.display = 'none';
					}, 5000);
				}
			};
		}


		function toggleFullscreen(element) {
			console.log('toggleFullscreen');
			if (!document.fullscreenElement) {
				enterFullscreen(element);
			} else {
				exitFullscreen();
			}
		}


		// Function to enter fullscreen mode for the video
		function enterFullscreen(element) {
			console.log('enterFullscreen for element =', element);
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) { // Firefox
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
				element.webkitRequestFullscreen();
			} else if (element.msRequestFullscreen) { // IE/Edge
				element.msRequestFullscreen();
			}
		}


		function exitFullscreen() {
			console.log('exitFullscreen()');
			var video_info = get_video_player_info();
			if (document.exitFullscreen) {
				document.exitFullscreen();

				if (video_info) {
					video_info.element.style.width = original_video_width + 'px';
					video_info.element.style.height = original_video_height + 'px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					video_info.element.style.left = video_info.element.parentElement.style.left;

					if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
						// Maintain video size when window resized or entering fullscreen mode
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';

						window.onresize = (function(){
							console.log('exitFullscreen: window.onresize');
							if (video_info) {
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							}
						});
					}
					else {
						maintain_video_size();
					}

					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}

			} else if (document.mozCancelFullScreen) { // Firefox
				document.mozCancelFullScreen();

				if (video_info) {
					video_info.element.style.width = original_video_width + 'px';
					video_info.element.style.height = original_video_height + 'px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					video_info.element.style.left = video_info.element.parentElement.style.left;

					if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
						// Maintain video size when window resized or entering fullscreen mode
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';
						window.onresize = (function(){
							if (video_info) {
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							}
						});
					}
					else {
						maintain_video_size();
					}

					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}

			} else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
				document.webkitExitFullscreen();

				if (video_info) {
					video_info.element.style.width = original_video_width + 'px';
					video_info.element.style.height = original_video_height + 'px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					video_info.element.style.left = video_info.element.parentElement.style.left;

					if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
						// Maintain video size when window resized or entering fullscreen mode
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';
						window.onresize = (function(){
							if (video_info) {
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							}
						});
					}
					else {
						maintain_video_size();
					}

					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}

			} else if (document.msExitFullscreen) { // IE/Edge
				document.msExitFullscreen();

				if (video_info) {
					video_info.element.style.width = original_video_width + 'px';
					video_info.element.style.height = original_video_height + 'px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					video_info.element.style.left = video_info.element.parentElement.style.left;

					if (video_info.src.includes('youtube') || video_info.src.includes('youtu.be')) {
						// Maintain video size when window resized or entering fullscreen mode
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';
						window.onresize = (function(){
							if (video_info) {
								video_info.element.style.position = 'absolute';
								video_info.element.style.width = '100%';
								video_info.element.style.height = '100%';
							}
						});
					}
					else {
						maintain_video_size();
					}

					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.left = (video_info.left + video_info.width - 48)  + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.top = (video_info.top + video_info.height - 44) + 'px';
					if (document.querySelector('#button_fullscreen')) document.querySelector('#button_fullscreen').style.zIndex = 2147483647;
				}
			}

			if (video_info.src !== '') {
				document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
				document.body.scrollTop = get_video_player_info().top; // For older browsers
				console.log('Scrolling');
				regenerate_textarea();
			}

		}


		function get_video_outer_info() {
			const video_info = get_video_player_info();
			const videoElement = video_info.element;
			var video_outer_info, video_outer_info_id;
			var video_outer_info_width, video_outer_info_height, video_outer_info_top, video_outer_info_left;
			var video_outer_info_position, video_outer_info_zIndex;
			if (videoElement) {
				video_outer_info = videoElement.parentElement;
				while (video_outer_info && video_outer_info !== document.body) {
					video_outer_info = video_outer_info.parentElement;
					video_outer_info_id = video_outer_info.parentElement.id;
					var rect = getRect(video_outer_info);
					video_outer_info_width = rect.width;
					video_outer_info_height = rect.height;
					video_outer_info_top = rect.top;
					video_outer_info_left = rect.left;
					video_outer_info_position = video_outer_info.parentElement.style.position;
					video_outer_info_zIndex = video_outer_info.parentElement.style.zIndex;
					if (video_outer_info.parentElement === document.body) {
						break;
					}
				}
				return {
					element: video_outer_info,
					id: video_outer_info_id,
					width: video_outer_info_width,
					height: video_outer_info_height,
					top: video_outer_info_top,
					left: video_outer_info_left,
					position: video_outer_info_position,
					zIndex: video_outer_info_zIndex,
				};
			} else {
				console.log('No video player found');
				return null;
			}
		}


		function maintain_video_size() {
			console.log('Maintain video size when window resized or entering fullscreen mode');
			var video_info = get_video_player_info();
			if (video_info) {
				var video_outer_info = get_video_outer_info();
			}

			if (video_info && video_info.src !== '' && !video_info.src.includes('youtube' || 'youtu.be')) {
				if (video_outer_info) video_outer_info.element.style.textAlign = 'center';
				if (video_info) video_info.element.style.position = 'absolute';
				if (window.innerWidth/window.innerHeight >= 16/9) {
					console.log('window.innerWidth/window.innerHeight >= 16/9');
					video_info.element.style.height = (window.innerHeight) + 'px';
					video_info.element.style.width = (((16/9) * window.innerHeight)) + 'px';
					video_info.element.style.left = (0.5 * (window.innerWidth - getRect(video_info.element).width)) + 'px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					regenerate_textarea();
				}
				else {
					console.log('window.innerWidth/window.innerHeight < 16/9');
					video_info.element.style.width = window.innerWidth + 'px';
					video_info.element.style.height = ((9/16) * window.innerWidth) + 'px';
					video_info.element.style.left = '0px';
					video_info.element.style.top = video_info.element.parentElement.style.top;
					regenerate_textarea();
				}

				window.onresize = (function(){
					if (video_info && video_outer_info) {
						console.log('maintain_video_size: window.onresize');

						var maxHeight = window.screen.height,
							maxWidth = window.screen.width,
							curHeight = window.innerHeight,
							curWidth = window.innerWidth;

						var isFullscreen = false;
						if (maxWidth == curWidth && maxHeight == curHeight) {
							//alert('maxWidth == curWidth && maxHeight == curHeight');
							isFullscreen = !isFullscreen;
							if (get_video_player_info().element.src.includes('youtube') || get_video_player_info().element.src.includes('youtu.be')) {
								enterFullscreen(document.documentElement);
							}
							else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
								enterFullscreen(document.body);
							}
							else {
								enterFullscreen(get_video_player_info().element.parentElement);
							}
						}
						else {
							isFullscreen = false;
						}

						if (!isFullscreen) {
							if (video_outer_info) video_outer_info.element.style.textAlign = 'center';
							if (video_info) video_info.element.style.position = 'absolute';
							if (window.innerWidth/window.innerHeight >= 16/9) {
								console.log('resize event: window.innerWidth/window.innerHeight >= 16/9');
								video_info.element.style.height = (window.innerHeight) + 'px';
								video_info.element.style.width = (((16/9) * window.innerHeight)) + 'px';
								video_info.element.style.left = (0.5 * (window.innerWidth - getRect(video_info.element).width)) + 'px';
								video_info.element.style.top = video_info.element.parentElement.style.top;
								regenerate_textarea();
							}
							else {
								console.log('resize event: window.innerWidth/window.innerHeight < 16/9');
								video_info.element.style.width = window.innerWidth + 'px';
								//video_info.element.style.width = video_info.element.parentElement.style.width;
								//video_info.element.style.width = original_video_width + 'px';
								video_info.element.style.height = ((9/16) * window.innerWidth) + 'px';
								//video_info.element.style.height = ((9/16) * get_video_player_info().width) + 'px';
								//video_info.element.style.height = ((9/16) * original_video_width) + 'px';;
								//video_info.element.style.left = '0px';
								video_info.element.style.left = video_info.element.parentElement.style.left;
								video_info.element.style.top = video_info.element.parentElement.style.top;
								regenerate_textarea();
							}
						}

						if (video_info.element.src !== '') {
							document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
							document.body.scrollTop = get_video_player_info().top; // For older browsers
							console.log('Scrolling');
							regenerate_textarea();
						}
					}
				});
			}

			else if (video_info && video_info.src !== '' && video_info.src.includes('youtube' || 'youtu.be')) {
				video_info.element.style.width = '100%';
				video_info.element.style.height = '100%';
				regenerate_textarea();

				window.onresize = (function(){
					console.log('maintain_video_size: window.onresize');

					var maxHeight = window.screen.height,
						maxWidth = window.screen.width,
						curHeight = window.innerHeight,
						curWidth = window.innerWidth;

					var isFullscreen = false;
					if (maxWidth == curWidth && maxHeight == curHeight) {
						//alert('maxWidth == curWidth && maxHeight == curHeight');
						console.log('maxWidth == curWidth && maxHeight == curHeight');
						isFullscreen = !isFullscreen;
						if (get_video_player_info().element.src.includes('youtube') || get_video_player_info().element.src.includes('youtu.be')) {
							enterFullscreen(document.documentElement);
						}
						else if (get_video_player_info().element.src.includes('www.cnnindonesia.com')) {
							enterFullscreen(document.body);
						}
						else {
							enterFullscreen(get_video_player_info().element.parentElement);
						}
					}
					else {
						isFullscreen = false;
					}

					if (!isFullscreen) {
						video_info.element.style.position = 'absolute';
						video_info.element.style.width = '100%';
						video_info.element.style.height = '100%';
						if (video_info.src !== '') {
							document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
							document.body.scrollTop = get_video_player_info().top; // For older browsers
							console.log('Scrolling');
							regenerate_textarea();
						}
					}
				});
			}

			// DON'T CHANGE THIS!
			if (video_info.src !== '') {
				document.documentElement.scrollTop = get_video_player_info().top; // For modern browsers
				document.body.scrollTop = get_video_player_info().top; // For older browsers
				console.log('Scrolling');
				regenerate_textarea();
			}

		}


		function setIconWithText(text) {
			// Create a canvas element
			var canvas = document.createElement('canvas');
			canvas.width = 128;
			canvas.height = 128;
			var context = canvas.getContext('2d');

			// Create an image element
			var img = new Image();
			img.src = chrome.runtime.getURL('mic-listening.png'); // Path to your icon image

			img.onload = function() {
				// Draw the image
				context.drawImage(img, 0, 0, canvas.width, canvas.height);

				// Set background color
				context.fillStyle = '#000000'; // Red background
				context.fillRect(0, canvas.height/4, canvas.width, canvas.height/2);

				// Set text properties
				context.font = 'Bold 48px Arial';
				context.fillStyle = '#FFFFFF'; // White text
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText(text, canvas.width / 2, canvas.height / 2);

				// Get ImageData
				var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

				// Serialize the ImageData object
				var imageDataSerialized = {
					width: imageData.width,
					height: imageData.height,
					data: Array.from(imageData.data)
				};

				// Send the serialized ImageData back to the background script
				chrome.runtime.sendMessage({cmd: 'setIcon', data: {imageData: imageDataSerialized}});
			};

		}


		// Listen for messages from the background script
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.cmd === 'generateIcon') {
				setIconWithText(message.data.text);
			}
		});

	});
}




chrome.action.onClicked.addListener((tab) => {

	recognizing = !recognizing; //CLICKING ON EXTENSION ICON WILL TOGGLE RECOGNIZING STATUS

	if (recognizing) {

		console.log('Start button clicked to start: recognizing =', recognizing);
		chrome.storage.local.set({'recognizing' : recognizing}, (() => {}));

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tab.id, 'start', function(response) {
				console.log('response =', response);
			});
		});


		// LISTENING MESSAGES FROM onLoad
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.cmd === 'setIcon') {
				var imageDataSerialized = request.data.imageData;
				// Deserialize the ImageData object
				var imageData = new ImageData(
					new Uint8ClampedArray(imageDataSerialized.data),
					imageDataSerialized.width,
					imageDataSerialized.height
				);
				chrome.action.setIcon({ imageData: imageData });
				sendResponse({status: 'Icon set'});
			}
			return true;
		});



		// LISTENING MESSAGE FROM ONSTART
		var icon_text_listening = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			sendResponse({status: 'icon_text_listening processed'});
			if (request.cmd === 'icon_text_listening') {
				icon_text_listening = request.data.value;
				chrome.action.setIcon({path: 'mic-listening.png'});
				chrome.action.setBadgeText({text: icon_text_listening});
			}
		});

		// LISTENING MESSAGE FROM ONERROR
		var icon_text_no_mic = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			sendResponse({status: 'icon_text_no_mic processed'});
			if (request.cmd === 'icon_text_no_mic') {
				icon_text_no_mic = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
				return true;
			}
		});
		var icon_text_blocked = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			sendResponse({status: 'icon_text_blocked processed'});
			if (request.cmd === 'icon_text_blocked') {
				icon_text_blocked = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
				return true;
			}
		});
		var icon_text_denied = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			sendResponse({status: 'icon_text_denied processed'});
			if (request.cmd === 'icon_text_denied') {
				icon_text_denied = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
				return true;
			}
		});



		// LISTENING MESSAGES FROM settings.js
		var changed_src_dialect = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_dialect') {
				sendResponse({status: 'changed_src_dialect processed'});
				changed_src_dialect = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_dialect', variable_value: changed_src_dialect});
				});
				//return true;
			}
		});

		var changed_show_src = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_show_src') {
				sendResponse({status: 'changed_show_src processed'});
				changed_show_src = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_show_src', variable_value: changed_show_src});
				});
				//return true;
			}
		});

		var changed_show_timestamp_src = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_show_timestamp_src') {
				sendResponse({status: 'changed_show_timestamp_src processed'});
				changed_show_timestamp_src = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_show_timestamp_src', variable_value: changed_show_timestamp_src});
				});
				//return true;
			}
		});


		var changed_src_selected_font = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_selected_font') {
				sendResponse({status: 'changed_src_selected_font processed'});
				changed_src_selected_font = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_selected_font', variable_value: changed_src_selected_font});
				});
				//return true;
			}
		});

		var changed_src_font_size = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_font_size') {
				sendResponse({status: 'changed_src_font_size processed'});
				changed_src_font_size = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_font_size', variable_value: changed_src_font_size});
				});
				//return true;
			}
		});

		var changed_src_font_color = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_font_color') {
				sendResponse({status: 'changed_src_font_color processed'});
				changed_src_font_color = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_font_color', variable_value: changed_src_font_color});
				});
				//return true;
			}
		});

		var changed_src_container_width_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_width_factor') {
				sendResponse({status: 'changed_src_container_width_factor processed'});
				changed_src_container_width_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_width_factor', variable_value: changed_src_container_width_factor});
				});
				//return true;
			}
		});

		var changed_src_container_height_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_height_factor') {
				sendResponse({status: 'changed_src_container_height_factor processed'});
				changed_src_container_height_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_height_factor', variable_value: changed_src_container_height_factor});
				});
				//return true;
			}
		});

		var changed_src_container_top_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_top_factor') {
				sendResponse({status: 'changed_src_container_top_factor processed'});
				changed_src_container_top_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_top_factor', variable_value: changed_src_container_top_factor});
				});
				//return true;
			}
		});

		var changed_src_container_left_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_left_factor') {
				sendResponse({status: 'changed_src_container_left_factor processed'});
				changed_src_container_left_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_left_factor', variable_value: changed_src_container_left_factor});
				});
				//return true;
			}
		});

		var changed_centerize_src = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_centerize_src') {
				sendResponse({status: 'changed_centerize_src processed'});
				changed_centerize_src = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_centerize_src', variable_value: changed_centerize_src});
				});
				//return true;
			}
		});

		var changed_src_container_color = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_color') {
				sendResponse({status: 'changed_src_container_color processed'});
				changed_src_container_color = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_color', variable_value: changed_src_container_color});
				});
				//return true;
			}
		});

		var changed_src_container_opacity = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_src_container_opacity') {
				sendResponse({status: 'changed_src_container_opacity processed'});
				changed_src_container_opacity = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_src_container_opacity', variable_value: changed_src_container_opacity});
				});
				//return true;
			}
		});

		var changed_save_src = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_save_src') {
				sendResponse({status: 'changed_save_src processed'});
				changed_save_src = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_save_src', variable_value: changed_save_src});
				});
				//return true;
			}
		});



		var changed_dst_dialect = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			sendResponse({status: 'changed_dst_dialect processed'});
			if (request.cmd === 'changed_dst_dialect') {
				changed_dst_dialect = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_dialect', variable_value: changed_dst_dialect});
				});
				//return true;
			}
		});

		var changed_show_dst = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_show_dst') {
				sendResponse({status: 'changed_show_dst processed'});
				changed_show_dst = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_show_dst', variable_value: changed_show_dst});
				});
				//return true;
			}
		});

		var changed_show_timestamp_dst = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_show_timestamp_dst') {
				sendResponse({status: 'changed_show_timestamp_dst processed'});
				changed_show_timestamp_dst = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_show_timestamp_dst', variable_value: changed_show_timestamp_dst});
				});
				//return true;
			}
		});

		var changed_dst_selected_font = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_selected_font') {
				sendResponse({status: 'changed_dst_selected_font processed'});
				changed_dst_selected_font = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_selected_font', variable_value: changed_dst_selected_font});
				});
				//return true;
			}
		});

		var changed_dst_font_size = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_font_size') {
				sendResponse({status: 'changed_dst_font_size processed'});
				changed_dst_font_size = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_font_size', variable_value: changed_dst_font_size});
				});
				//return true;
			}
		});

		var changed_dst_font_color = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_font_color') {
				sendResponse({status: 'changed_dst_font_color processed'});
				changed_dst_font_color = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_font_color', variable_value: changed_dst_font_color});
				});
				//return true;
			}
		});

		var changed_dst_container_width_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_width_factor') {
				sendResponse({status: 'changed_dst_container_width_factor processed'});
				changed_dst_container_width_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_width_factor', variable_value: changed_dst_container_width_factor});
				});
				//return true;
			}
		});

		var changed_dst_container_height_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_height_factor') {
				sendResponse({status: 'changed_dst_container_height_factor processed'});
				changed_dst_container_height_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_height_factor', variable_value: changed_dst_container_height_factor});
				});
				//return true;
			}
		});

		var changed_dst_container_top_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_top_factor') {
				sendResponse({status: 'changed_dst_container_top_factor processed'});
				changed_dst_container_top_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_top_factor', variable_value: changed_dst_container_top_factor});
				});
				//return true;
			}
		});

		var changed_dst_container_left_factor = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_left_factor') {
				sendResponse({status: 'changed_dst_container_left_factor processed'});
				changed_dst_container_left_factor = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_left_factor', variable_value: changed_dst_container_left_factor});
				});
				//return true;
			}
		});

		var changed_centerize_dst = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_centerize_dst') {
				sendResponse({status: 'changed_centerize_dst processed'});
				changed_centerize_dst = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_centerize_dst', variable_value: changed_centerize_dst});
				});
				//return true;
			}
		});

		var changed_dst_container_color = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_color') {
				sendResponse({status: 'changed_dst_container_color processed'});
				changed_dst_container_color = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_color', variable_value: changed_dst_container_color});
				});
				//return true;
			}
		});

		var changed_dst_container_opacity = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_dst_container_opacity') {
				sendResponse({status: 'changed_dst_container_opacity processed'});
				changed_dst_container_opacity = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_dst_container_opacity', variable_value: changed_dst_container_opacity});
				});
				//return true;
			}
		});

		var changed_save_dst = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_save_dst') {
				sendResponse({status: 'changed_save_dst processed'});
				changed_save_dst = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_save_dst', variable_value: changed_save_dst});
				});
				//return true;
			}
		});


		var changed_pause_threshold = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'changed_pause_threshold') {
				sendResponse({status: 'changed_pause_threshold processed'});
				changed_pause_threshold = request.data.value;
				chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					chrome.tabs.sendMessage(tab.id, {variable_name: 'changed_pause_threshold', variable_value: changed_pause_threshold});
				});
				//return true;
			}
		});


		chrome.scripting.insertCSS({
			target: {tabId:tab.id},
			files: ['js/jquery-ui.css']}),
		chrome.scripting.executeScript({
			target: {tabId:tab.id},
			files: ['js/jquery.min.js']}),
		chrome.scripting.executeScript({
			target: {tabId:tab.id},
			files: ['js/jquery-ui.min.js']}),
		chrome.scripting.executeScript({
			target: {tabId:tab.id},
			files: ['js/moment.min.js']}),
		chrome.scripting.executeScript({
			target: {tabId: tab.id},
			func: onLoad
		});


	} else {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tab.id, 'stop', function(response) {
				console.log('response =', response);
			});
		});
		chrome.storage.local.set({'recognizing' : recognizing},(()=>{}));
		chrome.action.setBadgeText({text: ''});
		chrome.action.setIcon({path: 'mic.png'});
		console.log('Start button clicked to end: recognizing =', recognizing);
		//chrome.runtime.sendMessage({ cmd: 'recognizing', data: { value: recognizing } });
		return;
	}

});


chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  
  // Create the "Settings" context menu item
  chrome.contextMenus.create({
    id: "settings",
    title: "Settings",
    contexts: ["action"],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log("Settings context menu item created");
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "settings") {
    console.log("Settings item clicked");
    chrome.tabs.create({
      url: chrome.runtime.getURL("settings.html")
    }, (newTab) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log("Settings tab opened with ID:", newTab.id);
      }
    });
  }
});
