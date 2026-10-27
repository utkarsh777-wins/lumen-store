import { Container } from "@/components/ui";

export const metadata = {
  title: "Privacy",
  description: "How Lumen handles account and order information.",
};

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-14">
      <h1 className="font-serif text-5xl">Privacy</h1>
      <div className="mt-8 space-y-4 text-muted">
        <p>We store the name, email, address, and order history you give us so we can ship what you bought and show it back to you.</p>
        <p>Passwords are hashed. Demo card numbers are checked and discarded. Only the last four digits are kept on the receipt.</p>
        <p>A session cookie keeps you signed in. A second cookie remembers a guest bag and wishlist on this browser. Neither is used for advertising.</p>
        <p>The newsletter list is just an email address. It is not sold, and this demo does not send mail.</p>
      </div>
    </Container>
  );
}
