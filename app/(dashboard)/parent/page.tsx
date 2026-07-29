import { redirect } from "next/navigation";

export default function ParentPage() {
  // Portail parent plus tard — pour l'instant retour au tableau de bord
  redirect("/dashboard");
}