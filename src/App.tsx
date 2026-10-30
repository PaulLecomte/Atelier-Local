import { useState } from "react";
import WorkshopCard from "./components/WorkshopCard";
import { workshops, type Workshop } from "./workshops";

export default function App() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [bookingCount, setBookingCount] = useState(0);
  const normalized = query.trim().toLocaleLowerCase("fr");
  const visible = workshops.filter(workshop =>
    `${workshop.title} ${workshop.location}`.toLocaleLowerCase("fr").includes(normalized),
  );

  const reserve = (workshop: Workshop) => {
    if (!workshop.available) return;
    const next = bookingCount + 1;
    setBookingCount(next);
    setNotice(`Préinscription de démonstration n° ${next} enregistrée pour ${workshop.title}. Aucun paiement ni réservation réelle.`);
  };

  return (
    <>
      <a className="skip-link" href="#catalogue">Aller aux ateliers</a>
      <header className="site-header">
        <a className="brand" href="#accueil">Atelier<span>Local</span><span className="brand-dot" aria-hidden="true">●</span></a>
        <nav aria-label="Navigation principale"><a href="#catalogue">Les ateliers</a><a href="#infos-pratiques">Comment ça marche ?</a></nav>
      </header>
      <main id="accueil">
        <section className="hero" aria-labelledby="page-title">
          <div className="eyebrow">Des savoir-faire à partager</div>
          <h1 id="page-title">Un atelier.<br /><em>De nouvelles idées.</em></h1>
          <p>Créer de ses mains, découvrir un lieu et prendre le temps d’apprendre ensemble.</p>
          <a className="hero-link" href="#catalogue">Trouver mon prochain atelier <span aria-hidden="true">↗</span></a>
          <div className="hero-note">Lille & Roubaix · Petits groupes · Tous niveaux</div>
        </section>
        <section className="catalogue" id="catalogue" aria-labelledby="catalogue-title">
          <div className="section-heading"><div><p className="eyebrow">Le programme</p><h2 id="catalogue-title">Les prochains ateliers</h2></div><span className="count" role="status" aria-label="Résultats de recherche" aria-atomic="true">{visible.length} atelier{visible.length > 1 ? "s" : ""}</span></div>
          <div className="search-area">
            <p className="search-label">Rechercher un atelier</p>
            <input type="search" id="workshop-search" value={query} onChange={event => setQuery(event.target.value)} />
            <p className="search-help">Saisissez un titre ou une ville.</p>
          </div>
          {visible.length > 0 ? (
            <div className="workshop-grid">
              {visible.map(workshop => <WorkshopCard key={workshop.id} workshop={workshop} onReserve={reserve} />)}
            </div>
          ) : <p className="empty-state">Aucun atelier ne correspond. Essayez un autre titre ou une autre ville.</p>}
        </section>
        <section className="how-it-works" id="infos-pratiques" aria-labelledby="how-title">
          <p className="eyebrow">À votre rythme</p><h2 id="how-title">Une découverte, simplement.</h2>
          <div className="how-grid"><div><span>01</span><h3>Choisissez votre atelier</h3><p>Retrouvez le lieu, la durée et le tarif dans le programme.</p></div><div><span>02</span><h3>Préparez votre venue</h3><p>Consultez les détails pour savoir ce qui est fourni et ce qu’il faut apporter.</p></div><div><span>03</span><h3>Prenez le temps de créer</h3><p>Les ateliers présentés ici sont fictifs. Toutes les actions sont des démonstrations locales.</p></div></div>
        </section>
        <div className="registration-result">
          <p className={notice ? "notice" : "notice-empty"}>{notice}</p>
        </div>
      </main>
      <footer><a className="brand" href="#accueil">Atelier<span>Local</span></a><p>Application pédagogique · Aucun envoi ni paiement réel.</p></footer>
    </>
  );
}
