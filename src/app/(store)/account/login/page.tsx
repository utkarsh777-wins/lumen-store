import { Suspense } from "react";

import { LoginForm } from "@/components/auth-forms";
import { Container } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense fallback={<p className="px-8 py-16">Loading…</p>}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <Container className="grid gap-12 py-16 md:grid-cols-2">
      <div className="max-w-md">
        <h1 className="font-serif text-4xl">Sign in</h1>
        <p className="mt-3 text-muted">Orders, saved addresses, and your wishlist live here.</p>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
      <aside className="h-fit border border-line bg-highlight p-6 text-sm">
        <p className="font-medium">Demo accounts</p>
        <p className="mt-3">
          Customer
          <br />
          jonah@example.com
          <br />
          lumen-guest
        </p>
        <p className="mt-4">
          Admin
          <br />
          admin@lumen.studio
          <br />
          lumen-admin
        </p>
      </aside>
    </Container>
  );
}
