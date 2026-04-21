import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ReceptionistClient from "./ReceptionistClient";

export default async function ReceptionistPage() {
  const session = await getSession();

  if (!session || session.role !== "receptionist") {
    redirect("/receptionist/login");
  }

  return <ReceptionistClient />;
}