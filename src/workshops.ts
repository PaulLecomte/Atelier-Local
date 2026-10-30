export type Workshop = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  duration: string;
  price: string;
  image: string;
  available: boolean;
  description: string;
};

export const workshops: Workshop[] = [
  {
    id: "serigraphie", title: "Premiers pas en sérigraphie", category: "Impression",
    date: "21 novembre 2026 · 10 h", location: "La Fabrique · Lille", duration: "2 h", price: "28 €",
    image: "/images/serigraphie.svg", available: true,
    description: "Composez un motif et découvrez l’impression à travers un écran. Repartez avec votre affiche. Le matériel est fourni ; prévoyez une tenue qui ne craint pas les taches.",
  },
  {
    id: "ceramique", title: "Une tasse en céramique", category: "Modelage",
    date: "22 novembre 2026 · 14 h 30", location: "L’Atelier des Rives · Roubaix", duration: "2 h 30", price: "35 €",
    image: "/images/ceramique.svg", available: true,
    description: "Modelez une tasse à la main et choisissez sa finition. Aucune expérience n’est nécessaire. La cuisson est incluse ; la pièce sera à récupérer plus tard à l’atelier.",
  },
  {
    id: "broderie", title: "Broder un petit paysage", category: "Textile",
    date: "28 novembre 2026 · 10 h", location: "Le Fil Commun · Lille", duration: "2 h", price: "24 €",
    image: "/images/broderie.svg", available: false,
    description: "Apprenez trois points de broderie et composez un paysage sur un petit tambour. Fils et tissus sont fournis. L’atelier accueille les personnes débutantes.",
  },
];
