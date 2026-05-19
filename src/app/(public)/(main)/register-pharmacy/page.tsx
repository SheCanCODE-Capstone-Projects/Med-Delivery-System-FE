import { redirect } from "next/navigation";

export default function RegisterPharmacyRedirect() {
  redirect("/auth/pharmacy-signup");
}
