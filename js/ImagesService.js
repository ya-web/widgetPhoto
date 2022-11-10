export function ImagesService() {}

ImagesService.prototype.getData = async function(requestServiceParams, appData, organ) {
	const urlServiceImages = celServices+'CelWidgetImage/*',
		url                = urlServiceImages+'?'+ new URLSearchParams(requestServiceParams),
		errorMessages      = [];

	try {
		const res = await fetch(url);
		if (!res.ok) {
			// @todo: voir la bonne adresse remarques
			errorMessages.push(
				`Une erreur est survenue, les images n’ont pas pu être chargées.
				Si le problème persiste vous pouvez contacter l'adresse cel_remarques@tela-botanica.org.`
			);

			console.error(res.status);
			throw new Error(
				`Erreur : L’URI suivante est invalide : ${urlServiceImages}
				Veuillez vérifier les paramêtres indiqués et la présence d’images associées.`
			);
		}
		const data        = await res.json(),
			displayMode   = appData.displayMode,
			responseItems = this.setItems(data, appData.hasFeatured, organ);

		if ('organes' === appData.displayMode) {
				console.warn('Aucune photo ne correspond à vos critères : ', '"'+organ+'"');
				return {[organ] :responseItems};
		} else {
			if(!responseItems) {
				errorMessages.push('Aucune photo ne correspond à vos critères');
				throw new Error(errorMessages);
			}
			return responseItems
		}
	} catch (errorMessages) {
		return {errorMessages};
	}
};

ImagesService.prototype.setItems = function(serviceData, hasFeatured, organ) {
	if(!serviceData.images?.length) {
		return false;
	}

	const items = [];
	let padIndex = 0,
		image;

	for(let i = 0; i < serviceData.images.length; i++) {
		image = serviceData.images[i];

		const occurence  = image.obs,
			user         = image.utilisateur,
			attribution  = image.attribution,
			originalName = image.nom_original,
			photoTag     = image.tags_photo,
			title        = `${occurence.nom_sel}[nn${occurence.nom_sel_nn}] par ${user.nom_utilisateur} le ${dateStringToLocaleDateString(occurence.date_obs)} - ${occurence.localisation}`,
			photoDate    = image.date_photo ?? occurence.date_obs,
			date         = dateStringToLocaleDateString(photoDate),// e.g. 24/03/2022
			dateLong     = dateStringToLongDateString(photoDate),// e.g. Jeudi 24 mars 2022
			profileUrl   = tbProfileUrlTpl+user.id_utilisateur,
			photoUrl     = image.url_photo.replace(/\,$/,''),
			photoUrlTpl  = photoUrl.replace(/(O|XS|[SML]|X(?:[23]|)L|CR(?:|X2)S|C(?:|X)S)$/,''),
			imageId      = String(image.id_photo).padStart(9, '0'),
			efloreLink   = efloreUrlTpl(occurence.nom_referentiel, occurence.nom_sel_nn),
			imgSizeCode  = 'CR'+(hasFeatured && 0 === i ? 'L' : 'S');

		preloadImage(photoUrlTpl,(0 === i));

		const item = {
			occurence,
			user,
			attribution,
			originalName,
			photoTag,
			title,
			imageId,
			photoUrl,
			photoUrlTpl,
			photoDate,
			date,
			dateLong,
			profileUrl,
			efloreLink,
			imgSizeCode
		};

		items[padIndex++] = item;
	};

	return items;
};