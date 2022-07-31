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
		//chrome.action.setBadgeBackgroundColor( {color: '#ff0000'});

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
		console.log('Start button clicked to end: recognizing =', recognizing);
		chrome.storage.sync.set({'recognizing' : recognizing},(()=>{}));
		chrome.action.setBadgeText({text: ''});
		chrome.action.setIcon({path: 'mic.png'});
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tab.id,'stop');
		});
		return;
	}
});

function onLoad() {

	var recognition, recognizing, langInput, langOutput, dialect, translate_dialect;

	chrome.runtime.onMessage.addListener(function (response, sendResponse) {
		console.log('response =', response);
		if (response = 'start') {
			//console.log('got message =', response)
			recognizing=true;
		}
		if (response = 'stop') {
			//console.log('got message =', response)
			recognizing=false;
			final_transcript = '';
			interim_transcript = '';
			hide_textareaBox();
			remove_textareaBox();
			try{
				recognition.stop()
			}
			catch(t){
				console.log("recognition.stop() failed",t)
			}
			return;
		}
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
					src_textarea_container$
						.css({
							'background-color': 'transparent',
							'color': 'yellow',
							'border': 'none'
						});
					src_textarea.style.width = String(0.5*window.innerWidth)+'px';
					src_textarea.style.height = String(0.09*window.innerHeight)+'px';
					src_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
					src_textarea.style.border = 'none';
					src_textarea.style.overflow = 'hidden';
				},
				stop: function (){
					$('#src_textarea').focus();
					src_textarea_container$
						.css({
							'background-color': 'transparent',
							'color': 'yellow',
							'border': 'none'
						});
					src_textarea.style.width = String(0.5*window.innerWidth)+'px';
					src_textarea.style.height = String(0.09*window.innerHeight)+'px';
					src_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
					src_textarea.style.border = 'none';
					src_textarea.style.overflow = 'hidden';
				}
			})
			.css({
				'position': 'absolute',
				'background-color': 'transparent',
				'color': 'yellow',
				'border': 'none',
				'display': 'block',
				'z-index': '2147483647'
			})
			.offset({top:0.1*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})
			.appendTo('body')

		src_textarea.style.width = String(0.5*window.innerWidth)+'px';
		src_textarea.style.height = String(0.09*window.innerHeight)+'px';
		src_textarea.style.color = 'yellow';
		src_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
		src_textarea.style.border = 'none';
		//src_textarea.style.display = 'inline-block';
		$('#src_textarea').css({'display':'inline-block'});
		src_textarea.style.overflow = 'hidden';

		h0 = $('#src_textarea').height();
		src_textarea.style.fontSize=String(0.28*h0)+'px';
		src_textarea.offsetParent.onresize = (function(){
			h = $('#src_textarea').height();
			src_textarea.style.fontSize=String(0.28*h)+'px';
		});

		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(0.5*window.innerWidth)
			.height(0.09*window.innerHeight)
			.resizable().draggable({
				cancel: 'text',
				start: function (){
					$('#dst_textarea').focus();
					dst_textarea_container$
						.css({
							'background-color': 'transparent',
							'color': 'yellow',
							'border': 'none'
						});
					dst_textarea.style.width = String(0.5*window.innerWidth)+'px';
					dst_textarea.style.height = String(0.09*window.innerHeight)+'px';
					dst_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
					dst_textarea.style.border = 'none';
					dst_textarea.style.overflow = 'hidden';
				},
				stop: function (){
					$('#dst_textarea').focus();
					dst_textarea_container$
						.css({
							'background-color': 'transparent',
							'color': 'yellow',
							'border': 'none'
						});
					dst_textarea.style.width = String(0.5*window.innerWidth)+'px';
					dst_textarea.style.height = String(0.09*window.innerHeight)+'px';
					dst_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
					dst_textarea.style.border = 'none';
					dst_textarea.style.overflow = 'hidden';
				}
			})
			.css({
				'position': 'absolute',
				'background-color': 'transparent',
				'color': 'yellow',
				'border': 'none',
				'display': 'block',
				'z-index': '2147483647'
			})
			.offset({top:0.65*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})
			.appendTo('body')

		dst_textarea.style.width = String(0.5*window.innerWidth)+'px';
		dst_textarea.style.height = String(0.09*window.innerHeight)+'px';
		dst_textarea.style.color = 'yellow';
		dst_textarea.style.backgroundColor = 'rgba(0,0,0,0.3)';
		dst_textarea.style.border = 'none';
		//dst_textarea.style.display = 'inline-block';
		$('#dst_textarea').css({'display':'inline-block'});
		dst_textarea.style.overflow = 'hidden';

		th0 = $('#dst_textarea').height();
		dst_textarea.style.fontSize=String(0.28*h0)+'px';
		dst_textarea.offsetParent.onresize = (function(){
			th = $('#dst_textarea').height();
			dst_textarea.style.fontSize=String(0.28*th)+'px';
		});

		window.addEventListener('resize', function(event){
			src_textarea_container.style.width = String(0.5*window.innerWidth)+'px';
			src_textarea_container.style.height = String(0.1*window.innerHeight)+'px';
			src_textarea_container.style.top = String(0.1*window.innerHeight)+'px';
			src_textarea_container.style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

			src_textarea.style.width = String(0.5*window.innerWidth)+'px';
			src_textarea.style.height = String(0.09*window.innerHeight)+'px';

			h0 = $('#src_textarea').height();
			src_textarea.style.fontSize=String(0.28*h0)+'px';
			src_textarea.offsetParent.onresize = (function(){
				h = $('#src_textarea').height();
				src_textarea.style.fontSize=String(0.28*h)+'px';
				src_textarea.scrollTop=src_textarea.scrollHeight;
			});

			dst_textarea_container.style.width = String(0.5*window.innerWidth)+'px';
			dst_textarea_container.style.height = String(0.1*window.innerHeight)+'px';
			dst_textarea_container.style.top = String(0.65*window.innerHeight)+'px';
			dst_textarea_container.style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

			dst_textarea.style.width = String(0.5*window.innerWidth)+'px';
			dst_textarea.style.height = String(0.09*window.innerHeight)+'px';

			th0 = $('#dst_textarea').height();
			dst_textarea.style.fontSize=String(0.28*h0)+'px';
			dst_textarea.offsetParent.onresize = (function(){
				th = $('#dst_textarea').height();
				dst_textarea.style.fontSize=String(0.28*th)+'px';
				dst_textarea.scrollTop=dst_textarea.scrollHeight;
			});
		});

		if (!recognizing) {
			final_transcript = '';
			interim_transcript = '';
			remove_textareaBox();
			console.log('recognition.onstart: stopping because recognizing =', recognizing);
			try{
				recognition.stop()
			}
			catch(t){
				console.log("recognition.stop() failed",t)
			}
			return;
		}

		console.log('initializing recognition: recognizing =', recognizing);

		hide_textareaBox();
		var final_transcript = '';
		var interim_transcript = '';
		var start_timestamp = Date.now();
		var translate_time = Date.now();

		console.log((!(('webkitSpeechRecognition'||'SpeechRecognition') in window)));

		if (!(('webkitSpeechRecognition'||'SpeechRecognition') in window)) {
			upgrade_info();
		} else {
			var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = dialect;

			recognition.onstart = function() {
				if (!recognizing) {
					recognizing = false;
					final_transcript = '';
					interim_transcript = '';
					remove_textareaBox();
					console.log('recognition.onstart: stopping because recognizing =', recognizing);
					try{
						recognition.stop()
					}
					catch(t){
						console.log("recognition.stop() failed",t)
					}
						return;
				} else {
					console.log('recognition.onstart: recognizing =', recognizing);
					final_transcript = '';
					interim_transcript = '';
					hide_textareaBox();
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
				hide_textareaBox();
				start_timestamp = Date.now();
				translate_time = Date.now();
			};

			recognition.onerror = function(event) {
				if (event.error == 'no-speech') {
					console.log('recognition.no-speech: recognizing =', recognizing);
				}
				if (event.error == 'audio-capture') {
					alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
					var icon_text_no_mic = 'NOMIC';
					chrome.runtime.sendMessage({ cmd: 'icon_text_no_mic', data: { value: icon_text_no_mic } })
					console.log('recognition.audio-capture: recognizing =', recognizing);
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
					console.log('recognition.not-allowed: recognizing =', recognizing);
				}
			};

			recognition.onend = function() {
				if (!recognizing) {
					final_transcript='';
					interim_transcript='';
					console.log('recognition.onend: stopping because recognizing =', recognizing);
					return;
				} else {
					console.log('recognition.onend: keep recognizing because recognizing =', recognizing);
					//recognition.stop();
					//setTimeout(function(){ recognition.start(); }, 400);
					hide_textareaBox();
					recognition.start();
					start_timestamp = Date.now();
					translate_time =  Date.now();
					//return;
				}
			};

			recognition.onresult = function(event) {
				console.log('recognition.onresult: recognizing =', recognizing);

				if (!recognizing) {
					final_transcript='';
					interim_transcript='';
					hide_textareaBox();
					remove_textareaBox();
					console.log('recognition.onresult: stopping because recognizing =', recognizing);
					try{
						recognition.stop()
					}
					catch(t){
						console.log("recognition.stop() failed",t)
					}
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
						//src_textarea.style.display='inline-block';
						$('#src_textarea').css({'display':'inline-block'});
						src_textarea.innerHTML=final_transcript + interim_transcript;
						src_textarea.scrollTop=src_textarea.scrollHeight;
					}

					//console.log('show_translation =', show_translation);
					if (show_translation) {
						var  t = final_transcript + interim_transcript;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							simple_translate(t, langInput, langOutput);
							translate_time = Date.now();
						};
					}
				}
			};

			if (recognizing) {
				console.log('starting recognition: recognizing =', recognizing);
				recognition.start();
				//setTimeout(function(){ recognition.start(); }, 400);
				start_timestamp = Date.now();
				translate_time =  Date.now();
			}
		}

		function upgrade_info() {
			alert('Web Speech API is not supported by this browser. upgrade_info to Chrome version 25 or later');
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

		function hide_textareaBox() {
			src_textarea.innerHTML='';
			//src_textarea.style.display='none';
			$('#src_textarea').css({'display':'none'});
			dst_textarea.innerHTML='';
			//dst_textarea.style.display='none';
			$('#dst_textarea').css({'display':'none'});
		}
		
		function remove_textareaBox() {
			console.log('removing elements');
			//if (typeof(src_textarea) != 'undefined' && src_textarea != null) {
				src_textarea.parentElement.removeChild(src_textarea);
			//}
			//if (typeof(src_textarea_container) != 'undefined' && src_textarea_container != null) {
				src_textarea_container.parentElement.removeChild(src_textarea_container);
			//}
			//if (typeof(dst_textarea) != 'undefined' && dst_textarea != null) {
				dst_textarea.parentElement.removeChild(dst_textarea);
			//}
			//if (typeof(dst_textarea_container) != 'undefined' && dst_textarea_container != null) {
				dst_textarea_container.parentElement.removeChild(dst_textarea_container);
			//}
		}

		function show_textareaBox() {
			//src_textarea.style.display='inline-block';
			$('#src_textarea').css({'display':'inline-block'});
			src_textarea.innerHTML='';
			//dst_textarea.style.display='inline-block';
			$('#dst_textarea').css({'display':'inline-block'});
			dst_textarea.innerHTML='';
		}

		function load(url, callback) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() { 
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
					return callback(JSON.parse(xmlHttp.responseText));
				}
			}
			xmlHttp.open('GET', url, true);
			xmlHttp.send(null);
			return xmlHttp.onreadystatechange();
		}

		function simple_translate(text, langInput, langOutput) {
			var i=0, r='', translation='';
			const url = 'https://clients5.google.com/translate_a/';
			var params = 'single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl='+langInput+'&tl='+langOutput+'&q='+text;
			var tr=load(url+params, function(response) {
				//console.log(response);
				for (i = 0, len = response.sentences.length; i < len; i++) {
					r=(((response.sentences[i].trans).replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
					/*if (r.includes('}'||')'||'%20')) {
						r=((r.replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
					}*/
					//r=((r.replace('}','')).replace(')','')).replace('\%20/g', ' ');
					//r=((r.replace('}','')).replace(')','')).replace('\%20/g', ' ');
					translation += r;
				};
				if (translation.includes('}'||')'||'%20')) {
					translation=((translation.replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
				}
				if (recognizing) {
					//dst_textarea_container$.css({'display':'block'});
					//dst_textarea.style.display = 'inline-block';
					$('#dst_textarea').css({'display':'inline-block'});
					dst_textarea.innerHTML=translation;
					dst_textarea.scrollTop=dst_textarea.scrollHeight;
				} else {
					dst_textarea.innerHTML='';
					//dst_textarea_container$.css({'display':'none'});
					//dst_textarea.style.display='none';
					$('#dst_textarea').css({'display':'none'});
				}
				return translation;
			});
			return tr;
		}
	});
}
