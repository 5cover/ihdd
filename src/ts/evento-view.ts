import StatWidget from "./StatWidget";
import { get_class, requireElementById } from "./util";
import Chart from 'chart.js/auto';

const FETCH_EVERY_MS = 300_000;

const canvas_pie = requireElementById('canvas-pie') as HTMLCanvasElement;
let chart_pie: Chart|null = null;

const list_special_mentions = requireElementById('list-special-mentions') as HTMLUListElement;
const template = requireElementById("template-special-mention") as HTMLTemplateElement;

render(await fetch_poll_results());

setInterval(() => void (async () => render(await fetch_poll_results()))(), FETCH_EVERY_MS);

function render(but3: Record<string, Answer>) {
    let n_participants = 0;
    const comments = [];
    list_special_mentions.replaceChildren();
    for (const answer of Object.values(but3)) {
        ++n_participants;
        if (answer["Nom du participant"] === "Les \"Oui\"") {
            if (chart_pie !== null) chart_pie.destroy();
            chart_pie = make_pie(answer);
            continue;
        }
        const response = answer["Veuillez valider votre parcours:"];
        const choice = response["PARCOURS A"] === 1 ? "Parcours A" : response["PARCOURS C"] === 1 ? "Parcours C" : "inconnu";
        const comment = response.Commentaire;
        if (comment) {
            comments.push(comment);
            const item = (template.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLLIElement;
            get_class(item, 'name').textContent = answer["Nom du participant"];
            get_class(item, 'comment').textContent = comment;
            get_class(item, 'choice').textContent = choice;
            list_special_mentions.appendChild(item);
        }
    }

    new StatWidget(requireElementById('sw-comments-by-participants')).setPercentage(comments.length, n_participants);
    new StatWidget(requireElementById('sw-avg-comment-length')).setMinMaxAvg(comments.map(c => c.length));
    new StatWidget(requireElementById('sw-mode-comment-letters')).setModeByChar(comments);

}


interface Answer {
    "Nom du participant": string,
    "Veuillez valider votre parcours:": {
        "PARCOURS A": number,
        "PARCOURS C": number,
        "Commentaire"?: string | null;
    },

}

function make_pie(total: Answer) {

    const counts = total["Veuillez valider votre parcours:"];
    return new Chart(canvas_pie, {
        type: 'pie',
        data: {
            labels: ['Parcours A', 'Parcours C'],
            datasets: [{
                data: [counts["PARCOURS A"], counts["PARCOURS C"]],
                backgroundColor: ['#36A2EB', '#FF6384'], // You can add more colors if needed
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

async function fetch_poll_results() {
    const url = '/ihdd/data/survey_65x4qkp9_results.json';
    return await (await fetch(url)).json() as Record<string, Answer>;
}