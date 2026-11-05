# Audit AtelierLocal

## Binôme et environnement

- Membres : Paul Lecomte, Shreya Ahluwalia
- Navigateur et version : Chromium 152 (navigateur intégré de l’environnement de développement), DevTools (onglet Accessibility, Console avec `document.activeElement`).

---

## Problème 1 (parcours) — Consulter les détails d’un atelier est impossible au clavier, et le contenu masqué reste atteignable

### Problème identifié

La commande « Détails de l’atelier » était une `div` avec un simple `onClick` :

- elle n’entre pas dans l’ordre de tabulation et ne réagit ni à Entrée ni à Espace : une personne qui navigue au clavier (ou avec une commande vocale, un contacteur…) **ne peut pas lire la description**, qui contient pourtant ce qui est fourni et ce qu’il faut apporter ;
- elle n’a pas de rôle : un lecteur d’écran la restitue comme du texte, sans indiquer qu’on peut agir ;
- elle n’expose aucun état : impossible de savoir si le panneau est ouvert ou fermé ;
- le panneau fermé n’était masqué que visuellement (`grid-template-rows: 0fr` + `opacity: 0`) avec `aria-hidden="true"`. Son lien « Consulter les informations pratiques » restait **focalisable** : la tabulation s’arrêtait sur un lien invisible (focus perdu à l’écran), et ce lien était focalisable tout en étant retiré de l’arbre d’accessibilité (contradiction signalée par les outils, le lecteur d’écran n’annonce rien ou un élément sans nom).

### Reproduction

1. Charger la page, cliquer dans la barre d’adresse puis parcourir la page avec Tab.
2. Constater qu’aucun arrêt ne correspond à « Détails de l’atelier » ; Entrée/Espace sur le texte ne fait rien.
3. Constater qu’après le bouton « M’inscrire à … » de la carte précédente, un arrêt de focus n’affiche aucun contour visible : `document.activeElement` (expression en direct dans la Console) indique le lien « Consulter les informations pratiques » du panneau fermé.
4. DevTools > Accessibility sur la `div` : rôle `generic`, pas d’état `expanded`.

### Comportement attendu

Une personne doit pouvoir atteindre la commande au clavier, comprendre que c’est un bouton qui déplie une zone, connaître son état (réduit / développé), l’activer avec Entrée ou Espace, puis atteindre le contenu une fois déplié — et seulement à ce moment-là.

### Correction à apporter

Utiliser le motif « disclosure » avec un bouton natif : `<button type="button" aria-expanded aria-controls>`. Le bouton natif apporte rôle, focus et activation clavier ; `aria-expanded` expose l’état ; `aria-controls` relie le bouton à son panneau. Le panneau fermé reçoit l’attribut `hidden` (règle `.details-panel[hidden]{display:none}` déjà prévue dans la feuille de style) : son contenu n’est plus ni visible, ni focalisable, ni exposé, ce qui supprime le `aria-hidden` contradictoire.

**Réalisé** (`src/components/WorkshopCard.tsx`) : la `div` est remplacée par un `button` (même classe, apparence inchangée) avec `aria-expanded={expanded}`, `aria-controls` vers l’`id` du panneau (généré par `useId`) et `aria-describedby` vers le titre de l’atelier, pour distinguer les trois boutons « Détails de l’atelier » hors contexte. Le panneau utilise `hidden={!expanded}` à la place de `aria-hidden`.

**Vérification** : au clavier, Tab atteint « Détails de l’atelier » avec un contour visible ; Entrée et Espace déplient/replient ; DevTools affiche rôle `button`, état `expanded: false` puis `true`. Panneau fermé : `display: none`, le lien n’est plus un arrêt de tabulation ; une fois ouvert, Tab l’atteint juste après le bouton.

---

## Problème 2 (parcours) — Le résultat de la préinscription n’est ni visible ni annoncé

### Problème identifié

Après « M’inscrire à … », le message de confirmation s’affichait dans un paragraphe placé **tout en bas de la page**, après la section « Une découverte, simplement » :

- une personne voyante qui utilise le zoom ou un petit écran ne voit rien changer près du bouton : elle ne sait pas si l’action a fonctionné et risque de recliquer (chaque clic crée une nouvelle préinscription : n° 2, n° 3…) ;
- le paragraphe n’était pas une région live : un lecteur d’écran **n’annonce rien**, le focus restant sur le bouton. La personne aveugle n’a aucun retour sur le résultat de sa tâche ;
- de plus, le paragraphe n’existait comme message qu’au moment du changement, ce qui ne permettrait pas une annonce fiable même avec un rôle ajouté au dernier moment.

### Reproduction

1. Au clavier, atteindre « M’inscrire à Premiers pas en sérigraphie », appuyer sur Entrée.
2. Rien ne change dans la zone visible ; le message n’apparaît qu’en faisant défiler jusqu’au pied de page.
3. DevTools > Accessibility sur le message : rôle `paragraph`, aucune propriété `live`. Avec un lecteur d’écran, aucune annonce n’est attendue.

### Comportement attendu

Après l’action, la personne doit savoir — sans déplacer son focus ni chercher dans la page — que la préinscription de démonstration est enregistrée et pour quel atelier, et voir ce message près du catalogue.

### Correction à apporter

Créer une région de statut **présente dès le chargement** (`role="status"`, équivalente à `aria-live="polite"`), placée dans la section du catalogue, juste après la recherche et avant les cartes, puis y insérer le message. La région existant avant le changement, son nouveau contenu est annoncé poliment sans voler le focus. Le focus reste sur le bouton (pas de déplacement inutile).

**Réalisé** (`src/App.tsx`, `src/styles.css`) : l’ancien bloc `.registration-result` en bas de page est supprimé ; une `div className="action-result" role="status"` est toujours rendue dans le catalogue et contient le message quand il existe. Cette même région sert à la confirmation du nouveau composant (« Poser une question »), ce qui rend les résultats d’action cohérents dans toute l’application.

**Vérification** : au clavier, après Entrée sur « M’inscrire à … », le message apparaît au-dessus des cartes, dans la zone visible ; le focus reste sur le bouton ; DevTools montre la région `status` (live polite) présente avant le clic et remplie après.

---

## Problème 3 (ciblé) — Le champ de recherche n’a pas d’étiquette

### Problème identifié

Le texte « Rechercher un atelier » était un `<p>` sans lien avec le champ, et l’aide « Saisissez un titre ou une ville » n’était pas reliée non plus. Le champ n’a donc **aucun nom accessible** : un lecteur d’écran annonce seulement « zone de recherche », sans dire quoi saisir ; cliquer sur le texte ne place pas le curseur dans le champ ; une commande vocale (« cliquer sur Rechercher un atelier ») échoue. Par ailleurs, le compteur de résultats (`role="status"`) portait `aria-label="Résultats de recherche"`, qui remplace son contenu dans le nom accessible et peut faire annoncer ce libellé fixe au lieu de « 1 atelier ».

### Reproduction

DevTools > Accessibility sur le champ : nom vide (règle `label` de axe / Lighthouse). Cliquer sur « Rechercher un atelier » : le champ ne reçoit pas le focus. Inspecter le compteur : nom « Résultats de recherche » au lieu du nombre.

### Comportement attendu

Le champ est annoncé « Rechercher un atelier, zone de recherche », suivi de son aide ; le compteur annonce le nombre de résultats après chaque saisie.

### Correction à apporter

**Réalisé** (`src/App.tsx`) : `<label htmlFor="workshop-search">` à la place du `<p>` (style inchangé), `aria-describedby="workshop-search-help"` vers l’aide, suppression du `aria-label` du compteur (son texte visible devient l’information annoncée).
**Vérification** : nom « Rechercher un atelier », description « Saisissez un titre ou une ville. » dans DevTools ; clic sur le libellé = focus dans le champ ; plus de violation axe `label`. Les trois tests de recherche de départ passent toujours.

---

## Problème 4 (ciblé) — Une illustration n’a pas d’attribut alt

### Problème identifié

L’image de l’atelier « Premiers pas en sérigraphie » n’avait **pas d’attribut `alt`**, contrairement aux deux autres (`alt=""`). Faute d’alternative, un lecteur d’écran peut annoncer le nom du fichier (« serigraphie.svg ») ou « image » : bruit sans information, et incohérence entre les cartes.

### Reproduction

Inspecter l’image de la première carte : `<img src="/images/serigraphie.svg">` sans `alt` ; axe/Lighthouse signale `image-alt`.

### Comportement attendu

Les illustrations sont décoratives : le titre, la catégorie, la date et le lieu sont déjà donnés en texte. Elles doivent être ignorées par les technologies d’assistance.

### Correction à apporter

**Réalisé** (`src/components/WorkshopCard.tsx`) : la condition spécifique à la sérigraphie est supprimée, toutes les cartes utilisent `<img src={…} alt="" />`.
**Vérification** : plus de violation `image-alt` ; dans l’arbre d’accessibilité, les trois images sont ignorées (rôle `presentation`).

---

## Problème 5 (ciblé) — Les titres des ateliers ne sont pas des titres

### Problème identifié

Le nom de chaque atelier était un `<p class="workshop-title">`, mis en forme comme un titre mais sans sémantique. La structure de la page saute donc de « Les prochains ateliers » (h2) à « Une découverte, simplement » (h2) : une personne qui navigue par titres (touche H d’un lecteur d’écran, panneau des repères) **ne peut pas passer d’un atelier à l’autre** ni repérer leur nom ; les `article` n’ont pas de nom.

### Reproduction

DevTools > Accessibility (ou extension listant les titres) : liste h1, h2, h2, h3×3 — aucun atelier n’y figure.

### Comportement attendu

Chaque atelier est un titre de niveau 3 sous « Les prochains ateliers », et chaque carte est identifiée par ce titre.

### Correction à apporter

**Réalisé** (`src/components/WorkshopCard.tsx`) : `<h3 className="workshop-title">` (la classe existante conserve exactement l’apparence) et `aria-labelledby` de l’`article` vers ce titre.
**Vérification** : la hiérarchie devient h1 › h2 « Les prochains ateliers » › h3 (×3 ateliers) › h2 « Une découverte… » › h3 (×3) ; chaque article est nommé par son atelier.

---

## Problème 6 (ciblé) — Le focus est invisible sur le bouton d’inscription

### Problème identifié

La feuille de style contenait `.reserve-button:focus-visible{outline:none;box-shadow:none}`, qui annule le contour de focus global **uniquement sur l’action principale**. Une personne qui navigue au clavier ne voit pas qu’elle est sur « M’inscrire à … » et risque de valider une préinscription sans le savoir, ou de se perdre dans la page.

### Reproduction

Au clavier, tabuler jusqu’à « M’inscrire à Premiers pas en sérigraphie » : aucun indicateur n’apparaît, alors que les liens et le champ en ont un. Dans DevTools > Styles, forcer l’état `:focus-visible` : la règle `outline: none` l’emporte.

### Comportement attendu

Le focus est toujours visible, avec le même indicateur que le reste de l’application.

### Correction à apporter

**Réalisé** (`src/styles.css`) : suppression de la règle. Le contour global (3 px `#4338a8`, décalé de 4 px) s’applique ; ce violet mesure 8,86:1 sur le blanc de la carte autour du bouton.
**Vérification** : au clavier, le contour apparaît autour des boutons « M’inscrire à … ».

---

## Composant créé

**Fichiers** : `src/components/QuestionDialog.tsx` (composant), intégration dans `src/App.tsx` via la propriété `extraAction` de `WorkshopCard`.

**Intégration et bon atelier.** Chaque carte (y compris l’atelier complet « Broder un petit paysage ») reçoit un bouton natif « Poser une question sur *titre de l’atelier* ». Le titre fait partie du texte visible, sur le modèle de « M’inscrire à … » : le nom est unique hors contexte et correspond à ce qui est affiché. `aria-haspopup="dialog"` indique qu’une fenêtre va s’ouvrir. L’atelier cliqué est transmis au composant (`RequestDialogProps.workshop`) et à `readRequest(form, "question", workshop.id)` ; la confirmation retrouve l’atelier depuis `values.workshopId`.

**Modale et continuité de la navigation.**
- `<dialog>` natif ouvert avec `showModal()` : le reste de la page devient inerte (ni clic, ni Tab, ni lecture hors de la fenêtre), sans piège de focus fait à la main.
- Nom de la fenêtre : `aria-labelledby` vers le titre h2 « Poser une question sur « Une tasse en céramique » » ; description : `aria-describedby` vers la date, le lieu et la mention « Les trois champs sont obligatoires ».
- À l’ouverture, le focus est placé sur ce titre (`tabIndex={-1}` : ciblable par script, mais pas un arrêt de Tab), pour que la personne entende d’abord de quel atelier il s’agit, puis Tab parcourt les contrôles dans l’ordre visuel.
- Fermeture par « Annuler », par la croix (bouton nommé « Fermer », symbole × masqué) ou par Échap (événement natif `cancel`). Aucune de ces voies n’appelle `onSubmit` : aucune demande n’est transmise.
- À toute fermeture (annulation ou envoi), le focus revient au bouton « Poser une question sur … » qui a ouvert la fenêtre. Ce retour est fait dans un effet, après le retrait de la fenêtre, car tant qu’elle est modale le reste de la page est inerte et ne peut pas recevoir le focus.

**Formulaire et reprise après erreur.**
- Chaque contrôle a un `label` visible relié par `htmlFor`, avec « (obligatoire) » dans le libellé ; `required` exprime la contrainte, et `noValidate` laisse notre code présenter des messages compréhensibles (comme en séance 3).
- Le sujet est un **`<select>` natif** (`name="choice"`), avec une première option vide « Sélectionnez un sujet » sélectionnée par défaut : aucun sujet n’est présélectionné, et le contrôle reste utilisable au clavier avec le comportement natif (flèches, lettres, Alt+↓).
- L’adresse est un `input type="email"` avec `autoComplete="email"` et une aide « Format attendu : nom@exemple.fr » reliée par `aria-describedby` ; la question est un `textarea`. Le validateur fourni refuse un message vide ou constitué d’espaces et une adresse vide ou mal formée.
- En cas d’erreur : chaque champ fautif reçoit `aria-invalid="true"`, une bordure renforcée (`.invalid`) et un message proche, relié par `aria-describedby` (le message ne repose donc pas que sur la couleur) ; un **résumé des erreurs** apparaît en haut du formulaire, avec un titre qui en donne le nombre et un lien par erreur (« Adresse électronique : Saisissez une adresse… ») qui donne le focus au champ concerné. Le focus est déplacé sur ce résumé à chaque envoi refusé, pour que la personne sache immédiatement pourquoi rien ne s’est passé.
- Les champs ne sont pas contrôlés ni réinitialisés : le sujet et la question déjà saisis sont **conservés** ; seul le champ à corriger doit être modifié.

**Confirmation et cohérence.** Après un envoi valide, la fenêtre se ferme, le focus revient au déclencheur et la région `role="status"` du catalogue (créée pour le problème 2) annonce : « Votre question sur « Le matériel à apporter » a été transmise à l’organisateur de l’atelier « Une tasse en céramique ». Envoi simulé, aucune donnée n’est transmise. » Le message cite l’atelier et le libellé du sujet, jamais l’adresse électronique. Les libellés « Envoyer la question » / « Annuler » décrivent précisément les actions, et une mention rappelle que l’envoi est simulé.

**Manipulations de vérification** (navigateur Chromium, clavier uniquement, état lu avec `document.activeElement` et l’onglet Accessibility) :
1. Tab jusqu’à « Poser une question sur Une tasse en céramique », Entrée : la fenêtre s’ouvre en modal (`:modal`), le focus est sur son titre.
2. Échap : la fenêtre se ferme, aucune confirmation n’apparaît, le focus est revenu sur le bouton.
3. Entrée pour rouvrir, Tab (croix) puis Tab (select), flèche bas ×2 : « Le matériel à apporter » ; Tab Tab, saisie de la question ; Tab, Entrée sur « Envoyer la question » sans adresse.
4. La fenêtre reste ouverte, le focus est sur le résumé « Une erreur empêche l’envoi de votre question » ; le sujet vaut `materiel`, la question est conservée, le champ adresse a `aria-invalid="true"`, aucune confirmation.
5. Tab sur le lien du résumé, Entrée : le focus est dans le champ adresse, décrit par l’aide et l’erreur ; saisie d’une adresse fictive, Entrée.
6. La fenêtre disparaît, le focus revient au bouton déclencheur, la région de statut affiche l’atelier et le sujet attendus.
7. Le bouton est aussi présent et fonctionnel sur l’atelier complet « Broder un petit paysage ».

Limite : aucun lecteur d’écran n’a été utilisé ; la restitution vocale des annonces (région de statut, résumé d’erreurs) reste à confirmer, par exemple avec NVDA + Firefox ou Chrome.

## Mini-test

- **Fichier** : `src/__tests__/Composant.test.tsx`.
- **Résultat** : `npm test -- --run` → 2 fichiers, 4 tests réussis (3 tests de démarrage + le mini-test). `npm run build` réussit.
- **Ce que le test vérifie**, depuis `render(<App />)` et `userEvent`, en ne trouvant les éléments que par leurs rôles et noms accessibles (ce qui vérifie aussi que les libellés sont bien reliés) :
  1. ouverture via le bouton « Poser une question sur Une tasse en céramique » et présence d’un `dialog` nommé avec cet atelier ;
  2. choix de « Le matériel à apporter » dans le `combobox` « Sujet de la question » (`selectOptions`) et saisie de la question ;
  3. envoi sans adresse : `aria-invalid="true"` et message d’erreur dans la description accessible du champ adresse, titre du résumé des erreurs présent, modale toujours ouverte, sujet (`materiel`) et question conservés, aucune confirmation ;
  4. après saisie d’une adresse fictive valide et nouvel envoi : modale retirée, confirmation contenant « Une tasse en céramique » et « Le matériel à apporter » mais pas l’adresse, focus revenu sur le bouton déclencheur.
- Le test DOM tourne sous jsdom (avec l’adaptation de `showModal` fournie dans `src/test-setup.ts`) : il ne prouve ni l’inertie réelle de la page, ni la restitution vocale.
