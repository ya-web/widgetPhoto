import {App} from '../App.js';

export function Organs() {
	return this;
}

Organs.prototype = new App()

Organs.prototype.initRequestParams = function() {
	return [
		'taxon',
		'referentiel',
		'nn',
		'pays',
		'tag',
		'famille',
		'start',
		'limit'
	];
};

// object that will contain all datas to build the vue
Organs.prototype.initAppData = function() {
	return {
		controls      : this.getRequestedControls(this.queryObj.controles),
		displayMode   : 'organes',
		useFancybox   : false,
		hasRss        : false,
		title         : '',
		hasSearch     : false,
		grid          : '6,1',
		column        : 6,
		row           : 1,
		hasFeatured   : false,
		maxPhotos     : 6,
		start         : 0,
		limit         : 6
	};
};

Organs.prototype.initQueryObj = function(params) {
	this.queryObj = filterQueryObject(
		['controles', ...params],
		QUERY_OBJECT
	);
	// force initial start and limit request values
	this.queryObj.start    = 0;
	this.queryObj.limit    = 6;
	this.queryObj.standard = 1;
};


Organs.prototype.buildApp = async function(params) {
	const self        = this,
		promises      = [],
		appData       = cloneObject(this.appData),
		requestParams = filterQueryObject(params, this.queryObj);

	[
		'fleur',
		'feuille',
		'fruit',
		'ecorce',
		'port',
		'rameau',
	].forEach((organ,i) => {
		requestParams.tag = organ;
		requestParams.limit = 6;
		promises[i] = self.imagesService.getData(requestParams, appData, organ);
	});

	const itemsPerOrgan = await Promise.all(promises);
	console.log(itemsPerOrgan);

	if(!!itemsPerOrgan) {
		appData.items = itemsPerOrgan;
	}

	this.onDocReady(appData);
};
