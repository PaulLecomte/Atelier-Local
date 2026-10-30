import { useState, type ReactNode } from "react";
import type { Workshop } from "../workshops";

type Props = {
  workshop: Workshop;
  onReserve: (workshop: Workshop) => void;
  extraAction?: ReactNode;
};

export default function WorkshopCard({ workshop, onReserve, extraAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="workshop-card">
      <div className="card-art">
        {workshop.id === "serigraphie"
          ? <img src={workshop.image} />
          : <img src={workshop.image} alt="" />}
        <span className="category">{workshop.category}</span>
      </div>
      <div className="card-body">
        <p className="workshop-date">{workshop.date}</p>
        <p className="workshop-title">{workshop.title}</p>
        <p className="location">{workshop.location}</p>
        <div className="card-meta"><span>{workshop.duration}</span><span>{workshop.price}</span></div>
        <p className="availability">
          <span className={"availability-dot " + (workshop.available ? "is-available" : "is-full")} aria-hidden="true" />
          {workshop.available ? "Places disponibles" : "Complet"}
        </p>
        <div className="details-trigger" onClick={() => setExpanded(value => !value)}>
          Détails de l’atelier <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </div>
        <div className={"details-panel " + (expanded ? "is-open" : "")} aria-hidden={!expanded}>
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
