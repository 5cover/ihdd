<?php
require_once 'Page.php';
require_once 'const.php';

$page = new Page('Home', scripts: ["index.js"]);
$page->put(function() {
?>
<h1><?= h14s(SITE_NAME) ?>!</h1>
<p><em lang="fr">Je déteste les dictionnaires des données&nbsp;!</em></p>
<p><label>JSON dictionary: <input type="file" id="input-file" accept=".json,application/json"></label></p>
<p id="p-input-error" class="error"></p>
<button id="button-generate" disabled>Générer le dictionnaire des données</button>
<p><em><small>All processing is done locally.</small></em></p>
<p><small>SheetJS version: <span id="span-sheet-js-version"></span></small></p>
<p><input type="text" id="input-text-to-pascalize"> <button id="button-pascalize">Pascalize</button> <input type="text" id="input-pascalized-text" readonly></p>
<?php
});