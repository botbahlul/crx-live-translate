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

	var action, recognition, recognizing, langInput, langOutput, dialect, translate_dialect;

	chrome.runtime.onMessage.addListener(function (response, sendResponse) {
		console.log('onload: response =', response);
	});

	chrome.storage.sync.get([ 'recognizing', 'dialect', 'translate_dialect', 'show_original', 'show_translation'], function(result) {

		recognizing = result.recognizing;
		console.log('onLoad: recognizing =', recognizing);

		dialect = result.dialect;
		if (!dialect) dialect='en-US';
		//console.log('dialect =',dialect);
		langInput=dialect.split('-')[0];
		//console.log('langInput = ', langInput);

		translate_dialect = result.translate_dialect;
		if (!translate_dialect) translate_dialect='en-US';
		//console.log('translate_dialect', translate_dialect);
		langOutput=translate_dialect.split('-')[0];
		//console.log('langOutput = ', langOutput);

		show_original = result.show_original;
		//console.log('show_original =', result.show_original);
		show_translation = result.show_translation;
		//console.log('show_translation', result.show_translation);


		var icon_text_listening = langInput.toUpperCase()+':'+langOutput.toUpperCase();
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

				document.querySelector("#src_textarea").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#src_textarea").style.height = String(0.09*window.innerHeight)+'px';

				src_h0 = $('#src_textarea').height();
				document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
				document.querySelector("#src_textarea").offsetParent.onresize = (function(){
					src_h = $('#src_textarea').height();
					document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
					document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
				});
			}

			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#dst_textarea_container").style.height = String(0.1*window.innerHeight)+'px';
				document.querySelector("#dst_textarea_container").style.top = String(0.65*window.innerHeight)+'px';
				document.querySelector("#dst_textarea_container").style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

				document.querySelector("#dst_textarea").style.width = String(0.5*window.innerWidth)+'px';
				document.querySelector("#dst_textarea").style.height = String(0.09*window.innerHeight)+'px';

				dst_h0 = $('#dst_textarea').height();
				document.querySelector("#dst_textarea").style.fontSize=String(0.28*src_h0)+'px';
				document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
					dst_h = $('#dst_textarea').height();
					document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
					document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
				});
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


		console.log('Initializing recognition: recognizing =', recognizing);

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
			recognition.lang = dialect;

			recognition.onstart = function() {
				final_transcript = '';
				interim_transcript = '';
				if (!recognizing) {
					recognizing = false;
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
					if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
					console.log('recognition.onstart: stopping because recognizing =', recognizing);
					return;
				} else {
					console.log('recognition.onstart: recognizing =', recognizing);
					recognition.lang = dialect;
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
					recognition.lang=dialect;
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
						document.querySelector("#src_textarea").innerHTML=final_transcript + interim_transcript;
						document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
					}

					//console.log('show_translation =', show_translation);
					if (show_translation) {
						var  t = final_transcript + interim_transcript;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							if (t) var tt=translate(t,langInput,langOutput).then((result => {
								if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value=result;
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
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
					if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
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
