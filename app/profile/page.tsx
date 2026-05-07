// app/profile/page.tsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { getSessionUserId } from "../actions/auth";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    redirect("/dashboard");
  }

  return <ProfileForm profile={profile} />;
}
