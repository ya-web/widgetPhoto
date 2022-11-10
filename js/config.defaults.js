/*                               */
/* Javascript configuration file */
/*                               */
const urlBase          = 'http://localhost';
const apiUrl           = 'https://api-test.tela-botanica.org';
const efloreUrlTpl     = (nomReferentiel, nomSelNn) => `https://www.tela-botanica.org/${nomReferentiel}-nn-${nomSelNn}`;
const tbProfileUrlTpl  = 'https://beta.tela-botanica.org/test/profil-par-id/';

const celServices      = apiUrl +'/service:cel:';
const imageTagsService = apiUrl+ '/service:del:0.1/mots-cles/';
const appUrlBase       = urlBase +'/widgetPhoto';

const configDefaults   = {
	vignette : '4,3',
	affichage : 'galerie',
	start : 0,
	limit : 9,
	extra : true
}