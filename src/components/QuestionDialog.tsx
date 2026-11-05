import { useEffect, useRef, useState, type FormEvent } from "react";
import { readRequest, requestOptions, type RequestDialogProps, type RequestErrors } from "../requests";

export default function QuestionDialog({ workshop, onClose, onSubmit }: RequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState<RequestErrors>({});

  // Ouverture en modale, focus sur le titre ; Échap ferme comme « Annuler ».
  useEffect(() => {
    const dialog = dialogRef.current!;
    if (!dialog.open) dialog.showModal();
    titleRef.current?.focus();
    const cancel = (event: Event) => { event.preventDefault(); onClose(); };
    dialog.addEventListener("cancel", cancel);
    return () => dialog.removeEventListener("cancel", cancel);
  }, [onClose]);

  // Après un envoi refusé, le focus va sur le premier champ en erreur.
  useEffect(() => {
    const first = (["choice", "contact", "message"] as const).find(field => errors[field]);
    if (first) document.getElementById(`question-${first}`)?.focus();
  }, [errors]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors } = readRequest(event.currentTarget, "question", workshop.id);
    setErrors(errors);
    if (Object.keys(errors).length === 0) onSubmit(values);
  };

  const errorProps = (field: keyof RequestErrors) => errors[field]
    ? { "aria-invalid": true, "aria-describedby": `question-${field}-error` }
    : {};
  const errorText = (field: keyof RequestErrors) =>
    errors[field] && <p className="field-error" id={`question-${field}-error`}>{errors[field]}</p>;

  return (
    <dialog ref={dialogRef} aria-labelledby="question-title">
      <div className="dialog-heading">
        <h2 id="question-title" ref={titleRef} tabIndex={-1}>Poser une question sur « {workshop.title} »</h2>
        <button type="button" className="close-button" aria-label="Fermer" onClick={onClose}>×</button>
      </div>

      <form noValidate onSubmit={submit}>
        <div className="field">
          <label htmlFor="question-choice">Sujet de la question (obligatoire)</label>
          <select id="question-choice" name="choice" defaultValue="" {...errorProps("choice")}>
            <option value="">Sélectionnez un sujet</option>
            {requestOptions.question.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {errorText("choice")}
        </div>

        <div className="field">
          <label htmlFor="question-contact">Adresse électronique (obligatoire, format nom@exemple.fr)</label>
          <input id="question-contact" name="contact" type="email" autoComplete="email" {...errorProps("contact")} />
          {errorText("contact")}
        </div>

        <div className="field">
          <label htmlFor="question-message">Votre question (obligatoire)</label>
          <textarea id="question-message" name="message" {...errorProps("message")} />
          {errorText("message")}
        </div>

        <div className="dialog-actions">
          <button type="submit" className="primary-button">Envoyer la question</button>
          <button type="button" className="secondary-button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </dialog>
  );
}
