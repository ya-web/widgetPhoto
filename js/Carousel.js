import {Contact} from './Contact.js';

const maxSize = 580;
const thumbsRegenUrlService = celServices+'celImage/regenerer-miniatures?ids-img=';
const directions = ['suivant', 'precedent'];
const imageFormats = {
	'CRX2S' : '63px (Carrée, rognée)',
	'CRXS'  : '100px (Carrée, rognée)',
	'CXS'   : '100px (Carrée)',
	'CS'    : '300px (Carrée)',
	'CRS'   : '300px (Carrée, rognée)',
	'XS'    : '150px',
	'S'     : '400px',
	'M'     : '600px',
	'L'     : '800px',
	'CRL'   : '600px (Carrée, rognée)',
	'XL'    : '1024px',
	'X2L'   : '1280px',
	'X3L'   : '1600px',
	'O'     : 'Format original (Taille inconnue)'
};
const defaultTags = [
	'fleur',
	'fruit',
	'feuille',
	'ecorce',
	'rameau',
	'planche',
	'insecte'
];

export function Carousel(props) {
	for (const p in props) {
		this[p] = props[p];
	}
	this.updateProps();

	this.carouselContainer = document.getElementById('carousel-container');
	this.imgInfosBlock     = document.getElementById('img-infos-block');
	this.selectImgFormat   = document.getElementById('formats');
	this.shutter           = document.getElementById('shutter');
	this.carouselBack      = document.getElementById('back-carousel');
	this.footerButtons     = document.getElementById('footer-buttons');
	this.moreMetas         = document.getElementById('more-metadata');
	this.moreMetasContent  = document.getElementById('more-metadata-content');
	this.appContainer      = document.getElementById('cel-photo-content');

	this.controls = document.getElementById('cel-photo-content').dataset.controls.split(',');
	this.tagNames = [];

	return this;
}

Carousel.prototype.init = function() {
	this.initTpl();
	this.initEvts();
};

Carousel.prototype.initTpl = function() {
	this.addImageFormatOptions();
	this.addImagesToCarousel();
	// reset
	this.carouselContainer.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
	document.getElementById('img-cadre-'+this.imageIndex).classList.add('active');
	this.updateOverlay();
	this.resizeCarousel();
};

Carousel.prototype.initEvts = function() {
	this.onMoreMetas();
	this.initEvtsScrollImage();
	window.addEventListener('resize', debounce(this.resizeCarousel.bind(this),100));
	this.initFeatures();
	this.initEvtsResponsiveBackCarousel();
	this.initEvtsTagsPF();
};

Carousel.prototype.updateProps = function() {
	this.item            = this.items[this.imageIndex];
	this.imageUrlBase    = this.item.photoUrlTpl+'O';
	this.imageUrl        = this.imageUrlBase+'.jpg';
	this.encodedImageUrl = encodeURIComponent(this.imageUrlBase);
	this.occurence       = this.item.occurence;
	this.nn              = `[nn${this.occurence.nom_sel_nn}]`;
	this.urlIP           = this.occurence.url_ip;
	this.imageTags       = this.tagsToArray(this.item.photoTag);
	this.occurenceTags   = this.tagsToArray(this.occurence.tags_obs);
	this.author          = this.item.user.nom_utilisateur;
};

Carousel.prototype.addImageFormatOptions = function() {
	for(const formatCode in imageFormats) {
		const option = document.createElement('option');

		option.value = formatCode;
		option.selected = 'O' === formatCode;
		option.textContent = imageFormats[formatCode];
		this.selectImgFormat.append(option);
	}
};

Carousel.prototype.addImagesToCarousel = function() {
	document.querySelectorAll('.carousel-item').forEach(itemEl => itemEl.remove());
	for(let i = this.start; i < this.start+this.maxPhotos; i++) {
		const item = this.items[i],
			carouselItem = document.createElement('div'),
			img          = document.createElement('img'),
			imgContainer = document.createElement('div');

		img.id = 'illustration-'+i;
		img.classList.add('d-block','align-middle');
		img.onerror = () => {
			img.onerror = null;
			img.closest('.carousel-item').remove();
		}
		img.src = item.photoUrl;

		imgContainer.classList.add('align-middle','img-container');
		imgContainer.appendChild(img);

		carouselItem.id = 'img-cadre-'+i;
		carouselItem.className = 'carousel-item';
		carouselItem.appendChild(imgContainer);

		document.getElementById('precedent').before(carouselItem);
	}
};

Carousel.prototype.updateOverlay = function() {
	const urlIP = this.urlIP;

	this.updateProps();
	this.displayImageTitle();
	this.loadContactForm();
	this.provideMetasShutterFeatures();
	this.regenerateThumbnail();
	document.querySelectorAll('.signaler-erreur-obs').forEach(el => el.href = urlIP);
	this.updateTags();
};

Carousel.prototype.initEvtsScrollImage = function() {
	const self = this;

	// using direction control buttons
	directions.forEach(direction =>
		document.getElementById(direction).addEventListener('click', event => {
			event.preventDefault();
			self.scrollImage(direction);
		})
	);

	// using keyboard arrows
	document.querySelector('#main :not(saisir-tag)').addEventListener('keydown', event => {
		event = (event || window.event);

		const determinDirection = (enventKey, keyCode) => {
				const key = keyCode.indexOf(enventKey);

				if (0 > key) {
					return;
				}
				return directions[key];
			},
			direction = ('key' in event) ? determinDirection(event.key, ['ArrowLeft', 'ArrowRight']) : determinDirection(event.keyCode, [37, 39]);

		if (!!direction) {
			document.getElementById(direction).click();
		}
	});
};

Carousel.prototype.initFeatures = function() {
	const self = this;

	this.footerButtons.querySelectorAll('#controls-block a').forEach(element => {
		element.addEventListener('click', function(event){
			event.preventDefault();
			event.stopPropagation();

			const toOpen = element.dataset.shutter,
				toClose = document.querySelector('.shutter-block:not(.hidden)').dataset.shutter;


			self.openShutter(toOpen, toClose);
			if (window.matchMedia('(max-width: 991px)').matches) {
				self.carouselContainer.classList.add('hidden');
				[self.shutter, self.carouselBack].forEach(el => el.classList.remove('hidden'));
			}
		}, false);
	});
};

Carousel.prototype.initEvtsResponsiveBackCarousel = function() {
	const self = this;

	this.carouselBack.addEventListener('click', function(event) {
		event.preventDefault();

		self.carouselContainer.classList.remove('hidden');
		this.classList.add('hidden');
		if (window.matchMedia('(max-width: 991px)').matches) {
			self.shutter.classList.add('hidden');
			document.querySelector('.control-button.active').classList.remove('active');
		}
	});
};

Carousel.prototype.scrollImage = function(direction) {
	const max = this.start + this.maxPhotos -1;

	if ('suivant' === direction) {
		this.imageIndex++ ;

		if(this.imageIndex > max) {// back to first
			this.imageIndex = this.start;
		}

	} else if ('precedent' === direction) {
		this.imageIndex--;

		if(this.imageIndex < this.start) {// go to last
			this.imageIndex = max;
		}
	}
	this.updateOverlay();
};

Carousel.prototype.displayImageTitle = function() {
	const efloreLink = this.displayLink(this.item.efloreLink, this.occurence.nom_sel);

	removeContent(this.imgInfosBlock);
	this.imgInfosBlock.insertAdjacentHTML(
		'afterbegin',
		`${efloreLink} par <a class="lien_contact load-overlay contact-overlay-open" data-image-index="${this.imageIndex}">${this.author}</a> le ${this.item.date} - ${this.occurence.localisation}`
	);
};

Carousel.prototype.resizeCarousel = function() {
	if (window.matchMedia('(max-width: 991px)').matches) {
		this.carouselContainer.classList.remove('hidden', 'col-lg-8');
		document.querySelector('.control-button.active')?.classList.remove('active');
		this.shutter.classList.add('hidden');
		this.shutter.classList.remove('col-lg-4');
		this.carouselBack.classList.add('hidden');
		this.imgInfosBlock.classList.remove('col-lg-4');
	} else {
		const visibleShutter = document.querySelector('.shutter-block:not(.hidden)');

		if (!!visibleShutter) {
			document.querySelector('.control-button.'+visibleShutter.dataset.shutter).classList.add('active');
		}
		this.carouselContainer.classList.add('col-lg-8');
		this.carouselContainer.classList.remove('hidden');
		this.shutter.classList.add('col-lg-4');
		this.shutter.classList.remove('hidden');
		this.imgInfosBlock.classList.add('col-lg-4');
		this.carouselBack.classList.add('hidden');
	}
};

Carousel.prototype.openShutter = function(toOpen, toClose) {
	this.footerButtons.querySelector('.'+toOpen).classList.add('active');
	document.getElementById(toOpen+'-block').classList.remove('hidden');
	this.shutter.scrollTop = 0;
	if(toOpen !== toClose) {
		this.footerButtons.querySelector('.'+toClose).classList.remove('active');
		document.getElementById(toClose+'-block').classList.add('hidden');
	}
};

/*** tags ***/

Carousel.prototype.initEvtsTagsPF = function() {
	const self = this;

	if(this.controls.includes('tags')) {
		// default tags
		document.querySelectorAll('#tags-block .tag').forEach(tagEl =>
			tagEl.addEventListener('click', async function(event) {
				event.preventDefault();

				if(!tagEl.classList.contains('active')) {
					self.setTag(tagEl.id);
				} else {
					self.deleteTag(tagEl.dataset.tagId);
				}
			})
		);
		// custom tags
		['blur', 'keyup'].forEach(eventType =>
			document.getElementById('saisir-tag').addEventListener(eventType, function(evt) {
				evt = evt || window.evt;

				if ('blur' === eventType || 'Enter' === evt.key || 13 === evt.keyCode) {
					const newTag = this.value;

					if(!!newTag && !self.tagNames.includes(newTag)) {
						self.setTag(newTag);
					}
					document.getElementById('form-user-tags').reset();
					this.value = '';
				}
			})
		);
	}
};

Carousel.prototype.updateTags = async function() {
	if(this.controls.includes('tags')) {
		const self = this,
			url    = imageTagsService +'?image='+this.item.imageId;

		document.getElementById('user-tags').value = this.item.photoTag;

		try {
			const res = await fetch(url);

			if (!res.ok) {
				// @todo: voir la bonne adresse remarques
				console.warn('Erreur', 'Les tags n’ont pas pu être chargés');
				throw new Error(res.status);
			}

			const data = await res.json(),
				tagsData = [],
				tags = [];

			if(!!data.resultats) {
				Object.keys(data.resultats).forEach(id => {
					const tagName = data.resultats[id].mot_cle,
						tag       = validHtmlAttributeString(tagName.toLowerCase());

					tagsData.push({id,tag,tagName});
					tags.push(tag);
					if(!self.tagNames.includes(tagName)) {
						self.tagNames.push(tagName);
					}
				});
			}
			//reset custom tags
			document.querySelectorAll('#tags-pf-supp .custom-tag').forEach(tagEl => {
				if(!tags.includes(tagEl.id)) {
					tagEl.remove();
				}
			});
			//reset default tags
			document.querySelectorAll('#tags-pf .tag.active').forEach(tagEl => {
				if(!tags.includes(tagEl.id)) {
					tagEl.dataset.tagId = '';
					tagEl.classList.remove('active');
				}
			});
			//set tags
			tagsData.forEach(tagData => {
				if(defaultTags.includes(tagData.tag)) {
					const tagEl = document.getElementById(tagData.tag);

					tagEl.dataset.tagId = tagData.id;
					tagEl.classList.add('active');
				} else {
					self.addCustomTag(tagData.tagName, tagData.id);
				}
			});

		} catch (error) {
			console.warn(error);
		}
	}
};

Carousel.prototype.addCustomTag = function(tag,tagId) {
	const self = this,
		customTagContainer = document.getElementById('tags-pf-supp'),
		tagAttr            = validHtmlAttributeString(tag.toLowerCase());

	if(!customTagContainer.querySelector(`#${tagAttr}.custom-tag`)) {
		const tagEl  = document.createElement('a'),
			closeTag = document.createElement('i');

		closeTag.classList.add('fas', 'fa-times-circle', 'fermer');

		tagEl.id = tagAttr;
		tagEl.classList.add('btn', 'tag', 'custom-tag', 'active');
		tagEl.dataset.tagName = tag;
		tagEl.insertAdjacentHTML('afterbegin', `${tag}&nbsp;`);
		tagEl.appendChild(closeTag);

		customTagContainer.appendChild(tagEl);

		closeTag.addEventListener('click', async function(event) {
			event.preventDefault();
			self.deleteTag(tagId);
		});
	}
};

Carousel.prototype.setTag = async function(tag) {
	try {
		const res = await fetch(imageTagsService, {
			method: 'PUT',
			body: `image=${this.item.imageId}&mot_cle=${tag}&auteur.id=${anonymousUserId}`
		});
		if (!res.ok) {
			// @todo: voir la bonne adresse remarques
			console.warn('Erreur', 'Le tag n’a pas pu être créé.');
			throw new Error(res.status);
		}
		const data = await res.json();

		console.log (data);
		this.updateTags();
	} catch (error) {
		console.warn(error);
	}
};

Carousel.prototype.deleteTag = async function(tagId) {
	if(!!tagId) {
		try {
			const res = await fetch(imageTagsService+tagId, {method: 'DELETE'});

			if (!res.ok) {
				console.warn('Erreur', 'Le tag n’a pas pu être supprimé.');
				throw new Error(res.status);
			}
			this.updateTags();
		} catch (error) {
			console.warn(error);
		}
	}
};

/*** metas ***/

Carousel.prototype.provideMetasShutterFeatures = function() {
	this.displayMetas();
	this.displayLocationPopup();
	this.displayMoreMetas();
	this.provideDownloadLink();
};

Carousel.prototype.displayMetas = function() {
	const self = this,
		metaContent = {
			'nom'              : this.displayLink(this.item.efloreLink, this.occurence.nom_sel),
			'localisation'     : this.occurence.localisation,
			'auteur-obs'       : !!this.author.trim() ? this.displayLink(self.item.profileUrl,this.author) : '',
			'date-obs'         : this.item.date,
			'commentaire'      : this.occurence.commentaire,
			'certitude'        : this.occurence.certitude,
			'fiabilite'        : this.occurence.fiabilite,
			'num-photo'        : this.item.imageId,
			'titre-original'   : this.item.originalName,
			'date-photo'       : this.item.photoDate,
			'attribution-copy' : this.item.attribution,
			'url-copy'         : this.imageUrl
		};

	Object.keys(metaContent).forEach(idAttr => {
		const content     = metaContent[idAttr] ??  0 === metaContent[idAttr] ? metaContent[idAttr].toString() : '',
			metaContainer = document.getElementById(idAttr),
			setContent    = () => {
				const label = metaContainer.querySelector('.contenu');

				content ??= 0 === content ? content.toString() : '';
				removeContent(label);
				label.insertAdjacentHTML('afterbegin', content)
			};

		switch(idAttr) {
			case 'attribution-copy' :
			case 'url-copy' :
				metaContainer.value = content;
				self.fieldCopy(metaContainer);
				break;
			case 'auteur-obs' :
				metaContainer.querySelector('.button').classList.toggle('disabled',!content);
				metaContainer.querySelector('.button').dataset.imageIndex = this.imageIndex;
			default:
				setContent();
				break;
		}
	});
};

Carousel.prototype.displayMoreMetas = function() {
	const self = this,
		metaLabels  = {
			'id_obs'                 : 'observation n°',
			'projet'                 : 'projet',
			'nom_referentiel'        : 'réferentiel',
			'date_obs'               : 'date d´observation',
			'nom_sel'                : 'nom scientifique',
			'nom_sel_nn'             : 'nom scientifique n°',
			'nom_ret'                : 'nom retenu',
			'nom_ret_nn'             : 'nom retenu n°',
			'famille'                : 'famille',
			'tags_obs'               : 'tags de l´observation',
			'lieudit'                : 'lieu dit',
			'station'                : 'station',
			'milieu'                 : 'milieu',
			'latitude'               : 'latitude',
			'longitude'              : 'longitude',
			'altitude'               : 'altitude',
			'localisation_precision' : 'précision de la localisation',
			'code_insee'             : 'code insee de la commune',
			'dept'                   : 'département',
			'pays'                   : 'pays',
			'est_ip_valide'          : 'validée sur identiplante',
			'score_ip'               : 'score identiplante',
			'url_ip'                 : 'url identiplante',
			'abondance'              : 'abondance',
			'phenologie'             : 'phénologie',
			'spontaneite'            : 'spontaneite',
			'type_donnees'           : 'type de donnees',
			'biblio'                 : 'bibliographie',
			'source'                 : 'source',
			'herbier'                : 'herbier',
			'observateur'            : 'observateur',
			'observateur_structure'  : 'structure'
		};

	this.updateMoreMetasIcon(isVisible(this.moreMetasContent));
	removeContent(this.moreMetasContent);

	Object.keys(metaLabels).forEach(key => {
		const label = metaLabels[key],
			idAttr = key.replace( '_', '-' );
		let content = self.occurence[key];

		switch(key) {
			case 'nom_sel':
				content = self.displayLink(self.item.efloreLink,content);
				break;
			case 'nom_ret':
				const urlEfloreNomRetenu = self.item.efloreLink.replace(self.occurence.nom_sel_nn, self.occurence.nom_ret_nn);

				content = self.displayLink(urlEfloreNomRetenu, content);
				break;
			case 'url_ip':
				content = self.displayLink(content, content);
				break;
			case 'est_ip_valide':
			case 'herbier':
				if('0' === content) {
					content = 'non';
				}
				break;
			case 'date_obs':
				content = dateStringToLocaleDateString(content);
				break;
			case 'tags_obs':
				content = self.occurenceTags.join('<br>');
				break;
			default:
				break;
		}

		if (!!content) {
			this.moreMetasContent.insertAdjacentHTML('beforeend',
				`<li id="${idAttr}-metadonnees-plus" class="row">
					<div class="col-5 label">${capitalizeFirstLetter(label)}</div>
					<div class="col-7 contenu">${content}</div>
				</li>`
			);
		}
	});

	if( !this.moreMetasContent.classList.contains('active')) {
		hide(this.moreMetasContent);
	}
};

Carousel.prototype.onMoreMetas = function() {
	const self = this;

	this.moreMetas.addEventListener('click', function(event) {
		event.preventDefault();

		toggleVisibility(self.moreMetasContent, 200, function() {
			const isOpen = isVisible(self.moreMetasContent);

			self.updateMoreMetasIcon(isOpen);
			self.moreMetasContent.classList.toggle('active', isOpen);
		});
	}, false);
};

Carousel.prototype.updateMoreMetasIcon = function(isOpen) {
	this.moreMetas.querySelectorAll('.more').forEach(button => button.classList.toggle('hidden', isOpen));
	this.moreMetas.querySelectorAll('.less').forEach(button => button.classList.toggle('hidden', !isOpen));
};

/*** copy informations on clipboard ***/

Carousel.prototype.fieldCopy = function(field) {
	const attributionCopy = document.getElementById('attribution-copy'),
		urlCopy           = document.getElementById('url-copy');

	field.addEventListener('click', function() {
		[attributionCopy,urlCopy].forEach(copyEl => {
			copyEl.classList.remove('hidden');
			copyEl.querySelectorAll('.copy-message').forEach(message => message.remove());
		});

		this.select();
		document.execCommand('copy');

		this.insertAdjacentHTML('afterend',
			`<p class="copy-message alert-success" style="width: 100%; height:${this.offsetHeight}px; margin: 0; display:flex;">
				<span style="margin:auto; font-size:1rem;">Copié dans le presse papier</span>
			</p>`
		)
		this.classList.add('hidden');

		setTimeout( function() {
			document.querySelectorAll('.copy-message').forEach(message => message.remove());
			field.classList.remove('hidden');
		}, 1000 );
	});
};

/*** download images ***/

Carousel.prototype.provideDownloadLink = function() {
	const imageId   = this.item.imageId;

	this.selectImgFormat.addEventListener('change', function() {
		const format = this.value ?? 'O';

		document.getElementById('telecharger').href = `${celServices+'CelImageFormat/'+imageId}?methode=telecharger&format=${format}`;
	});

	this.selectImgFormat.dispatchEvent(new Event('change'));
};

Carousel.prototype.displayLocationPopup = function() {
	const self = this,
		lat    = this.occurence.latitude,
		lng    = this.occurence.longitude;

	document.getElementById('obs-location')?.remove();

	if(!!lat && !!lng) {
		this.locationButton().addEventListener('click', function(event) {
			event.preventDefault();

			let locationMapContainer = document.getElementById('location-map-container');

			if(!locationMapContainer) {
				locationMapContainer = self.locationMap();
				this.after(self.locationMap());

				const map = L.map('location-map', {
					zoomControl: true,
					dragging: false,
					scrollWheelZoom: 'center'
				}).setView([lat, lng], 12);

				map.markers = [];

				L.tileLayer('https://osm.tela-botanica.org/tuiles/osmfr/{z}/{x}/{y}.png', {
					attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>',
					maxZoom: 18
				}).addTo(map);

				map.addLayer(new L.FeatureGroup());

				const marker = new L.Marker({lat,lng}, {draggable: false});

				map.addLayer(marker);
				map.markers.push(marker);

				document.getElementById('map-close').addEventListener('click', () => locationMapContainer.remove());
			} else {
				locationMapContainer.remove();
			}
		});

		document.getElementById('images-meta-container').addEventListener('click', event => {
			if(!event.target.closest('#location-map-container') && !event.target.closest('#obs-location')) {
				document.getElementById('location-map-container')?.remove();
			}
		});
	}
};

Carousel.prototype.locationButton = function() {
	const locate = document.createElement('a');

	locate.id = 'obs-location';
	locate.classList.add(
		'button',
		'btn',
		'btn-sm',
		'btn-outline-secondary'
	);
	locate.insertAdjacentHTML(
		'afterbegin',
		'<i class="fas fa-map-marker-alt" aria-hidden="true"></i>'
	);
	document.getElementById('localisation').appendChild(locate);

	return locate;
};

Carousel.prototype.locationMap = function() {
	const locationMapContainer = document.createElement('div'),
		mapClose               = document.createElement('button'),
		locationMap            = document.createElement('div');

	mapClose.id = 'map-close';
	mapClose.type = 'button';
	mapClose.classList.add(
		'button',
		'btn',
		'btn-sm',
		'btn-outline-secondary'
	);
	mapClose.setAttribute('aria-label', 'Close');
	mapClose.insertAdjacentHTML(
		'afterbegin',
		'<span aria-hidden="true">×</span>'
	);

	locationMap.id = 'location-map';

	locationMapContainer.id = 'location-map-container';
	locationMapContainer.appendChild(mapClose);
	locationMapContainer.appendChild(locationMap);

	return locationMapContainer;
};

Carousel.prototype.loadContactForm = function() {
	const items = this.items;

	document.querySelectorAll('.lien_contact').forEach(
		contactLink => contactLink.addEventListener('click', evt => {
			evt.preventDefault();

			const imageIndex = contactLink.dataset.imageIndex,
				content = loadOverlayContent('contact');

			if (!!content) {
				enableOverlay(content);
				new Contact(items[imageIndex],imageIndex,true).init();
			}
		})
	);
};

Carousel.prototype.regenerateThumbnail = function() {
	if (this.controls.includes('modification')) {
		const self = this;

		document.getElementById('regenerer-miniature').addEventListener('click', function(event) {
			event.preventDefault();

			const url = self.thumbsRegenerateUrlService+self.item.imageId;

			fetch(url).then(res => {
				if(res.ok) {
					console.log('ok');// @todo : console.log data
				} else {
					console.log('La régénérétion d´image ne s´est pas faite');
				}
			})
			.catch(error => console.error(error.message));
		});
	}

};

Carousel.prototype.tagsToArray = function(tags) {
	const cleanTags = [];

	if(!!tags) {
		tags = tags.replace(new RegExp('\\.'), '').split(',');
		tags.forEach((tag,i) => {
			if(!!tag.replace(' ', '')) {
				cleanTags[i] = tag.trim();
			}
		});
	}
	return cleanTags;
};

Carousel.prototype.displayLink = function(url, label) {
	if( !/https?:\/\//.test(url) ) {
		url = 'https://'+url;
	}
	return `<a href="${url}" target="_blank">${label}</a> `;
};
