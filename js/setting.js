var langInput, langOutput, language_index, translate_language_index, dialect, translate_dialect, dialect_index, translate_dialect_index, show_original, show_translation;

document.addEventListener('DOMContentLoaded', (event) => {
	CheckStoredValues();
});

function CheckStoredValues() {

	chrome.storage.sync.get(['langInput'], function(result) {
		langInput = result.langInput;
		console.log('langInput =', langInput);
	});

	chrome.storage.sync.get(['language_index'], function(result) {
		language_index = result.language_index;
		console.log('language_index =', language_index);
		if (!language_index) language_index='1';
		select_language.selectedIndex = language_index;
		update_Country();
	});

	chrome.storage.sync.get(['dialect'], function(result) {
		dialect = result.dialect;
		console.log('dialect =', dialect);
		if (!dialect) dialect='en-US';
		if (langs[language_index].length>2)
			for (j=0;j<select_dialect.length;j++) {
				if (select_dialect[j].value===dialect) {
					dialect_index = j;
					break;
				}
			}
		select_dialect.selectedIndex = dialect_index;
	});

	chrome.storage.sync.get(['langOutput'], function(result) {
		langOutput = result.langOutput;
		console.log('langOutput =', langOutput);
	});

	chrome.storage.sync.get(['translate_language_index'], function(result) {
		translate_language_index = result.translate_language_index;
		console.log('translate_language_index =', translate_language_index);
		if (!translate_language_index) translate_language_index='6';
		select_translate_language.selectedIndex = translate_language_index;
		update_tr_Country();
	});

	chrome.storage.sync.get(['translate_dialect'], function(result) {
		translate_dialect = result.translate_dialect;
		console.log('translate_dialect =', translate_dialect);
		if (!translate_dialect) translate_dialect='en-US';
		if (tr_langs[translate_language_index].length>2)
			for (j=0;j<select_translate_dialect.length;j++) {
				if (select_translate_dialect[j].value===translate_dialect) {
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
}

select_language.addEventListener('change', function(){
	update_Country()
	chrome.storage.sync.set({'langInput' : langInput},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "langInput", data: { value: langInput } })
	console.log('langInput =', langInput);
	chrome.storage.sync.set({'language_index' : select_language.value},(()=>{}));
});

select_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'langInput' : langInput},(()=>{}));
	chrome.storage.sync.set({'dialect' : select_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "dialect", data: { value: dialect } })
	console.log('dialect =', dialect);
});

select_translate_language.addEventListener('change', function(){
	update_tr_Country();
	chrome.storage.sync.set({'langOutput' : langOutput},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "langOutput", data: { value: langOutput } })
	chrome.storage.sync.set({'translate_language_index' : select_translate_language.value},(()=>{}));
});

select_translate_dialect.addEventListener('change', function(){
	chrome.storage.sync.set({'langOutput' : langOutput},(()=>{}));
	console.log('langOutput =', langOutput);
	chrome.storage.sync.set({'translate_dialect' : select_translate_dialect.value},(()=>{}));
	//chrome.runtime.sendMessage({ cmd: "translate_dialect", data: { value: translate_dialect } })
	console.log('translate_dialect =', translate_dialect);
});

checkbox_show_original.addEventListener('change', function(){
	chrome.storage.sync.set({'show_original' : checkbox_show_original.checked},(()=>{}));
	console.log('checkbox_show_original.checked =', checkbox_show_original.checked);
});

checkbox_show_translation.addEventListener('change', function(){
	chrome.storage.sync.set({'show_translation' : checkbox_show_translation.checked},(()=>{}));
	console.log('checkbox_show_translation.checked =', checkbox_show_translation.checked);
});

save_button.addEventListener('click', function(){
	chrome.storage.sync.set({
		'langInput': langInput,
		'langOutput': langOutput,
		'language_index': select_language.value,
		'dialect': select_dialect.value,
		'translate_language_index': select_translate_language.value,
		'translate_dialect': select_translate_dialect.value,
		'show_original': checkbox_show_original.checked,
		'show_translation': checkbox_show_translation.checked
	}, function() {
		console.log('save langInput = ', langInput);
		console.log('save langOutput = ', langOutput);
		console.log('save language_index = ', select_language.value);
		console.log('save dialect = ', select_dialect.value);
		console.log('save translate_language_index = ', select_translate_language.value);
		console.log('save translate_dialect = ', select_translate_dialect.value);
		console.log('save show_original = ', checkbox_show_original.checked);
		console.log('save show_translation = ', checkbox_show_translation.checked);
	});
	CheckStoredValues();
});

var langs =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
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
    langInput=select_dialect.value.split('-')[0];
}

var tr_langs =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
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
	if(select_translate_dialect.value.split('-')[0]==langOutput)
		langOutputIndex=j;
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
    langOutput=select_translate_dialect.value.split('-')[0];
}

