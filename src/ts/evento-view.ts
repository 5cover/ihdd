import { get_class, requireElementById } from "./util";
import Chart from 'chart.js/auto';

const canvas_pie = requireElementById('canvas-pie') as HTMLCanvasElement;
const list_special_mentions = requireElementById('list-special-mentions') as HTMLUListElement;
const template = requireElementById("template-special-mention") as HTMLTemplateElement;

const but3 = await fetch_poll_results();

for (const answer of Object.values(but3)) {
    if (answer["Nom du participant"] === "Les \"Oui\"") {
        make_pie(answer);
        continue;
    }
    const response = answer["Veuillez valider votre parcours:"];
    const choice = response["PARCOURS A"] === 1 ? "Parcours A" : response["PARCOURS C"] === 1 ? "Parcours C" : "inconnu";
    const comment = response.Commentaire;
    if (comment) {
        const item = (template.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLLIElement;
        get_class(item, 'name').textContent = answer["Nom du participant"];
        get_class(item, 'comment').textContent = comment;
        get_class(item, 'choice').textContent = choice;
        list_special_mentions.appendChild(item);
    }
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
    new Chart(canvas_pie, {
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