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
			}
		});

		var icon_text_no_mic = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_no_mic') {
				icon_text_no_mic = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			}
		});

		var icon_text_blocked = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_blocked') {
				icon_text_blocked = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			}
		});

		var icon_text_denied = '';
		chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
			if (request.cmd == 'icon_text_denied') {
				icon_text_denied = request.data.value;
				chrome.action.setIcon({path: 'mic-slashed.png'});
			}
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
			func: 	onLoad
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
	}
});



function onLoad() {

	var action, recognition, recognizing, src, dst, src_dialect, dst_dialect;
	var srt_id = 0, srt_time = 0, speech_start_time = 0, speech_end_time = 0, srt_transcript = '';
	var srt_time_hh = 0, srt_time_mm = 0, srt_time_ss = 0;
	var speech_start_time_hh = 0, speech_start_time_mm = 0, speech_start_time_ss = 0;
	var speech_end_time_hh = 0, speech_end_time_mm = 0, speech_end_time_ss = 0;
	var srt_time = 0;
	var a = '', b = '', c = '';
	var transcript = [];

	chrome.runtime.onMessage.addListener(function (response, sendResponse) {
		console.log('onload: response =', response);
	});

	chrome.storage.sync.get([ 'recognizing', 'src_dialect', 'dst_dialect', 'show_original', 'show_translation'], function(result) {

		recognizing = result.recognizing;
		console.log('onLoad: recognizing =', recognizing);

		src_dialect = result.src_dialect;
		if (!src_dialect) src_dialect='en-US';
		//console.log('src_dialect =',src_dialect);
		src = src_dialect.split('-')[0];
		if (src_dialect == "yue-Hant-HK") {
			src = "zh-TW";
		}
		if (src_dialect == "cmn-Hans-CN") {
			src = "zh-CN";
		}
		if (src_dialect == "cmn-Hans-HK") {
			src = "zh-CN";
		}
		if (src_dialect == "cmn-Hant-TW") {
			src = "zh-TW";
		}
		//console.log('src = ', src);

		dst_dialect = result.dst_dialect;
		if (!dst_dialect) dst_dialect='en-US';
		//console.log('dst_dialect', dst_dialect);
		dst = dst_dialect.split('-')[0];
		if (dst_dialect == "yue-Hant-HK") {
			dst = "zh-TW";
		}
		if (dst_dialect == "cmn-Hans-CN") {
			dst = "zh-CN";
		}
		if (dst_dialect == "cmn-Hans-HK") {
			dst = "zh-CN";
		}
		if (dst_dialect == "cmn-Hant-TW") {
			dst = "zh-TW";
		}
		//console.log('dst = ', dst);

		show_original = result.show_original;
		//console.log('show_original =', result.show_original);
		show_translation = result.show_translation;
		//console.log('show_translation', result.show_translation);


		var icon_text_listening = src.toUpperCase()+':'+dst.toUpperCase();
		chrome.runtime.sendMessage({ cmd: 'icon_text_listening', data: { value: icon_text_listening } })

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
			.width(0.5*window.innerWidth)
			.height(0.09*window.innerHeight)
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
				'background-color': 'rgba(0,0,0,0.3)',
				'color': 'yellow',
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:0.1*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

		if (!document.querySelector("#src_textarea_container")) {
			console.log('appending src_textarea_container to html body');
			src_textarea_container$.appendTo('body');
		} else {
			console.log('src_textarea_container has already exist');
		}

		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		document.querySelector("#src_textarea").style.color = 'yellow';
		document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		src_h0 = $('#src_textarea').height();
		document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
		document.querySelector("#src_textarea").offsetParent.onresize = (function(){
			src_h = $('#src_textarea').height();
			document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
		});

		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(0.5*window.innerWidth)
			.height(0.09*window.innerHeight)
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
				'background-color': 'rgba(0,0,0,0.3)',
				'color': 'yellow',
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:0.65*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

		if (!document.querySelector("#dst_textarea_container")) {
			console.log('appending dst_textarea_container to html body');
			dst_textarea_container$.appendTo('body');
		} else {
			console.log('src_textarea_container has already exist');
		}

		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		document.querySelector("#dst_textarea").style.color = 'yellow';
		document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		dst_h0 = $('#dst_textarea').height();
		document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h0)+'px';
		document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
			dst_h = $('#dst_textarea').height();
			document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
		});

		window.addEventListener('resize', function(event){
			if (document.querySelector("#src_textarea_container")) {
				document.querySelector("#src_textarea_container").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#src_textarea_container").style.height = String(0.1*window.innerHeight)+'px';
				document.querySelector("#src_textarea_container").style.top = String(0.1*window.innerHeight)+'px';
				document.querySelector("#src_textarea_container").style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

				var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
					.width(0.5*window.innerWidth)
					.height(0.09*window.innerHeight)
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
						'background-color': 'rgba(0,0,0,0.3)',
						'color': 'yellow',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:0.1*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

				document.querySelector("#src_textarea").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#src_textarea").style.height = String(0.09*window.innerHeight)+'px';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';
				document.querySelector("#src_textarea").style.color = 'yellow';
				document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#src_textarea").style.border = 'none';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").style.overflow = 'hidden';

				src_h0 = $('#src_textarea').height();
				document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
				if (document.querySelector("#src_textarea").offsetParent) {
					document.querySelector("#src_textarea").offsetParent.onresize = (function(){
						src_h = $('#src_textarea').height();
						document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
						document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
					});
				}
			}

			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#dst_textarea_container").style.height = String(0.1*window.innerHeight)+'px';
				document.querySelector("#dst_textarea_container").style.top = String(0.65*window.innerHeight)+'px';
				document.querySelector("#dst_textarea_container").style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

				var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
					.width(0.5*window.innerWidth)
					.height(0.09*window.innerHeight)
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
						'background-color': 'rgba(0,0,0,0.3)',
						'color': 'yellow',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:0.65*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

				document.querySelector("#dst_textarea").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#dst_textarea").style.height = String(0.09*window.innerHeight)+'px';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				document.querySelector("#dst_textarea").style.color = 'yellow';
				document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#dst_textarea").style.border = 'none';
				document.querySelector("#dst_textarea").style.display = 'inline-block';
				document.querySelector("#dst_textarea").style.overflow = 'hidden';

				dst_h0 = $('#dst_textarea').height();
				document.querySelector("#dst_textarea").style.fontSize=String(0.28*src_h0)+'px';
				if (document.querySelector("#dst_textarea").offsetParent) {
					document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
						dst_h = $('#dst_textarea').height();
						document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
						document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
					});
				}
			}
		});

		if (!recognizing) {
			final_transcript = '';
			interim_transcript = '';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('onload: stopping because recognizing =', recognizing);
			return;
		}


		console.log('initializing recognition: recognizing =', recognizing);

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

			recognition.onstart = function() {
				final_transcript = '';
				interim_transcript = '';

//---------------------------------------------------------------ONSTART--------------------------------------------------------------//

				var now = Date.now();
				var date = new Date(now);
				srt_time = Date.now();
				srt_time_hh = date.getHours();
				srt_time_mm = date.getMinutes();
				srt_time_ss = date.getSeconds();

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

			recognition.onerror = function(event) {
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

			recognition.onend = function() {
				final_transcript='';
				interim_transcript='';
				if (!recognizing) {
					console.log('recognition.onend: stopping because recognizing =', recognizing);
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

				if (!recognizing) {
					final_transcript='';
					interim_transcript='';
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					console.log('recognition.onresult: stopping because recognizing =', recognizing);
					return;
				} else {
					recognition.lang=src_dialect;
					var interim_transcript = '';
					for (var i = event.resultIndex; i < event.results.length; ++i) {
						if (event.results[i].isFinal) {
							final_transcript += event.results[i][0].transcript;
							final_transcript = final_transcript + '. '
							final_transcript = capitalize(final_transcript);
							final_transcript = remove_linebreak(final_transcript);
						} else {
							interim_transcript += event.results[i][0].transcript;
							interim_transcript = remove_linebreak(interim_transcript);
						}
					}

					//console.log('show_original =', result.show_original);
					if (show_original) {
						document.querySelector("#src_textarea_container").style.display = 'block';
						document.querySelector("#src_textarea").innerHTML = final_transcript + interim_transcript;
						document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
					}

					/*var now = Date.now();
					var date = new Date(now);
					speech_start_time_hh = date.getHours();
					speech_start_time_mm = date.getMinutes();
					speech_start_time_ss = date.getSeconds();
					speech_start_time = ("0" + (speech_start_time_hh)).slice(-2) + ':' + ("0" + (speech_start_time_mm)).slice(-2) + ':' + ("0" + (speech_start_time_ss)).slice(-2);*/


					if (Date.now() - srt_time > 5000) {

						speech_start_time_hh = srt_time_hh;
						speech_start_time_mm = srt_time_mm;
						speech_start_time_ss = srt_time_ss;
						speech_start_time = ("0" + (speech_start_time_hh)).slice(-2) + ':' + ("0" + (speech_start_time_mm)).slice(-2) + ':' + ("0" + (speech_start_time_ss)).slice(-2);

						srt_id += 1;
						now = Date.now();
						date = new Date(now);
						speech_end_time_hh = date.getHours();
						speech_end_time_mm = date.getMinutes();
						speech_end_time_ss = date.getSeconds();

						//speech_end_time = ("0" + (speech_end_time_hh-srt_time_hh)).slice(-2) + ':' + ("0" + (speech_end_time_mm-srt_time_mm)).slice(-2) + ':' + ("0" + (speech_end_time_ss-srt_time_ss)).slice(-2);
						speech_end_time = ("0" + (speech_end_time_hh)).slice(-2) + ':' + ("0" + (speech_end_time_mm)).slice(-2) + ':' + ("0" + (speech_end_time_ss)).slice(-2);

						a = final_transcript + interim_transcript;
						console.log('a =', a);
						if (srt_id === 0) {
							b = ' ';
						}
						if (srt_id > 0) {
							b = transcript[srt_id-1];
						}
						console.log('b =', b);
						transcript[srt_id] = a;
						if (srt_id === 0) {
							c = a;
						}
						if (srt_id > 0) {
							c = a.substring(b.length);
						}
						console.log('c =', c);
						srt_transcript = String(srt_id) + ' ' + String(speech_start_time) + ' ' + String(speech_end_time) + ' ' + c + '\n';
						console.log(srt_transcript);

						speech_start_time = speech_end_time;
						//b = a;
						//console.log('b =', b);

						srt_time = Date.now();
						srt_time_hh = date.getHours();
						srt_time_mm = date.getMinutes();
						srt_time_ss = date.getSeconds();
					}


					//console.log('show_translation =', show_translation);
					if (show_translation) {
						var  t = final_transcript + interim_transcript;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							if (t) var tt=translate(t,src,dst).then((result => {
								if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value=result;
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop = document.querySelector("#dst_textarea").scrollHeight;
							}));
							translate_time = Date.now();
						};
					}
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
		}


		var two_line = /\n\n/g;
		var one_line = /\n/g;
		function linebreak(s) {
			return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
		}

		function remove_linebreak(s) {
			return s.replace(two_line, '').replace(one_line, '');
		}

		var first_char = /\S/;
		function capitalize(s) {
			return s.replace(first_char, function(m) { return m.toUpperCase(); });
		}

		var translate = async (t,src,dst) => {
			var tt = new Promise(function(resolve) {
				var i=0, len=0, r='', tt='';
				const url = 'https://clients5.google.com/translate_a/';
				var params = 'single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl='+src+'&tl='+dst+'&q='+t;
				var xmlHttp = new XMLHttpRequest();
				var response;
				xmlHttp.onreadystatechange = function(event) {
					if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
						response = JSON.parse(xmlHttp.responseText);
						for (var i = 0, len = response.sentences?.length; i < len; i++) {
							var r=(((response.sentences[i].trans).replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
							r=((r.replace('}','')).replace(')','')).replace('\%20/g', ' ');
							tt += r;
						}
						if (tt.includes('}'||')'||'%20')) {
							tt=((tt.replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
						}
						resolve(tt);
					}
				}
				xmlHttp.open('GET', url+params, true);
				xmlHttp.send(null);
				xmlHttp.onreadystatechange();
			});
			return await tt;
		}
	});
}
