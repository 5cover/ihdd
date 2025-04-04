# I Hate Data Dictionaries

> *They are redundant. Just look at the damn UML diagram.*  
> — a developer, moments before building a UML-powered data dictionary tool

---

## 🤔 What is this?

**I Hate Data Dictionaries (IHDD)** is a lovingly bitter tool for generating data dictionaries from UML-style schema definitions — but also:

- ✅ Validates a custom JSON schema format
- ✅ Generates styled Excel files with metadata, constraints, and cross-links
- ✅ Builds a static documentation site (with PHP 😬)
- ✅ Hosts a live survey dashboard using GitHub Actions, Bash, and Git as a database

Yes. It does all of that.

---

## 🧩 Project Structure

Here's a quick tour of the codebase:

```text
.
├── src/                 # Source code (TS, PHP, SCSS, Bash)
│   ├── ts/              # Core TypeScript logic (schema parsing, Excel generation)
│   ├── php/             # PHP-based static site generator
│   ├── bash/            # Git archaeology scripts for timestamping survey data
│   └── scss/            # Stylesheets (compiled to docs/css)
├── docs/                # Output site (GitHub Pages target, built via ./build)
│   ├── index.html       # Data dictionary generator UI
│   ├── evento-view.html # Survey dashboard
│   └── data/            # JSON survey data, updated via GitHub Actions
├── ihdd -> docs/        # Symlink to serve site locally via `php -S`
├── build*               # Bash script to compile site (PHP first, then Webpack)
├── localhost*           # Starts a local dev server via `php -S`
├── package.json         # TS + Webpack build config
├── .github/workflows/   # GitHub Actions: polling RENATER for survey data
```

---

## 📦 How it works

### 1. Data Dictionary Generator (`index.html`)

- Upload or paste a schema (see [`data/413.json`](data/413.json) for format)
- Click **Generate**
- A beautiful, navigable Excel file is produced via `xlsx-js-style`
- Features:
  - UML class / association support
  - Inheritance, constraints, traits (`default`, `computed`, etc.)
  - Reverse navigation links
  - Domain constraints (`[0;10]`, etc.)
- Optional: PascalCase converter for your naming misery

### 2. Survey Dashboard (`evento-view.html`)

- Displays data from a RENATER Evento survey (BUT3 parcours votes)
- Renders:
  - Pie chart (Chart.js)
  - Stat widgets: comment rate, vote count, average thought size
  - Most recent responses
  - Student “thoughts” (freeform comments)
- Updated **every 5 minutes** via GitHub Actions:
  - Downloads latest results
  - Uses Git commit history to timestamp first appearances of each response
  - Commits & force-pushes data back into the repo

### 3. Site Build

```bash
./build         # Compiles PHP to HTML, then runs Webpack
./localhost     # Starts a local dev server at http://localhost:5555
```

- PHP static site generator reads from `src/php/site/`
- Webpack compiles TS into `docs/js/`
- SCSS compiles into `docs/css/` (tooling not included, but assumed)

---

## 📁 Schema Format

See `data/413.json` for a real example.

- Schemas → Relations (tables / classes)
- Each relation has:
  - `attrs`: attributes with types, constraints, and traits
  - `kind`: class or association
  - `references`: links to other relations
- Supports UML concepts like:
  - Abstract classes
  - Inheritance
  - Associations with roles

---

## 🧠 Git-powered Timestamping (Yes, Really)

To determine when each survey vote was cast, IHDD:

- Tracks `survey_*.json` file history via Git
- Parses each historical version
- Detects when each key (participant) first appeared
- Outputs a mapping of participant → first-seen timestamp

All done with `bash` and `jq`. See [`src/bash/vote_timestamps_from_history.bash`](src/bash/vote_timestamps_from_history.bash).

---

## 🖼 Styling & UX

- Fully custom layout using **vanilla CSS + SCSS**
- Grid-based dashboard
- Minimal JS, no frameworks
- Existential developer commentary throughout:
  - `"In the end, nothing really matters."` (footer)
  - `"BUT Informatique"` (header)
  - `// Styling the pie chart with a nod to life's circular absurdity`

---

## 🛠 Toolchain

| Part | Tech |
|------|------|
| Excel export | TypeScript + `xlsx-js-style` |
| Schema model | Custom JSON DSL |
| Docs UI | PHP templates + Webpack |
| Dashboard | Chart.js, vanilla DOM |
| Styling | SCSS, hand-written |
| Automation | Bash + GitHub Actions |
| Hosting | GitHub Pages |
| Timestamps | Git log as time-series DB |

---

## 🪦 Philosophy

This project is:

> 🤬 "I hate data dictionaries"  
> 😐 "But people keep asking for them"  
> 🧠 "So I built something that generates them from actual data models"  
> 🙃 "Also it has a live dashboard and Git archaeology scripts"  
> 🪄 "Oh and it uses PHP. Deal with it."

---

## 🧪 Getting Started (Locally)

```bash
npm install
./build        # Compiles the site
./localhost    # Runs it at http://localhost:5555
```

---

## ❤️ Contributing

You probably shouldn’t. But if you must, open an issue.

---

## 📜 License

[The Unlicense](LICENSE) — because even the author didn't want to own this.

---

## 🙏 Acknowledgements

- Made under duress, for stakeholders who don’t read UML
- Fueled by irony, caffeine, and chart.js
- Maintained only because it works

---

**Bonne chance.**
