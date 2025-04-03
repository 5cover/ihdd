import StatWidget from "./StatWidget";
import { fetch_json, get_class as get_by_class, requireElementById, time_ago } from "./util";
import Chart from 'chart.js/auto';

const FETCH_EVERY_MS = 300_000;
const THE_YES = "Les \"Oui\"";

const canvas_pie = requireElementById('canvas-pie') as HTMLCanvasElement;
let chart_pie: Chart | null = null;

const list_special_mentions = requireElementById('list-special-mentions') as HTMLUListElement;
const template_special_mention = requireElementById("template-special-mention") as HTMLTemplateElement;
const template_recent_vote = requireElementById('template-recent-vote') as HTMLTemplateElement;
const list_recent_votes = requireElementById('list-recent-votes') as HTMLUListElement;

await render();

setInterval(() => void (render()), FETCH_EVERY_MS);

async function render() {
    const but3 = await fetch_json('/ihdd/data/survey_65x4qkp9_results.json') as Record<string, Answer>;
    render_pie_and_special_mentions(but3);
    const timestamps = await fetch_json('/ihdd/data/survey_65x4qkp9_timestamps.json') as Record<string, number>;
    render_recent_votes(but3, timestamps, 100);
}

function render_pie_and_special_mentions(but3: Record<string, Answer>) {
    list_special_mentions.replaceChildren();

    let n_participants = 0;
    const comments = [];

    for (const answer of Object.values(but3)) {
        if (answer["Nom du participant"] === THE_YES) {
            if (chart_pie !== null) chart_pie.destroy();
            chart_pie = make_pie(answer);
            continue;
        }
        ++n_participants;
        const choice = answer["Veuillez valider votre parcours:"];
        const cursus = get_cursus(choice);
        const comment = choice.Commentaire;
        if (comment) {
            comments.push(comment);
            const item = (template_special_mention.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLLIElement;
            get_by_class(item, 'name').textContent = answer["Nom du participant"];
            get_by_class(item, 'comment').textContent = comment;
            get_by_class(item, 'cursus').textContent = cursus;
            list_special_mentions.appendChild(item);
        }
    }

    new StatWidget(requireElementById('sw-comments-by-participants')).setPercentage(comments.length, n_participants);
    new StatWidget(requireElementById('sw-avg-comment-length')).setMinMaxAvg(comments.map(c => c.length));
    new StatWidget(requireElementById('sw-mode-comment-letters')).setModeByChar(comments);

}


interface Answer {
    "Nom du participant": string,
    "Veuillez valider votre parcours:": Choice,

}

interface Choice {
    "PARCOURS A": number,
    "PARCOURS C": number,
    "Commentaire"?: string | null;
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
                    position: 'bottom',
                    labels: {
                        // This more specific font property overrides the global property
                        font: {
                            size: 16
                        }
                    },
                }
            }
        }
    });
}


function render_recent_votes(but3: Record<string, Answer>, timestamps: Record<string, number>, n: number) {
    list_recent_votes.replaceChildren();

    const recent = Object.entries(timestamps).sort((a, b) => b[1] - a[1]).slice(0, n); // last n votes

    for (const [id, timestamp] of recent) {
        const answer = but3[id];
        if (answer === undefined) {
            console.error(`answer ${id} not found`);
            continue;
        }
        if (answer["Nom du participant"] === THE_YES) continue;

        const item = (template_recent_vote.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLLIElement;

        const vote_date = new Date(timestamp * 1000);
        const time = get_by_class(item, 'date').appendChild(document.createElement('time'));
        time.dateTime = vote_date.toISOString();
        time.textContent = time_ago(timestamp);
        time.title = vote_date.toLocaleString();

        get_by_class(item, 'name').textContent = answer["Nom du participant"];

        const choice = answer["Veuillez valider votre parcours:"];

        get_by_class(item, 'cursus').textContent = get_cursus(choice);


        const comment = get_by_class(item, 'comment');
        if (choice.Commentaire) {
            comment.textContent = choice.Commentaire;
            item.classList.add('tall');
        } else {
            comment.remove();
        }

        list_recent_votes.appendChild(item);
    }
}

function get_cursus(c: Choice) {
    return c["PARCOURS A"] === 1 ? "Parcours\u00A0A" : c["PARCOURS C"] === 1 ? "Parcours\u00A0C" : "inconnu";
}