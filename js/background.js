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
	};
});


function onLoad() {

	var action, recognition, recognizing, src, dst, src_dialect, dst_dialect;
	var selectedFont, fontSize, fontColor, containerWidthFactor, containerHeightFactor, srcWidth, srcHeight, srcTop, srcLeft, dstWidth, dstHeight, dstTop, dstLeft;
	var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript, interim_started = false;
	var pauseTimeout, pauseThreshold = 2000; // 2 seconds artificial pause threshold;
	var all_final_transcripts = [], all_final_transcripts_excluding_last = [], formatted_all_final_transcripts, formatted_all_final_transcripts_excluding_last;
	var videoInfo;
	var timestamp_separator = "-->";
	var session_start_time, session_end_time;

	function formatTimestamp(startTimestamp) {
		// Convert startTimestamp to string
		const timestampString = startTimestamp.toISOString();

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

	chrome.storage.sync.get([ 'recognizing', 'src_dialect', 'dst_dialect', 'show_original', 'show_translation', 'selectedFont', 'fontSize', 'fontColor', 'containerWidthFactor', 'containerHeightFactor'], function(result) {
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

		show_original = result.show_original;
		//console.log('show_original =', result.show_original);
		show_translation = result.show_translation;
		//console.log('show_translation', result.show_translation);

		selectedFont = result.selectedFont;
		//console.log('selectedFont =', result.selectedFont);

		fontSize = result.fontSize;
		//console.log('fontSize =', result.fontSize);

		fontColor = result.fontColor;
		//console.log('fontColor =', result.fontColor);

		containerWidthFactor = result.containerWidthFactor;
		//console.log('result.containerWidthFactor =', result.containerWidthFactor);

		containerHeightFactor = result.containerHeightFactor;
		console.log('result.containerHeightFactor =', result.containerHeightFactor);



		document.documentElement.scrollTop = 0; // For modern browsers
		document.body.scrollTop = 0; // For older browsers

		videoID = getVideoPlayerId();
		console.log("videoID:", videoID);

		videoInfo = getVideoPlayerInfo();
		if (videoInfo) {
			console.log('Extension is starting');
			console.log("Video player found!");
			console.log("videoInfo.id = ", videoInfo.id);
			//console.log("Top:", videoInfo.top);
			//console.log("Left:", videoInfo.left);
			//console.log("Width:", videoInfo.width);
			//console.log("Height:", videoInfo.height);
		} else {
			console.log("No video player found on this page.");
		}

		//srcWidth = containerWidthFactor*window.innerWidth;
		srcWidth = containerWidthFactor*videoInfo.width;
		//console.log('srcWidth =', srcWidth);

		//srcHeight = containerHeightFactor*window.innerHeight;
		srcHeight = containerHeightFactor*videoInfo.height;
		//console.log('containerHeightFactor =', containerHeightFactor);
		//console.log('videoInfo.height =', videoInfo.height);
		//console.log('srcHeight =', srcHeight);

		//srcTop = 0.25*window.innerHeight;
		srcTop = videoInfo.top + 0.02*videoInfo.height;
		//console.log('srcTop =', srcTop);

		//srcLeft = 0.5*(window.innerWidth-srcWidth);
		srcLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
		//console.log('srcLeft =', srcLeft);

		//dstWidth = containerWidthFactor*window.innerWidth;
		dstWidth = containerWidthFactor*videoInfo.width;
		//console.log('dstWidth =', dstWidth);

		//dstHeight = containerHeightFactor*window.innerHeight;
		dstHeight = containerHeightFactor*videoInfo.height;
		//console.log('containerHeightFactor =', containerHeightFactor);
		//console.log('videoInfo.height =', videoInfo.height);
		//console.log('dstHeight =', dstHeight);

		//dstTop = 0.75*window.innerHeight;
		dstTop = videoInfo.top + 0.6*videoInfo.height;
		//console.log('dstTop =', dstTop);

		//dstLeft = 0.5*(window.innerWidth-dstWidth);
		dstLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
		//console.log('dstLeft =', dstLeft);

		var icon_text_listening = src.toUpperCase()+':'+dst.toUpperCase();

		chrome.runtime.sendMessage({ cmd: 'icon_text_listening', data: { value: icon_text_listening } });

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
			.width(srcWidth)
			.height(srcHeight)
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
				'font': selectedFont,
				'fontSize': fontSize,
				'color': fontColor,
				'background-color': 'rgba(0,0,0,0.3)',
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:srcTop, left:srcLeft})

		if (!document.querySelector("#src_textarea_container")) {
			console.log('appending src_textarea_container to html body');
			src_textarea_container$.appendTo('body');
		} else {
			console.log('src_textarea_container has already exist');
		};

		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		//document.querySelector("#src_textarea").style.color = 'yellow';
		document.querySelector("#src_textarea").style.color = fontColor;
		document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		//src_h0 = $('#src_textarea').height();
		//document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h0)+'px';
		document.querySelector("#src_textarea").style.fontSize=String(fontSize)+'px';
		document.querySelector("#src_textarea").offsetParent.onresize = (function(){
		//	src_h = $('#src_textarea').height();
		//	document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h)+'px';
			document.querySelector("#src_textarea").style.position='absolute';
			document.querySelector("#src_textarea").style.width = '100%';
			document.querySelector("#src_textarea").style.height = '100%';
		});



		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(dstWidth)
			.height(dstHeight)
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
				'font': selectedFont,
				'fontSize': fontSize,
				'color': fontColor,
				'background-color': 'rgba(0,0,0,0.3)',
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:dstTop, left:dstLeft})

		if (!document.querySelector("#dst_textarea_container")) {
			console.log('appending dst_textarea_container to html body');
			dst_textarea_container$.appendTo('body');
		} else {
			console.log('src_textarea_container has already exist');
		};

		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		//document.querySelector("#dst_textarea").style.color = 'yellow';
		document.querySelector("#dst_textarea").style.color = fontColor;
		document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		//dst_h0 = $('#dst_textarea').height();
		//document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h0)+'px';
		document.querySelector("#dst_textarea").style.fontSize=String(fontSize)+'px';
		document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
		//	dst_h = $('#dst_textarea').height();
		//	document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h)+'px';
			document.querySelector("#dst_textarea").style.position='absolute';
			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';
		});



		window.addEventListener('resize', function(event){

			document.documentElement.scrollTop = 0; // For modern browsers
			document.body.scrollTop = 0; // For older browsers

			videoInfo = getVideoPlayerInfo();
			if (videoInfo) {
				console.log('Window is resized');
				console.log("Video player found!");
				console.log("videoInfo.id = ", videoInfo.id);
				//console.log("Top:", videoInfo.top);
				//console.log("Left:", videoInfo.left
				//console.log("Width:", videoInfo.width);
				//console.log("Height:", videoInfo.height);
			} else {
				console.log("No video player found on this page.");
			}

			//srcWidth = containerWidthFactor*window.innerWidth;
			srcWidth = containerWidthFactor*videoInfo.width;
			//console.log('srcWidth =', srcWidth);

			//srcHeight = containerHeightFactor*window.innerHeight;
			srcHeight = containerHeightFactor*videoInfo.height;
			//console.log('srcHeight =', srcHeight);

			//srcTop = 0.25*window.innerHeight;
			srcTop = videoInfo.top + 0.02*videoInfo.height;
			//console.log('srcTop =', srcTop);

			//srcLeft = 0.2*(window.innerWidth-0.5*window.innerWidth);
			//srcLeft = 0.5*(window.innerWidth-srcWidth);
			srcLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
			//console.log('srcLeft =', srcLeft);

			//dstWidth = containerWidthFactor*window.innerWidth;
			dstWidth = containerWidthFactor*videoInfo.width;
			//console.log('dstWidth =', dstWidth);
		
			//dstHeight = containerHeightFactor*window.innerHeight;
			dstHeight = containerHeightFactor*videoInfo.height;
			//console.log('dstHeight =', dstHeight);

			//dstTop = 0.75*window.innerHeight;
			dstTop = videoInfo.top + 0.6*videoInfo.height;
			//console.log('dstTop =', dstTop);

			//dstLeft = 0.2*(window.innerWidth-0.5*window.innerWidth);
			//dstLeft = 0.5*(window.innerWidth-dstWidth);
			dstLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
			//console.log('dstLeft =', dstLeft);


			if (document.querySelector("#src_textarea_container")) {
				document.querySelector("#src_textarea_container").style.width = String(srcWidth)+'px';
				document.querySelector("#src_textarea_container").style.height = String(srcHeight)+'px';
				document.querySelector("#src_textarea_container").style.top = String(srcTop)+'px';
				document.querySelector("#src_textarea_container").style.left = String(srcLeft)+'px';

				var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
					.width(srcWidth)
					.height(srcHeight)
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
						'font': selectedFont,
						'fontSize': fontSize,
						'color': fontColor,
						'background-color': 'rgba(0,0,0,0.3)',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:srcTop, left:srcLeft})

				document.querySelector("#src_textarea").style.width = String(srcWidth)+'px';
				document.querySelector("#src_textarea").style.height = String(srcHeight)+'px';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';
				//document.querySelector("#src_textarea").style.color = 'yellow';
				document.querySelector("#src_textarea").style.color = fontColor;
				document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#src_textarea").style.border = 'none';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").style.overflow = 'hidden';

				//src_h0 = $('#src_textarea').height();
				//document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h0)+'px';
				document.querySelector("#src_textarea").style.fontSize=String(fontSize)+'px';
				if (document.querySelector("#src_textarea").offsetParent) {
					document.querySelector("#src_textarea").offsetParent.onresize = (function(){
					//	src_h = $('#src_textarea').height();
					//	document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h)+'px';
						document.querySelector("#src_textarea").style.position='absolute';
						document.querySelector("#src_textarea").style.width = '100%';
						document.querySelector("#src_textarea").style.height = '100%';
						document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
					});
				}
			}


			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.width = String(dstWidth)+'px';
				document.querySelector("#dst_textarea_container").style.height = String(dstHeight)+'px';
				document.querySelector("#dst_textarea_container").style.top = String(dstTop)+'px';
				document.querySelector("#dst_textarea_container").style.left = String(dstLeft)+'px';

				var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
					.width(dstWidth)
					.height(dstHeight)
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
						'font': selectedFont,
						'fontSize': fontSize,
						'color': fontColor,
						'background-color': 'rgba(0,0,0,0.3)',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:dstTop, left:dstLeft})

				document.querySelector("#dst_textarea").style.width = String(dstWidth)+'px';
				document.querySelector("#dst_textarea").style.height = String(dstHeight)+'px';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				//document.querySelector("#dst_textarea").style.color = 'yellow';
				document.querySelector("#dst_textarea").style.color = fontColor;
				document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#dst_textarea").style.border = 'none';
				document.querySelector("#dst_textarea").style.display = 'inline-block';
				document.querySelector("#dst_textarea").style.overflow = 'hidden';

				//dst_h0 = $('#dst_textarea').height();
				//document.querySelector("#dst_textarea").style.fontSize=String(0.35*src_h0)+'px';
				document.querySelector("#dst_textarea").style.fontSize=String(fontSize)+'px';
				if (document.querySelector("#dst_textarea").offsetParent) {
					document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
					//	dst_h = $('#dst_textarea').height();
					//	document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h)+'px';
						document.querySelector("#dst_textarea").style.position='absolute';
						document.querySelector("#dst_textarea").style.width = '100%';
						document.querySelector("#dst_textarea").style.height = '100%';
						document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
					});
				}

			}

			document.documentElement.scrollTop = videoInfo.top; // For modern browsers
			document.body.scrollTop = videoInfo.top; // For older browsers

		});


		document.addEventListener('fullscreenchange', function(event) {

			document.documentElement.scrollTop = 0; // For modern browsers
			document.body.scrollTop = 0; // For older browsers

			videoInfo = getVideoPlayerInfo();
			if (videoInfo) {
				console.log('fullscreenchange');
				console.log("Video player found!");
				console.log("videoInfo.id = ", videoInfo.id);
				//console.log("Top:", videoInfo.top);
				//console.log("Left:", videoInfo.left
				//console.log("Width:", videoInfo.width);
				//console.log("Height:", videoInfo.height);
			} else {
				console.log("No video player found on this page.");
			}

			//srcWidth = containerWidthFactor*window.innerWidth;
			srcWidth = containerWidthFactor*videoInfo.width;
			//console.log('srcWidth =', srcWidth);

			//srcHeight = containerHeightFactor*window.innerHeight;
			srcHeight = containerHeightFactor*videoInfo.height;
			//console.log('srcHeight =', srcHeight);

			//srcTop = 0.25*window.innerHeight;
			srcTop = videoInfo.top + 0.02*videoInfo.height;
			//console.log('srcTop =', srcTop);

			//srcLeft = 0.2*(window.innerWidth-0.5*window.innerWidth);
			//srcLeft = 0.5*(window.innerWidth-srcWidth);
			srcLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
			//console.log('srcLeft =', srcLeft);

			//dstWidth = containerWidthFactor*window.innerWidth;
			dstWidth = containerWidthFactor*videoInfo.width;
			//console.log('dstWidth =', dstWidth);
		
			//dstHeight = containerHeightFactor*window.innerHeight;
			dstHeight = containerHeightFactor*videoInfo.height;
			//console.log('dstHeight =', dstHeight);

			//dstTop = 0.75*window.innerHeight;
			dstTop = videoInfo.top + 0.6*videoInfo.height;
			//console.log('dstTop =', dstTop);

			//dstLeft = 0.2*(window.innerWidth-0.5*window.innerWidth);
			//dstLeft = 0.5*(window.innerWidth-dstWidth);
			dstLeft = videoInfo.left + 0.5*(videoInfo.width-srcWidth);
			//console.log('dstLeft =', dstLeft);


			if (document.querySelector("#src_textarea_container")) {
				document.querySelector("#src_textarea_container").style.width = String(srcWidth)+'px';
				document.querySelector("#src_textarea_container").style.height = String(srcHeight)+'px';
				document.querySelector("#src_textarea_container").style.top = String(srcTop)+'px';
				document.querySelector("#src_textarea_container").style.left = String(srcLeft)+'px';

				var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
					.width(srcWidth)
					.height(srcHeight)
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
						'font': selectedFont,
						'fontSize': fontSize,
						'color': fontColor,
						'background-color': 'rgba(0,0,0,0.3)',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:srcTop, left:srcLeft})

				document.querySelector("#src_textarea").style.width = String(srcWidth)+'px';
				document.querySelector("#src_textarea").style.height = String(srcHeight)+'px';
				document.querySelector("#src_textarea").style.width = '100%';
				document.querySelector("#src_textarea").style.height = '100%';
				//document.querySelector("#src_textarea").style.color = 'yellow';
				document.querySelector("#src_textarea").style.color = fontColor;
				document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#src_textarea").style.border = 'none';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").style.overflow = 'hidden';

				//src_h0 = $('#src_textarea').height();
				//document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h0)+'px';
				document.querySelector("#src_textarea").style.fontSize=String(fontSize)+'px';
				if (document.querySelector("#src_textarea").offsetParent) {
					document.querySelector("#src_textarea").offsetParent.onresize = (function(){
					//	src_h = $('#src_textarea').height();
					//	document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h)+'px';
						document.querySelector("#src_textarea").style.position='absolute';
						document.querySelector("#src_textarea").style.width = '100%';
						document.querySelector("#src_textarea").style.height = '100%';
						document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
					});
				}
			}

			if (document.querySelector("#dst_textarea_container")) {
				document.querySelector("#dst_textarea_container").style.width = String(dstWidth)+'px';
				document.querySelector("#dst_textarea_container").style.height = String(dstHeight)+'px';
				document.querySelector("#dst_textarea_container").style.top = String(dstTop)+'px';
				document.querySelector("#dst_textarea_container").style.left = String(dstLeft)+'px';

				var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
					.width(dstWidth)
					.height(dstHeight)
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
						'font': selectedFont,
						'fontSize': fontSize,
						'color': fontColor,
						'background-color': 'rgba(0,0,0,0.3)',
						'border': 'none',
						'display': 'block',
						'overflow': 'hidden',
						'z-index': '2147483647'
					})
					.offset({top:dstTop, left:dstLeft})

				document.querySelector("#dst_textarea").style.width = String(dstWidth)+'px';
				document.querySelector("#dst_textarea").style.height = String(dstHeight)+'px';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				//document.querySelector("#dst_textarea").style.color = 'yellow';
				document.querySelector("#dst_textarea").style.color = fontColor;
				document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
				document.querySelector("#dst_textarea").style.border = 'none';
				document.querySelector("#dst_textarea").style.display = 'inline-block';
				document.querySelector("#dst_textarea").style.overflow = 'hidden';

				//dst_h0 = $('#dst_textarea').height();
				//document.querySelector("#dst_textarea").style.fontSize=String(0.35*src_h0)+'px';
				document.querySelector("#dst_textarea").style.fontSize=String(fontSize)+'px';
				if (document.querySelector("#dst_textarea").offsetParent) {
					document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
					//	dst_h = $('#dst_textarea').height();
					//	document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h)+'px';
						document.querySelector("#dst_textarea").style.position='absolute';
						document.querySelector("#dst_textarea").style.width = '100%';
						document.querySelector("#dst_textarea").style.height = '100%';
						document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
					});
				}
			}

			document.documentElement.scrollTop = videoInfo.top; // For modern browsers
			document.body.scrollTop = videoInfo.top; // For older browsers

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

					document.documentElement.scrollTop = videoInfo.top; // For modern browsers
					document.body.scrollTop = videoInfo.top; // For older browsers
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
				resetPauseTimeout(); // Reset timeout on error as well
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
					//console.log('801:timestamped_final_and_interim_transcript = ', timestamped_final_and_interim_transcript);
					var t = formatted_all_final_transcripts_excluding_last + timestamped_final_and_interim_transcript;
					if (t) {
						// Split text into an array of lines
						let lines = t.trim().split('\n');
						// Use a Set to filter out duplicate lines
						let uniqueLines = [...new Set(lines)];
						// Join the unique lines back into a single string
						let uniqueText = uniqueLines.join('\n');
						uniqueText = uniqueText + '\n';
						saveTranscript(uniqueText);
						var tt=gtranslate(uniqueText,src,dst).then((result => {
							//console.log('806:result = ', result);
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
							//console.log('818:timestamped_translated_final_and_interim_transcript = ', timestamped_translated_final_and_interim_transcript);
							saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
						}));
					}

					session_end_time = formatTimestamp(new Date());
					console.log('session_end_time =', session_end_time);

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
				resetPauseTimeout();

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
							//final_transcript += event.results[i][0].transcript;
							//final_transcript = final_transcript + '. '
							//final_transcript = capitalize(final_transcript);
							//final_transcript = remove_linebreak(final_transcript);

							interim_transcript = '';
							interim_started = false;
							endTimestamp = formatTimestamp(new Date());
							//console.log('endTimestamp =', endTimestamp);
							final_transcript += `${startTimestamp} ${timestamp_separator} ${endTimestamp} : ${capitalize(event.results[i][0].transcript)}`;
							final_transcript = final_transcript + '.\n'
							//console.log('final_transcript = ', final_transcript);
							all_final_transcripts.push(`${final_transcript}`);
							//console.log('864:all_final_transcripts = ', all_final_transcripts);
							all_final_transcripts_excluding_last = all_final_transcripts.slice(0, -1);
							//console.log('866:all_final_transcripts_excluding_last = ', all_final_transcripts_excluding_last);
						} else {
							if (!interim_started) {
								// Capture the timestamp only when the interim result starts
								startTimestamp = formatTimestamp(new Date());
								interim_started = true; // Set the flag to true
								//console.log(`Interim transcript started at ${interim_start_timestamp}: ${interim_transcript}`);
							}
							interim_transcript += event.results[i][0].transcript;
							//interim_transcript = remove_linebreak(interim_transcript);
							interim_transcript = capitalize(interim_transcript);
							//interim_transcript = capitalizeSentences(interim_transcript);
						}
					}


					timestamped_final_and_interim_transcript = final_transcript + interim_transcript;
					if (containsColon(timestamped_final_and_interim_transcript)) {
						timestamped_final_and_interim_transcript = capitalizeSentences(timestamped_final_and_interim_transcript);
						//console.log('capitalizeSentences(timestamped_final_and_interim_transcript) = ', timestamped_final_and_interim_transcript);
					}

					formatted_all_final_transcripts = all_final_transcripts.join("");
					//console.log('formatted_all_final_transcripts = ', formatted_all_final_transcripts);
					formatted_all_final_transcripts_excluding_last = all_final_transcripts_excluding_last.join("");
					//console.log('formatted_all_final_transcripts_excluding_last = ', formatted_all_final_transcripts_excluding_last);

					//console.log('show_original =', result.show_original);
					if (show_original) {
						document.querySelector("#src_textarea_container").style.display = 'block';
						//document.querySelector("#src_textarea").innerHTML = final_transcript + interim_transcript;
						//document.querySelector("#src_textarea").value = formatted_all_final_transcripts_excluding_last + timestamped_final_and_interim_transcript;
						var t = formatted_all_final_transcripts_excluding_last + timestamped_final_and_interim_transcript;
						if (t) {
							// Split text into an array of lines
							let lines = t.trim().split('\n');
							// Use a Set to filter out duplicate lines
							let uniqueLines = [...new Set(lines)];
							// Join the unique lines back into a single string
							let uniqueText = uniqueLines.join('\n');
							document.querySelector("#src_textarea").value = uniqueText;
						}
						document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
					}



					//console.log('show_translation =', show_translation);
					if (show_translation) {
						//var  t = final_transcript + interim_transcript;
						//var  t = document.querySelector("#src_textarea").value;
						var  t = formatted_all_final_transcripts_excluding_last + timestamped_final_and_interim_transcript;
						if ((Date.now() - translate_time > 1000) && recognizing) {
							if (t) var tt=gtranslate(t,src,dst).then((result => {
								if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';
								//console.log('formatText(result) = ', formatText(result));
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
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value=result;
								//console.log('#dst_textarea.value = ', document.querySelector("#dst_textarea").value);
								//if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").innerHTML=formatText(result);
								if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop = document.querySelector("#dst_textarea").scrollHeight;
							}));
							translate_time = Date.now();
						};
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
			//console.log('transcription = ', transcription);

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


		function resetPauseTimeout() {
			//all_final_transcripts += timestamped_final_and_interim_transcript;
			clearTimeout(pauseTimeout);
			pauseTimeout = setTimeout(function() {
				console.log("No speech detected for " + pauseThreshold / 1000 + " seconds, stopping recognition");
				recognition.stop();
			}, pauseThreshold);
		}


		function containsColon(sentence) {
			// Check if the sentence includes the colon character
			return sentence.includes(':');
		}


		function containsSpaceCharacter(sentence) {
			// Check if the sentence includes the colon character
			return sentence.includes('\%20');
		}


		function getVideoPlayerInfo() {
			var elements = document.querySelectorAll('video, iframe');
			//console.log('elements = ',  elements);
			var largestVideoElement = null;
			var largestSize = 0;

			for (var i=0; i<elements.length; i++) {
				var rect = elements[i].getBoundingClientRect();
				//console.log('rect', rect);
				if (rect.width > 0) {
					var size = rect.width * rect.height;
					if (size > largestSize) {
						largestSize = size;
						largestVideoElement = elements[i];
					}
					var videoPlayerID = elements[i].id;
					//console.log('videoPlayerID = ',  videoPlayerID);
					return {
						id: elements[i].id,
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height
					};
				}
			}
			//console.log('No video player found');
			return null;
		}


		function getVideoPlayerId() {
			var elements = document.querySelectorAll('video, iframe');
			var largestVideoElement = null;
			var largestSize = 0;
			for (var i=0; i<elements.length; i++) {
				if ((elements[i].getBoundingClientRect()).width > 0) {
					var size = elements[i].getBoundingClientRect().width * elements[i].getBoundingClientRect().height;
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
				if ((element.getBoundingClientRect()).width > 0) {
					// Calculate size of the video element (using area as size metric)
					var size;
					size = element.getBoundingClientRect().width * element.getBoundingClientRect().height;

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

/*
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
							var r=((((response[i][0]).replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
							r=(((r.replace('}','')).replace(')','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
							tt += r;
						}
						if (tt.includes('}'||')'||'%20'||'%3E')) {
							tt=(((tt.replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
						}
						resolve(tt);
					}
				}
				xmlHttp.open('GET', url+params, true);
				xmlHttp.send(null);
				xmlHttp.onreadystatechange();
			});
			return await tt;
		};
*/

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


/*
		var gtranslate = async (t,src,dst) => {
			var tt = new Promise(function(resolve) {
				var i=0, len=0, r='', tt='';
				const url = 'https://translate.googleapis.com/translate_a/'
				var params = 'single?client=gtx&sl='+src+'&tl='+dst+'&dt=t&q='+t;
				var xmlHttp = new XMLHttpRequest();
				var response;
				xmlHttp.onreadystatechange = function(event) {
					if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
						response = JSON.parse(xmlHttp.responseText)[0];
						for (var i = 0, len = response.length; i < len; i++) {
							var r=((((response[i][0]).replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
							r=(((r.replace('}','')).replace(')','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
							tt += r;
						}
						if (tt.includes('}'||')'||'%20'||'%3E')) {
							tt=(((tt.replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
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
*/

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