import {App} from '../App.js';

export function Gallery() {
	this.appDataParams = [
		'affichage',
		'champ_recherche',
		'vignette',
		'extra',
		'mode_zoom',
		'titre',
		'rss',
		'id',
		'start',
		'limit',
		'controles'
	];

	return this;
}

Gallery.prototype = new App();

Gallery.prototype.initRequestParams = function() {
	return [
		'recherche',
		'taxon',
		'nn',
		'referentiel',
		'commune',
		'dept',
		'pays',
		'auteur',
		'programme',
		'projet',
		'tag',
		'famille',
		'standard',
		'start',
		'limit'
	];
};

Gallery.prototype.initQueryObj = function(requestParams) {
	// filter app url query string
	this.queryObj = filterQueryObject(
		[...this.appDataParams,...requestParams],
		QUERY_OBJECT
	);
	// initial start and limit request values
	this.queryObj.start = this.queryObj.start ? parseInt(this.queryObj.start) : parseInt(configDefaults.start);
	if (!!this.queryObj.limit) {
		this.queryObj.limit = parseInt(this.queryObj.limit);
	} else if (!!configDefaults.limit) {
		this.queryObj.limit = parseInt(configDefaults.limit);
	} else {
		this.queryObj.limit = 100;
	}
};

Gallery.prototype.initAppData = function() {
	const toBool    = str => 'false' !== str && 'null' !== str && !!str,
		data        = filterQueryObject(this.appDataParams,this.queryObj),
		controls    = this.getRequestedControls(data.controles),
		displayMode = 'galerie',
		useFancybox = undefined === data.mode_zoom || 'fancybox' === data.mode_zoom,
		hasRss      = undefined === data.rss || toBool(data.rss),
		grid        = !!data.vignette && '/^[0-9]+,[0-9]+$/'.test(data.vignette) ? data.vignette : configDefaults.vignette,
		title       = data.titre ? htmlentities.encode(decodeURIComponent(data.titre)) : '',
		hasSearch   = undefined === data.champ_recherche || toBool(data.champ_recherche);

	let [column, row] = grid.split(',');
	column = parseInt(column);
	row = parseInt(row);

	let hasFeatured = true;
	if(!!data.extra) {
		hasFeatured = 1 === column && 1 === row ? false : toBool(data.extra);
	} else {
		hasFeatured = configDefaults.extra;
	}

	let maxPhotos = column * row;
	if (hasFeatured) {
		if (2 === column) {
			maxPhotos -= 1;
		} else if (2 < column) {
			maxPhotos -= 3;
		}
	}

	const start     = this.queryObj.start,
		limit       = this.queryObj.limit,
		total = 0;

	return {
		controls,
		displayMode,
		useFancybox,
		hasRss,
		title,
		hasSearch,
		grid,
		column,
		row,
		hasFeatured,
		maxPhotos,
		start,
		limit
	};
};

Gallery.prototype.buildApp = async function(params) {
	const requestParams = filterQueryObject(params, this.queryObj),
		appData         = cloneObject(this.appData),
		baseLimit       = requestParams.limit;

	if (baseLimit > appData.maxPhotos + 1) {
		requestParams.limit = appData.maxPhotos + 1;
	}

	const items = await this.imagesService.getData(requestParams, appData);

	if(items.errorMessages) {
		this.errorMessages = this.errorMessages.concat(items.errorMessages);
	}
	if(items?.length) {
		appData.items = items;
		appData.total = appData.items.length;
		requestParams.limit = baseLimit;
		appData.requestParams = requestParams;
	}
	this.onDocReady(appData)
};
