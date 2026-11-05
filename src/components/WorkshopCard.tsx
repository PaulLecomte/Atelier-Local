import { useId, useState, type ReactNode } from "react";
import type { Workshop } from "../workshops";

type Props = {
  workshop: Workshop;
  onReserve: (workshop: Workshop) => void;
  extraAction?: ReactNode;
};

export default function WorkshopCard({ workshop, onReserve, extraAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const panelId = useId();
  return (
    <article className="workshop-card" aria-labelledby={titleId}>
      <div className="card-art">
        <img src={workshop.image} alt="" />
        <span className="category">{workshop.category}</span>
      </div>
      <div className="card-body">
        <p className="workshop-date">{workshop.date}</p>
        <h3 className="workshop-title" id={titleId}>{workshop.title}</h3>
        <p className="location">{workshop.location}</p>
        <div className="card-meta"><span>{workshop.duration}</span><span>{workshop.price}</span></div>
        <p className="availability">
          <span className={"availability-dot " + (workshop.available ? "is-available" : "is-full")} aria-hidden="true" />
          {workshop.available ? "Places disponibles" : "Complet"}
        </p>
        <button type="button" className="details-trigger" aria-expanded={expanded} aria-controls={panelId}
          aria-describedby={titleId} onClick={() => setExpanded(value => !value)}>
          Détails de l’atelier <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
        <div id={panelId} className={"details-panel " + (expanded ? "is-open" : "")} hidden={!expanded}>
          <div className="details-inner">
            <p>{workshop.description}</p>
            <a href="#infos-pratiques">Consulter les informations pratiques</a>
          </div>
        </div>
        <div className="card-actions">
          {workshop.available ? (
            <button type="button" className="reserve-button" onClick={() => onReserve(workshop)}>
              M’inscrire à {workshop.title}
            </button>
          ) : <p className="closed-message">Inscriptions closes</p>}
          {extraAction}
        </div>
      </div>
    </article>
  );
}
