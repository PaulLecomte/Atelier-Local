import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
afterEach(cleanup);

describe("Question à l’organisateur", () => {
  it("depuis App, conserve le sujet et la question après un envoi sans email, puis confirme le bon atelier et le bon sujet après correction", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Ouvrir la question pour « Une tasse en céramique ».
    const trigger = screen.getByRole("button", { name: "Poser une question sur Une tasse en céramique" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: /Une tasse en céramique/ });

    // 2. Choisir le sujet et rédiger la question.
    const subject = within(dialog).getByRole("combobox", { name: /Sujet de la question/ });
    const question = within(dialog).getByRole("textbox", { name: /Votre question/ });
    await user.selectOptions(subject, "Le matériel à apporter");
    await user.type(question, "Faut-il apporter un tablier ?");

    // 3. Envoyer sans adresse électronique.
    await user.click(within(dialog).getByRole("button", { name: "Envoyer la question" }));

    // 4. Erreur indiquée, modale ouverte, saisie conservée, aucune confirmation.
    const email = within(dialog).getByRole("textbox", { name: /Adresse électronique/ });
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/Saisissez une adresse électronique au format nom@exemple\.fr/);
    expect(email).toHaveFocus();
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("open");
    expect(subject).toHaveValue("materiel");
    expect(question).toHaveValue("Faut-il apporter un tablier ?");
    expect(screen.queryByText(/a été transmise/)).not.toBeInTheDocument();

    // 5. Renseigner une adresse valide puis envoyer à nouveau.
    await user.type(email, "camille@exemple.fr");
    await user.click(within(dialog).getByRole("button", { name: "Envoyer la question" }));

    // 6. La modale se ferme, la confirmation cite le bon atelier et le bon sujet.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const confirmation = screen.getByText(/a été transmise/);
    expect(confirmation).toHaveTextContent("Une tasse en céramique");
    expect(confirmation).toHaveTextContent("Le matériel à apporter");
    expect(confirmation).not.toHaveTextContent("camille@exemple.fr");
    expect(trigger).toHaveFocus();
  });
});
