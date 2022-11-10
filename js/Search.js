export function Search() {
	this.container = document.getElementById('cel-photo-content');
	this.gallery   = document.querySelector('.cel-photo-gallery');
	this.form      = document.getElementById('search-form');
	return this;
}

Search.prototype.init = function() {
	this.initSearchForm();
	this.initSearch();
};

Search.prototype.initSearchForm = function() {
	const formFields = [
		'recherche',
		'taxon',
		'famille',
		'referentiel',
		'localite',
		'departement',
		'pays',
		'auteur',
		'programme',
		'tags',
		'standard'
	],
	queryStringParams = this.getQueryStringParams();
	let field,
		paramValue = null;

	formFields.forEach(param => {
		field = document.getElementById(param) ?? null;
		paramValue = queryStringParams[param];
		if(!!paramValue) {
			if(!!field) {
				if('referentiel' === param) {
					Array.from(field.getElementsByTagName('option')).forEach((option,index) => {
						option.selected = option.value === paramValue;
					});
				}
				field.value = paramValue;
			} else if('standard' === param) {
				document.getElementById('non-standards').checked = '0' === paramValue;
			}
		}
	});
};

Search.prototype.initSearch = function() {
	const self = this,
		search = this.form.querySelector('.recherche');

	this.toggleMoreFilters();
	this.form.querySelectorAll('input, select').forEach(field =>  {
		if(search.id !== field.id) {
			field.addEventListener('change', function() {
				if(!!field.value) {
					search.value = '';
				}
			})
		}

		field.addEventListener('keydown', function(evt) {
			if(13 === evt.keyCode || 'Enter' === evt.key) {
				self.onSearch(evt);
			}
		})
	});
	document.getElementById('search-button').addEventListener('click', this.onSearch.bind(this));
};

Search.prototype.toggleMoreFilters = function() {
	const filtersToggleButton = this.form.querySelector('.more-filters-button'),
		openFilters         = filtersToggleButton.querySelector('.plus'),
		closeFilters        = filtersToggleButton.querySelector('.less'),
		otherFilters        = document.getElementById('other-filters'),
		closeOverlayButton  = otherFilters.querySelector('.close-filters-button');

	filtersToggleButton.addEventListener('click', evt => {
		evt.preventDefault();
		[otherFilters,openFilters,closeFilters].forEach(button => button.classList.toggle('hidden'));
	});
	closeOverlayButton.addEventListener('click', evt => {
		evt.preventDefault();
		[otherFilters,closeFilters].forEach(button => button.classList.add('hidden'));
		openFilters.classList.remove('hidden');
	});
};

Search.prototype.onSearch = function(evt) {
	const self = this,
		queryStringParams = this.getQueryStringParams(),
		searchTerms       = this.getSearchTerms(evt.target.closest('form')),
		newQueryObj       = {...queryStringParams,...searchTerms};

	Object.keys(newQueryObj).forEach(param => !newQueryObj[param] && delete newQueryObj[param]);

	const newQueryString = new URLSearchParams(newQueryObj),
		url              = appUrlBase+'?'+newQueryString.toString();

	this.gallery.querySelectorAll('*').forEach(n => n.remove());
	this.gallery.classList.add('text-align-center');
	this.container.querySelector('.cel-photo-footer').querySelectorAll('*').forEach(n => n.remove());

	fetch(url).then(res => {
		if(res.ok) {
			res.text().then(() => window.location = url);
		} else {
			self.gallery.textContent = 'Votre recherche n’a donné aucun résultat';
			console.warn( 'Erreur, le contenu n’a pas pu être chargé' );
		}
	}).catch(error => console.error( error.message ));
};

Search.prototype.getQueryStringParams = function() {
	const urlSearchParams = new URLSearchParams(window.location.search);

	return Object.fromEntries(urlSearchParams.entries());
};

Search.prototype.getSearchTerms = function(form) {
	const formData  = new FormData(form),
		searchTerms = {standard:'1'};

	formData.forEach((value,param) => {
		if('photos-affichees' === param && 'non-standard' === value) {
			searchTerms.standard = '0';
		} else {
			searchTerms[param] = value;
		}
	});

	return searchTerms;
};

