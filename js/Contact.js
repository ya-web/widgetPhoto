export function Contact (item, imageIndex, isFromOverlay = false) {
	this.item          = item;
	this.imageIndex    = imageIndex;
	this.isFromOverlay = isFromOverlay;

	this.form          = document.getElementById('form-contact');
	this.cancelButton  = document.getElementById('fc_annuler');

	return this;
}

Contact.prototype.init = function() {
	const self = this;

	this.initTpl();
	document.getElementById('form-contact').addEventListener('submit', function(evt) {
		evt.preventDefault();
		self.envoyerCourriel();
	});
	this.onCloseContactOverlay();
};

Contact.prototype.initTpl = function() {
	document.querySelector('.destinataire').textContent = this.item.user.nom_utilisateur;
	document.getElementById('fc_sujet').value = `Image #${this.item.imageId} de ${this.item.occurence.nom_sel}`;
	document.getElementById('fc_message').textContent = `\n\n\n\n\n\n\n\n--\nConcerne l’image de \"${this.item.occurence.nom_sel} du ${this.item.date}`;
	document.getElementById('fc_destinataire_id').value = this.item.imageId;
};

Contact.prototype.onCloseContactOverlay = function() {
	const self = this,
		callback = evt => {
			evt.preventDefault();
			evt.stopPropagation();

			if(self.isFromOverlay) {
				const loadCarouselink = Array.from(document.querySelectorAll('.carousel-overlay-open')).find(link => link.dataset.imageIndex = this.imageIndex);

				loadCarouselink.click();
			} else {
				closeOverlay();
			}
		};

	[this.cancelButton, document.getElementById('close-overlay')].forEach(
		closeButton => closeButton.addEventListener('click', callback, false)
	);

	this.cancelButton.addEventListener('keydown', evt => {
		evt = evt || window.event;
		// evt.keyCode déprécié, on tente d'abord evt.key
		if ('Enter' === evt.key || 13 === evt.keyCode) {
			callback(evt);
		}
	});

	document.body.addEventListener('keyup',  evt => {
		if(!document.getElementById('images-meta-container').classList.contains('hidden')) {
			evt = evt || window.event;
			// evt.keyCode déprécié, on tente d'abord evt.key
			if (/^Esc(ape)?/.test(evt.key) || 27 === evt.keyCode) {
				callback(evt);
			}
		}
	});
};

Contact.prototype.envoyerCourriel = async function() {
	let data      = [],
		form      = document.getElementById('form-contact'),
		// @todo: valider email
		formValid = !!form.elements.fc_sujet && !!form.elements.fc_message && !!form.elements.fc_utilisateur_courriel;

	if (formValid) {
		// l'envoi aux non inscrits passe par le service intermédiaire du cel
		// qui va récupérer le courriel associé à l'image indiquée
		const recipient = document.getElementById('fc_destinataire_id').value,
			urlMessage = 'http://api.tela-botanica.org/service:cel:celMessage/image/'+recipient,
			names = [
				'sujet',
				'message',
				'utilisateur_courriel',
				'destinataire_id'
			],
			inputs = form.elements;
		let erreurMsg = '';

		names.forEach(name => {
			const input = inputs['fc_'+name];

			if(!!input) {
				if ( 'sujet' === name) {
					input.value += ' - Carnet en ligne - Tela Botanica';
				}
				if ('message' === name) {
					input.value +=
						`\n--\n
						Ce message vous est envoyé par l'intermédiaire du widget photo du Carnet en Ligne du réseau Tela Botanica.\n
						http://www.tela-botanica.org/widgetPhoto`;
				}
				data[index] = {
					'name' : name,
					'value': input.value
				};
			}

		});

		const dialogEl = document.getElementById('fc-zone-dialogue');

		dialogEl.querySelectorAll('.msg').forEach(msgEl => msgEl.remove());
		try {
			const res = await fetch(urlMessage, {
				method : "POST",
				cache  : false,
				data,
			});
			if (!res.ok) {
				// @todo: voir la bonne adresse remarques
				/*erreurMsg += `Erreur Ajax :\ntype : ${res.status} ${errorThrown}\n`;
				reponse = JSON.parse(jqXHR.responseText);
				if (!!reponse) {
					response.foreach(value => erreurMsg += value+"\n");
				}*/
				throw new Error(res.status);
			}
			const text = await res.text();

			const message = `<pre class="msg info">${text}</pre>`;

				dialogEl.insertAdjacentHTML("beforeend", message);

			/*const jsonDebugInfos = jqXHR.getResponseHeader("X-DebugJrest-Data");
			let debugMsg = '';

			if (!!jsonDebugInfos) {
				debugInfos = JSON.parse(jsonDebugInfos);
				if (!!debugInfos) {
					debugInfos.forEach(value => debugMsg += value+"\n");
				}
			}

			if (!!erreurMsg) {
				const errorHtmlMessage =
					`<p class="msg">
						Une erreur est survenue lors de la transmission de votre message.<br>
						Vous pouvez signaler le disfonctionnement à 
						<a href="mailto:cel-remarques@tela-botanica.org?subject=Disfonctionnement du widget carto&body=${erreurMsg}\nDébogage :\n${debugMsg}">
							cel-remarques@tela-botanica.org
						</a>.
					</p>`
				dialogEl.insertAdjacentHTML("beforeend", errorHtmlMessage);
			}*/

		} catch (error) {
			console.warn(error);
		}

		/*$.ajax({
			type       : "POST",
			cache      : false,
			url        : urlMessage,
			data       : data,
			success    : function(data) {
				const message = `<pre class="msg info">${data.message}</pre>`;

				dialogEl.insertAdjacentHTML("beforeend", message);
			},
			error      : function(jqXHR, textStatus, errorThrown) {
				erreurMsg += `Erreur Ajax :\ntype : ${textStatus} ${errorThrown}\n`;
				reponse = JSON.parse(jqXHR.responseText);
				if (!!reponse) {
					response.foreach(value => erreurMsg += value+"\n");
				}
			},
			complete   : function(jqXHR, textStatus) {
				const jsonDebugInfos = jqXHR.getResponseHeader("X-DebugJrest-Data");
				let debugMsg = '';

				if (!!jsonDebugInfos) {
					debugInfos = JSON.parse(jsonDebugInfos);
					if (!!debugInfos) {
						debugInfos.forEach(value => debugMsg += value+"\n");
					}
				}

				if (!!erreurMsg) {
					const errorHtmlMessage =
						`<p class="msg">
							Une erreur est survenue lors de la transmission de votre message.<br>
							Vous pouvez signaler le disfonctionnement à 
							<a href="mailto:cel-remarques@tela-botanica.org?subject=Disfonctionnement du widget carto&body=${erreurMsg}\nDébogage :\n${debugMsg}">
								cel-remarques@tela-botanica.org
							</a>.
						</p>`
					dialogEl.insertAdjacentHTML("beforeend", errorHtmlMessage);
				}
			}
		});*/
	}
	return false;
};
