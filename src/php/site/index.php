<?php
require_once 'Page.php';
require_once 'const.php';

$page = new Page('Home', scripts: ["index.js"]);
$page->put(function() {
?>
<h1><?= h14s(SITE_NAME) ?>!</h1>
<em lang="fr">Je déteste les dictionnaires de données&nbsp;!</em>
<button id="button-magic">Magic</button>
<?php
});