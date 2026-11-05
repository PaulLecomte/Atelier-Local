import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import QuestionDialog from "./components/QuestionDialog";
import WorkshopCard from "./components/WorkshopCard";
import { requestOptions, type RequestValues } from "./requests";
import { workshops, type Workshop } from "./workshops";

export default function App() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [bookingCount, setBookingCount] = useState(0);
  const [questionFor, setQuestionFor] = useState<Workshop | null>(null);
  const questionTrigger = useRef<HTMLButtonElement | null>(null);
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

  const openQuestion = (workshop: Workshop, event: MouseEvent<HTMLButtonElement>) => {
    questionTrigger.current = event.currentTarget;
    setQuestionFor(workshop);
  };

  // Fermeture, annulation ou envoi : le focus revient au bouton qui a ouvert la fenêtre.
  // L'effet attend que la fenêtre soit retirée : tant qu'elle est modale, le reste de la page est inerte.
  const closeQuestion = useCallback(() => setQuestionFor(null), []);
  useEffect(() => {
    if (!questionFor && questionTrigger.current) {
      questionTrigger.current.focus();
      questionTrigger.current = null;
    }
  }, [questionFor]);

  const sendQuestion = (values: RequestValues) => {
    const workshop = workshops.find(item => item.id === values.workshopId);
    const subject = requestOptions.question.find(option => option.value === values.choice)?.label;
    setNotice(`Votre question sur « ${subject} » a été transmise à l’organisateur de l’atelier « ${workshop?.title} ». Envoi simulé, aucune donnée n’est transmise.`);
    closeQuestion();
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
          <div className="section-heading"><div><p className="eyebrow">Le programme</p><h2 id="catalogue-title">Les prochains ateliers</h2></div><span className="count" role="status" aria-atomic="true">{visible.length} atelier{visible.length > 1 ? "s" : ""}</span></div>
          <div className="search-area">
            <label className="search-label" htmlFor="workshop-search">Rechercher un atelier</label>
            <input type="search" id="workshop-search" aria-describedby="workshop-search-help" value={query} onChange={event => setQuery(event.target.value)} />
            <p className="search-help" id="workshop-search-help">Saisissez un titre ou une ville.</p>
          </div>
          <div className="registration-result" role="status">
            <p className={notice ? "notice" : "notice-empty"}>{notice}</p>
          </div>
          {visible.length > 0 ? (
            <div className="workshop-grid">
              {visible.map(workshop => (
                <WorkshopCard key={workshop.id} workshop={workshop} onReserve={reserve} extraAction={
                  <button type="button" className="contact-button" onClick={event => openQuestion(workshop, event)}>
                    Poser une question sur {workshop.title}
                  </button>
                } />
              ))}
            </div>
          ) : <p className="empty-state">Aucun atelier ne correspond. Essayez un autre titre ou une autre ville.</p>}
        </section>
        <section className="how-it-works" id="infos-pratiques" aria-labelledby="how-title">
          <p className="eyebrow">À votre rythme</p><h2 id="how-title">Une découverte, simplement.</h2>
          <div className="how-grid"><div><span>01</span><h3>Choisissez votre atelier</h3><p>Retrouvez le lieu, la durée et le tarif dans le programme.</p></div><div><span>02</span><h3>Préparez votre venue</h3><p>Consultez les détails pour savoir ce qui est fourni et ce qu’il faut apporter.</p></div><div><span>03</span><h3>Prenez le temps de créer</h3><p>Les ateliers présentés ici sont fictifs. Toutes les actions sont des démonstrations locales.</p></div></div>
        </section>
      </main>
      {questionFor && <QuestionDialog workshop={questionFor} onClose={closeQuestion} onSubmit={sendQuestion} />}
      <footer><a className="brand" href="#accueil">Atelier<span>Local</span></a><p>Application pédagogique · Aucun envoi ni paiement réel.</p></footer>
    </>
  );
}
