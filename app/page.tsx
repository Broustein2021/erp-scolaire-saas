import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function Home() {
  const profile = await getCurrentProfile();
  redirect(profile ? "/dashboard" : "/login");
}