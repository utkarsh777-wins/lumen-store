import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { logout } from "@/actions/auth";
import { AddressForm, ProfileForm } from "@/components/account-forms";
import { Container } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16">Loading your account…</p>}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/account");
  const address = await prisma.address.findFirst({ where: { userId: session.sub, isDefault: true } });
  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Hello, {session.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted">{session.email}</p>
        </div>
        <nav className="flex gap-4 text-sm" aria-label="Account">
          <Link href="/account" aria-current="page" className="underline">
            Profile
          </Link>
          <Link href="/account/orders">Orders</Link>
          <form action={logout}>
            <button className="underline">Sign out</button>
          </form>
        </nav>
      </div>
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl">Profile</h2>
          <div className="mt-4">
            <ProfileForm name={session.name} email={session.email} />
          </div>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Shipping address</h2>
          <div className="mt-4">
            <AddressForm
              address={{
                fullName: address?.fullName ?? session.name,
                line1: address?.line1 ?? "",
                line2: address?.line2 ?? "",
                city: address?.city ?? "",
                region: address?.region ?? "",
                postal: address?.postal ?? "",
                country: address?.country ?? "US",
                phone: address?.phone ?? "",
              }}
            />
          </div>
        </section>
      </div>
    </Container>
  );
}
