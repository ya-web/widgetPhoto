// see https://stackoverflow.com/a/9899701/12717345
function docReady(fn) {
	// DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

const getQueryObject = url => Object.fromEntries(new URLSearchParams(url.search));
const QUERY_OBJECT = getQueryObject(window.location);

const filterQueryObject = (validParams, queryObj) => Object.fromEntries(
	Object.entries(queryObj)
		.filter(([key, value]) => validParams.includes(key) && undefined !== value)
);

const cloneObject = obj => {
	const clone = {};
	for(let i in obj) {
		if(null !== obj[i] &&  'object' === typeof(obj[i])) {
			clone[i] = cloneObject(obj[i]);
		} else {
			clone[i] = obj[i];
		}
	}
	return clone;
};

const loadOverlayContent = function (mode, controls) {
	let content = '';

	if ('carousel' === mode) {
		const controls = document.getElementById('cel-photo-content').dataset.controls.split(','),
			controlsItems = {
				tags         : {
					icon : 'tags',
					tooltip: 'Tags'
				},
				protocoles   : {
					icon : 'star',
					tooltip: 'Protocoles'
				},
				signaler     : {
					icon : 'exclamation-triangle',
					tooltip: 'Signaler'
				},
				revision     : {
					icon : 'edit',
					tooltip: 'Révision'
				},
				metadonnees  : {
					icon : 'info-circle',
					tooltip: 'Métadonnées'
				},
				modification : {
					icon : 'redo-alt',
					tooltip: 'Modifier la photo'
				},
				aide         : {
					icon : 'question-circle',
					tooltip: 'Aide'
				},
			};

		let shutters = '',
			buttons = '';

		if (!controls) {
			controls = ['metadonnees', 'aide'];
		}

		controls.forEach(key => {
			const controlItem = controlsItems[key];

			shutters += templates.controls[key];
			buttons += `<a id="button-${key}" class="btn control-button ${key}" data-toggle="tooltip" data-placement="top" title="${controlItem.tooltip}" data-shutter="${key}"><i class="fas fa-${controlItem.icon}"></i></a>`
		});
		content = templates[mode](shutters, buttons);
	} else if ('contact' === mode) {
		content = templates[mode];
	}

	return content;
};

// Activation/Desactivation et contenu de la modale
const enableOverlay = content => {
	const displayMode = document.body.dataset.displayMode,
		modal         = document.getElementById('images-meta-container'),
		appContainer  = document.getElementById('cel-photo-content');

	if ('organes' !== displayMode) {
		document.getElementById('cel-photo-content').classList.add('fixed');
	}
	removeContent(modal);
	modal.insertAdjacentHTML('afterbegin', content);
	modal.classList.remove('hidden');

	document.getElementById('close-overlay').addEventListener('click', closeOverlay, false);
	document.body.addEventListener('keydown', evt => {
		evt = evt || window.event;
		// evt.keyCode déprécié, on tente d'abord evt.key
		if (/^Esc(ape)?/.test(evt.key) || 27 === evt.keyCode) {
			closeOverlay();
		}
	}, false);

};

const closeOverlay = () => {
	const modal = document.getElementById('images-meta-container'),
		appContainer = document.getElementById('cel-photo-content');

	if (!modal.classList.contains('hidden')) {
		removeContent(modal);
		modal.classList.add('hidden');
		appContainer.classList.remove('fixed');
	}
};

const validHtmlAttributeString = chaine => {
	chaine = chaine.latinise();

	return chaine.replace(/[^a-z0-9_\s]/gi, '').replace(/[_\s]/g, '_');
};

// see : http://semplicewebsites.com/removing-accents-javascript
const Latinise = {};

Latinise.latin_map = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};

String.prototype.latinise = function() {
	return this.replace(
		/[^A-Za-z0-9\[\] ]/g,
		function( a ) {
			return Latinise.latin_map[a]||a
		}
	)
};

// @see: https://ourcodeworld.com/articles/read/188/encode-and-decode-html-entities-using-pure-javascript
const htmlentities = {
	/**
	 * Converts a string to its html characters completely.
	 *
	 * @param {String} str String with unescaped HTML characters
	 **/
	encode : function(str) {
		var buf = [];

		for (var i=str.length-1;i>=0;i--) {
			if (str[i] === encodeURIComponent(str[i])) {
				buf.unshift([str[i]]);
			} else {
				buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
			}
		}

		return buf.join('');
	},
	/**
	 * Converts an html characterSet into its original character.
	 *
	 * @param {String} str htmlSet entities
	 **/
	decode : function(str) {
		return str.replace(/&#(\d+);/g, function(match, dec) {
			return String.fromCharCode(dec);
		});
	}
};

const isString = (string, checkEmpty = false) => {
	let isString = 'string' === typeof string || string instanceof String;

	if(checkEmpty) {
		isString &= '' != string;
	}
	return isString;
}

// e.g. Jeudi 24 mars 2022
const dateStringToLongDateString = dateString =>  {
	if (!isString(dateString, true)) {
		return;
	}

	const options = {weekday: "long", day: "numeric", month: "long", year: "numeric"},
		date = new Date(dateString);

	return date.toLocaleDateString('fr-FR', options);
};

// e.g. 24/03/2022
const dateStringToLocaleDateString = dateString =>  {
	if (!isString(dateString, true)) {
		return;
	}

	const date = new Date(dateString);

	return date.toLocaleDateString('fr-FR');
};

const capitalizeFirstLetter = string => (isString(string, true)) ? string[0].toUpperCase()+string.slice(1) : string;

const debounce = function(callback, delay) {
	let timer;

	return function(){
		const args = arguments;
		const context = this;

		clearTimeout(timer);

		timer = setTimeout(function() {
			callback.apply(context, args);
		}, delay)
	}
};

const isVisible = element => (
	!!element
	&& element.offsetWidth > 0
	&& element.offsetHeight > 0
	&& 'none' !== window.getComputedStyle(element).display
	&& !element.classList.contains('custom-hide')
);

const show = (element, duration = 200, callback) => {
	if(!!element) {
		setTimeout(function() {
			element.style.display = 'block';
			element.classList.remove('custom-hide');
			element.className = 'custom-show';
			if(undefined !== callback && 'function' === typeof callback) {
				callback();
			}
		}, duration)
	}
};

const hide = (element, duration = 200, callback) => {
	if(!!element) {
		element.classList.remove('custom-show');
		element.className = 'custom-hide';

		setTimeout(function() {
			element.style.display = 'none';
			if(undefined !== callback && 'function' === typeof callback) {
				callback();
			}
		}, duration);
	}
};

const toggleVisibility = (element, duration = 200, callback) => {
	if(!!element) {
		if(isVisible(element)) {
			hide(element, duration, callback);
		} else {
			show(element, duration, callback);
		}
	}
};

const removeContent = parent => {
	while (parent.firstChild) {
		parent.firstChild.remove()
	}
};

const preloadImage = (imageUrlTpl, shouldPreloadLargeImg = false) => {
	const head = document.head || document.getElementsByTagName('head')[0],
		link = document.createElement('link'),
		sizes = ['O','CRS'];

	if(shouldPreloadLargeImg) {
		sizes.push('CRL');
	}

	sizes.forEach(size => {
		const imageUrl = imageUrlTpl+size

		link.setAttribute('rel', 'preload');
		link.setAttribute('as', 'image');
		link.href = imageUrl;
		head.appendChild(link);
	});
};

const generateRandomstring = length => {
	const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let  randomString = '';

	for (let i = 0; i < length; i++) {
		const randomPoz = Math.floor(Math.random() * charSet.length);

		randomString += charSet.substring(randomPoz,randomPoz+1);
	}

	return randomString;
}
const anonymousUserId = generateRandomstring(28);

/* ***** Templates ***** */

const templates = {
	carousel : (blocks, buttons, controlsList) =>
		`<div id="close-overlay"><i class="fa-regular fa-rectangle-xmark"></i></div>
		<div id="shutter" class="col-lg-4 col-12">
			<div id="shutter-container">
				${blocks}
			</div>

		</div>
		<div id="carousel-container" class="carousel col-lg-8 col-12" data-ride="carousel" data-interval="false">
			<div class="carousel-inner h-100 w-100">
				<a id="precedent" class="carousel-control-prev carousel-control" href="#carousel-container" role="button" data-slide="prev">
					<i class="fas fa-chevron-left"></i>
					<span class="sr-only">Precedent</span>
				</a>
				<a id="suivant" class="carousel-control-next carousel-control" href="#carousel-container" role="button" data-slide="next">
					<i class="fas fa-chevron-right"></i>
					<span class="sr-only">Suivant</span>
				</a>
			</div>
		</div>
		<div id="footer-buttons" class="col-12 col-lg-8" data-controls="${controlsList}">
			<div id="controls-block" class="">${buttons}</div>
			<a id="back-carousel" class="btn btn-outline-dark btn-lg control-button hidden">
				<i class="fa fa-angles-left"></i>&nbsp;Photos
			</a>
			<div id="img-infos-block"></div>
		</div>`,

	controls : {
		tags :
			`<div id="tags-block" class="shutter-block tags hidden todo" data-shutter="tags">
				<h2>Tags</h2>
				<h3>Tags CEL (propres à l'auteur)</h3>
				<form id="form-user-tags">
					<input type="text" name="null" id="user-tags" placeholder="Aucun tag ajouté par l'auteur de l'observation" disabled>
				</form>
				<h3>Tags Pictoflora</h3>
				<div id="tags-pf">
					<a id="port" class="btn tag">Port</a><!--
					--><a id="fleur" class="btn tag">Fleur</a><!--
					--><a id="fruit" class="btn tag">Fruit</a><!--
					--><a id="feuille" class="btn tag">Feuille</a><!--
					--><a id="ecorce" class="btn tag">Ecorce</a><!--
					--><a id="rameau" class="btn tag">Rameau</a><!--
					--><a id="planche" class="btn tag">Planche</a><!--
					--><a id="insecte" class="btn tag">Insecte</a>
				</div>
				<label for="saisir-tag">Saisir un tag</label>
				<input type="text" class="form-control" id="saisir-tag" name="saisir-tag">
				<div id="tags-pf-supp"></div>
				<a id="signaler-photo" class="btn btn-sm btn-warning"><i class="fas fa-exclamation-triangle"></i>&nbsp;Signaler une photo inappropriée</a>
				<a id="signaler-erreur-id-bis" class="btn btn-sm btn-warning signaler-erreur-obs" title="Signaler une mauvaise identification ou en proposer une autre via l'outil identiplante" target="_blank"><i class="fas fa-exclamation-triangle"></i>&nbsp;Signaler une erreur d'identification</a>
			</div>`,
		protocoles :
			`<div id="protocoles-block" class="shutter-block protocoles hidden todo" data-shutter="protocoles">
				<h2>Protocoles</h2>
				<select name="protocole" id="protocole" class="form-control custom-select">
					<option value="" selected hidden>Choix du protocole</option>
					<option id="capitalisation_image" value="capitalisation_image">Capitalisation d'images</option>
					<option id="aide_identification" value="aide_identification">Aide à l'identification</option>
					<option id="defi_photo" value="defi_photo">Défi photo</option>
					<option id="gentiane_azure" value="gentiane_azure">Enquête Gentiane-azuré</option>
					<option id="arbres_tetards" value="arbres_tetards">Arbres têtards</option>
				</select>
				<p id="message-protocole" class="message">
					Choisissez un protocole pour pouvoir protocoles la photo
					<!-- le message change en fonction du protocole -->
				</p>
				<div id="notes-protocole-block" class="hidden">
					<ul id="notes-protocole-fct">
						<li id="plus-infos-protocole" class="row">
							<div class="col-10 label">Plus d'infos sur le wiki</div>
							<a class="button btn btn-sm btn-outline-secondary" target="_blank"><i class="fas fa-question-circle"></i></a>
						</li>
						<li id="note">
							<div class="col-5 label">Notez</div>
							<div class="col-5 contenu"><!-- étoiles --></div>
							<a class="button btn btn-sm btn-outline-secondary"><i class="fas fa-backspace"></i></a>
						</li>
						<li id="note-moyenne">
							<div class="col-5 label">Note Moyenne</div>
							<div class="col-5 contenu" style="text-align:right;"></div>
						</li>
						<li id="note">
							<div class="col-5 label">Nombre de votes</div>
							<div class="col-5 contenu" style="text-align:right;"></div>
						</li>
					</ul>
				</div>
			</div>`,
		signaler :
			`<div id="signaler-block" class="shutter-block signaler hidden" data-shutter="signaler">
				<h2>Signaler</h2>
				<h3>Signaler une photo inappropriée</h3>
				<p id="message-signaler" class="message">
					En signalant cette photo vous participez à la qualification des données d'observation botaniques. Les photos qualifiées d'inappropriées pour l'une des raison ci-dessous ne seront pas affichées parmi les autres illustrations sur eFlore, voire pourront être dépubliées.
				</p>
				<li id="exemple-inapproprie" class="row">
					<div class="col-10 label">Exemple de photos inappropriées</div>
					<a class="button btn btn-sm btn-outline-secondary"><i class="fas fa-question-circle"></i></a>
				</li>
				<li id="plus-infos-signaler" class="row">
					<div class="col-10 label">Plus d'infos sur le wiki</div>
					<a class="button btn btn-sm btn-outline-secondary" target="_blank"><i class="fas fa-question-circle"></i></a>
				</li>
				<form id="type-inapprorie">
					<div class="list-label">
						En quoi cette photo est-elle inappropriée ?
					</div>
					<div class="list">
						<div class="form-check">
							<input type="checkbox" id="non-vegetale" name="type-inapprorie" class="non-vegetale form-check-input" value="non-vegetale">
							<label for="non-vegetale" class="non-vegetale form-check-label">Photo non végétale</label>
						</div>
						<div class="form-check">
							<input type="checkbox" id="ecran" name="type-inapprorie" class="ecran form-check-input" value="ecran">
							<label for="ecran" class="ecran form-check-label">Photo d'écran</label>
						</div>
						<div class="form-check">
							<input type="checkbox" id="floue-pixelisee" name="type-inapprorie" class="floue-pixelisee form-check-input" value="floue-pixelisee">
							<label for="floue-pixelisee" class="floue-pixelisee form-check-label">Photo floue ou pixelisée</label>
						</div>
						<div class="form-check">
							<input type="checkbox" id="cultivee-pot" name="type-inapprorie" class="cultivee-pot form-check-input" value="cultivee-pot">
							<label for="cultivee-pot" class="cultivee-pot form-check-label">Plante cultivée / en pot</label>
						</div>
					</div>
				</form>
				<a id="signaler-erreur-id-signaler" class="btn btn-sm btn-warning signaler-erreur-obs" title="Signaler une mauvaise identification ou en proposer une autre via l'outil identiplante" target="_blank"><i class="fas fa-exclamation-triangle"></i>&nbsp;Signaler une erreur d'identification</a>
			</div>`,
		revision :
			`<div id="revision-block" class="shutter-block revision hidden todo" data-shutter="revision">
				<h2>Révision</h2>
				<h3>Proposition de détermination</h3>
			</div>`,
		metadonnees :
			`<div id="metadonnees-block" class="shutter-block metadonnees" data-shutter="metadonnees">
				<h2>Métadonnées</h2>
				<ul id="metadata-content">
					<li id="nom" class="row">
						<div class="col-5 label">Nom</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="localisation" class="row">
						<div class="col-5 label">Localisation</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="auteur-obs" class="row">
						<div class="col-5 label">Auteur</div>
						<div class="col-5 contenu"></div>
						<a class="lien_contact load-overlay contact-overlay-open button btn btn-sm btn-outline-secondary"><i class="fas fa-envelope"></i></a>
					</li>
					<li id="date-obs" class="row">
						<div class="col-5 label">Date d'observation</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="commentaire" class="row">
						<div class="col-5 label">Commentaires</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="certitude" class="row">
						<div class="col-5 label">Certitude de l'identification</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="fiabilite" class="row">
						<div class="col-5 label">Grade</div>
						<div class="col-5 contenu"></div>
						<a href="https://www.tela-botanica.org/ressources/donnees/qualification-des-donnees-dobservation/#standard" class="button btn btn-sm btn-outline-secondary" target="_blank"><i class="fas fa-question-circle"></i></a>
					</li>
				</ul>
				<a id="more-metadata" class="display-more">Afficher <span class="more">plus</span><span class="less hidden">moins</span> d'infos&nbsp;<span class="more">+</span><span class="less hidden">-</span></a>
				<ul id="more-metadata-content"></ul>
				<ul id="metadata-content-suite">
					<li id="num-photo" class="row">
						<div class="col-5 label">Photo n°</div>
						<div class="col-5 contenu"></div>
					</li>
					<li id="licence" class="row">
						<div class="col-5 label">Licence</div>
						<div class="col-5 contenu">
							<a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/fr/">CC-BY-SA 2.0 FR</a>
						</div>
					</li>
				</ul>

				<a id="signaler-erreur-id" class="btn btn-sm btn-warning signaler-erreur-obs" title="Signaler une mauvaise identification ou en proposer une autre via l'outil identiplante" target="_blank" href="https://www.tela-botanica.org/appli:identiplante"><i class="fas fa-exclamation-triangle"></i>&nbsp;Signaler une erreur d'identification</a>

				<h2>Téléchargement</h2>
				<ul id="contenu-telechargement">
					<li id="titre-original" class="row">
						<div class="col-5 label">Titre original</div>
						<div class="col-7 contenu"></div>
					</li>
					<li id="date-photo" class="row">
						<div class="col-5 label">Date de la photo</div>
						<div class="col-7 contenu"></div>
					</li>
					<li id="Licence-bis" class="row">
						<div class="col-5 label">Licence</div>
						<div class="col-7 contenu">
							<a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/fr/">CC-BY-SA 2.0 FR</a>
						</div>
					</li>
					<li id="attribution" class="row">
						<div class="col-12 label">Attribution</div>
						<div class="col-12 contenu">
							<input id="attribution-copy" type="text" name="attribution-copy" rows="4" class="form-control" readonly="readonly" style="width: 100%; height: 100%;">
						</div>
					</li>
					<li id="url" class="row">
						<div class="col-12 label">Url</div>
						<div class="col-12 contenu">
							<input id="url-copy" type="text" name="url-copy" rows="2" class="form-control" readonly="readonly" style="width: 100%; height: 100%;">
						</div>
					</li>
				</ul>
				<ul id="contenu-telechargement-suite" class="mb-0">
					<li id="autres-formats" class="row">
						<div class="col-12 label">Autres formats</div>
						<div class="col-12 contenu">
							<select name="formats" id="formats" class="form-control custom-select">
							</select>
						</div>
					</li>
				</ul>
				<a href="" id="telecharger" class="btn btn-success mt-0"><i class="fas fa-upload"></i>&nbsp;Télécharger</a>
			</div>`,
		modification :
			`<div id="modification-block" class="shutter-block modification hidden" data-shutter="modification">
				<h2>Modifier la photo</h2>
				<h3 class="todo">Faire pivoter la photo</h3>
				<div id="pivoter-photo" class="d-flex justify-content-around todo">
					<div id="bloc-pivoter-droite" class="d-flex flex-column">
						<label for="pivoter-droite">Pivoter à droite</label>
						<a id="pivoter-droite" class="btn btn-success btn-lg"><i class="fas fa-redo"></i></a>
					</div>
					<div id="bloc-pivoter-gauche" class="d-flex flex-column">
						<label for="pivoter-gauche">Pivoter à gauche</label>
						<a id="pivoter-gauche" class="btn btn-success btn-lg"><i class="fas fa-undo"></i></a>
					</div>
				</div>
				<h3>Régénérer miniature</h3>
				<p id="message-regenerer" class="message">
					Vous avez remarqué un problème dans l'affichage de la miniature de cette photo ? Vous pouvez la régénérer ci-dessous !
				</p>
				<a id="regenerer-miniature" class="btn btn-warning btn-lg"><i class="fas fa-recycle"></i>&nbsp;Régénérer la miniature</a>
			</div>`,
		aide :
			`<div id="aide-block" class="shutter-block aide hidden todo" data-shutter="aide">
				<h2>Aide</h2>
				<p id="texte-aide" class="message">
					Auxerunt haec vulgi sordidioris audaciam, quod cum ingravesceret penuria commeatuum, famis et furoris inpulsu Eubuli cuiusdam inter suos clari domum ambitiosam ignibus subditis inflammavit rectoremque ut sibi iudicio imperiali addictum calcibus incessens et pugnis conculcans seminecem laniatu miserando discerpsit. post cuius lacrimosum interitum in unius exitio quisque imaginem periculi sui considerans documento recenti similia formidabat.

					Novitates autem si spem adferunt, ut tamquam in herbis non fallacibus fructus appareat, non sunt illae quidem repudiandae, vetustas tamen suo loco conservanda; maxima est enim vis vetustatis et consuetudinis. Quin in ipso equo, cuius modo feci mentionem, si nulla res impediat, nemo est, quin eo, quo consuevit, libentius utatur quam intractato et novo. Nec vero in hoc quod est animal, sed in iis etiam quae sunt inanima, consuetudo valet, cum locis ipsis delectemur, montuosis etiam et silvestribus, in quibus diutius commorati sumus.

					Erat autem diritatis eius hoc quoque indicium nec obscurum nec latens, quod ludicris cruentis delectabatur et in circo sex vel septem aliquotiens vetitis certaminibus pugilum vicissim se concidentium perfusorumque sanguine specie ut lucratus ingentia laetabatur.
				</p>
				<ul id="aide-plus">
					<li id="plus-infos" class="row">
						<div class="col-10 label">Plus d'infos sur le wiki</div>
						<a class="button btn btn-sm btn-outline-secondary" target="_blank"><i class="fas fa-question-circle"></i></a>
					</li>
					<li id="autres-questions" class="row">
						<div class="col-10 label">D'autres questions ? Écrivez-nous !</div>
						<a class="button btn btn-sm btn-outline-secondary"><i class="fas fa-envelope"></i></a>
					</li>
				</ul>
			</div>`,

	},
	contact :
		`<div id="close-overlay"><i class="fa-regular fa-rectangle-xmark"></i></div>
		<div id="tpl-form-contact">
			<h2 class="mb-3">Message à <span class="destinataire"></span>&nbsp;:</h2>
			<form id="form-contact" method="post" action="">
				<div id="fc-zone-dialogue" class="mb-3"></div>
				<div class="form-group mb-3">
					<label for="fc_sujet">Sujet</label>
					<input type="text" id="fc_sujet" class="form-control" name="fc_sujet" value="" required>
				</div>
				<div class="form-group mb-3">
					<label for="fc_message">Message</label>
					<textarea id="fc_message"  class="form-control form-control-lg" name="fc_message" required></textarea>
				</div>
				<div class="form-group mb-3">
					<label for="fc_utilisateur_courriel" title="Utilisez le courriel avec lequel vous êtes inscrit à Tela Botanica">Votre courriel</label>
					<input type="email" id="fc_utilisateur_courriel"  class="form-control" name="fc_utilisateur_courriel" placeholder="mail@exemple.com" required>
				</div>
				<div class="form-group">
					<input type="hidden" id="fc_destinataire_id" name="fc_destinataire_id" value="">
					<input type="hidden" name="fc_type_envoi" id="fc_type_envoi" value="non-inscrit">
					<input type="submit" id="fc_envoyer" class="btn btn-success form-control" value="Envoyer">
					<input type="reset" id="fc_effacer"  class="btn btn-warning form-control" value="Effacer">
					<button id="fc_annuler" type="button" class="close btn btn-danger form-control annuler">Annuler</button>
				</div>
			</form>
		</div>`,
};
