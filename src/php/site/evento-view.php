<?php

require_once 'Page.php';
require_once 'const.php';

$page = new Page('Parcours BUT3', ['evento-view.css'], ['evento-view.js']);

$page->put(<<<HTML
<h1>Sondage choix de parcours BUT3</h1>
<div class="top-left">
    <h2>Choix de parcours</h2>
    <canvas id="canvas-pie"></canvas>
</div>
<section class="top-right">
    <h2>Statistiques</h2>
        <div id="stats">
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
            <article class="stat-widget" id="sw-n-votes-today">
                <h3 class="title">Nombres de votes aujourd'hui</h3>
                <div class="summary"></div>
                <div class="details"></div>
            </article>
        </div>
</section>
<section class="bottom-right">
    <h2>Pensées des Étudiants</h2>
    <ul id="list-special-mentions"></ul>
</section>
<section class="bottom-left">
    <h2>Votes Récents</h2>
    <ul id="list-recent-votes"></ul>
</section>

<template id="template-special-mention">
    <li>
        <blockquote>
            <p class="comment"></p>
            <p>—<span class="name"></span>, <span class="cursus"></span></p>
        </blockquote>
    </li>
</template>
<template id="template-recent-vote">
    <li>
        <p><em class="date"></em></p>
        <p><span class="name"></span> a voté pour <span class="cursus"></span></p>
        <blockquote class="comment"></blockquote>
    </li>
</template>
HTML, put_footer: 'v1.1');
