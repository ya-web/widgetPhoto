import {ImagesService} from './js/ImagesService.js';
import {Organs} from './js/Organs.js';
import {Gallery} from './js/Gallery.js';
import {Index} from './js/Index.js';

export function App() {
	this.queryObj             = {};
	this.appData              = {};
	this.errorMessages        = [];
	this.imagesService = new ImagesService();

	return this;
}

App.prototype.init = function() {
	// Display mode : gallery or organs (organs is "eFlore" display mode)
	const displayMode = filterQueryObject(
		['affichage'],
		QUERY_OBJECT // parsed query string defined in utils.js
	)?.affichage ?? configDefaults.affichage;
	const app = 'organes' === displayMode ? new Organs() : new Gallery();

	// run app depending on display mode
	const requestParams = app.initRequestParams();

	app.initQueryObj(requestParams);
	app.appData = app.initAppData();
	app.buildApp(requestParams);
};

App.prototype.onDocReady = function(appData) {
	docReady(function() {
		const appContainer = document.getElementById('cel-photo-content');

		if(!!appData.items) {
			new Index(appData).init();
		} else {
			document.getElementById('loading-page').remove();
			if(this.errorMessages?.length) {
				appContainer.insertAdjacentHTML(
					'afterbegin',
					`<div id="loading-page" class="warning">
						<h1>${this.errorMessages.join('<br>')}</h1>
						<div class="loading-error "><i class="fa fa-plant-wilt"></i></div>
					</div>`
				)
			}
		}
	});
};

App.prototype.getRequestedControls = function(controlsList) {
	const validControlsKeys  = [
		'metadonnees',
		'tags',
		'protocoles',
		'signaler',
		'revision',
		'modification',
		'aide'
	],
	reqKeys = isString(controlsList) ? controlsList.split(',') : [],
	controlsKeys = reqKeys.map(key => key.replace(/\s+/g, '').toLowerCase().latinise());

	if(!controlsKeys.includes('metadonnees')) {
		controlsKeys.unshift('metadonnees');
	}
	if(!controlsKeys.includes('aide')) {
		controlsKeys.push('aide');
	}

	const controls = validControlsKeys.filter(key => controlsKeys.includes(key));

	return controls.join(',');
};

new App().init();
