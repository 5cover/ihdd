<?php

require_once 'Page.php';
require_once 'const.php';

$page = new Page('Parcours BUT3', ['evento-view.css'], ['evento-view.js']);

$page->put(function() {
?>
<h1>Sondage choix de parcours BUT3</h1>
<h2>Camembert</h2>
<canvas id="canvas-pie"></canvas>
<h2>Pensées des Étudiants</h2>
<ul id="list-special-mentions"></ul>
<template id="template-special-mention">
    <li>
        <blockquote>
            <p class="comment"></p>
            <p>—<span class="name"></span>, <span class="choice"></span></p>
        </blockquote>
    </li>
</template>
<?php
});