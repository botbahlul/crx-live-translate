console.log('INITIALIZING VARIABLES');
var src, src_language_index, src_dialect, src_dialect_index, show_src, show_timestamp_src, save_src;
var dst, dst_language_index, dst_dialect, dst_dialect_index, show_dst, show_timestamp_dst, save_dst;
var changed_src, changed_src_dialect;
var changed_dst, changed_dst_dialect;

var src_fonts;
var src_selected_font_index, src_selected_font, src_font_size, src_font_color;
var src_container_width_factor, src_container_height_factor;
var src_container_top_factor, src_container_left_factor, centerize_src;
var src_container_color, src_container_opacity;

var dst_fonts;
var dst_selected_font_index, dst_selected_font, dst_font_size, dst_font_color;
var dst_container_width_factor, dst_container_height_factor;
var dst_container_top_factor, dst_container_left_factor, centerize_dst;
var dst_container_color, dst_container_opacity;

var changed_src_selected_font, changed_src_font_size, changed_src_font_color;
var changed_src_container_width_factor, changed_src_container_height_factor;
var changed_src_container_top_factor, changed_src_container_left_factor, changed_centerize_src;
var changed_src_container_color, changed_src_container_opacity;

var changed_dst_selected_font, changed_dst_font_size, changed_dst_font_color;
var changed_dst_container_width_factor, changed_dst_container_height_factor;
var changed_dst_container_top_factor, changed_dst_container_left_factor, changed_centerize_dst;
var changed_dst_container_color, changed_dst_container_opacity;

var pause_threshold;

var sample_text_1 = "This is the text sample of how the subtitles will be shown.";
var sample_text_2 = "It may looks different on different video width and video height.";
var start_time_1, end_time_1, startTimestamp1, endTimestamp1, timestamped_sample_text_1;
var start_time_2, end_time_2, startTimestamp2, endTimestamp2, timestamped_sample_text_2;
var timestamped_sample_text, sample_text;
var timestamp_separator = "-->";
var src_timestamped_sample_text, dst_timestamped_sample_text;

const font_scale = 360/540;

var recognizing = false;

start_time_1 = new Date();

timestamped_sample_text = createTimeStampedSampleText();

src_fonts = getAvailableFonts();
src_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    document.querySelector("#select_src_font").appendChild(option);
});

dst_fonts = getAvailableFonts();
dst_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    document.querySelector("#select_dst_font").appendChild(option);
});


var src_language =
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

for (var i = 0; i < src_language.length; i++) {
    document.querySelector("#select_src_language").options[i] = new Option(src_language[i][0], i);
}


var dst_language =
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

for (var j = 0; j < dst_language.length; j++) {
    document.querySelector("#select_dst_language").options[j] = new Option(dst_language[j][0], j);
}

window.addEventListener('beforeunload', () => {
  saveAllSettings();
});

var first_check = true;


// LISTENING MESSAGES FROM background.js (recognition.onresult)
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log('sender =', sender);
	console.log('message =', message);
	
	sendResponse({status: 'OK'});

	if (typeof message === 'object' && message !== null && message.hasOwnProperty('cmd') && message.hasOwnProperty('data')) {

		const {cmd, data} = message;
		if (cmd === 'recognizing') {
			console.log('recognizing =', data.value);
			recognizing = data.value;
			//return true;
		}

		if (cmd === 'background_src_container_width_factor') {
			console.log('background_src_container_width_factor =', data.value);
			src_container_width_factor = data.value;
			src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
			document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
			//return true;
		}

		if (cmd === 'background_src_container_height_factor') {
			console.log('background_src_container_height_factor =', data.value);
			src_container_height_factor = data.value;
			src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
			document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
			//return true;
		}

		if (cmd === 'background_src_container_top_factor') {
			console.log('background_src_container_top_factor =', data.value);
			src_container_top_factor = data.value;
			src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
			document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
			//return true;
		}

		if (cmd === 'background_src_container_left_factor') {
			console.log('background_src_container_left_factor =', data.value);
			src_container_left_factor = data.value;
			src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
			//return true;
		}

		if (cmd === 'background_centerize_src') {
			console.log('background_centerize_src =', data.value);
			centerize_src = data.value;
			document.querySelector("#checkbox_centerize_src").checked = centerize_src;
			//return true;
		}

		if (cmd === 'background_dst_container_width_factor') {
			console.log('background_dst_container_width_factor =', data.value);
			dst_container_width_factor = data.value;
			dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
			document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
			//return true;
		}

		if (cmd === 'background_dst_container_height_factor') {
			console.log('background_dst_container_height_factor =', data.value);
			dst_container_height_factor = data.value;
			dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
			document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
			//return true;
		}

		if (cmd === 'background_dst_container_top_factor') {
			console.log('background_dst_container_top_factor =', data.value);
			dst_container_top_factor = data.value;
			dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
			document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
			//return true;
		}

		if (cmd === 'background_dst_container_left_factor') {
			console.log('background_dst_container_left_factor =', data.value);
			dst_container_left_factor = data.value;
			dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
			//return true;
		}

		if (cmd === 'background_centerize_dst') {
			console.log('background_centerize_dst =', data.value);
			centerize_dst = data.value;
			document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
			//return true;
		}

		update_sample_text();
	}
});


CheckStoredValues();
document.addEventListener('DOMContentLoaded', (event) => {
	console.log('DOMContentLoaded');
	update_sample_text();
	saveAllSettings();
});


function CheckStoredValues() {
	console.log('CheckStoredValues');

    chrome.storage.local.get(['recognizing'], (result) => {
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
    });


	chrome.storage.local.get(['src_language_index'], function(result) {
		src_language_index = result.src_language_index;
		console.log('CheckStoredValues before if: src_language_index =', src_language_index);
		if (result.src_language_index) {
			src_language_index = result.src_language_index;
		} else {
			src_language_index = 26;			
		}
		console.log('CheckStoredValues after if: src_language_index =', src_language_index);
		document.querySelector("#select_src_language").selectedIndex = src_language_index;
		saveData('src_language_index', src_language_index);
		[src, src_language_index, src_dialect, src_dialect_index] = update_src_country();
	});

	chrome.storage.local.get(['src_dialect'], function(result) {
		src_dialect = result.src_dialect;
		console.log('CheckStoredValues before if: src_dialect =', src_dialect);
		if (result.src_dialect) {
			src_dialect = result.src_dialect;
			console.log('CheckStoredValues: result.src_dialect =', result.src_dialect);
		} else {
			if (src_language[src_language_index].length > 2) {
				if (src === 'en') {
					src_dialect = 'en-US';
					console.log('CheckStoredValues: src_dialect =', src_dialect);
				} else {
					src_dialect = document.querySelector("#select_src_dialect").value;
					console.log('CheckStoredValues: src_dialect =', src_dialect);
				}
			} else {
				src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
				console.log('CheckStoredValues: src_dialect =', src_dialect);
			}
		}
		for (let i = 0; i < document.querySelector("#select_src_dialect").length; i++) {
			if (select_src_dialect[i].value === src_dialect) {
				src_dialect_index = i;
				document.querySelector("#select_src_dialect").selectedIndex = src_dialect_index;
				saveData('src_dialect_index', src_dialect_index);
				break;
			}
		}
		console.log('CheckStoredValues after if: src_dialect =', src_dialect);
		src = document.querySelector("#select_src_dialect").value.split('-')[0];
		console.log('CheckStoredValues after if: src =', src);
		saveData('src', src);
		saveData('src_dialect', src_dialect);
		console.log('CheckStoredValues after if: src_dialect_index =', src_dialect_index);
	});

	chrome.storage.local.get(['show_src'], function(result) {
		show_src = result.show_src;
		console.log('CheckStoredValues before if: show_src =', show_src);
		if (typeof show_src === 'undefined') {
			document.querySelector("#checkbox_show_src").checked = true;
		} else {
			if (result.show_src === true) {
				document.querySelector("#checkbox_show_src").checked = true;
			} else {
				document.querySelector("#checkbox_show_src").checked = false;
			}
		}
		show_src = document.querySelector("#checkbox_show_src").checked;
		console.log('CheckStoredValues aftere if: show_src =', show_src);
		saveData('show_src', show_src);
	});

	chrome.storage.local.get(['show_timestamp_src'], function(result) {
		show_timestamp_src = result.show_timestamp_src;
		console.log('CheckStoredValues before if: show_timestamp_src =', show_timestamp_src);
		if (typeof show_timestamp_src === 'undefined') {
			document.querySelector("#checkbox_show_timestamp_src").checked = true;
		} else {
			if (result.show_timestamp_src === true) {
				document.querySelector("#checkbox_show_timestamp_src").checked = true;
			} else {
				document.querySelector("#checkbox_show_timestamp_src").checked = false;
			}
		}
		show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
		console.log('CheckStoredValues after if: show_timestamp_src =', show_timestamp_src);
		saveData('show_timestamp_src', show_timestamp_src);
	});

	chrome.storage.local.get(['src_selected_font_index'], function(result) {
		src_selected_font_index = result.src_selected_font_index;
		console.log('CheckStoredValues before if: result.src_selected_font_index =', result.src_selected_font_index);
		if (!src_selected_font_index) src_selected_font_index = 0;
		console.log('CheckStoredValues after if: src_selected_font_index =', src_selected_font_index);
		document.querySelector("#select_src_font").selectedIndex = src_selected_font_index;
		saveData('src_selected_font_index', src_selected_font_index);
	});

	chrome.storage.local.get(['src_selected_font'], function(result) {
		src_selected_font = result.src_selected_font;
		console.log('CheckStoredValues before if: result.src_selected_font =', result.src_selected_font);
		if (result.src_selected_font) {
			document.querySelector("#select_src_font").value = src_selected_font;
		} else {
			src_selected_font = "Arial";
			document.querySelector("#select_src_font").value = src_selected_font;
		}
		console.log('CheckStoredValues after if: src_selected_font =', src_selected_font);
		saveData('src_selected_font', src_selected_font);
	});

	chrome.storage.local.get(['src_font_size'], function(result) {
		src_font_size = result.src_font_size;
		console.log('CheckStoredValues before if: result.src_font_size =', result.src_font_size);
		if (result.src_font_size) {
			document.querySelector("#input_src_font_size").value = src_font_size;
		} else {
			src_font_size = 18;
			document.querySelector("#input_src_font_size").value = src_font_size;
		}
		console.log('CheckStoredValues after if: src_font_size =', src_font_size);
	});

	chrome.storage.local.get(['src_font_color'], function(result) {
		src_font_color = result.src_font_color;
		console.log('CheckStoredValues before if: result.src_font_color =', result.src_font_color);
		if (result.src_font_color) {
			document.querySelector("#slider_src_font_color").value = src_font_color;
			document.querySelector("#label_src_font_color").textContent = document.querySelector("#slider_src_font_color").value;
		} else {
			src_font_color = '#00ff1e';
			document.querySelector("#slider_src_font_color").value = src_font_color;
			document.querySelector("#label_src_font_color").textContent = document.querySelector("#slider_src_font_color").value;
		}
		console.log('CheckStoredValues after if: src_font_color =', src_font_color);
	});

	chrome.storage.local.get(['src_container_width_factor'], function(result) {
		src_container_width_factor = result.src_container_width_factor;
		console.log('CheckStoredValues before if: result.src_container_width_factor =', result.src_container_width_factor);
		if (result.src_container_width_factor) {
			src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
			document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
		} else {
			src_container_width_factor = 0.795;
			src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
			document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
		}
		console.log('CheckStoredValues after if: src_container_width_factor =', src_container_width_factor);
	});

	chrome.storage.local.get(['src_container_height_factor'], function(result) {
		src_container_height_factor = result.src_container_height_factor;
		console.log('CheckStoredValues before if: result.src_container_height_factor =', result.src_container_height_factor);
		if (result.src_container_height_factor) {
			src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
			document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
		} else {
			src_container_height_factor = 0.180;
			src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
			document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
		}
		console.log('CheckStoredValues after if: src_container_height_factor =', src_container_height_factor);
	});

	chrome.storage.local.get(['src_container_top_factor'], function(result) {
		src_container_top_factor = result.src_container_top_factor;
		console.log('CheckStoredValues before if: result.src_container_top_factor =', result.src_container_top_factor);
		if (result.src_container_top_factor) {
			src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
			document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
		} else {
			src_container_top_factor = 0.010;
			src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
			document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
		}
		console.log('CheckStoredValues after if: src_container_top_factor =', src_container_top_factor);
	});

	chrome.storage.local.get(['centerize_src'], function(result) {
		centerize_src = result.centerize_src;
		console.log('CheckStoredValues before if: result.centerize_src =', result.centerize_src);
		if (centerize_src) {
			document.querySelector("#checkbox_centerize_src").checked = centerize_src;
		} else {
			document.querySelector("#checkbox_centerize_src").checked = true;
		}
		console.log('CheckStoredValues after if: centerize_src =', centerize_src);
	});

	chrome.storage.local.get(['src_container_left_factor'], function(result) {
		src_container_left_factor = result.src_container_left_factor;
		console.log('CheckStoredValues before if: result.src_container_left_factor =', result.src_container_left_factor);
		if (result.src_container_left_factor) {
			src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
		} else {
			src_container_left_factor = 0.100;
			src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
		}
		console.log('CheckStoredValues after if: src_container_left_factor =', src_container_left_factor);
	});

	chrome.storage.local.get(['src_container_color'], function(result) {
		src_container_color = result.src_container_color;
		console.log('CheckStoredValues before if: result.src_container_color =', result.src_container_color);
		if (result.src_container_color) {
			document.querySelector("#slider_src_container_color").value = src_container_color;
			document.querySelector("#label_src_container_color").textContent = document.querySelector("#slider_src_container_color").value;
		} else {
			document.querySelector("#slider_src_container_color").value = "#000000";
			document.querySelector("#label_src_container_color").textContent = document.querySelector("#slider_src_container_color").value;
		}
		console.log('CheckStoredValues after if: src_container_color =', src_container_color);
	});

	chrome.storage.local.get(['src_container_opacity'], function(result) {
		src_container_opacity = result.src_container_opacity;
		console.log('CheckStoredValues before if: result.src_container_opacity =', result.src_container_opacity);
		if (result.src_container_opacity) {
			document.querySelector("#slider_src_container_opacity").value = src_container_opacity;
			document.querySelector("#label_src_container_opacity").textContent = document.querySelector("#slider_src_container_opacity").value;
		} else {
			document.querySelector("#slider_src_container_opacity").value = 0.3;
			document.querySelector("#label_src_container_opacity").textContent = document.querySelector("#slider_src_container_opacity").value;
		}
		console.log('CheckStoredValues after if: src_container_opacity =', src_container_opacity);
	});

	chrome.storage.local.get(['save_src'], function(result) {
		save_src = result.save_src;
		console.log('CheckStoredValues before if: save_src =', save_src);
		if (typeof save_src === 'undefined') {
			document.querySelector("#checkbox_save_src").checked = true;
		} else {
			if (result.save_src === true) {
				document.querySelector("#checkbox_save_src").checked = true;
			} else {
				document.querySelector("#checkbox_save_src").checked = false;
			}
		}
		save_src = document.querySelector("#checkbox_save_src").checked;
		console.log('CheckStoredValues aftere if: save_src =', save_src);
		saveData('save_src', save_src);
	});



	chrome.storage.local.get(['dst_language_index'], function(result) {
		dst_language_index = result.dst_language_index;
		console.log('CheckStoredValues before if: dst_language_index =', dst_language_index);
		if (typeof dst_language_index === 'undefined') {
			dst_language_index = 15;
		} else {
			dst_language_index = result.dst_language_index;
		}
		console.log('CheckStoredValues after if: dst_language_index =', dst_language_index);
		document.querySelector("#select_dst_language").selectedIndex = dst_language_index;
		saveData('dst_language_index', dst_language_index);
		[dst, dst_language_index, dst_dialect, dst_dialect_index] = update_dst_country();
	});

	chrome.storage.local.get(['dst_dialect'], function(result) {
		dst_dialect = result.dst_dialect;
		console.log('CheckStoredValues before if: dst_dialect =', dst_dialect);
		if (result.dst_dialect) {
			dst_dialect = result.dst_dialect;
			console.log('CheckStoredValues: result.dst_dialect =', result.dst_dialect);
		} else {
			if (dst_language[dst_language_index].length > 2) {
				if (dst === 'en') {
					dst_dialect = 'en-US';
					console.log('CheckStoredValues: dst_dialect =', dst_dialect);
				} else {
					dst_dialect = document.querySelector("#select_dst_dialect").value;
					console.log('CheckStoredValues: dst_dialect =', dst_dialect);
				}
			} else {
				dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
				console.log('CheckStoredValues: dst_dialect =', dst_dialect);
			}
		}
		for (let i = 0; i < document.querySelector("#select_dst_dialect").length; i++) {
			if (select_dst_dialect[i].value === dst_dialect) {
				dst_dialect_index = i;
				document.querySelector("#select_dst_dialect").selectedIndex = dst_dialect_index;
				saveData('dst_dialect_index', dst_dialect_index);
				break;
			}
		}
		console.log('CheckStoredValues after if: dst_dialect =', dst_dialect);
		dst = document.querySelector("#select_dst_dialect").value.split('-')[0];
		console.log('CheckStoredValues after if: dst =', dst);
		saveData('dst', dst);
		saveData('dst_dialect', dst_dialect);
		console.log('CheckStoredValues after if: dst_dialect_index =', dst_dialect_index);
	});

	chrome.storage.local.get(['show_dst'], function(result) {
		show_dst = result.show_dst;
		console.log('CheckStoredValues before if: show_dst =', show_dst);
		if (typeof show_dst === 'undefined') {
			document.querySelector("#checkbox_show_dst").checked = true;
		} else {
			if (result.show_dst === true) {
				document.querySelector("#checkbox_show_dst").checked = true;
			} else {
				document.querySelector("#checkbox_show_dst").checked = false;
			}
		}
		show_dst = document.querySelector("#checkbox_show_dst").checked;
		console.log('CheckStoredValues after if: show_dst =', show_dst);
		saveData('show_dst', show_dst);
	});

	chrome.storage.local.get(['show_timestamp_dst'], function(result) {
		show_timestamp_dst = result.show_timestamp_dst;
		console.log('CheckStoredValues before if: show_timestamp_dst =', show_timestamp_dst);
		if (typeof show_timestamp_dst === 'undefined') {
			document.querySelector("#checkbox_show_timestamp_dst").checked = true;
		} else {
			if (result.show_timestamp_dst === true) {
				document.querySelector("#checkbox_show_timestamp_dst").checked = true;
			} else {
				document.querySelector("#checkbox_show_timestamp_dst").checked = false;
			}
		}
		show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
		console.log('CheckStoredValues after if: show_timestamp_dst =', show_timestamp_dst);
		saveData('show_timestamp_dst', show_timestamp_dst);
	});

	chrome.storage.local.get(['dst_selected_font_index'], function(result) {
		dst_selected_font_index = result.dst_selected_font_index;
		console.log('CheckStoredValues before if: result.dst_selected_font_index =', result.dst_selected_font_index);
		if (!dst_selected_font_index) dst_selected_font_index = 0;
		console.log('CheckStoredValues after if: dst_selected_font_index =', dst_selected_font_index);
		document.querySelector("#select_dst_font").selectedIndex = dst_selected_font_index;
	});

	chrome.storage.local.get(['dst_selected_font'], function(result) {
		dst_selected_font = result.dst_selected_font;
		console.log('CheckStoredValues before if: result.dst_selected_font =', result.dst_selected_font);
		if (result.dst_selected_font) {
			document.querySelector("#select_dst_font").value = dst_selected_font;
		}
		console.log('CheckStoredValues after if: dst_selected_font =', dst_selected_font);
	});

	chrome.storage.local.get(['dst_font_size'], function(result) {
		dst_font_size = result.dst_font_size;
		console.log('CheckStoredValues before if: result.dst_font_size =', result.dst_font_size);
		if (result.dst_font_size) {
			document.querySelector("#input_dst_font_size").value = dst_font_size;
		}
		console.log('CheckStoredValues after if: dst_font_size =', dst_font_size);
	});

	chrome.storage.local.get(['dst_font_color'], function(result) {
		dst_font_color = result.dst_font_color;
		console.log('CheckStoredValues before if: result.dst_font_color =', result.dst_font_color);
		if (result.dst_font_color) {
			document.querySelector("#slider_dst_font_color").value = dst_font_color;
			document.querySelector("#label_dst_font_color").textContent = document.querySelector("#slider_dst_font_color").value;
		} else {
			dst_font_color = '#fff700';
			document.querySelector("#slider_dst_font_color").value = dst_font_color;
			document.querySelector("#label_dst_font_color").textContent = document.querySelector("#slider_dst_font_color").value;
		}
		console.log('CheckStoredValues after if: dst_font_color =', dst_font_color);
	});

	chrome.storage.local.get(['dst_container_width_factor'], function(result) {
		dst_container_width_factor = result.dst_container_width_factor;
		console.log('CheckStoredValues before if: result.dst_container_width_factor =', result.dst_container_width_factor);
		if (result.dst_container_width_factor) {
			dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
			document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
		} else {
			dst_container_width_factor = 0.795;
			dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
			document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
		}
		console.log('CheckStoredValues after if: dst_container_width_factor =', dst_container_width_factor);
	});

	chrome.storage.local.get(['dst_container_height_factor'], function(result) {
		dst_container_height_factor = result.dst_container_height_factor;
		console.log('CheckStoredValues before if: result.dst_container_height_factor =', result.dst_container_height_factor);
		if (result.dst_container_height_factor) {
			dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
			document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
		} else {
			dst_container_height_factor = 0.225;
			dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
			document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
		}
		console.log('CheckStoredValues after if: dst_container_height_factor =', dst_container_height_factor);
	});

	chrome.storage.local.get(['dst_container_top_factor'], function(result) {
		dst_container_top_factor = result.dst_container_top_factor;
		console.log('CheckStoredValues before if: result.dst_container_top_factor =', result.dst_container_top_factor);
		if (result.dst_container_top_factor) {
			dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
			document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
		} else {
			dst_container_top_factor = 0.650;
			dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
			document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
		}
		console.log('CheckStoredValues after if: dst_container_top_factor =', dst_container_top_factor);
	});

	chrome.storage.local.get(['centerize_dst'], function(result) {
		centerize_dst = result.centerize_dst;
		console.log('centerize_dst =', centerize_dst);
		if (centerize_dst) {
			document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
		} else {
			document.querySelector("#checkbox_centerize_dst").checked = true;
		}
		console.log('CheckStoredValues after if: centerize_dst =', centerize_dst);
	});

	chrome.storage.local.get(['dst_container_left_factor'], function(result) {
		dst_container_left_factor = result.dst_container_left_factor;
		console.log('CheckStoredValues before if: result.dst_container_left_factor =', result.dst_container_left_factor);
		if (result.dst_container_left_factor) {
			dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
		} else {
			dst_container_left_factor = 0.100;
			dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
		}
		console.log('CheckStoredValues after if: dst_container_top_factor =', dst_container_top_factor);
	});

	chrome.storage.local.get(['dst_container_color'], function(result) {
		dst_container_color = result.dst_container_color;
		console.log('CheckStoredValues before if: result.dst_container_color =', result.dst_container_color);
		if (result.dst_container_color) {
			document.querySelector("#slider_dst_container_color").value = dst_container_color;
			document.querySelector("#label_dst_container_color").textContent = document.querySelector("#slider_dst_container_color").value;
		} else {
			document.querySelector("#slider_dst_container_color").value = "#000000";
			document.querySelector("#label_dst_container_color").textContent = document.querySelector("#slider_dst_container_color").value;
		}
		console.log('CheckStoredValues after if: dst_container_color =', dst_container_color);
	});

	chrome.storage.local.get(['dst_container_opacity'], function(result) {
		dst_container_opacity = result.dst_container_opacity;
		console.log('CheckStoredValues before if: result.dst_container_opacity =', result.dst_container_opacity);
		if (result.dst_container_opacity) {
			document.querySelector("#slider_dst_container_opacity").value = dst_container_opacity;
			document.querySelector("#label_dst_container_opacity").textContent = document.querySelector("#slider_dst_container_opacity").value;
		} else {
			document.querySelector("#slider_dst_container_opacity").value = 0.3;
			document.querySelector("#label_dst_container_opacity").textContent = document.querySelector("#slider_dst_container_opacity").value;
		}
		console.log('CheckStoredValues after if: dst_container_opacity =', dst_container_opacity);
	});

	chrome.storage.local.get(['save_dst'], function(result) {
		save_dst = result.save_dst;
		console.log('CheckStoredValues before if: save_dst =', save_dst);
		if (typeof save_dst === 'undefined') {
			document.querySelector("#checkbox_save_dst").checked = true;
		} else {
			if (result.save_dst === true) {
				document.querySelector("#checkbox_save_dst").checked = true;
			} else {
				document.querySelector("#checkbox_save_dst").checked = false;
			}
		}
		save_dst = document.querySelector("#checkbox_save_dst").checked;
		console.log('CheckStoredValues aftere if: save_dst =', save_dst);
		saveData('save_dst', save_dst);
	});


	chrome.storage.local.get(['pause_threshold'], function(result) {
		pause_threshold = result.pause_threshold;
		console.log('CheckStoredValues before if: result.pause_threshold =', result.pause_threshold);
		if (typeof pause_threshold === 'undefined') {
			document.querySelector("#input_pause_threshold").value = 5000;
		} else {
			document.querySelector("#input_pause_threshold").value = result.pause_threshold;
		}
		pause_threshold = document.querySelector("#input_pause_threshold").value;
		console.log('CheckStoredValues after if: pause_threshold =', pause_threshold);
		saveData('pause_threshold', pause_threshold);
	});


	if (first_check) {
		update_sample_text();
		first_check = false;
	}
};


document.querySelector("#select_src_language").addEventListener('change', function(){
	console.log('document.querySelector("#select_src_language").addEventListener("change")');
	[src, src_language_index, src_dialect, src_dialect_index] = update_src_country();
	console.log('src =', src);
	console.log('src_language_index =', src_language_index);
	console.log('src_dialect =', src_dialect);
	console.log('src_dialect_index =', src_dialect_index);
	saveData('src', src);
	saveData('src_language_index', document.querySelector("#select_src_language").selectedIndex);
	saveData('src_dialect', src_dialect);
	saveData('src_dialect_index', src_dialect_index);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_dialect", data: { value: src_dialect } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_dialect',
				data: {
					value: src_dialect
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#select_src_dialect").addEventListener('change', function(){
	console.log('document.querySelector("#select_src_dialect").addEventListener("change")');
	src_dialect = document.querySelector("#select_src_dialect").value;
	console.log('src_dialect =', src_dialect);
	src_dialect_index = document.querySelector("#select_src_dialect").selectedIndex;
	console.log('src_dialect_index =', src_dialect_index);
	saveData('src_dialect_index', src_dialect_index);
	src = src_dialect.split('-')[0];
	console.log('src =', src);
	saveData('src', src);
	src_language_index = document.querySelector("#select_src_language").selectedIndex;
	console.log('src_language_index =', src_language_index);
	saveData('src_language_index', src_language_index);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_dialect", data: { value: src_dialect } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_dialect',
				data: {
					value: src_dialect
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_show_src").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_show_src").addEventListener("change")');
	console.log('document.querySelector("#checkbox_show_src").checked =', document.querySelector("#checkbox_show_src").checked);
	show_src = document.querySelector("#checkbox_show_src").checked;
	saveData('show_src', show_src);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_show_src", data: { value: show_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_show_src',
				data: {
					value: show_src
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_show_timestamp_src").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_show_timestamp_src").addEventListener("change")');
	console.log('document.querySelector("#checkbox_show_timestamp_src").checked =', document.querySelector("#checkbox_show_timestamp_src").checked);
	show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
	saveData('show_timestamp_src', show_timestamp_src);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_show_timestamp_src", data: { value: show_timestamp_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_show_timestamp_src',
				data: {
					value: show_timestamp_src
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		} else {
			saveAllSettings();
		}
    });
});


document.querySelector("#select_dst_language").addEventListener('change', function(){
	console.log('document.querySelector("#select_dst_language").addEventListener("change")');
	[dst, dst_language_index, dst_dialect, dst_dialect_index] = update_dst_country();
	console.log('dst =', dst);
	console.log('dst_language_index =', dst_language_index);
	console.log('dst_dialect =', dst_dialect);
	console.log('dst_dialect_index =', dst_dialect_index);
	saveData('dst', dst);
	saveData('dst_language_index', document.querySelector("#select_dst_language").selectedIndex);
	saveData('dst_dialect', dst_dialect);
	saveData('dst_dialect_index', dst_dialect_index);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_dialect", data: { value: dst_dialect } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_dialect',
				data: {
					value: dst_dialect
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#select_dst_dialect").addEventListener('change', function(){
	console.log('document.querySelector("#select_dst_dialect").addEventListener("change")');
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('dst_dialect =', dst_dialect);
	dst_dialect_index = document.querySelector("#select_dst_dialect").selectedIndex;
	console.log('dst_dialect_index =', dst_dialect_index);
	saveData('dst_dialect_index', dst_dialect_index);
	dst = dst_dialect.split('-')[0];
	console.log('dst =', dst);
	saveData('dst', dst);
	dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
	console.log('dst_language_index =', dst_language_index);
	saveData('dst_language_index', dst_language_index);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_dialect", data: { value: dst_dialect } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_dialect',
				data: {
					value: dst_dialect
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_show_dst").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_show_dst").addEventListener("change")');
	console.log('document.querySelector("#checkbox_show_dst").checked =', document.querySelector("#checkbox_show_dst").checked);
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	saveData('show_dst', show_dst);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_show_dst", data: { value: show_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_show_dst',
				data: {
					value: show_dst
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_show_timestamp_dst").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_show_timestamp_dst").addEventListener("change")');
	console.log('document.querySelector("#checkbox_show_timestamp_dst").checked =', document.querySelector("#checkbox_show_timestamp_dst").checked);
	show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
	saveData('show_timestamp_dst', show_timestamp_dst);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_show_timestamp_dst", data: { value: show_timestamp_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_show_timestamp_dst',
				data: {
					value: show_timestamp_dst
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});


// Add event listeners for changes in font select and font size input
document.querySelector("#select_src_font").addEventListener("change", function(){
	console.log('document.querySelector("#select_src_font").addEventListener("change")');
	src_selected_font = document.querySelector("#select_src_font").value;
	console.log('src_selected_font =', src_selected_font);
	saveData('src_selected_font', src_selected_font);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_selected_font", data: { value: src_selected_font } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_selected_font',
				data: {
					value: src_selected_font
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_font_size").addEventListener("input", function(){
	console.log('document.querySelector("#input_src_font_size").addEventListener("input")');
	src_font_size = document.querySelector("#input_src_font_size").value;
	console.log('src_font_size =', src_font_size);
	saveData('src_font_size', src_font_size);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_font_size", data: { value: src_font_size } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_font_size',
				data: {
					value: src_font_size
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_font_size").addEventListener("change", function(){
	console.log('document.querySelector("#input_src_font_size").addEventListener("input")');
	src_font_size = document.querySelector("#input_src_font_size").value;
	console.log('src_font_size =', src_font_size);
	saveData('src_font_size', src_font_size);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_font_size", data: { value: src_font_size } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_font_size',
				data: {
					value: src_font_size
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_font_color").addEventListener("input", function(){
	console.log('document.querySelector("#slider_src_font_color").addEventListener("input")');
	src_font_color = document.querySelector("#slider_src_font_color").value;
	document.querySelector("#label_src_font_color").textContent = document.querySelector("#slider_src_font_color").value;
	console.log('src_font_color =', src_font_color);
	saveData('src_font_color', src_font_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_font_color", data: { value: src_font_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_font_color',
				data: {
					value: src_font_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_font_color").addEventListener("change", function(){
	console.log('document.querySelector("#slider_src_font_color").addEventListener("change")');
	src_font_color = document.querySelector("#slider_src_font_color").value;
	document.querySelector("#label_src_font_color").textContent = document.querySelector("#slider_src_font_color").value;
	console.log('src_font_color =', src_font_color);
	saveData('src_font_color', src_font_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_font_color", data: { value: src_font_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_font_color',
				data: {
					value: src_font_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_width_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_src_container_width_factor").addEventListener("input")');
	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
	console.log('src_container_width_factor =', src_container_width_factor);
	saveData('src_container_width_factor', src_container_width_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_width_factor", data: { value: src_container_width_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_width_factor',
				data: {
					value: src_container_width_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_width_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_src_container_width_factor").addEventListener("change")');
	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
	console.log('src_container_width_factor =', src_container_width_factor);
	saveData('src_container_width_factor', src_container_width_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_width_factor", data: { value: src_container_width_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_width_factor',
				data: {
					value: src_container_width_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_height_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_src_container_height_factor").addEventListener("input")');
	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
	src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
	console.log('src_container_height_factor =', src_container_height_factor);
	saveData('src_container_height_factor', src_container_height_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_height_factor", data: { value: src_container_height_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_height_factor',
				data: {
					value: src_container_height_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_height_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_src_container_height_factor").addEventListener("change")');
	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
	src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
	console.log('src_container_height_factor =', src_container_height_factor);
	saveData('src_container_height_factor', src_container_height_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_height_factor", data: { value: src_container_height_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_height_factor',
				data: {
					value: src_container_height_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_top_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_src_container_top_factor").addEventListener("input")');
	src_container_top_factor = document.querySelector("#input_src_container_top_factor").value;
	src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
	console.log('src_container_top_factor =', src_container_top_factor);
	saveData('src_container_top_factor', src_container_top_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_top_factor", data: { value: src_container_top_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_top_factor',
				data: {
					value: src_container_top_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_top_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_src_container_top_factor").addEventListener("change")');
	src_container_top_factor = document.querySelector("#input_src_container_top_factor").value;
	src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
	console.log('src_container_top_factor =', src_container_top_factor);
	saveData('src_container_top_factor', src_container_top_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_top_factor", data: { value: src_container_top_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_top_factor',
				data: {
					value: src_container_top_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_centerize_src").addEventListener("change", function(){
	console.log('document.querySelector("#checkbox_centerize_src").addEventListener("change")');
	centerize_src = document.querySelector("#checkbox_centerize_src").checked;
	console.log('centerize_src =', centerize_src);
	saveData('centerize_src', centerize_src);
	var textarea_rect = get_textarea_rect();
	if (document.querySelector("#checkbox_centerize_src").checked) {
		src_left = textarea_rect.src_left;
		//console.log('textarea_rect.src_left =', textarea_rect.src_left);
		src_container_left_factor = (src_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		//console.log('src_container_left_factor =', src_container_left_factor);
		document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
	} else {
		src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
		//console.log('src_container_left_factor =', src_container_left_factor);
	}
	console.log('src_container_left_factor =', src_container_left_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_src", data: { value: centerize_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_src',
				data: {
					value: centerize_src
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_left_factor", data: { value: src_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_left_factor',
				data: {
					value: src_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_left_factor").addEventListener('input', function(){
	console.log('document.querySelector("#input_src_container_left_factor").addEventListener("input")');
	src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
	src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
	console.log('src_container_left_factor =', src_container_left_factor);
	saveData('src_container_left_factor', src_container_left_factor);
	video_info = getVideoPlayerInfo();
	if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
		centerize_src = false;
		saveData('centerize_src', centerize_src);
		document.querySelector("#checkbox_centerize_src").checked = centerize_src;
	}
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_left_factor", data: { value: src_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_left_factor',
				data: {
					value: src_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_src", data: { value: centerize_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_src',
				data: {
					value: centerize_src
				}, function(response) {
					console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_src_container_left_factor").addEventListener('change', function(){
	console.log('document.querySelector("#input_src_container_left_factor").addEventListener("change")');
	var textarea_rect = get_textarea_rect();
	if (document.querySelector("#checkbox_centerize_src").checked) {
		src_left = textarea_rect.src_left;
		//console.log('textarea_rect.src_left =', textarea_rect.src_left);
		src_container_left_factor = (src_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
		//console.log('src_container_left_factor =', src_container_left_factor);
		document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
	} else {
		src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
		src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
		//console.log('src_container_left_factor =', src_container_left_factor);
	}
	console.log('src_container_left_factor =', src_container_left_factor);
	saveData('src_container_left_factor', src_container_left_factor);
	video_info = getVideoPlayerInfo();
	if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
		centerize_src = false;
		saveData('centerize_src', centerize_src);
		document.querySelector("#checkbox_centerize_src").checked = centerize_src;
	}
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_left_factor", data: { value: src_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_left_factor',
				data: {
					value: src_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_src", data: { value: centerize_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_src',
				data: {
					value: centerize_src
				}, function(response) {
					console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_container_color").addEventListener('input', function(){
	console.log('document.querySelector("#slider_src_container_color").addEventListener("input")');
	src_container_color = document.querySelector("#slider_src_container_color").value;
	document.querySelector("#label_src_container_color").textContent = document.querySelector("#slider_src_container_color").value;
	console.log('src_container_color =', src_container_color);
	saveData('src_container_color', src_container_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_color", data: { value: src_container_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_color',
				data: {
					value: src_container_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_container_color").addEventListener('change', function(){
	console.log('document.querySelector("#slider_src_container_color").addEventListener("change")');
	src_container_color = document.querySelector("#slider_src_container_color").value;
	document.querySelector("#label_src_container_color").textContent = document.querySelector("#slider_src_container_color").value;
	console.log('src_container_color =', src_container_color);
	saveData('src_container_color', src_container_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_color", data: { value: src_container_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_color',
				data: {
					value: src_container_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_container_opacity").addEventListener('input', function(){
	console.log('document.querySelector("#slider_src_container_opacity").addEventListener("input")');
	src_container_opacity = document.querySelector("#slider_src_container_opacity").value;
	document.querySelector("#label_src_container_opacity").textContent = document.querySelector("#slider_src_container_opacity").value;
	console.log('src_container_opacity =', src_container_opacity);
	saveData('src_container_opacity', src_container_opacity);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_opacity", data: { value: src_container_opacity } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_opacity',
				data: {
					value: src_container_opacity
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_src_container_opacity").addEventListener('change', function(){
	console.log('document.querySelector("#slider_src_container_opacity").addEventListener("change")');
	src_container_opacity = document.querySelector("#slider_src_container_opacity").value;
	document.querySelector("#label_src_container_opacity").textContent = document.querySelector("#slider_src_container_opacity").value;
	console.log('src_container_opacity =', src_container_opacity);
	saveData('src_container_opacity', src_container_opacity);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_src_container_opacity", data: { value: src_container_opacity } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_src_container_opacity',
				data: {
					value: src_container_opacity
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_save_src").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_save_src").addEventListener("change")');
	console.log('document.querySelector("#checkbox_save_src").checked =', document.querySelector("#checkbox_save_src").checked);
	save_src = document.querySelector("#checkbox_save_src").checked;
	saveData('save_src', save_src);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_save_src", data: { value: save_src } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_save_src',
				data: {
					value: save_src
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});



document.querySelector("#select_dst_font").addEventListener("change", function(){
	console.log('document.querySelector("#select_dst_font").addEventListener("change")');
	dst_selected_font = document.querySelector("#select_dst_font").value;
	console.log('dst_selected_font =', dst_selected_font);
	saveData('dst_selected_font', dst_selected_font);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_selected_font", data: { value: dst_selected_font } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_selected_font',
				data: {
					value: dst_selected_font
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_font_size").addEventListener("input", function(){
	console.log('document.querySelector("#input_dst_font_size").addEventListener("input")');
	dst_font_size = document.querySelector("#input_dst_font_size").value;
	console.log('dst_font_size =', dst_font_size);
	saveData('dst_font_size', dst_font_size);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_font_size", data: { value: dst_font_size } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_font_size',
				data: {
					value: dst_font_size
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_font_size").addEventListener("change", function(){
	console.log('document.querySelector("#input_dst_font_size").addEventListener("input")');
	dst_font_size = document.querySelector("#input_dst_font_size").value;
	console.log('dst_font_size =', dst_font_size);
	saveData('dst_font_size', dst_font_size);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_font_size", data: { value: dst_font_size } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_font_size',
				data: {
					value: dst_font_size
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_font_color").addEventListener("input", function(){
	console.log('document.querySelector("#slider_dst_font_color").addEventListener("input")');
	dst_font_color = document.querySelector("#slider_dst_font_color").value;
	document.querySelector("#label_dst_font_color").textContent = document.querySelector("#slider_dst_font_color").value;
	console.log('dst_font_color =', dst_font_color);
	saveData('dst_font_color', dst_font_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_font_color", data: { value: dst_font_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_font_color',
				data: {
					value: dst_font_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_font_color").addEventListener("change", function(){
	console.log('document.querySelector("#slider_dst_font_color").addEventListener("change")');
	dst_font_color = document.querySelector("#slider_dst_font_color").value;
	document.querySelector("#label_dst_font_color").textContent = document.querySelector("#slider_dst_font_color").value;
	console.log('dst_font_color =', dst_font_color);
	saveData('dst_font_color', dst_font_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_font_color", data: { value: dst_font_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_font_color',
				data: {
					value: dst_font_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_width_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_dst_container_width_factor").addEventListener("input")');
	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
	console.log('dst_container_width_factor =', dst_container_width_factor);
	saveData('dst_container_width_factor', dst_container_width_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_width_factor", data: { value: dst_container_width_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_width_factor',
				data: {
					value: dst_container_width_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_width_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_dst_container_width_factor").addEventListener("change")');
	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
	console.log('dst_container_width_factor =', dst_container_width_factor);
	saveData('dst_container_width_factor', dst_container_width_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_width_factor", data: { value: dst_container_width_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_width_factor',
				data: {
					value: dst_container_width_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_height_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_dst_container_height_factor").addEventListener("input")');
	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
	dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
	console.log('dst_container_height_factor =', dst_container_height_factor);
	saveData('dst_container_height_factor', dst_container_height_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_height_factor", data: { value: dst_container_height_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_height_factor',
				data: {
					value: dst_container_height_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_height_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_dst_container_height_factor").addEventListener("change")');
	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
	dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
	console.log('dst_container_height_factor =', dst_container_height_factor);
	saveData('dst_container_height_factor', dst_container_height_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_height_factor", data: { value: dst_container_height_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_height_factor',
				data: {
					value: dst_container_height_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_top_factor").addEventListener("input", function(){
	console.log('document.querySelector("#input_dst_container_top_factor").addEventListener("input")');
	dst_container_top_factor = document.querySelector("#input_dst_container_top_factor").value;
	dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
	console.log('dst_container_top_factor =', dst_container_top_factor);
	saveData('dst_container_top_factor', dst_container_top_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_top_factor", data: { value: dst_container_top_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_top_factor',
				data: {
					value: dst_container_top_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_top_factor").addEventListener("change", function(){
	console.log('document.querySelector("#input_dst_container_top_factor").addEventListener("change")');
	dst_container_top_factor = document.querySelector("#input_dst_container_top_factor").value;
	dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
	console.log('dst_container_top_factor =', dst_container_top_factor);
	saveData('dst_container_top_factor', dst_container_top_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_top_factor", data: { value: dst_container_top_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_top_factor',
				data: {
					value: dst_container_top_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_centerize_dst").addEventListener("change", function(){
	console.log('document.querySelector("#checkbox_centerize_dst").addEventListener("change")');
	centerize_dst = document.querySelector("#checkbox_centerize_dst").checked;
	console.log('centerize_dst =', centerize_dst);
	saveData('centerize_dst', centerize_dst);
	var textarea_rect = get_textarea_rect();
	if (document.querySelector("#checkbox_centerize_dst").checked) {
		dst_left = textarea_rect.dst_left;
		//console.log('textarea_rect.dst_left =', textarea_rect.dst_left);
		dst_container_left_factor = (dst_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		//console.log('dst_container_left_factor =', dst_container_left_factor);
		document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
	} else {
		dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
		//console.log('dst_container_left_factor =', dst_container_left_factor);
	}
	console.log('dst_container_left_factor =', dst_container_left_factor);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_dst", data: { value: centerize_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_dst',
				data: {
					value: centerize_dst
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_left_factor", data: { value: dst_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_left_factor',
				data: {
					value: dst_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_left_factor").addEventListener('input', function(){
	console.log('document.querySelector("#input_dst_container_left_factor").addEventListener("input")');
	dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
	dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
	console.log('dst_container_left_factor =', dst_container_left_factor);
	saveData('dst_container_left_factor', dst_container_left_factor);
	video_info = getVideoPlayerInfo();
	if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
		centerize_dst = false;
		saveData('centerize_dst', centerize_dst);
		document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
	}
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_left_factor", data: { value: dst_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_left_factor',
				data: {
					value: dst_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_dst", data: { value: centerize_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_dst',
				data: {
					value: centerize_dst
				}, function(response) {
					console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_dst_container_left_factor").addEventListener('change', function(){
	console.log('document.querySelector("#input_dst_container_left_factor").addEventListener("change")');
	var textarea_rect = get_textarea_rect();
	if (document.querySelector("#checkbox_centerize_dst").checked) {
		dst_left = textarea_rect.dst_left;
		//console.log('textarea_rect.dst_left =', textarea_rect.dst_left);
		dst_container_left_factor = (dst_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
		//console.log('dst_container_left_factor =', dst_container_left_factor);
		document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
	} else {
		dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
		dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
		//console.log('dst_container_left_factor =', dst_container_left_factor);
	}
	console.log('dst_container_left_factor =', dst_container_left_factor);
	saveData('dst_container_left_factor', dst_container_left_factor);
	video_info = getVideoPlayerInfo();
	if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
		centerize_dst = false;
		saveData('centerize_dst', centerize_dst);
		document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
	}
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_left_factor", data: { value: dst_container_left_factor } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_left_factor',
				data: {
					value: dst_container_left_factor
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
			console.log('chrome.runtime.sendMessage({ cmd: "changed_centerize_dst", data: { value: centerize_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_centerize_dst',
				data: {
					value: centerize_dst
				}, function(response) {
					console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_container_color").addEventListener('input', function(){
	console.log('document.querySelector("#slider_dst_container_color").addEventListener("input")');
	dst_container_color = document.querySelector("#slider_dst_container_color").value;
	document.querySelector("#label_dst_container_color").textContent = document.querySelector("#slider_dst_container_color").value;
	console.log('dst_container_color =', dst_container_color);
	saveData('dst_container_color', dst_container_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_color", data: { value: dst_container_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_color',
				data: {
					value: dst_container_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_container_color").addEventListener('change', function(){
	console.log('document.querySelector("#slider_dst_container_color").addEventListener("change")');
	dst_container_color = document.querySelector("#slider_dst_container_color").value;
	document.querySelector("#label_dst_container_color").textContent = document.querySelector("#slider_dst_container_color").value;
	console.log('dst_container_color =', dst_container_color);
	saveData('dst_container_color', dst_container_color);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_color", data: { value: dst_container_color } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_color',
				data: {
					value: dst_container_color
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_container_opacity").addEventListener('input', function(){
	console.log('document.querySelector("#slider_dst_container_opacity").addEventListener("input")');
	dst_container_opacity = document.querySelector("#slider_dst_container_opacity").value;
	document.querySelector("#label_dst_container_opacity").textContent = document.querySelector("#slider_dst_container_opacity").value;
	console.log('dst_container_opacity =', dst_container_opacity);
	saveData('dst_container_opacity', dst_container_opacity);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_opacity", data: { value: dst_container_opacity } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_opacity',
				data: {
					value: dst_container_opacity
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#slider_dst_container_opacity").addEventListener('change', function(){
	console.log('document.querySelector("#slider_dst_container_opacity").addEventListener("change")');
	dst_container_opacity = document.querySelector("#slider_dst_container_opacity").value;
	document.querySelector("#label_dst_container_opacity").textContent = document.querySelector("#slider_dst_container_opacity").value;
	console.log('dst_container_opacity =', dst_container_opacity);
	saveData('dst_container_opacity', dst_container_opacity);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_dst_container_opacity", data: { value: dst_container_opacity } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_dst_container_opacity',
				data: {
					value: dst_container_opacity
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#checkbox_save_dst").addEventListener('change', function(){
	console.log('document.querySelector("#checkbox_save_dst").addEventListener("change")');
	console.log('document.querySelector("#checkbox_save_dst").checked =', document.querySelector("#checkbox_save_dst").checked);
	save_dst = document.querySelector("#checkbox_save_dst").checked;
	saveData('save_dst', save_dst);
	update_sample_text();
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_save_dst", data: { value: save_dst } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_save_dst',
				data: {
					value: save_dst
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});

document.querySelector("#input_pause_threshold").addEventListener('change', function(){
	console.log('document.querySelector("#input_pause_threshold").addEventListener.addEventListener("change")');
	pause_threshold = document.querySelector("#input_pause_threshold").value;
	console.log('pause_threshold =', pause_threshold);
	saveData('pause_threshold', pause_threshold);
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
		} else {
			recognizing = result.recognizing;
		}
		console.log('recognizing =', recognizing);
		if (recognizing) {
			console.log('chrome.runtime.sendMessage({ cmd: "changed_pause_threshold", data: { value: pause_threshold } })');
			chrome.runtime.sendMessage({
				cmd: 'changed_pause_threshold',
				data: {
					value: pause_threshold
				}, function(response) {
					console.log('response.status =', response.status);
				}
			});
		}
		saveAllSettings();
    });
});



save_button.addEventListener('click', function(){
	saveAllSettings();
});


function update_src_country() {
    console.log('update_src_country()');
	for (var i = document.querySelector("#select_src_dialect").options.length - 1; i >= 0; i--) {
        document.querySelector("#select_src_dialect").remove(i);
    }
    var list = src_language[document.querySelector("#select_src_language").selectedIndex];
    for (var i = 1; i < list.length; i++) {
        document.querySelector("#select_src_dialect").options.add(new Option(list[i][1], list[i][0]));
    }
    document.querySelector("#select_src_dialect").style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    document.querySelector("#select_src_dialect").style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    src = document.querySelector("#select_src_dialect").value.split('-')[0];
	console.log('update_src_country(): src =', src);
	if (src_dialect === "yue-Hant-HK") {
		src = "zh-TW";
	}
	if (src_dialect === "cmn-Hans-CN") {
		src = "zh-CN";
	}
	if (src_dialect === "cmn-Hans-HK") {
		src = "zh-CN";
	}
	if (src_dialect === "cmn-Hant-TW") {
		src = "zh-TW";
	}
	src_language_index = document.querySelector("#select_src_language").selectedIndex;
	if (src_language[src_language_index].length > 2) {
		for (var j = 0; j < document.querySelector("#select_src_dialect").length; j++) {
			if (select_src_dialect[j].value === src_dialect) {
				src_dialect_index = j;
				document.querySelector("#select_src_dialect").selectedIndex = src_dialect_index;
				break;
			}
		}
	}
	if (src_language[src_language_index].length > 2) {
		src_dialect = document.querySelector("#select_src_dialect").value;
	} else {
		src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
	};
	return [src, src_language_index, src_dialect, src_dialect_index];
}


function update_dst_country() {
    console.log('update_dst_country()');
	for (var i = document.querySelector("#select_dst_dialect").options.length - 1; i >= 0; i--) {
        document.querySelector("#select_dst_dialect").remove(i);
    }
    var list = dst_language[document.querySelector("#select_dst_language").selectedIndex];
    for (var i = 1; i < list.length; i++) {
        document.querySelector("#select_dst_dialect").options.add(new Option(list[i][1], list[i][0]));
    }
    document.querySelector("#select_dst_dialect").style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    dst = document.querySelector("#select_dst_dialect").value.split('-')[0];
	console.log('update_dst_country(): dst =', dst);
	if (dst_dialect === "yue-Hant-HK") {
		dst = "zh-TW";
	}
	if (dst_dialect === "cmn-Hans-CN") {
		dst = "zh-CN";
	}
	if (dst_dialect === "cmn-Hans-HK") {
		dst = "zh-CN";
	}
	if (dst_dialect === "cmn-Hant-TW") {
		dst = "zh-TW";
	}
	dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
	if (dst_language[dst_language_index].length > 2) {
		for (var j = 0; j < document.querySelector("#select_dst_dialect").length; j++) {
			if (select_dst_dialect[j].value === dst_dialect) {
				dst_dialect_index = j;
				document.querySelector("#select_dst_dialect").selectedIndex = dst_dialect_index;
				break;
			}
		}
	}
	if (dst_language[dst_language_index].length > 2) {
		dst_dialect = document.querySelector("#select_dst_dialect").value;
	} else {
		dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
	};
	return [dst, dst_language_index, dst_dialect, dst_dialect_index];
}


function getAvailableFonts() {
    console.log('getAvailableFonts()');
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
    console.log('update_sample_text()');

	src_selected_font = document.querySelector("#select_src_font").value;
	//console.log('src_selected_font =', src_selected_font);
	//saveData('src_selected_font', src_selected_font);

	src_selected_font_index = document.querySelector("#select_src_font").selectedIndex;
	//console.log('src_selected_font_index =', src_selected_font_index);
	//saveData('src_selected_4font_index', src_selected_font_index);

    src_font_size = document.querySelector("#input_src_font_size").value;
	//console.log('src_font_size =', src_font_size);
	//saveData('src_font_size', src_font_size);

	src_font_color = document.querySelector("#slider_src_font_color").value;
	document.querySelector("#label_src_font_color").textContent = document.querySelector("#slider_src_font_color").value;
	//console.log('src_font_color =', src_font_color);
	//saveData('src_font_color', src_font_color);

	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
	//console.log('src_container_width_factor =', src_container_width_factor);
	//saveData('src_container_width_factor', src_container_width_factor);

	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
	src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
	//console.log('src_container_height_factor =', src_container_height_factor);
	//saveData('src_container_height_factor', src_container_height_factor);

	src_container_top_factor = document.querySelector("#input_src_container_top_factor").value;
	src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
	//console.log('src_container_top_factor =', src_container_top_factor);
	//saveData('src_container_top_factor', src_container_top_factor);

	centerize_src = document.querySelector("#checkbox_centerize_src").checked;
	//console.log('centerize_src =', centerize_src);
	//saveData('centerize_src', centerize_src);

	var textarea_rect = get_textarea_rect();
	if (document.querySelector("#checkbox_centerize_src").checked) {
		src_left = textarea_rect.src_left;
		//console.log('textarea_rect.src_left =', textarea_rect.src_left);
		src_container_left_factor = (src_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
		//console.log('src_container_left_factor =', src_container_left_factor);
		document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
	} else {
		src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
		src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
		//console.log('src_container_left_factor =', src_container_left_factor);
	}

	src_container_color = document.querySelector("#slider_src_container_color").value;
	document.querySelector("#label_src_container_color").textContent = document.querySelector("#slider_src_container_color").value;
	//console.log('src_container_color =', src_container_color);
	//saveData('src_container_color', src_container_color);

	src_container_opacity = document.querySelector("#slider_src_container_opacity").value;
	document.querySelector("#label_src_container_opacity").textContent = document.querySelector("#slider_src_container_opacity").value;
	//console.log('src_container_opacity =', src_container_opacity);
	//saveData('src_container_opacity', src_container_opacity);



    dst_selected_font = document.querySelector("#select_dst_font").value;
	//console.log('dst_selected_font =', dst_selected_font);
	//saveData('dst_selected_font', dst_selected_font);

	dst_selected_font_index = document.querySelector("#select_dst_font").selectedIndex;
	//console.log('dst_selected_font_index =', dst_selected_font_index);
	//saveData('dst_selected_font_index', dst_selected_font_index);

    dst_font_size = document.querySelector("#input_dst_font_size").value;
	//console.log('dst_font_size =', dst_font_size);
	//saveData('dst_font_size', dst_font_size);

	dst_font_color = document.querySelector("#slider_dst_font_color").value;
	document.querySelector("#label_dst_font_color").textContent = document.querySelector("#slider_dst_font_color").value;
	//console.log('dst_font_color =', dst_font_color);
	//saveData('dst_font_color', dst_font_color);

	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
	//console.log('dst_container_width_factor =', dst_container_width_factor);
	//saveData('dst_container_width_factor', dst_container_width_factor);

	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
	dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
	//console.log('dst_container_height_factor =', dst_container_height_factor);
	//saveData('dst_container_height_factor', dst_container_width_factor);

	dst_container_top_factor = document.querySelector("#input_dst_container_top_factor").value;
	dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
	//console.log('dst_container_top_factor =', dst_container_top_factor);
	//saveData('dst_container_top_factor', dst_container_top_factor);

	centerize_dst = document.querySelector("#checkbox_centerize_dst").checked;
	//console.log('centerize_dst =', centerize_dst);
	//saveData('centerize_dst', centerize_dst);

	if (document.querySelector("#checkbox_centerize_dst").checked) {
		dst_left = textarea_rect.dst_left;
		//console.log('textarea_rect.dst_left =', textarea_rect.dst_left);
		dst_container_left_factor = (dst_left - getRect(document.querySelector("#my_yt_iframe")).left)/getRect(document.querySelector("#my_yt_iframe")).width;
		dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
		//console.log('dst_container_left_factor =', dst_container_left_factor);
		document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
	} else {
		dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
		dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
		//console.log('dst_container_left_factor =', dst_container_left_factor);
	}

	dst_container_color = document.querySelector("#slider_dst_container_color").value;
	document.querySelector("#label_dst_container_color").textContent = document.querySelector("#slider_dst_container_color").value;
	//console.log('dst_container_color =', dst_container_color);
	//saveData('dst_container_color', dst_container_color);

	dst_container_opacity = document.querySelector("#slider_dst_container_opacity").value;
	document.querySelector("#label_dst_container_opacity").textContent = document.querySelector("#slider_dst_container_opacity").value;
	//console.log('dst_container_opacity =', dst_container_opacity);
	//saveData('dst_container_opacity', dst_container_opacity);

	saveAllSettings();

	if (document.querySelector("#src_textarea_container") || document.querySelector("#dst_textarea_container")) {
		regenerate_textarea();
	} else {
		create_modal_text_area();
	}

}


document.addEventListener('fullscreenchange', function(event) {
	console.log('document.addEventListener("fullscreenchange")');
	update_sample_text();
});


window.addEventListener('resize', function(event){
	console.log('window.addEventListener("resize")');
	update_sample_text();
});


function hexToRgba(hex, opacity) {
	let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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


function get_textarea_rect() {
	src_width = document.querySelector("#input_src_container_width_factor").value*getRect(document.querySelector("#my_yt_iframe")).width;
	//console.log('src_width =', src_width);

	src_height = document.querySelector("#input_src_container_height_factor").value*getRect(document.querySelector("#my_yt_iframe")).height;
	//console.log('src_height =', src_width);

	src_top = getRect(document.querySelector("#my_yt_iframe")).top + document.querySelector("#input_src_container_top_factor").value*getRect(document.querySelector("#my_yt_iframe")).height;
	//console.log('src_top =', src_top);

	if (document.querySelector("#checkbox_centerize_src").checked) {
		src_left = getRect(document.querySelector("#my_yt_iframe")).left + 0.5*(getRect(document.querySelector("#my_yt_iframe")).width - document.querySelector("#input_src_container_width_factor").value*getRect(document.querySelector("#my_yt_iframe")).width);
		//console.log('src_left =', src_left);
	} else {
		src_left = getRect(document.querySelector("#my_yt_iframe")).left + document.querySelector("#input_src_container_left_factor").value*getRect(document.querySelector("#my_yt_iframe")).width;
		//console.log('src_left =', src_left);
	}

	dst_width = document.querySelector("#input_dst_container_width_factor").value*getRect(document.querySelector("#my_yt_iframe")).width;
	//console.log('dst_width =', dst_width);
		
	dst_height = document.querySelector("#input_dst_container_height_factor").value*getRect(document.querySelector("#my_yt_iframe")).height;
	//console.log('dst_height =', dst_height);

	dst_top = getRect(document.querySelector("#my_yt_iframe")).top + document.querySelector("#input_dst_container_top_factor").value*getRect(document.querySelector("#my_yt_iframe")).height;
	//console.log('dst_top =', dst_top);

	if (document.querySelector("#checkbox_centerize_dst").checked) {
		dst_left = getRect(document.querySelector("#my_yt_iframe")).left + 0.5*(getRect(document.querySelector("#my_yt_iframe")).width - document.querySelector("#input_dst_container_width_factor").value*getRect(document.querySelector("#my_yt_iframe")).width);
		//console.log('dst_left =', dst_left);
	} else {
		dst_left = getRect(document.querySelector("#my_yt_iframe")).left + document.querySelector("#input_dst_container_left_factor").value*getRect(document.querySelector("#my_yt_iframe")).width;
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
	console.log('regenerate_textarea()');
	var textarea_rect = get_textarea_rect();

	if (document.querySelector("#checkbox_show_src").checked) {
		saveData('show_src', show_src);
		if (document.querySelector("#src_textarea_container")) {
			document.querySelector("#src_textarea_container").style.display = 'block';
			document.querySelector("#src_textarea_container").style.fontFamily = document.querySelector("#select_src_font").value + ", sans-serif";
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
					'fontFamily': document.querySelector("#select_src_font").value + ', sans-serif',
					'fontSize': font_scale * document.querySelector("#input_src_font_size").value - 1,
					'color': document.querySelector("#slider_src_font_color").value,
					'backgroundColor': hexToRgba(document.querySelector("#slider_src_container_color").value, document.querySelector("#slider_src_container_opacity").value),
					'border': 'none',
					'display': 'block',
					'overflow': 'hidden',
					'z-index': '2147483647'
				})
				.offset({top:textarea_rect.src_top, left:textarea_rect.src_left})

			src = document.querySelector("#select_src_dialect").value.split('-')[0];
			console.log('src =', src);
			if (timestamped_sample_text && src) var tt_src = gtranslate(timestamped_sample_text, 'en', src).then((result => {

				result = formatTranscript(result);
				src_timestamped_sample_text = result;

				show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
				//console.log('show_timestamp_src =', show_timestamp_src);

				if (src_timestamped_sample_text) {
					show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
					saveData('show_timestamp_src', show_timestamp_src);
					if (document.querySelector("#checkbox_show_timestamp_src").checked) {
						document.querySelector("#src_textarea").value = src_timestamped_sample_text;
						//console.log('src_timestamped_sample_text =', src_timestamped_sample_text);
					} else {
						document.querySelector("#src_textarea").value = removeTimestamps(src_timestamped_sample_text);
					}
					document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
				}
			}));

			document.querySelector("#src_textarea").style.width = String(textarea_rect.src_width)+'px';
			document.querySelector("#src_textarea").style.height = String(textarea_rect.src_height)+'px';
			document.querySelector("#src_textarea").style.width = '100%';
			document.querySelector("#src_textarea").style.height = '100%';
			document.querySelector("#src_textarea").style.border = 'none';
			document.querySelector("#src_textarea").style.display = 'inline-block';
			document.querySelector("#src_textarea").style.overflow = 'hidden';

			document.querySelector("#src_textarea").style.fontFamily = document.querySelector("#select_src_font").value + ", sans-serif";
			document.querySelector("#src_textarea").style.fontSize = String(font_scale * document.querySelector("#input_src_font_size").value - 1) + 'px';
			document.querySelector("#src_textarea").style.color = document.querySelector("#slider_src_font_color").value;
			document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(document.querySelector("#slider_src_container_color").value, document.querySelector("#slider_src_container_opacity").value);

		} else {
			console.log('src_textarea_container has already exist');
		}
	} else {
		saveData('show_src', show_src);
		if (document.querySelector("#src_textarea_container")) {
			document.querySelector("#src_textarea_container").style.display = 'none';
		}
	}


	if (document.querySelector("#checkbox_show_dst").checked) {
		saveData('show_dst', show_dst);
		if (document.querySelector("#dst_textarea_container")) {
			document.querySelector("#dst_textarea_container").style.display = 'block';
			document.querySelector("#dst_textarea_container").style.fontFamily = document.querySelector("#select_dst_font").value + ", sans-serif";
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
					'fontFamily': document.querySelector("#select_dst_font").value + ', sans-serif',
					'fontSize': font_scale * document.querySelector("#input_dst_font_size").value - 1,
					'color': document.querySelector("#slider_dst_font_color").value,
					'backgroundColor': hexToRgba(document.querySelector("#slider_dst_container_color").value, document.querySelector("#slider_dst_container_opacity").value),
					'border': 'none',
					'display': 'block',
					'overflow': 'hidden',
					'z-index': '2147483647'
				})
				.offset({top:textarea_rect.dst_top, left:textarea_rect.dst_left})

			dst = document.querySelector("#select_dst_dialect").value.split('-')[0];
			console.log('dst =', dst);
			if (timestamped_sample_text && dst) var tt_dst = gtranslate(timestamped_sample_text, 'en', dst).then((result => {

				result = formatTranscript(result);
				dst_timestamped_sample_text = result;

				show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
				//console.log('show_timestamp_dst =', show_timestamp_dst);

				if (dst_timestamped_sample_text) {
					show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
					saveData('show_timestamp_dst', show_timestamp_dst);
					if (document.querySelector("#checkbox_show_timestamp_dst").checked) {
						document.querySelector("#dst_textarea").value = dst_timestamped_sample_text;
						console.log('dst_timestamped_sample_text =', dst_timestamped_sample_text);
					} else {
						document.querySelector("#dst_textarea").value = removeTimestamps(dst_timestamped_sample_text);
					}
					document.querySelector("#dst_textarea").scrollTop = document.querySelector("#dst_textarea").scrollHeight;
				}
			}));

			document.querySelector("#dst_textarea").style.width = String(textarea_rect.dst_width)+'px';
			document.querySelector("#dst_textarea").style.height = String(textarea_rect.dst_height)+'px';
			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';
			document.querySelector("#dst_textarea").style.border = 'none';
			document.querySelector("#dst_textarea").style.display = 'inline-block';
			document.querySelector("#dst_textarea").style.overflow = 'hidden';

			document.querySelector("#dst_textarea").style.fontFamily = document.querySelector("#select_dst_font").value + ", sans-serif";
			document.querySelector("#dst_textarea").style.fontSize = String(font_scale * document.querySelector("#input_dst_font_size").value - 1) + 'px';
			document.querySelector("#dst_textarea").style.color = document.querySelector("#slider_dst_font_color").value;
			document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(document.querySelector("#slider_dst_container_color").value, document.querySelector("#slider_dst_container_opacity").value);

		} else {
			console.log('dst_textarea_container has already exist');
		}

	} else {
		saveData('show_dst', show_dst);
		if (document.querySelector("#dst_textarea_container")) {
			document.querySelector("#dst_textarea_container").style.display = 'none';
		}
	}
}


function create_modal_text_area() {
	console.log("Create modal text area");

	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
	src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);

	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
	dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);

	var textarea_rect = get_textarea_rect();
	video_info = getVideoPlayerInfo();

	if (document.querySelector("#checkbox_show_src").checked) {
		saveData("show_src", show_src);
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
				'fontFamily': document.querySelector("#select_src_font").value + ', sans-serif',
				'fontSize': font_scale * document.querySelector("#input_src_font_size").value - 1,
				'color': document.querySelector("#slider_src_font_color").value,
				'backgroundColor': hexToRgba(document.querySelector("#slider_src_container_color").value, document.querySelector("#slider_src_container_opacity").value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:textarea_rect.src_top, left:textarea_rect.src_left})

		if (!document.querySelector("#src_textarea_container")) {
			console.log('appending src_textarea_container to html body');
			src_textarea_container$.appendTo('body');
		} else {
			console.log('src_textarea_container has already exist');
		}

		src = document.querySelector("#select_src_dialect").value.split('-')[0];
		console.log('src =', src);
		if (timestamped_sample_text && src) var tt_src = gtranslate(timestamped_sample_text, 'en', src).then((result => {

			result = formatTranscript(result);
			src_timestamped_sample_text = result;

			show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
			saveData('show_timestamp_src', show_timestamp_src);
			//console.log('show_timestamp_src =', show_timestamp_src);
			if (document.querySelector("#checkbox_show_timestamp_src").checked) {
				document.querySelector("#src_textarea").value = src_timestamped_sample_text;
				//console.log('src_timestamped_sample_text =', src_timestamped_sample_text);
			} else {
				document.querySelector("#src_textarea").value = removeTimestamps(src_timestamped_sample_text);
			}
			document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
		}));

		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';
		document.querySelector("#src_textarea").style.allow = "fullscreen";

		document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea").style.color = src_font_color;
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(document.querySelector("#slider_src_container_color").value, document.querySelector("#slider_src_container_opacity").value);
		document.querySelector("#src_textarea").style.fontSize = String(font_scale * src_font_size - 1) + 'px';

		document.querySelector("#src_textarea").offsetParent.onresize = (function(){

			document.querySelector("#src_textarea").style.position='absolute';
			document.querySelector("#src_textarea").style.width = '100%';
			document.querySelector("#src_textarea").style.height = '100%';

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
				document.querySelector("#checkbox_centerize_src").checked = false;
			}

			video_info = getVideoPlayerInfo();
			if (video_info) {
				src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/video_info.width;
				src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
				//console.log('src_container_width_factor =', src_container_width_factor);
				document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
				saveData("src_container_width_factor", src_container_width_factor);

				src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/video_info.height;
				src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
				//console.log('src_container_height_factor =', src_container_height_factor);
				document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
				saveData("src_container_height_factor", src_container_height_factor);
			} else {
				src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/window.innerWidth;
				src_container_width_factor = parseFloat(src_container_width_factor).toFixed(3);
				//console.log('src_container_width_factor =', src_container_width_factor);
				document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
				saveData("src_container_width_factor", src_container_width_factor);

				src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/window.innerHeight;
				src_container_height_factor = parseFloat(src_container_height_factor).toFixed(3);
				//console.log('src_container_height_factor =', src_container_height_factor);
				document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
				saveData("src_container_height_factor", src_container_height_factor);
			}

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
				centerize_src = false;
				saveData('centerize_src', centerize_src);
				document.querySelector("#checkbox_centerize_src").checked = centerize_src;
			}

			chrome.storage.local.get(['recognizing'], (result) => {
				if (chrome.runtime.lastError) {
					console.error("Error retrieving data: ", chrome.runtime.lastError);
					return;
				}
				console.log('result =', result);
				if (typeof result.recognizing === 'undefined') {
					recognizing = false;
				} else {
					recognizing = result.recognizing;
				}
				console.log('recognizing =', recognizing);
				if (recognizing) {
					// SENDING MESSAGES TO background.js
					chrome.runtime.sendMessage({
						cmd: 'changed_src_container_width_factor',
						data: {
							value: src_container_width_factor
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
					chrome.runtime.sendMessage({
						cmd: 'changed_src_container_height_factor',
						data: {
							value: src_container_height_factor
						}, function(response) {
							console.log('response.status =', response.status);
						}
					});
				} else {
					// After do saveData() to save a single data into settings we need to do saveAllSettings() to make them written correctly in chrome storage
					saveAllSettings();
				}
			});
		});


		document.querySelector("#src_textarea").offsetParent.ondrag = (function(){

			document.querySelector("#src_textarea").style.position='absolute';

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
				document.querySelector("#checkbox_centerize_src").checked = false;
			}

			video_info = getVideoPlayerInfo();
			if (video_info) {
				src_container_top_factor = (getRect(document.querySelector("#src_textarea_container")).top - video_info.top)/video_info.height;
				src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
				document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
				//console.log('src_container_top_factor =', src_container_top_factor);
				saveData("src_container_top_factor", src_container_top_factor);

				src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/video_info.width;
				src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
				document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
				//console.log('src_container_left_factor =', src_container_left_factor);
				saveData("src_container_left_factor", src_container_left_factor);
			} else {
				src_container_top_factor = getRect(document.querySelector("#src_textarea_container")).top/window.innerHeight;
				src_container_top_factor = parseFloat(src_container_top_factor).toFixed(3);
				document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
				//console.log('src_container_top_factor =', src_container_top_factor);
				saveData("src_container_top_factor", src_container_top_factor);

				src_container_left_factor = getRect(document.querySelector("#src_textarea_container")).left/window.innerWidth;
				src_container_left_factor = parseFloat(src_container_left_factor).toFixed(3);
				document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
				//console.log('src_container_left_factor =', src_container_left_factor);
				saveData("src_container_left_factor", src_container_left_factor);
			}

			if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#src_textarea_container")).width)) {
				centerize_src = false;
				saveData('centerize_src', centerize_src);
				document.querySelector("#checkbox_centerize_src").checked = centerize_src;
			}

			chrome.storage.local.get(['recognizing'], (result) => {
				if (chrome.runtime.lastError) {
					console.error("Error retrieving data: ", chrome.runtime.lastError);
					return;
				}
				console.log('result =', result);
				if (typeof result.recognizing === 'undefined') {
					recognizing = false;
				} else {
					recognizing = result.recognizing;
				}
				console.log('recognizing =', recognizing);
				if (recognizing) {
					// SENDING MESSAGES TO background.js
					chrome.runtime.sendMessage({
						cmd: 'changed_src_container_top_factor',
						data: {
							value: src_container_top_factor
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
					chrome.runtime.sendMessage({
						cmd: 'changed_src_container_left_factor',
						data: {
							value: src_container_left_factor
						}, function(response) {
							console.log('response.status =', response.status);
						}
					});
				} else {
					// After do saveData() to save a single data into settings we need to do saveAllSettings() to make them written correctly in chrome storage
					saveAllSettings();
				}
			});
		});
	} else {
		saveData("show_src", show_src);
		if (document.querySelector("#src_textarea_container")) {
			document.querySelector("#src_textarea_container").style.display = 'none';
		}
	}



	if (document.querySelector("#checkbox_show_dst").checked) {
		saveData("show_dst", show_dst);
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
				'fontFamily': document.querySelector("#select_dst_font").value + ', sans-serif',
				'fontSize': font_scale * document.querySelector("#input_dst_font_size").value - 1,
				'color': document.querySelector("#slider_dst_font_color").value,
				'backgroundColor': hexToRgba(document.querySelector("#slider_dst_container_color").value, document.querySelector("#slider_dst_container_opacity").value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:textarea_rect.dst_top, left:textarea_rect.dst_left})

		if (!document.querySelector("#dst_textarea_container")) {
			console.log('appending dst_textarea_container to html body');
			dst_textarea_container$.appendTo('body');
		} else {
			console.log('dst_textarea_container has already exist');
		}


		dst = document.querySelector("#select_dst_dialect").value.split('-')[0];
		console.log('dst =', dst);
		if (timestamped_sample_text && dst) var tt_dst = gtranslate(timestamped_sample_text, 'en', dst).then((result => {

			result = formatTranscript(result);
			dst_timestamped_sample_text = result;

			show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
			saveData('show_timestamp_dst', show_timestamp_dst);
			//console.log('show_timestamp_dst =', show_timestamp_dst);
			if (document.querySelector("#checkbox_show_timestamp_dst").checked) {
				document.querySelector("#dst_textarea").value = dst_timestamped_sample_text;
				//console.log('dst_timestamped_sample_text =', dst_timestamped_sample_text);
			} else {
				document.querySelector("#dst_textarea").value = removeTimestamps(dst_timestamped_sample_text);
			}
			document.querySelector("#dst_textarea").scrollTop = document.querySelector("#dst_textarea").scrollHeight;
		}));


		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';
		document.querySelector("#dst_textarea").style.allow = "fullscreen";

		document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea").style.color = dst_font_color;
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(document.querySelector("#slider_dst_container_color").value, document.querySelector("#slider_dst_container_opacity").value);
		document.querySelector("#dst_textarea").style.fontSize = String(font_scale * dst_font_size - 1) + 'px';

		document.querySelector("#dst_textarea").offsetParent.onresize = (function(){

			document.querySelector("#dst_textarea").style.position='absolute';
			document.querySelector("#dst_textarea").style.width = '100%';
			document.querySelector("#dst_textarea").style.height = '100%';

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
				document.querySelector("#checkbox_centerize_dst").checked = false;
			}

			video_info = getVideoPlayerInfo();
			if (video_info) {
				dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/video_info.width;
				dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
				//console.log('dst_container_width_factor =', dst_container_width_factor);
				document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
				saveData("dst_container_width_factor", dst_container_width_factor);

				dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/video_info.height;
				dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
				//console.log('dst_container_height_factor =', dst_container_height_factor);
				document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
				saveData("dst_container_height_factor", dst_container_height_factor);
			} else {
				dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/window.innerWidth;
				dst_container_width_factor = parseFloat(dst_container_width_factor).toFixed(3);
				//console.log('dst_container_width_factor =', dst_container_width_factor);
				document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
				saveData("dst_container_width_factor", dst_container_width_factor);

				dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/window.innerHeight;
				dst_container_height_factor = parseFloat(dst_container_height_factor).toFixed(3);
				//console.log('dst_container_height_factor =', dst_container_height_factor);
				document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
				saveData("dst_container_height_factor", dst_container_height_factor);
			}

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
				centerize_dst = false;
				saveData('centerize_dst', centerize_dst);
				document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
			}

			chrome.storage.local.get(['recognizing'], (result) => {
				if (chrome.runtime.lastError) {
					console.error("Error retrieving data: ", chrome.runtime.lastError);
					return;
				}
				console.log('result =', result);
				if (typeof result.recognizing === 'undefined') {
					recognizing = false;
				} else {
					recognizing = result.recognizing;
				}
				console.log('recognizing =', recognizing);
				if (recognizing) {
					// SENDING MESSAGES TO background.js
					chrome.runtime.sendMessage({
						cmd: 'changed_dst_container_width_factor',
						data: {
							value: dst_container_width_factor
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
					chrome.runtime.sendMessage({
						cmd: 'changed_dst_container_height_factor',
						data: {
							value: dst_container_height_factor
						}, function(response) {
							console.log('response.status =', response.status);
						}
					});
				} else {
					// After do saveData() to save a single data into settings we need to do saveAllSettings() to make them written correctly in chrome storage
					saveAllSettings();
				}
			});
		});


		document.querySelector("#dst_textarea").offsetParent.ondrag = (function(){

			document.querySelector("#dst_textarea").style.position='absolute';

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
				document.querySelector("#checkbox_centerize_dst").checked = false;
			}

			video_info = getVideoPlayerInfo();
			if (video_info) {
				dst_container_top_factor = (getRect(document.querySelector("#dst_textarea_container")).top - video_info.top)/video_info.height;
				dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
				document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
				//console.log('dst_container_top_factor =', dst_container_top_factor);
				saveData("dst_container_top_factor", dst_container_top_factor);

				dst_container_left_factor = (getRect(document.querySelector("#dst_textarea_container")).left - video_info.left)/video_info.width;
				dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
				document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
				//console.log('dst_container_left_factor =', dst_container_left_factor);
				saveData("dst_container_left_factor", dst_container_left_factor);
			} else {
				dst_container_top_factor = getRect(document.querySelector("#dst_textarea_container")).top/window.innerHeight;
				dst_container_top_factor = parseFloat(dst_container_top_factor).toFixed(3);
				document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
				//console.log('dst_container_top_factor =', dst_container_top_factor);
				saveData("dst_container_top_factor", dst_container_top_factor);

				dst_container_left_factor = getRect(document.querySelector("#dst_textarea_container")).left/window.innerWidth;
				dst_container_left_factor = parseFloat(dst_container_left_factor).toFixed(3);
				document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
				//console.log('dst_container_left_factor =', dst_container_left_factor);
				saveData("dst_container_left_factor", dst_container_left_factor);
			}

			if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5 * (video_info.width - getRect(document.querySelector("#dst_textarea_container")).width)) {
				centerize_dst = false;
				saveData('centerize_dst', centerize_dst);
				document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
			}

			chrome.storage.local.get(['recognizing'], (result) => {
				if (chrome.runtime.lastError) {
					console.error("Error retrieving data: ", chrome.runtime.lastError);
					return;
				}
				console.log('result =', result);
				if (typeof result.recognizing === 'undefined') {
					recognizing = false;
				} else {
					recognizing = result.recognizing;
				}
				console.log('recognizing =', recognizing);
				if (recognizing) {
					// SENDING MESSAGES TO background.js
					chrome.runtime.sendMessage({
						cmd: 'changed_dst_container_top_factor',
						data: {
							value: dst_container_top_factor
						}, function(response) {
							console.log('response.status =', response.status); //GET RESPONSE FROM settings.js LISTENER
						}
					});
					chrome.runtime.sendMessage({
						cmd: 'changed_dst_container_left_factor',
						data: {
							value: dst_container_left_factor
						}, function(response) {
							console.log('response.status =', response.status);
						}
					});
				} else {
					// After do saveData() to save a single data into settings we need to do saveAllSettings() to make them written correctly in chrome storage
					saveAllSettings();
				}
			});
		});
	} else {
		saveData("show_dst", show_dst);
		if (document.querySelector("#dst_textarea_container")) {
			document.querySelector("#dst_textarea_container").style.display = 'none';
		}
	}
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
			var videoPlayerID = elements[i].id;
			var style = window.getComputedStyle(elements[i]);
			//console.log('videoPlayerID =',  videoPlayerID);
			var position = style.position !== 'static' ? style.position : 'relative';
			var zIndex = style.zIndex !== 'auto' && style.zIndex !== '0' ? parseInt(style.zIndex) : 1;

			return {
				element: elements[i],
				id: elements[i].id,
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
				position: position,
				zIndex: zIndex,
			};
		}
	}
	//console.log('No video player found');
	return null;
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


function removeEmptyLines(transcript) {
    // Split the transcript into individual lines
    const lines = transcript.split('\n');
    // Filter out empty lines and join the remaining lines back into a single string
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    return nonEmptyLines.join('\n');
}


function removeTimestamps(transcript) {
	transcript = formatTranscript(transcript);
	console.log('transcript =', transcript);
	var timestampPattern = /(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /;
	//var timestampPattern = /(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /;
	console.log('timestampPattern =', timestampPattern);
	var lines = transcript.split('\n');
	console.log('lines =', lines);
	var cleanedLines = lines.map(line => line.replace(timestampPattern, ''));
	console.log('cleanedLines =', cleanedLines);
	return cleanedLines.join('\n');
}


function removeTimestampsForChinese(transcript) {
    // Regular expression pattern to match the timestamps, accommodating Chinese full-width colon
    //const timestampPattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\s*：/g;
	const timestampPattern = /\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{2,4}-\d{2}-\d{2,4} \d{2}:\d{2}:\d{2}\.\d{3}\s*：/g;
    
    // Replace the matched timestamps with an empty string
    return transcript.replace(timestampPattern, '');
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


function capitalizeSentences(transcription) {
	//console.log('transcription =', transcription);

    // Split the transcription into individual lines
    const lines = transcription.split('\n');
    
    // Iterate over each line
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
		// Split each line by colon to separate startTimestamp and sentence
        //const parts = lines[i].split(' : ');
		const colon = lines[i].match(/\s*: /);
		const parts = lines[i].split(colon);
		//console.log('parts[0] =', parts[0]);
		//console.log('parts[1] =', parts[1]);

        // If the line is in the correct format (startTimestamp : sentence)
        if (parts.length === 2) {
            // Capitalize the first character of the sentence
            const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);

            // Replace the original sentence with the capitalized one
			lines[i] = parts[0] + colon + capitalizedSentence;
			//console.log('i =', i );
			//console.log('lines[i] =', lines[i] );
        }
    }
    
    // Join the lines back into a single string and return
	//console.log('lines.join("\n") =', lines.join('\n'));
    return lines.join('\n');
}


function formatTranscript(transcript) {
	// Give space between colon and sentence
	transcript = transcript.replace(/：/g, ": ");
	//transcript = transcript.replace(/(\d{2}[:：]\d{2}[:：]\d{2}\.\d{3}\s*[:：])/g, '$1 ');
	// Give space between timestamp and colon
	transcript = transcript.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})(:)/g, '$1 :');
	// Replace commas with periods in timestamps
	transcript = transcript.replace(/(\d+),(\d+)/g, '$1.$2');
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


function createTimeStampedSampleText() {
	end_time_1 = new Date(start_time_1.getTime()); // Create a new Date object based on start_time_1
	end_time_1.setSeconds(end_time_1.getSeconds() + 10);
	//console.log('end_time_1 =', end_time_1);

	startTimestamp1 = formatTimestampToISOLocalString(start_time_1);
	//console.log('startTimestamp1 =', startTimestamp1);

	endTimestamp1 = formatTimestampToISOLocalString(end_time_1);
	//console.log('endTimestamp1 =', endTimestamp1);

	timestamped_sample_text_1 = startTimestamp1 + ' ' + timestamp_separator + ' ' + endTimestamp1 + ' : ' + sample_text_1;
	//console.log('timestamped_sample_text_1 =', timestamped_sample_text_1);

	start_time_2 = new Date(end_time_1.getTime()); // Create a new Date object based on end_time_1
	start_time_2.setSeconds(start_time_2.getSeconds() + 30);
	//console.log('start_time_2 =', start_time_2);

	end_time_2 = new Date(start_time_2.getTime()); // Create a new Date object based on start_time
	end_time_2.setSeconds(end_time_2.getSeconds() + 10);
	//console.log('end_time_2 =', end_time_2);

	startTimestamp2 = formatTimestampToISOLocalString(start_time_2);
	//console.log('startTimestamp2 =', startTimestamp2);

	endTimestamp2 = formatTimestampToISOLocalString(end_time_2);
	//console.log('endTimestamp2 =', endTimestamp2);

	timestamped_sample_text_2 = startTimestamp2 + ' ' + timestamp_separator + ' ' + endTimestamp2 + ' : ' + sample_text_2;
	//console.log('timestamped_sample_text_2 =', timestamped_sample_text_2);

	timestamped_sample_text = timestamped_sample_text_1 + "\n" + timestamped_sample_text_2;
	//console.log('timestamped_sample_text =', timestamped_sample_text);

	return timestamped_sample_text;
}


var debounceTimeout;
function saveData(key, data) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        // Retrieve current settings
        chrome.storage.local.get(['settings'], (result) => {
            let settings = result.settings || {};
            settings[key] = data;
            chrome.storage.local.set({ 'settings': settings }, () => {
                console.log(key + ' = ' + data  + ' saved within settings.');
                setTimeout(() => {
                    verifyData(key, data, 'settings');
                }, 100);
            });
        });
    }, 100);
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


var Timeout;
function checkData(key, data, parentKey = null) {
    clearTimeout(Timeout);
    Timeout = setTimeout(() => {
		//chrome.storage.local.get([key], function(result) {
		chrome.storage.local.get([parentKey || key], (result) => {
			if (parentKey) {
				data = result[parentKey][key];
				console.log(result[parentKey][key] === data ? 'Data verified.' : 'Data verification failed.');
				console.log('parentKey =', parentKey);
				console.log('result[parentKey] =', result[parentKey]);
				console.log('result.parentKey =', result.parentKey);
			} else {
				data = result[key];
				console.log(result[key] === data ? 'Data verified.' : 'Data verification failed.');
				console.log('key =', key);
				console.log('result[key] =', result[key]);
				console.log('result.key =', result.key);
			}
        });
    }, 1500); // Adjust the timeout as needed
}


function getData(key, callback) {
    chrome.storage.local.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
        
        let settings = result.settings || {};
        callback(settings[key]);
    });
}


function getRecognizingStatus() {
    chrome.storage.local.get(['recognizing'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data: ", chrome.runtime.lastError);
            return;
        }
		console.log('result =', result);
		if (typeof result.recognizing === 'undefined') {
			recognizing = false;
			return recognizing;
		} else {
			recognizing = result.recognizing;
			return recognizing;
		}
    });
}


function saveSetting(key, value, callback) {
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


function saveAllSettings() {
    const settings = {
        'src': src,
        'src_language_index': src_language_index,
        'src_dialect': src_dialect,
        'src_dialect_index': src_dialect_index,
        'dst': dst,
        'dst_language_index': dst_language_index,
        'dst_dialect': dst_dialect,
        'dst_dialect_index': dst_dialect_index,
        'show_src': show_src,
        'show_dst': show_dst,
        'show_timestamp_src': show_timestamp_src,
        'show_timestamp_dst': show_timestamp_dst,
        'save_src': save_src,
        'save_dst': save_dst,
        'pause_threshold': pause_threshold,

        'src_selected_font_index': src_selected_font_index,
        'src_selected_font': src_selected_font,
        'src_font_size': src_font_size,
        'src_font_color': src_font_color,
        'src_container_width_factor': src_container_width_factor,
        'src_container_height_factor': src_container_height_factor,
        'src_container_top_factor': src_container_top_factor,
        'src_container_left_factor': src_container_left_factor,
        'centerize_src': centerize_src,
        'src_container_color': src_container_color,
        'src_container_opacity': src_container_opacity,

        'dst_selected_font_index': dst_selected_font_index,
        'dst_selected_font': dst_selected_font,
        'dst_font_size': dst_font_size,
        'dst_font_color': dst_font_color,
        'dst_container_width_factor': dst_container_width_factor,
        'dst_container_height_factor': dst_container_height_factor,
        'dst_container_top_factor': dst_container_top_factor,
        'dst_container_left_factor': dst_container_left_factor,
        'centerize_dst': centerize_dst,
        'dst_container_color': dst_container_color,
        'dst_container_opacity': dst_container_opacity,
    };

    const keys = Object.keys(settings);
    let index = 0;

    function saveNext() {
        if (index < keys.length) {
            const key = keys[index];
            const value = settings[key];
            saveSetting(key, value, function() {
                index++;
                setTimeout(saveNext, 100); // Adjust the delay as necessary
            });
        } else {
            console.log("All data saved successfully.");
        }
    }

    saveNext();
}
