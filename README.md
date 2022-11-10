# Tela Botanica Widget Photo

## Description

Displays photos linked to Tela Botanica occurences.
Designed for integration in an iframe.  

## Install

Copy & paste [_js/config.default.js_](js/config.default.js) as _config.js_, then adapt all variables to the environement where you run the app.

## Usage

**Querystring parameters** :
- `affichage` : `galerie` (default) or `organes` (designed for eflore, e.g. https://www.tela-botanica.org/bdtfx-nn-72318-illustrations#illustrations-coste).
If `organes` is chosen then `taxon` is mandatory, and only params related to taxonomy of the plant will be taken into account (e.g. `referentiel`).

- `taxon` : Species name.
- `referentiel` : Referencial (taxonomy).
- `nn` : Nomenclatural number of a species.
- `start` : Where to start in the results array (default 0).
- `limit` : Number of results to display (default depends on grid total displayable photos e.g. 9 when `affichage` is set to `galerie` because the grid takes 4*3 but the first photo is featured so takes 4 in the grid instead of 1).
- `controls`: Coma separated features in the carousel to enable (`tags`, `protocoles`, `signaler`, `revision`, `metadonnees`, `modification`, `aide`, default : `metadonnees`,`aide`).

Parameters below are only taken into account if display mode is not `organes`:
- `tag` : Coma separated photo tags.
- `recherche` : Search.
- `commune` : City.
- `dept` : County.
- `auteur` : Author of the photo.
- `programme` : Program.
- `projet` : Project.
- `standard` : Rather the photo is a valid illustration of the species in the occurence or not.
