import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { readRequest, requestOptions, type RequestDialogProps, type RequestErrors } from "../requests";

type Field = keyof RequestErrors;

const fieldOrder: Field[] = ["choice", "contact", "message"];
const fieldLabels: Record<Field, string> = {
  choice: "Sujet de la question",
  contact: "Adresse électronique",
  message: "Votre question",
};

export default function QuestionDialog({ workshop, onClose, onSubmit }: RequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [attempt, setAttempt] = useState(0);
  const baseId = useId();
  const id = (name: string) => `${baseId}-${name}`;
  const errorList = fieldOrder.filter(field => errors[field]);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Ouverture : la fenêtre devient modale et le focus entre sur son titre.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    titleRef.current?.focus();
    // Échap déclenche « cancel » : on ferme par le même chemin que la croix et Annuler.
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  // Après un envoi refusé, le focus rejoint le résumé des erreurs.
  useEffect(() => {
    if (attempt > 0 && errorList.length > 0) summaryRef.current?.focus();
  }, [attempt]);

  // Le parent retire la fenêtre : aucune demande n'est transmise.
  const close = () => onCloseRef.current();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: nextErrors } = readRequest(event.currentTarget, "question", workshop.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setAttempt(value => value + 1);
      return;
    }
    onSubmit(values);
  };

  const goToField = (event: MouseEvent<HTMLAnchorElement>, field: Field) => {
    event.preventDefault();
    document.getElementById(id(field))?.focus();
  };

  const describedBy = (field: Field, help?: boolean) =>
    [help ? id(`${field}-help`) : "", errors[field] ? id(`${field}-error`) : ""].filter(Boolean).join(" ") || undefined;

  const invalidState = (field: Field) => ({
    className: errors[field] ? "invalid" : undefined,
    "aria-invalid": errors[field] ? true : undefined,
  });

  const fieldError = (field: Field) =>
    errors[field] ? <p className="field-error" id={id(`${field}-error`)}>{errors[field]}</p> : null;

  return (
    <dialog ref={dialogRef} aria-labelledby={id("title")} aria-describedby={id("context")}>
      <div className="dialog-heading">
        <h2 id={id("title")} ref={titleRef} tabIndex={-1}>Poser une question sur « {workshop.title} »</h2>
        <button type="button" className="close-button" aria-label="Fermer" onClick={close}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className="dialog-context" id={id("context")}>
        {workshop.date} · {workshop.location}. Les trois champs sont obligatoires.
      </p>

      <form noValidate onSubmit={submit}>
        {errorList.length > 0 && (
          <div className="error-summary" ref={summaryRef} tabIndex={-1} aria-labelledby={id("summary-title")}>
            <h3 id={id("summary-title")}>
              {errorList.length > 1 ? `${errorList.length} erreurs empêchent` : "Une erreur empêche"} l’envoi de votre question
            </h3>
            <ul>
              {errorList.map(field => (
                <li key={field}>
                  <a href={`#${id(field)}`} onClick={event => goToField(event, field)}>
                    {fieldLabels[field]} : {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="field">
          <label htmlFor={id("choice")}>{fieldLabels.choice} (obligatoire)</label>
          <select id={id("choice")} name="choice" defaultValue="" required
            {...invalidState("choice")} aria-describedby={describedBy("choice")}>
            <option value="">Sélectionnez un sujet</option>
            {requestOptions.question.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {fieldError("choice")}
        </div>

        <div className="field">
          <label htmlFor={id("contact")}>{fieldLabels.contact} (obligatoire)</label>
          <p className="field-help" id={id("contact-help")}>Format attendu : nom@exemple.fr. Utilisez une adresse fictive.</p>
          <input id={id("contact")} name="contact" type="email" autoComplete="email" required
            {...invalidState("contact")} aria-describedby={describedBy("contact", true)} />
          {fieldError("contact")}
        </div>

        <div className="field">
          <label htmlFor={id("message")}>{fieldLabels.message} (obligatoire)</label>
          <textarea id={id("message")} name="message" required
            {...invalidState("message")} aria-describedby={describedBy("message")} />
          {fieldError("message")}
        </div>

        <div className="dialog-actions">
          <button type="submit" className="primary-button">Envoyer la question</button>
          <button type="button" className="secondary-button" onClick={close}>Annuler</button>
        </div>
        <p className="simulation-note">Envoi simulé : aucune donnée n’est transmise.</p>
      </form>
    </dialog>
  );
}
