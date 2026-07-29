import { redirect } from "next/navigation";

export default function ComptablePage() {
  // Module comptable complet plus tard — pour l'instant retour au tableau de bord
  redirect("/dashboard");
}