export type RequestKind = "question";
export type RequestValues = {
  kind: RequestKind;
  workshopId: string;
  choice: string;
  contact: string;
  message: string;
};
export type RequestErrors = Partial<Record<"choice" | "contact" | "message", string>>;
export type RequestDialogProps = {
  workshop: import("./workshops").Workshop;
  onClose: () => void;
  onSubmit: (values: RequestValues) => void;
};

export const requestOptions = {
  question: [
    { value: "horaires", label: "Les horaires" },
    { value: "materiel", label: "Le matériel à apporter" },
    { value: "acces", label: "L’accès au lieu" },
    { value: "autre", label: "Un autre sujet" },
  ],
};

export function readRequest(form: HTMLFormElement, kind: RequestKind, workshopId: string): {
  values: RequestValues; errors: RequestErrors;
} {
  const data = new FormData(form);
  const choice = String(data.get("choice") ?? "");
  const contact = String(data.get("contact") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();
  const errors: RequestErrors = {};
  if (!requestOptions[kind].some(option => option.value === choice)) {
    errors.choice = "Choisissez le sujet de votre question.";
  }
  const input = form.elements.namedItem("contact") as HTMLInputElement | null;
  if (!contact || input?.validity.typeMismatch) {
    errors.contact = "Saisissez une adresse électronique au format nom@exemple.fr.";
  }
  if (!message) errors.message = "Écrivez votre question.";
  return { values: { kind, workshopId, choice, contact, message }, errors };
}
