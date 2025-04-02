<?php
require_once 'Page.php';
require_once 'const.php';

$page = new Page(SITE_NAME . ' - Home', scripts: ['ihdd.js']);
$page->put(function () {
?>
<h1><?= h14s(SITE_NAME) ?></h1>
<p><em lang="fr">Je déteste les dictionnaires des données&nbsp;!</em></p>

<h2>Generate a data dictionary</h2>
<p><label>JSON dictionary: <input type="file" id="input-file" accept=".json,application/json"></label> <button type="button" id="button-clear-file" disabled>Clear</button></p>
<p><label><input type="checkbox" disabled> Sort schemas alphabetically</label></p>
<p><label><input type="checkbox" disabled checked> Sort relations alphabetically</label></p>
<p><label><input type="checkbox" disabled checked> Sort attributes by required first</label></p>
<button type="button" id="button-generate" disabled>Generate data dictionary</button>
<p id="p-error" class="error"></p>
<details>
    <summary>Text input</summary>
    <p><button type="button" id="button-load-example">Load example file</button></p>
    <textarea id="textarea-input" cols="120" rows="30"></textarea>
</details>

<h2>JSON schema</h2>
<p>JSON schema URL: <code><?= h14s(JSON_SCHEMA_URL) ?></code></p>
<h3>Using JSON schemas in VSCode</h3>
<p>To use JSON schemas in VScode, there are two solutions:</p>
<ol>
    <li>
        <p>Using a <code>$schema</code> directive in the file</p>
        <p>The <code>$schema</code> directive defines the schema to match the current file against.</p>
        <pre><code>{
    "$schema": "<?= h14s(JSON_SCHEMA_URL) ?>"
    // rest of your JSON...
}</code></pre>
    </li>
    <li>
        <p><code>json.schemas</code> key in <code>settings.json</code></p>
        <p>The <code>json.schema</code> setting can define schemas for a variety of files using wildcards.</p>
        <pre><code>"json.schemas": [
    {
        "url": "<?= h14s(JSON_SCHEMA_URL) ?>",
        "fileMatch": [
            "data/data-dictionary*.json"
        ]
    }
]</code></pre>
    </li>
</ol>

<h2>snake_case to PascalCase</h2>
<p><input type="text" id="input-text-to-pascalize"> <button type="button" id="button-pascalize">Pascalize</button> <input type="text" id="input-pascalized-text" readonly></p>
<p><em><small>All processing is done locally.</small></em></p>
<?php
});
