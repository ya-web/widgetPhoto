import {Search} from './Search.js';
import {Carousel} from './Carousel.js';
import {Contact} from './Contact.js';
import {ImagesService} from './ImagesService.js';

export function Index(props) {
	this.props = cloneObject(props);
	for (const p in props) {
		this[p] = props[p];
	}

	this.head               = document.head || document.getElementsByTagName('head')[0];
	this.appContainerIdAttr = 'cel-photo-content';
	this.appContainer       = document.getElementById(this.appContainerIdAttr);

	return this;
}

Index.prototype.init = function() {
	// always
	this.addMetaImage();
	this.updateBaseIndex();
	this.addGridStyle();
	// if title or rss
	this.addTitle();
	// if search
	this.addSearch();
	// organs display mode
	this.addOrganTabs();
	// other display modes
	this.addGallery();
	this.addFooter();
	this.addPagination();
	this.updateItems();
	if(this.hasSearch) {
		new Search().init();
	}
	// organs display mode
	this.onTab();
};

Index.prototype.addMetaImage = function() {
	const  self = this;

	if(!!this.items?.length) {
		const meta = document.createElement('meta');

		meta.setAttribute('property', 'og:image');
		meta.content = this.items[this.start].photoUrlTpl+'CRS';
		this.head.appendChild(meta);
	} else {
		const metasAttributes = [
			{
				propety : 'og:image',
				content: 'https://resources.tela-botanica.org/tb/img/256x256/carre_englobant.png'
			},
			{
				propety : 'og:image:type',
				content: 'image/png'
			},
			{
				propety : 'og:image:width',
				content: '256'
			},
			{
				propety : 'og:image:height',
				content: '256'
			}
		];

		metasAttributes.forEach(metaAttributes => {
			const meta = document.createElement('meta');

			meta.setAttribute('property', metaAttributes.property);
			meta.content = metaAttributes.content;
			self.head.appendChild(meta);
		});
	}
};

// see: https://stackoverflow.com/a/524721/12717345
Index.prototype.addGridStyle = function() {
	const basicDim = Math.floor(100/this.column) - 1,
		css =
			`.grid-wrapper {
				grid-template-columns: repeat(${this.column}, ${basicDim}vw);
				grid-template-rows: repeat(${this.row}, ${basicDim}vw);
			}`,
		style = document.createElement('style');

	this.head.appendChild(style);
	style.type = 'text/css';
	if (style.styleSheet){
		// This is required for IE8 and below.
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
};

Index.prototype.updateBaseIndex = function() {
	const body = document.body;

	body.classList.add(this.displayMode);
	body.dataset.displayMode = this.displayMode;
	this.appContainer.dataset.controls = this.controls;
	document.getElementById('loading-page').remove();
};

Index.prototype.addTitle = function() {
	if(!!this.title || this.hasRss) {
		this.appContainer.insertAdjacentHTML(
			'afterbegin',
			this.mainTitleTpl()
		);
	}
};

Index.prototype.addSearch = function() {
	if(this.hasSearch) {
		this.appContainer.insertAdjacentHTML(
			'beforeend',
			this.searchTpl
		);
	}
};

Index.prototype.addGallery = function () {
	if('organes' !== this.displayMode) {
		this.appContainer.appendChild(this.galleryTpl(this.items));
	}
};

Index.prototype.addPagination = function () {
	if('organes' !== this.displayMode) {
		const nextPrevBtnsContainer = document.createElement('div');

		nextPrevBtnsContainer.id = 'next-previous-buttons';
		this.appContainer.appendChild(nextPrevBtnsContainer);
		this.setNextPrevBtns(nextPrevBtnsContainer);
	}
};

Index.prototype.updateItems = async function() {
	const galleryLength = document.querySelectorAll('.grid-item')?.length ?? 0;

	if('organes' !== this.displayMode && this.total > galleryLength) {
		const requestParams = cloneObject(this.requestParams),
			imagesService = new ImagesService();

		requestParams.start = this.start + this.maxPhotos + 1;
		requestParams.limit -= requestParams.start;

		const items = await imagesService.getData(requestParams, this.props);

		if(items?.length) {
			this.items = this.items.concat(items);
			this.total += items.length;
		}
	}
};

Index.prototype.addFooter = function () {
	if('organes' !== this.displayMode) {
		this.appContainer.insertAdjacentHTML(
			'beforeend',
			this.footerTpl()
		);
	}
};

Index.prototype.addOrganTabs = function () {
	if('organes' === this.displayMode) {
		const {tablist,tabContent} = this.organTabs();

		this.appContainer.appendChild(tablist);
		this.appContainer.appendChild(tabContent);
	}
};

Index.prototype.setNextPrevBtns = function(nextPrevBtns) {
	let previous = document.getElementById('previous-photos'),
		next = document.getElementById('next-photos'),
		alert = nextPrevBtns.querySelector('.alert');

	if(0 < this.start) {
		if(!previous) {
			nextPrevBtns.insertAdjacentHTML('afterbegin', '<a id="previous-photos" class="prev" href="">Photos precedentes</a>');
			previous = document.getElementById('previous-photos');
			this.loadNextPreviousGridPhotos(previous);
		}
	} else if(!!previous) {
		previous.remove();
	}

	const self = this;

	if (next) {
		next.remove();
	}
	setTimeout(function() {
		const galleryLength = document.querySelectorAll('.grid-item')?.length ?? 0;

		if(self.total > self.start+self.maxPhotos && galleryLength === self.maxPhotos) {
			if (!document.getElementById('next-photos')) {
				nextPrevBtns.insertAdjacentHTML('beforeend', '<a id="next-photos" class="next" href="">Photos suivantes</a>');
				next = document.getElementById('next-photos');
				self.loadNextPreviousGridPhotos(next);
			}
			if(alert) {
				alert.remove();
			}
		} else {
			if(!alert) {
				nextPrevBtns.insertAdjacentHTML('beforeend', '<div class="alert alert-secondary mt-0 ml-1" role="alert" style="display: inline-block;">Toutes les photos disponibles, correspondant à vos critères, ont été affichées</div>');
			}
		}
	}, 1200);
};

Index.prototype.loadNextPreviousGridPhotos = function(paginationLink) {
	if(!!paginationLink) {
		const self = this,
			gallery = document.querySelector('.cel-photo-gallery'),
			nextPrevBtns = document.getElementById('next-previous-buttons');

		paginationLink.addEventListener('click', function(evt) {
			evt.preventDefault();

			removeContent(gallery);
			const direction = paginationLink.classList.contains('prev') ? -1 : 1;

			self.start += direction * self.maxPhotos;
			self.photoGrid(self.items,true).forEach(gridItem => gallery.appendChild(gridItem));
			self.setNextPrevBtns(nextPrevBtns);
		});
	}
};

Index.prototype.onOpenOverlay = function(link) {
	const self = this,
		mode = link.dataset.mode,
		imageIndex = link.dataset.imageIndex,
		content = loadOverlayContent(mode);

	link.addEventListener('click', evt => {
		evt.preventDefault();

		if (!!content) {
			enableOverlay(content);
			if('carousel' === mode) {
				const items = 'organes' !== self.displayMode ? self.items : self.extractOrganItems(link),
					props = {
						items,
						imageIndex,
						start: self.start,
						maxPhotos: self.maxPhotos
					};

				new Carousel(props).init();
				$('[data-toggle="tooltip"]').tooltip();
			} else {
				const isOriginCarouselOverlay = 'organes' !== self.displayMode && link.closest('#images-meta-container');

				new Contact(self.items[imageIndex],imageIndex,isOriginCarouselOverlay).init();
			}
		}
	});
};

Index.prototype.extractOrganItems = function(link) {
	const tabPane     = link.closest('.tab-pane'),
		organ         = tabPane.id,
		itemsPerOrgan = this.items.find(item => organ === Object.keys(item)[0]);

	return itemsPerOrgan[organ];
};

Index.prototype.onTab = function () {
	if('organes' === this.displayMode) {
		const openCarousel = (target) => {
			const organ         = target.getAttribute('aria-controls'),
				loadCarouselink = document.getElementById(organ).querySelector('.load-overlay');

			if(!!loadCarouselink) {
				loadCarouselink?.click()
			} else {
				closeOverlay();
			}
		};

		openCarousel(document.querySelector('.nav-link.active'));
		document.querySelectorAll('.nav-link').forEach(
			navLink => navLink.addEventListener('click', event =>
				openCarousel(event.target)
			)
		);
	}
};

/** Templates */

Index.prototype.mainTitleTpl = function() {
	const title            = this.title ?? '',
		rssFlowUrl         = celServices+'CelSyndicationImage/multicriteres/atom/M',
		requestQueryString = new URLSearchParams(this.requestParams).toString(),
		rssLink            = this.hasRss ?
			`<a href="${rssFlowUrl+'?'+requestQueryString}" class="cel-photo-flux"	title="Suivre les images" onclick="window.open(this.href);return false;">
				<img src="https://www.tela-botanica.org/sites/commun/generique/images/rss.png" alt="Suivre les images" />
			</a>` : '';
	const mainTitle = `<h1>${title}${rssLink}</h1>`;

	return mainTitle;
};

Index.prototype.searchTpl =
	`<form id="search-form" class="search-form container" action="">
		<div id="search-block" class="search-block form-inline d-flex justify-content-center w-100">
			<input type="text" id="champ-recherche" name="champ-recherche" class="recherche form-control mr-1" placeholder="Votre recherche">
			<input type="hidden" id="filtres" name="filtres">
			<a id="search-button" class="btn btn-success search-button mr-1"><i class="fas fa-search"></i>&nbsp;Rechercher</a>
			<a id="more-filters-button" class="btn btn-outline-secondary more-filters-button">
				<span class="plus">
					<i class="fas fa-chevron-down"></i>&nbsp;Plus&nbsp;de&nbsp;filtres
				</span>
				<span class="less hidden">
					<i class="fas fa-chevron-up"></i>&nbsp;Fermer&nbsp;les&nbsp;filtres
				</span>
			</a>
		</div>
		<div id="other-filters" class="other-filters row hidden">
			<a id="close-filters-button" class="btn close-filters-button"><i class="fas fa-times"></i></a>
			<div id="left-filter-block" class="filters-block left-filter-block col-lg-6">
				<div class="row taxon-block filter-block">
					<label for="taxon">Taxon</label>
					<input type="text" id="taxon" name="taxon" class="form-control">
				</div>
				<div class="row referentiel-block filter-block">
					<label for="referentiel">Référentiel</label>
					<select name="referentiel" id="referentiel" class="custom-select form-control referentiel">
						<option value="bdtfxr" selected="selected" title="Trachéophytes de France métropolitaine">Métropole (index réduit)</option>
						<option value="bdtfx" title="Trachéophytes de France métropolitaine">Métropole (BDTFX)</option>
						<option value="bdtxa" title="Trachéophytes des Antilles">Antilles françaises (BDTXA)</option>
						<option value="bdtre" title="Trachéophytes de La Réunion">Réunion (BDTRE)</option>
						<option value="aublet" title="Guyane">Guyane (AUBLET2)</option>
						<option value="florical" title="Nouvelle-Calédonie">Nouvelle-Calédonie (FLORICAL)</option>
						<option value="isfan" title="Afrique du Nord">Afrique du Nord (ISFAN)</option>
						<option value="apd" title="Afrique de l'Ouest et du Centre">Afrique de l'Ouest et du Centre (APD)</option>
						<option value="lbf" title="Liban">Liban (LBF)</option>
						<option value="autre" title="Autre/Inconnu">Autre/Inconnu</option>
					</select>
				</div>
				<div class="periode-block filter-block">
					<label for="periode" class="d-block">Date (début-fin)</label>
					<div class="form-row">
						<div class="form-group mb-lg-0 mb-1 col">
							<input type="date" id="periode-debut" name="periode-debut" class="form-control">
						</div>
						<div class="form-group mb-0 col">
							<input type="date" id="periode-fin" name="periode-fin" class="form-control">
						</div>
					</div>
					<input type="hidden" id="periode" name="periode">
				</div>
				<div class="row  localite-block filter-block">
					<label for="localite">Localité</label>
					<input type="text" id="localite" name="localite" class="form-control">
				</div>
				<div class="row  filter-block">
					<label for="departement">Département</label>
					<input type="text" id="departement" name="departement" class="form-control" placeholder="Numéros (séparés par des virgules)">
				</div>
				<div class="row  filter-block">
					<label for="pays">Pays</label>
					<input type="text" id="pays" name="pays" class="form-control">
				</div>
			</div>
			<div id="right-filter-block" class="filters-block right-filter-block col-lg-6">
				<div class="row  filter-block">
					<label for="auteur">Auteur</label>
					<input type="text" id="auteur" name="auteur" class="form-control" placeholder="Nom, email">
				</div>
				<div class="row  filter-block">
					<label for="programme">Programme</label>
					<input type="text" id="programme" name="programme" class="form-control">
				</div>
				<div class="row  filter-block">
					<label for="tags">Tags (tous)</label>
					<input type="text" id="tags" name="tags" class="form-control">
				</div>
				<div class="list displayed-photos-block filter-block mt-3">
					<div class="form-check mt-3">
						<input type="checkbox" id="non-standards" name="photos-affichees" class="non-standards form-check-input" value="non-standards">
						<label for="non-standards" class="non-standards form-check-label">Afficher les photos des observations non "standards"</label>
					</div>
				</div>
			</div>
		</div>
	</form>`;

// @todo : galleryTpl() et photoGrid() Ajouter les elements en createElement et ajouter un eventListener loadovelay directement sur chaque lien nécessaire
Index.prototype.galleryTpl = function(items, hasTitleBlock = true) {
	const gallery = document.createElement('div'),
		gridItems = this.photoGrid(items, hasTitleBlock);

	gallery.classList.add('cel-photo-gallery', 'grid-wrapper');
	gridItems.forEach(gridItem => gallery.appendChild(gridItem));

	return gallery;
};

Index.prototype.photoGrid = function(items, hasTitleBlock) {
	const max = (this.start + this.maxPhotos <= items.length ? this.start + this.maxPhotos : items.length),
		gridItems = [];
	let tpl = '',
		item,
		gridItem,
		titleBlock,
		titleBlockContent,
		titleBlockContactLink,
		carouselLink,
		carouselLinkImg;

	for(let imageIndex = this.start; imageIndex < max; imageIndex++) {
		item = items[imageIndex];

		gridItem = document.createElement('div');
		gridItem.classList.add('cel-photo', 'grid-item');
		if(this.hasFeatured && imageIndex === 0) {
			gridItem.classList.add('grid-size2');
		}

		carouselLink = document.createElement('a');
		carouselLink.href = item.photoUrlTpl+'O';
		carouselLink.classList.add('cel-img', 'load-overlay', 'carousel-overlay-open');
		carouselLink.dataset.mode = 'carousel';
		carouselLink.dataset.imageIndex = imageIndex;
		carouselLink.setAttribute('title', `${item.title} - Publiée le ${item.dateLong} - GUID : ${item.imageId}`);
		carouselLink.setAttribute('rel', 'galerie-princ');
		this.onOpenOverlay(carouselLink);

		carouselLinkImg = document.createElement('img');
		carouselLinkImg.src = item.photoUrlTpl+item.imgSizeCode;
		carouselLinkImg.setAttribute('alt', item.title);
		carouselLinkImg.setAttribute(
			'onerror',
			`this.onerror=null;
			this.closest('.cel-photo').remove();`
		);

		carouselLink.appendChild(carouselLinkImg);

		gridItem.appendChild(carouselLink);

		if(hasTitleBlock) {
			titleBlock = document.createElement('div');
			titleBlock.id = 'cel-info-'+item.imageId;
			titleBlock.classList.add('cel-infos');

			titleBlockContent = document.createElement('strong');

			if(!!item.efloreLink) {
				titleBlockContent.insertAdjacentHTML('afterbegin', item.occurence.nom_sel);
				if(!!item.user.nom_utilisateur?.trim()) {
					titleBlockContent.insertAdjacentHTML('beforeend', '<br>par');

					titleBlockContactLink = document.createElement('a');
					titleBlockContactLink.classList.add('cel-img-contact', 'load-overlay', 'contact-overlay-open');
					titleBlockContactLink.dataset.mode = 'contact';
					titleBlockContactLink.dataset.imageIndex = imageIndex;
					titleBlockContactLink.setAttribute('title', 'Cliquez pour contacter l’auteur de la photo');
					titleBlockContactLink.textContent = item.user.nom_utilisateur;
					this.onOpenOverlay(titleBlockContactLink);

					titleBlockContent.appendChild(titleBlockContactLink);
				}
			} else {
				titleBlockContent.insertAdjacentHTML('afterbegin', item.title);
			}

			titleBlock.appendChild(titleBlockContent);

			gridItem.appendChild(titleBlock);
		}

		gridItems[imageIndex] = gridItem;
	}

	return gridItems;
};

Index.prototype.footerTpl = function() {
	const options = {
			weekday : 'long',
			day     : 'numeric',
			month   : 'long',
			year    : 'numeric',
			hour    : '2-digit',
			minute  : '2-digit',
			second  : '2-digit'
		},
		date      = new Date(),
		now       = date.toLocaleString('fr-FR', options);

	const footer =
		`<p class="cel-photo-footer grey-txt clear">
			<span class="cel-photo-source">
				Source :
				<a href="http://www.tela-botanica.org/page:cel" title="Carnet en Ligne" onclick="window.open(this.href);return false;">
					CEL
				</a>
			</span>
			<span class="cel-photo-date-generation">Au ${now}</span>
		</p>`;
	return footer;
};

Index.prototype.organTabs = function() {
	const self = this,
		tablist    = document.createElement('ul'),
		tabContent = document.createElement('div');

	tablist.id = 'displayPerOrgan';
	tablist.setAttribute('role','tablist');
	tablist.classList.add(
		'nav',
		'nav-tabs',
		'nav-pills',
		'with-arrow',
		'lined',
		'flex-column',
		'flex-sm-row',
		'text-center'
	);

	tabContent.id = 'displayPerOrganContent';
	tabContent.classList.add('tab-content');

	this.items.forEach((itemPerOrgan,key) => {
		const organ  = Object.keys(itemPerOrgan)[0];
		if(itemPerOrgan[organ]) {
			const items    = itemPerOrgan[organ],
				tab      = document.createElement('li'),
				tablink  = document.createElement('a'),
				tabPanel = document.createElement('div'),
				tooltips = {
					'fleur'   : 'organes reproducteurs',
					'ecorce'  : 'tige',
					'fruit'   : 'cône / graine',
					'port'    : 'aspect général',
					'rameau'  : 'subdivision de la tige'
				};

			tab.classList.add('nav-item', 'flex-sm-fill');

			tablink.id = organ+'-tab';
			tablink.classList.add(
				'nav-link',
				'text-uppercase',
				'font-weight-bold',
				'mr-sm-3',
				'rounded-0'
			);
			if(!!tooltips[organ]) {
				tablink.setAttribute('title', tooltips[organ]);
			}
			tablink.setAttribute('role','tab');
			tablink.setAttribute('aria-controls',organ);
			tablink.setAttribute('aria-selected','true');
			tablink.dataset.toggle = 'tab';
			tablink.href = '#'+organ;
			tablink.textContent = capitalizeFirstLetter(organ);

			tabPanel.id = organ;
			tabPanel.setAttribute('role', 'tabpanel');
			tabPanel.setAttribute('aria-labelledby', organ+'-tab');
			tabPanel.classList.add(
				'tab-pane',
				'fade',
				'px-4',
				'py-5',
				'show'
			);

			if (0 === key) {
				tablink.classList.add('active');
				tabPanel.classList.add('active');
			}

			tabPanel.prepend(self.galleryTpl(items,false));
			tab.appendChild(tablink);

			tablist.appendChild(tab);
			tabContent.appendChild(tabPanel);
		}

	});

	return {tablist,tabContent};
};
