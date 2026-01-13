import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type VerifyPageProps = {
  searchParams?: {
    token?: string;
  };
};

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const token = searchParams?.token;
  if (!token) {
    redirect("/login");
  }

  redirect(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}
