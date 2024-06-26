var recognizing = false;


chrome.action.onClicked.addListener((tab) => {
	recognizing=!recognizing;

	if (recognizing) {
		var icon_text_listening = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'icon_text_listening') {
				icon_text_listening = request.data.value;
				chrome.action.setIcon({path: 'mic-listening.png'});
				chrome.action.setBadgeText({text: icon_text_listening});
			};
		});

		var icon_text_no_mic = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'icon_text_no_mic') {
				icon_text_no_mic = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			};
		});

		var icon_text_blocked = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'icon_text_blocked') {
				icon_text_blocked = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			};
		});

		var icon_text_denied = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd === 'icon_text_denied') {
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

	var session_start_time, session_end_time;
	var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript;
	var interim_started = false;
	var pause_timeout, pause_threshold = 5000, input_pause_threshold; // 5 seconds artificial pause threshold;
	var all_final_transcripts = [], formatted_all_final_transcripts;
	var all_translated_transcripts = [], formatted_all_translated_transcripts;
	var transcript_is_final = false;
	var displayed_transcript, displayed_translation;

	var video_info;
	var timestamp_separator = "-->";


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

	chrome.runtime.onMessage.addListener(function (response, sendResponse) {
		console.log('onload: response =', response);
	});

	chrome.storage.sync.get(['recognizing', 'src_dialect', 'dst_dialect', 'show_src', 'show_dst', 
			'show_timestamp_src', 'show_timestamp_dst', 'pause_threshold', 
			'src_selected_font', 'src_font_size', 'src_font_color', 'src_container_width_factor', 'src_container_height_factor', 
			'src_container_top_factor', 'src_container_left_factor', 'centerize_src', 'src_container_color', 'src_container_opacity', 
			'dst_selected_font', 'dst_font_size', 'dst_font_color', 'dst_container_width_factor', 'dst_container_height_factor', 
			'dst_container_top_factor', 'dst_container_left_factor', 'centerize_dst', 'dst_container_color', 'dst_container_opacity'], function(result) {

		recognizing = result.recognizing;
		console.log('onLoad: recognizing =', recognizing);

		src_dialect = result.src_dialect;
		if (!src_dialect) src_dialect = 'en-US';
		//console.log('src_dialect =',src_dialect);
		src = src_dialect.split('-')[0];
		if (src_dialect === "yue-Hant-HK") {
			src = "zh-TW";
		};
		if (src_dialect === "cmn-Hans-CN") {
			src = "zh-CN";
		};
		if (src_dialect === "cmn-Hans-HK") {
			src = "zh-CN";
		};
		if (src_dialect === "cmn-Hant-TW") {
			src = "zh-TW";
		};
		console.log('src =', src);

		dst_dialect = result.dst_dialect;
		if (!dst_dialect) dst_dialect = 'en-US';
		//console.log('dst_dialect', dst_dialect);
		dst = dst_dialect.split('-')[0];
		if (dst_dialect === "yue-Hant-HK") {
			dst = "zh-TW";
		};
		if (dst_dialect === "cmn-Hans-CN") {
			dst = "zh-CN";
		};
		if (dst_dialect === "cmn-Hans-HK") {
			dst = "zh-CN";
		};
		if (dst_dialect === "cmn-Hant-TW") {
			dst = "zh-TW";
		};
		console.log('dst =', dst);

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

		create_modal_textarea();

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
		var speech_start_time = Date.now();
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
				startTimestamp = formatTimestampToISOLocalString(new Date());
				resetPauseTimeout();

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
				speech_start_time = Date.now();
				translate_time = Date.now();
			};

			recognition.onspeechend = function(event) {
				console.log('recognition.onspeechend: recognizing =', recognizing);
				final_transcript = '';
				interim_transcript = '';
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				speech_start_time = Date.now();
				translate_time = Date.now();
			};


//---------------------------------------------------------------ONERROR--------------------------------------------------------------//

			recognition.onerror = function(event) {
				resetPauseTimeout(); // Reset timeout on error as well
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

				if (event.error === 'no-speech') {
					console.log('recognition.no-speech: recognizing =', recognizing);
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
				}
				if (event.error === 'audio-capture') {
					alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
					var icon_text_no_mic = 'NOMIC';
					chrome.runtime.sendMessage({ cmd: 'icon_text_no_mic', data: { value: icon_text_no_mic } })
					console.log('recognition.audio-capture: recognizing =', recognizing);
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
				}
				if (event.error === 'not-allowed') {
					if (Date.now() - speech_start_time < 100) {
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
				//final_transcript = '';
				//interim_transcript = '';
				session_end_time = formatTimestampToISOLocalString(new Date());
				//console.log('session_end_time =', session_end_time);

				if (!recognizing) {
					final_transcript = '';
					interim_transcript = '';

					console.log('recognition.onend: stopping because recognizing =', recognizing);

					var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
					if (t) {
						t = formatTranscript(t);
						//console.log('t =', t);
						// Split text into an array of lines
						var lines = t.trim().split('\n');
						// Use a Set to filter out duplicate lines
						var unique_lines = [...new Set(lines)];
						unique_lines = removeDuplicates(unique_lines);
						//console.log('unique_lines =', unique_lines);

						// Join the unique lines back into a single string
						var unique_text;
						var newunique_lines = [];
						var timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

						if (unique_lines.length === 1 && unique_lines[0] != '' && unique_lines[0] != 'undefined') {
							const timestamps = unique_lines[0].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
							if (!timestamps) {
								var lastunique_lines = `${session_start_time} ${timestamp_separator} ${session_end_time} : ${unique_lines[0]}`;
								//console.log('lastunique_lines =', lastunique_lines);
								unique_lines[0] = lastunique_lines;
								unique_text = newunique_lines.join('\n');
								unique_text = unique_text + '\n';
							}
						}
						else if (unique_lines.length>1 && unique_lines[unique_lines.length-1] != '' && !timestamps.test(unique_lines[unique_lines.length-1])) {
							var lastunique_lines = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${unique_lines[unique_lines.length-1]}`;
							//console.log('lastunique_lines =', lastunique_lines);
							unique_lines[unique_lines.length-1] = lastunique_lines;
							for (var i = 0; i < unique_lines.length; i++) {
								newunique_lines.push(unique_lines[i]);
							}
							//console.log('newunique_lines =', newunique_lines);
							unique_text = newunique_lines.join('\n');
							unique_text = unique_text + '\n';
						}
						else if (unique_lines.length>1 && unique_lines[unique_lines.length-1] != '' && timestamps.test(unique_lines[unique_lines.length-1])) {
							unique_text = unique_lines.join('\n');
							unique_text = unique_text + '\n';
						}

						// SAVING TRANSCRIPTIONS
						if (unique_text) {
							unique_text = unique_text.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
							unique_text = removeEmptySentences(unique_text);
							unique_text = removePeriodOnlySentences(unique_text);
							//console.log('unique_text =', unique_text);

							if (show_timestamp_src) {
								saveTranscript(unique_text);
							} else {
								saveTranscript(removeTimestamps(unique_text));
							}
						}


						// SAVING TRANSLATIONS
						if (unique_text) var tt = gtranslate(unique_text, src, dst).then((result => {
							result = result.replace(/(\d+),(\d+)/g, '$1.$2');

							result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
							result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');

							result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
							result = result.replace(/(\d{2})-\s?(\d{2})-\s?(\d{4})/g, '$1-$2-$3');

							result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
							result = result.replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{5})/g, '$1-$2-$3');

							result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');

							result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
							result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{2}-\d{2}-\d{5} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);

							result = result.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
							result = result.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

							result = result.replace('.,', '.');
							result = result.replace(',.', ',');
							result = result.replace('. .', '.');

							result = convertDatesToISOFormat(result);
							result = formatTranscript(result);

							result = result.replace(/\n\s*$/, '');

							timestamped_translated_final_and_interim_transcript = result + "\n";
							//console.log('timestamped_translated_final_and_interim_transcript =', timestamped_translated_final_and_interim_transcript);

							if (timestamped_translated_final_and_interim_transcript) {
								timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
								timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
								timestamped_translated_final_and_interim_transcript = removeEmptySentences(timestamped_translated_final_and_interim_transcript);
								timestamped_translated_final_and_interim_transcript = removePeriodOnlySentences(timestamped_translated_final_and_interim_transcript);

								if (show_timestamp_dst) {
									saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
								} else {
									saveTranslatedTranscript(removeTimestamps(timestamped_translated_final_and_interim_transcript));
								}
							}

							formatted_all_translated_transcripts = '';
							all_translated_transcripts = [];
							timestamped_translated_final_and_interim_transcript = '';
							lines = '';
							unique_lines = [];
							unique_text = '';
							t = '';

						}));
					}

					saveChangedSettings();

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
							final_transcript = final_transcript + '.\n'
							all_final_transcripts.push(`${final_transcript}`);
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

					timestamped_final_and_interim_transcript = final_transcript + '\n' + interim_transcript;

					if (containsTimestamp(timestamped_final_and_interim_transcript)) {
						timestamped_final_and_interim_transcript = formatTranscript(timestamped_final_and_interim_transcript);
						timestamped_final_and_interim_transcript = removeEmptyLines(timestamped_final_and_interim_transcript);
						if (!show_timestamp_src) {
							timestamped_final_and_interim_transcript = removePeriodOnlyLines(timestamped_final_and_interim_transcript);
						}
						//console.log('formatTranscript(timestamped_final_and_interim_transcript) =', timestamped_final_and_interim_transcript);
					}

					if (all_final_transcripts.length > 0) {
						all_final_transcripts = removeDuplicates(all_final_transcripts);
						formatted_all_final_transcripts = all_final_transcripts.join("\n");
						//console.log('formatted_all_final_transcripts =', formatted_all_final_transcripts);
					}

					if (formatted_all_final_transcripts) {
						displayed_transcript = formatted_all_final_transcripts + '\n' + interim_transcript;
						//console.log('formatted_all_final_transcripts: displayed_transcript =', displayed_transcript);
					} else {
						displayed_transcript = timestamped_final_and_interim_transcript;
						//console.log('!formatted_all_final_transcripts: displayed_transcript =', displayed_transcript);
					}
					displayed_transcript = formatTranscript(displayed_transcript);

					//console.log('displayed_transcript =', displayed_transcript);
					if (displayed_transcript) {
						// Split text into an array of lines
						var lines = displayed_transcript.trim().split('\n');
						// Use a Set to filter out duplicate lines
						var unique_lines = [...new Set(lines)];
						// Join the unique lines back into a single string
						var unique_text = unique_lines.join('\n');
						//console.log('unique_text =', unique_text);
					}

					if (unique_text && getFirstWord(unique_text).includes('undefined')) unique_text = unique_text.replace('undefined', '');

					if (unique_text) {
						unique_text = removeEmptyLines(unique_text);
						if (!show_timestamp_src) {
							unique_text = removePeriodOnlyLines(unique_text);
						}
					}

					if (show_src) {
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'block';
						if (show_timestamp_src) {
							if (unique_text && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = unique_text;
						} else {
							if (unique_text && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = removeTimestamps(unique_text);
						}
						if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
					} else {
						if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					}


					if (show_dst) {
						//var  t = unique_text; // CAN'T BE USED BECAUSE GOOGLE TRANSLATE SERVER WILL RESPOND WITH 403 AFTER SOME REQUESTS
						var t = timestamped_final_and_interim_transcript;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							if (t) var tt = gtranslate(t, src, dst).then((result => {
								if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';

								result = result.replace(/(\d+),(\d+)/g, '$1.$2');

								result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
								result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');

								result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
								result = result.replace(/(\d{2})-\s?(\d{2})-\s?(\d{4})/g, '$1-$2-$3');

								result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
								result = result.replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})/g, '$1-$2-$3');

								result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');

								result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
								result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);

								result = result.replace(/(\d{2}:\d{2}:\d{2}\.\d{3}): /g, '$1 : ');

								result = result.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
								result = result.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

								result = result.replace(/ (\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/g, /(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/);
								result = result.replace(/ (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/g, /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/);

								result = result.replace('.,', '.');
								result = result.replace(',.', ',');
								result = result.replace('. .', '.');

								result = convertDatesToISOFormat(result);
								result = formatTranscript(result);

								result = result.replace(/\n\s*$/, '');

								result = removeEmptyLines(result);

								var timestamps = result.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /);

								//console.log('transcript_is_final =', transcript_is_final);
								if (transcript_is_final) {
									//console.log('transcript_is_final');
									all_translated_transcripts.push(`${result}`);
									all_translated_transcripts = removeDuplicates(all_translated_transcripts);
									//console.log('all_translated_transcripts =', all_translated_transcripts);
									formatted_all_translated_transcripts = all_translated_transcripts.join("");
									//console.log('formatted_all_translated_transcripts =', formatted_all_translated_transcripts);
								}

								//console.log('formatted_all_translated_transcripts =', formatted_all_translated_transcripts);
								var translated_unique_text;
								if (all_translated_transcripts.length > 0) {
									all_translated_transcripts = removeDuplicates(all_translated_transcripts);
									translated_unique_text = all_translated_transcripts.join('\n');
									//console.log('translated_unique_text =', translated_unique_text);
								}

								displayed_translation = translated_unique_text + '\n' + result;
								displayed_translation = formatTranscript(displayed_translation);

								if (getFirstWord(displayed_translation).includes('undefined')) displayed_translation = displayed_translation.replace('undefined', '');

								var displayed_translation_lines = displayed_translation.trim().split('\n');
								var displayed_translation_unique_lines = [...new Set(displayed_translation_lines)];
								displayed_translation_unique_lines = removeDuplicates(displayed_translation_unique_lines);
								displayed_translation= displayed_translation_unique_lines.join('\n');

								if (show_timestamp_dst) {
									//console.log('displayed_translation =', displayed_translation);
									if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = displayed_translation;
								} else {
									//console.log('removeTimestamps(displayed_translation) =', removeTimestamps(displayed_translation));
									if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = removeTimestamps(displayed_translation);
								}

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
				speech_start_time = Date.now();
				translate_time =  Date.now();
			}


			chrome.runtime.onMessage.addListener(function (response, sendResponse) {
				console.log('on initializing: response =', response);

				if (response === 'start') {
					recognizing = true;
				}
				if (response === 'stop') {
					console.log('removing src_textarea_container from html body');
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
					console.log('removing dst_textarea_container from html body');
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
					recognizing = false;
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


		function formatTranscript(transcript) {
			// Replace URL-encoded spaces with regular spaces
			transcript = transcript.replace(/%20/g, ' ');
			transcript = transcript.trim();
			transcript = transcript.replace(/(\d{2}:\d{2}:\d{2}\.\d{3}): /g, '$1 : ');
			transcript = transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
			transcript = transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

			// Match timestamps in the transcript
			const timestamps = transcript.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /);

			if (timestamps) {
				// Split the transcript based on timestamps
				const lines = transcript.split(timestamps);

				let formattedTranscript = "";
				for (let line of lines) {
					line = line.trim();
					// Replace the separator format in the timestamps
					line = line.replace(timestamps, '$1 --> $2');

					const colon = line.match(/\s*: /);
					const parts = line.split(colon);
					if (parts.length === 2) {
						const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);
						line = parts[0] + colon + capitalizedSentence;
					}

					// Add the formatted line to the result
					if (line !== '') formattedTranscript += line.trim() + "\n";
				}
        
				const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : [^]+?)(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} -->|\s*$)/g;
				const matches = formattedTranscript.match(regex);
				if (regex && formattedTranscript) formattedTranscript = matches.join('');

				return formattedTranscript.trim(); // Trim any leading/trailing whitespace from the final result

			} else {
				return transcript.trim();
			}
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
			const nonEmptyLines = lines.filter(line => line.trim() !== '.');
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


		function removeDuplicates(transcript_array) {
			// Create a Set to store unique entries
			let unique_transcript_array = new Set();

			// Iterate through each transcript
			transcript_array.forEach(transcript => {
				// Split the transcript by newline to get individual lines
				let lines = transcript.split('\n');

				// Add each line to the Set (Sets automatically handle duplicates)
				lines.forEach(line => {
					if (line !== '') {
						unique_transcript_array.add(line.trim());
					}
				});
			});

			// Convert the Set back to an array and return it
			return Array.from(unique_transcript_array);
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
				recognition.stop();
			}, pause_threshold);
		}


		function create_modal_textarea() {
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
			//console.log('vContainer =', vContainer);

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
			document.querySelector("#src_textarea").style.fontSize = String(src_font_size)+'px';

			document.querySelector("#src_textarea").offsetParent.onresize = (function(){

				if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
					centerize_src = false;
					saveData('centerize_src', centerize_src);
				}

				document.querySelector("#src_textarea").style.position='absolute';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';

				video_info = getVideoPlayerInfo();
				if (video_info) {
					//console.log('src_width =', getRect(document.querySelector("#src_textarea")).width);
					//console.log('video_info.width =', video_info.width);
					src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/video_info.width;
					if (src_container_width_factor < 0) {
						src_container_width_factor = 0;
					}
					//console.log('src_container_width_factor =', src_container_width_factor);
					saveData('src_container_width_factor', src_container_width_factor);

					//console.log('src_height =', getRect(document.querySelector("#src_textarea")).height);
					//console.log('video_info.height =', video_info.height);
					src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/video_info.height;
					if (src_container_height_factor < 0) {
						src_container_height_factor = 0;
					}
					//console.log('src_container_height_factor =', src_container_height_factor);
					saveData('src_container_height_factor', src_container_height_factor);
				} else {
					//console.log('src_width =', getRect(document.querySelector("#src_textarea")).width);
					//console.log('window.innerWidth =', window.innerWidth);
					src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/window.innerWidth;
					if (src_container_width_factor < 0) {
						src_container_width_factor = 0;
					}
					//console.log('src_container_width_factor =', src_container_width_factor);
					saveData('src_container_width_factor', src_container_width_factor);

					//console.log('src_height =', getRect(document.querySelector("#src_textarea")).height);
					//console.log('window.innerHeight =', window.innerHeight);
					src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/window.innerHeight;
					if (src_container_height_factor < 0) {
						src_container_height_factor = 0;
					}
					//console.log('src_container_height_factor =', src_container_height_factor);
					saveData('src_container_height_factor', src_container_height_factor);
				}
			});


			document.querySelector("#src_textarea").offsetParent.ondrag = (function(){

				if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
					centerize_src = false;
					saveData('centerize_src', centerize_src);
				}

				document.querySelector("#dst_textarea").style.position='absolute';

				video_info = getVideoPlayerInfo();
				if (video_info) {
					src_container_top_factor = (getRect(document.querySelector("#src_textarea_container")).top - video_info.top)/video_info.height;
					//if (src_container_top_factor < 0) {
					//	src_container_top_factor = 0;
					//}
					//console.log('src_container_top_factor =', src_container_top_factor);
					saveData("src_container_top_factor", src_container_top_factor);

					src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/video_info.width;
					//if (src_container_left_factor < 0) {
					//	src_container_left_factor = 0;
					//}
					//console.log('src_container_left_factor =', src_container_left_factor);
					saveData("src_container_left_factor", src_container_left_factor);
				} else {
					src_container_top_factor = getRect(document.querySelector("#src_textarea_container")).top/window.innerHeight;
					//if (src_container_top_factor < 0) {
					//	src_container_top_factor = 0;
					//}
					//console.log('src_container_top_factor =', src_container_top_factor);
					saveData("src_container_top_factor", src_container_top_factor);

					src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/window.innerWidth;
					//if (src_container_left_factor < 0) {
					//	src_container_left_factor = 0;
					//}
					//console.log('src_container_left_factor =', src_container_left_factor);
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
				console.log('dst_textarea_container has already exist');
			};

			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';
			document.querySelector("#dst_textarea").style.border = 'none';
			document.querySelector("#dst_textarea").style.display = 'inline-block';
			document.querySelector("#dst_textarea").style.overflow = 'hidden';

			document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif"
			document.querySelector("#dst_textarea").style.color = dst_font_color;
			document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);
			document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size)+'px';

			document.querySelector("#dst_textarea").offsetParent.onresize = (function(){

				if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
					centerize_dst = false;
					saveData('centerize_dst', centerize_dst);
				}

				document.querySelector("#dst_textarea").style.position='absolute';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';

				video_info = getVideoPlayerInfo();
				if (video_info) {
					//console.log('dst_width =', getRect(document.querySelector("#dst_textarea")).width);
					//console.log('video_info.width =', video_info.width);
					dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/video_info.width;
					if (dst_container_width_factor < 0) {
						dst_container_width_factor = 0;
					}
					//console.log('dst_container_width_factor =', dst_container_width_factor);
					saveData('dst_container_width_factor', dst_container_width_factor);

					//console.log('dst_height =', getRect(document.querySelector("#dst_textarea")).height);
					//console.log('video_info.height =', video_info.height);
					dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/video_info.height;
					if (dst_container_height_factor < 0) {
						dst_container_height_factor = 0;
					}
					//console.log('dst_container_height_factor =', dst_container_height_factor);
					saveData('dst_container_height_factor', dst_container_height_factor);
				} else {
					//console.log('dst_width =', getRect(document.querySelector("#dst_textarea")).width);
					//console.log('window.innerWidth =', window.innerWidth);
					dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/window.innerWidth;
					if (dst_container_width_factor < 0) {
						dst_container_width_factor = 0;
					}
					//console.log('dst_container_width_factor =', dst_container_width_factor);
					saveData('dst_container_width_factor', dst_container_width_factor);

					//console.log('dst_height =', getRect(document.querySelector("#dst_textarea")).height);
					//console.log('video_info.height =', video_info.height);
					dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/window.innerHeight;
					if (dst_container_height_factor < 0) {
						dst_container_height_factor = 0;
					}
					//console.log('dst_container_height_factor =', dst_container_height_factor);
					saveData('dst_container_height_factor', dst_container_height_factor);
				}
			});


			document.querySelector("#dst_textarea").offsetParent.ondrag = (function(){

				if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
					centerize_dst = false;
					saveData('centerize_dst', centerize_dst);
				}

				document.querySelector("#dst_textarea").style.position='absolute';

				if (video_info) {
					dst_container_top_factor = (getRect(document.querySelector("#dst_textarea_container")).top - video_info.top)/video_info.height;
					//if (dst_container_top_factor < 0) {
					//	dst_container_top_factor = 0;
					//}
					//console.log('dst_container_top_factor =', dst_container_top_factor);
					saveData("dst_container_top_factor", dst_container_top_factor);

					dst_container_left_factor = (getRect(document.querySelector("#dst_textarea_container")).left - video_info.left)/video_info.width;
					//if (dst_container_left_factor < 0) {
					//	dst_container_left_factor = 0;
					//}
					//console.log('dst_container_left_factor =', dst_container_left_factor);
					saveData("dst_container_left_factor", dst_container_left_factor);
				} else {
					dst_container_top_factor = getRect(document.querySelector("#dst_textarea_container")).top/window.innerHeight;
					//if (dst_container_top_factor < 0) {
					//	dst_container_top_factor = 0;
					//}
					//console.log('dst_container_top_factor =', dst_container_top_factor);
					saveData("dst_container_top_factor", dst_container_top_factor);

					dst_container_left_factor = getRect(document.querySelector("#dst_textarea_container")).left/window.innerWidth;
					//if (dst_container_left_factor < 0) {
					//	dst_container_left_factor = 0;
					//}
					//console.log('dst_container_left_factor =', dst_container_left_factor);
					saveData("dst_container_left_factor", dst_container_left_factor);
				}
			});
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
				document.querySelector("#src_textarea").style.fontSize = String(src_font_size)+'px';
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
				document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size)+'px';
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
			//console.log('elements =',  elements);
			var largestVideoElement = null;
			var largestSize = 0;

			for (var i = 0; i < elements.length; i++) {
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
			for (var i = 0; i < elements.length; i++) {
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
				// Retrieve current settings
				chrome.storage.sync.get(['settings'], (result) => {
					let settings = result.settings || {};
					settings[key] = data;
					chrome.storage.sync.set({ 'settings': settings }, () => {
						console.log(key + ' data saved within settings.');
						setTimeout(() => {
							verifyData(key, data, 'settings');
						}, 100);
					});
				});
			}, 1000);
		}


		function verifyData(key, data, parentKey = null) {
			chrome.storage.sync.get([parentKey || key], (result) => {
				if (parentKey) {
					console.log(result[parentKey][key] === data ? 'Data verified.' : 'Data verification failed.');
				} else {
					console.log(result[key] === data ? 'Data verified.' : 'Data verification failed.');
				}
			});
		}


		function saveChangedSettings() {
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
			chrome.storage.sync.set(settings, function() {
				if (chrome.runtime.lastError) {
					console.error("Error setting data: ", chrome.runtime.lastError);
				} else {
					// Log saved values for debugging
					for (const [key, value] of Object.entries(settings)) {
						console.log(`save ${key} = `, value);
					}
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

	});

}
