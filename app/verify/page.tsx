import VerifyClient from "./verify-client";

type VerifyPageProps = {
  searchParams?: {
    token?: string;
  };
};

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const token = searchParams?.token ?? null;
  return <VerifyClient token={token} />;
}
