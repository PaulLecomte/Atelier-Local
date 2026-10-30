# Repères techniques

Vous pouvez réutiliser et adapter les supports des séances précédentes. Les solutions d’accessibilité et leur justification font partie de votre travail.

## Fichiers du projet

- `src/App.tsx` : liste, recherche, préinscription et intégration du composant.
- `src/components/WorkshopCard.tsx` : carte d’un atelier ; propriété facultative `extraAction` pour votre bouton.
- `src/workshops.ts` : données des ateliers à conserver.
- `src/requests.ts` : types, options et validateur de la question.
- `src/styles.css` : styles existants et styles disponibles pour le formulaire.
- `src/test-setup.ts` : configuration des tests et adaptations du dialogue sous jsdom.

## Contrat du validateur

`readRequest(form, "question", workshopId)` lit les contrôles nommés `choice`, `contact` et `message`. Il retourne un objet `values` et un objet `errors`, dont les clés correspondent aux champs concernés. Le validateur ne gère ni l’affichage ni les interactions du composant.

## Tester depuis l’application

Comme en séance 3, utilisez `render(<App />)` puis les actions de `userEvent`. Le test demandé porte sur le parcours dans l’application et sa confirmation.

`user.selectOptions(select, valeur)` simule le choix d’une option native. `toHaveValue` permet de vérifier la valeur sélectionnée.

Si vous utilisez les boutons radio autorisés, donnez à leurs contrôles le même nom `choice` et les valeurs fournies dans `requestOptions.question`. Le validateur peut ainsi lire le sujet sélectionné avec le même contrat.

## Documentation

- Select HTML : <https://developer.mozilla.org/fr/docs/Web/HTML/Reference/Elements/select>
- Select dans React : <https://react.dev/reference/react-dom/components/select>
- Testing Library, selectOptions : <https://testing-library.com/docs/user-event/utility/#selectoptions-deselectoptions>
- Lighthouse : <https://developer.chrome.com/docs/devtools/lighthouse>

Les tests DOM ne remplacent pas les essais dans un navigateur. Si vous utilisez un lecteur d’écran, indiquez vos observations réelles.
