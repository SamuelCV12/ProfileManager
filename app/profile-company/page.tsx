// app/profile-company/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { getSessionUserId } from "../actions/auth";
import CompanyProfileForm from "./CompanyProfileForm";

export default async function ProfileCompanyPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const company = await prisma.company.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!company) {
    redirect("/dashboard-company");
  }

  return <CompanyProfileForm company={company} />;
}
