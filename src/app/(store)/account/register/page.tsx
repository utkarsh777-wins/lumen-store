import { RegisterForm } from "@/components/auth-forms";
import { Container } from "@/components/ui";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Container className="max-w-md py-16">
      <h1 className="font-serif text-4xl">Create an account</h1>
      <p className="mt-3 text-muted">Use it to track orders and keep a wishlist.</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </Container>
  );
}
