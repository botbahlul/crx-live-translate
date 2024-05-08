var src, dst, language_index, translate_language_index, src_dialect, dst_dialect, dialect_index, translate_dialect_index, show_original, show_translation, selectedFontIndex, selectedFont, fontSize, fontColor, fontSelect, fontSizeInput, fontColorInput, sampleText, fonts;

fontSelect = document.getElementById("fontSelect");
fontSizeInput = document.getElementById("fontSize");
fontColorInput = document.getElementById("fontColor");
sampleText = document.getElementById("sampleText");
fonts = getAvailableFonts();
fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    fontSelect.appendChild(option);
});

document.addEventListener('DOMContentLoaded', (event) => {
	CheckStoredValues();
});

function CheckStoredValues() {

	chrome.storage.sync.get(['src'], function(result) {
		src = result.src;
		console.log('src =', src);
	});

	chrome.storage.sync.get(['language_index'], function(result) {
		language_index = result.language_index;
		console.log('language_index =', language_index);
		if (!language_index) language_index='1';
		select_language.selectedIndex = language_index;
		update_Country();
	});

	chrome.storage.sync.get(['src_dialect'], function(result) {
		src_dialect = result.src_dialect;
		console.log('src_dialect =', src_dialect);
		if (!src_dialect) src_dialect='en-US';
		if (langs[language_index].length>2)
			for (j=0;j<select_dialect.length;j++) {
				if (select_dialect[j].value===src_dialect) {
					dialect_index = j;
					break;
				}
			}
		select_dialect.selectedIndex = dialect_index;
	});

	chrome.storage.sync.get(['dst'], function(result) {
		dst = result.dst;
		console.log('dst =', dst);
	});

	chrome.storage.sync.get(['translate_language_index'], function(result) {
		translate_language_index = result.translate_language_index;
		console.log('translate_language_index =', translate_language_index);
		if (!translate_language_index) translate_language_index='6';
		select_translate_language.selectedIndex = translate_language_index;
		update_tr_Country();
	});

	chrome.storage.sync.get(['dst_dialect'], function(result) {
		dst_dialect = result.dst_dialect;
		console.log('dst_dialect =', dst_dialect);
		if (!dst_dialect) dst_dialect='en-US';
		if (tr_langs[translate_language_index].length>2)
			for (j=0;j<select_translate_dialect.length;j++) {
				if (select_translate_dialect[j].value===dst_dialect) {
					translate_dialect_index = j;
					break;
				}
			}
		select_translate_dialect.selectedIndex = translate_dialect_index;
	});

	chrome.storage.sync.get(['show_original'], function(result) {
		show_original = result.show_original;
		console.log('show_original =', show_original);
		if (show_original) checkbox_show_original.checked=true;
	});

	chrome.storage.sync.get(['show_translation'], function(result) {
		show_translation = result.show_translation;
		console.log('show_translation =', show_translation);
		if (show_translation) checkbox_show_translation.checked=true;
	});

	chrome.storage.sync.get(['selectedFontIndex'], function(result) {
		selectedFontIndex = result.selectedFontIndex;
		console.log('CheckStoredValues before if: selectedFontIndex =', selectedFontIndex);
		if (!selectedFontIndex) selectedFontIndex=8;
		fontSelect.selectedIndex = selectedFontIndex;
		console.log('CheckStoredValues after if: selectedFontIndex =', selectedFontIndex);
	});


	chrome.storage.sync.get(['selectedFont'], function(result) {
		selectedFont = result.selectedFont;
		console.log('CheckStoredValues before if: selectedFont =', selectedFont);
		if (result.selectedFont) {
			fontSelect.value = selectedFont;
		}
		updateSampleText()
		console.log('CheckStoredValues after if: selectedFont =', selectedFont);
	});


	chrome.storage.sync.get(['fontSize'], function(result) {
		//if (!fontSize) fontSize=16;
		fontSize = result.fontSize;
		console.log('CheckStoredValues before if: fontSize =', fontSize);
		if (result.fontSize) {
			fontSizeInput.value = fontSize;
		}
		console.log('CheckStoredValues after if: fontSize =', fontSize);
		//getAvailableFonts()
		updateSampleText()
	});

	chrome.storage.sync.get(['fontColor'], function(result) {
		//if (!fontColor) fontColor="yellow";
		fontColor = result.fontColor;
		console.log('CheckStoredValues before if: fontColor =', fontColor);
		if (result.fontColor) {
			fontColorInput.value = fontColor;
		}
		//getAvailableFonts()
		updateSampleText()
		console.log('CheckStoredValues after if: fontColor =', fontColor);
	});

}

select_language.addEventListener('change', function(){
	update_Country()
	chrome.storage.sync.set({'src' : src},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "src", data: { value: src } })
	console.log('src =', src);
	chrome.storage.sync.set({'language_index' : select_language.value},(()=>{}));
});

select_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'src' : src},(()=>{}));
	chrome.storage.sync.set({'src_dialect' : select_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "src_dialect", data: { value: src_dialect } })
	console.log('src_dialect =', src_dialect);
});

select_translate_language.addEventListener('change', function(){
	update_tr_Country();
	chrome.storage.sync.set({'dst' : dst},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "dst", data: { value: dst } })
	chrome.storage.sync.set({'translate_language_index' : select_translate_language.value},(()=>{}));
});

select_translate_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'dst' : dst},(()=>{}));
	console.log('dst =', dst);
	chrome.storage.sync.set({'dst_dialect' : select_translate_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "dst_dialect", data: { value: dst_dialect } })
	console.log('dst_dialect =', dst_dialect);
});

checkbox_show_original.addEventListener('change', function(){
	chrome.storage.sync.set({'show_original' : checkbox_show_original.checked},(()=>{}));
	console.log('checkbox_show_original.checked =', checkbox_show_original.checked);
});

checkbox_show_translation.addEventListener('change', function(){
	chrome.storage.sync.set({'show_translation' : checkbox_show_translation.checked},(()=>{}));
	console.log('checkbox_show_translation.checked =', checkbox_show_translation.checked);
});

// Add event listeners for changes in font select and font size input
fontSelect.addEventListener("change", updateSampleText);
fontSizeInput.addEventListener("input", updateSampleText);
fontColorInput.addEventListener("input", updateSampleText);

document.getElementById("updateSampleText_button").addEventListener("click", updateSampleText);

save_button.addEventListener('click', function(){
	chrome.storage.sync.set({
		'src': src,
		'dst': dst,
		'language_index': select_language.value,
		'src_dialect': select_dialect.value,
		'translate_language_index': select_translate_language.value,
		'dst_dialect': select_translate_dialect.value,
		'show_original': checkbox_show_original.checked,
		'show_translation': checkbox_show_translation.checked,
		'selectedFontIndex': selectedFontIndex,
		'selectedFont': selectedFont,
		'fontSize': fontSize,
		'fontColor': fontColor,
	}, function() {
		console.log('save src = ', src);
		console.log('save dst = ', dst);
		console.log('save language_index = ', select_language.value);
		console.log('save src_dialect = ', select_dialect.value);
		console.log('save translate_language_index = ', select_translate_language.value);
		console.log('save dst_dialect = ', select_translate_dialect.value);
		console.log('save show_original = ', checkbox_show_original.checked);
		console.log('save show_translation = ', checkbox_show_translation.checked);
		console.log('selectedFontIndex = ', selectedFontIndex);
		console.log('selectedFont = ', selectedFont);
		console.log('fontSize = ', fontSize);
		console.log('fontColor = ', fontColor);
	});
	CheckStoredValues();
});

var langs =
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

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}

function update_Country() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
	//console.log('select_dialect.value =',select_dialect.value);
	//console.log(select_dialect);
	//select_dialect_value=document.getElementById('select_dialect').value;
	//console.log('select_dialect_value =', select_dialect_value);
    src=select_dialect.value.split('-')[0];
}

var tr_langs =
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

for (var j = 0; j < tr_langs.length; j++) {
    select_translate_language.options[j] = new Option(tr_langs[j][0], j);
	if(select_translate_dialect.value.split('-')[0]==dst)
		dstIndex=j;
}

function update_tr_Country() {
    for (var j = select_translate_dialect.options.length - 1; j >= 0; j--) {
        select_translate_dialect.remove(j);
    }
    var list = tr_langs[select_translate_language.selectedIndex];
    for (var j = 1; j < list.length; j++) {
        select_translate_dialect.options.add(new Option(list[j][1], list[j][0]));
    }
    select_translate_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    dst=select_translate_dialect.value.split('-')[0];
}


function getAvailableFonts() {
    var fontList = [];
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    // Set some text to measure the width of
    var text = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Measure the width of the text for each font
    var defaultWidth = ctx.measureText(text).width;

    // List of commonly available fonts in most browsers
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

function updateSampleText() {
    selectedFont = fontSelect.value;
	console.log('selectedFont =', selectedFont);
	chrome.storage.sync.set({'selectedFont' : selectedFont},(()=>{}));

	selectedFontIndex = fontSelect.selectedIndex;
	console.log('selectedFontIndex =', selectedFontIndex);
	chrome.storage.sync.set({'selectedFontIndex' : selectedFontIndex},(()=>{}));

    fontSize = fontSizeInput.value;
	console.log('fontSize =', fontSize);
	chrome.storage.sync.set({'fontSize' : fontSize},(()=>{}));

	fontColor = fontColorInput.value;
	console.log('fontColor =', fontColor);
	chrome.storage.sync.set({'fontColor' : fontColor},(()=>{}));

    sampleText.style.fontFamily = selectedFont + ", sans-serif";
    sampleText.style.fontSize = fontSize + "px";
	sampleText.style.color = fontColor;
    sampleText.textContent = "Sample Text";
	sampleText.style.backgroundColor = 'rgba(0,0,0,0.3)';
	sampleText.style.width = (0.8*window.innerWidth) + "px";
	console.log('width =', sampleText.style.width);
	sampleText.style.height = (0.075*window.innerHeight) + "px";
	console.log('height =', sampleText.style.height);
	sampleText.style.offset({left:0.2*(window.innerWidth-0.5*window.innerWidth)})
}

