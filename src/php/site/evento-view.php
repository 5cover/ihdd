<?php

require_once 'Page.php';
require_once 'const.php';

$page = new Page('Parcours BUT3', ['evento-view.css'], ['evento-view.js']);

$page->put(<<<HTML
<h1>Sondage choix de parcours BUT3</h1>
<h2>Statistiques</h2>
<section class="section-col">
    <canvas id="canvas-pie"></canvas>
    <div class="section-row">
        <article class="stat-widget" id="sw-comments-by-participants">
            <h3 class="title">Étudiants ayant pensé</h3>
            <div class="summary"></div>
            <div class="details"></div>
        </article>
        <article class="stat-widget" id="sw-avg-comment-length">
            <h3 class="title">Taille de pensée moyenne</h3>
            <div class="summary"></div>
            <div class="details"></div>
        </article>
        <article class="stat-widget" id="sw-mode-comment-letters">
            <h3 class="title">Lettre la plus pensée</h3>
            <div class="summary"></div>
            <div class="details"></div>
        </article>
    </div>
</section>
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
HTML);
