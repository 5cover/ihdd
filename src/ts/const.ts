
export const EXAMPLE_FILE_URL = 'https://raw.githubusercontent.com/5cover/ihdd/refs/heads/main/data/413.json';

interface Column {
    name: string,
    desc?: string,
};

export const attributeTableColumns: Column[] = [
    { name: 'Nom' },
    { name: 'Description' },
    { name: 'Type' },
    { name: 'Nature', desc: 'Élémentaire ou déduite/calculée' },
    { name: 'Domaine' },
    { name: 'Valeur défaut', desc: 'Liste des valeurs ou intervalle' },
    { name: 'Obligatoire' },
    { name: 'Contraintes/règles de calcul', desc: 'Exemples : {dateExp > dateCom}/prixTTC = prixHT * TVA' },
    { name: 'Remarques' },
];

export const referencesTableColumns: Column[] = [
    { name: 'Vers', desc: 'Relation référencée' },
    { name: 'Description' },
    { name: 'Nom', desc: "Nom de l'assocation" },
    { name: 'Qualificateur', desc: "Qualificateur de ce côté de l'association" },
];