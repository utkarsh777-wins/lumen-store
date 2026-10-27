import { cardDigits, luhnValid } from "@/lib/luhn";

export type CardInput = {
  name: string;
  number: string;
  exp: string;
  cvc: string;
};

export type CardField = "cardName" | "cardNumber" | "cardExp" | "cardCvc";

export type CardAssessment =
  | { ok: true; last4: string }
  | { ok: false; field: CardField; error: string };

const DECLINE_PAN = "4000000000000002";

export function assessMockCard(input: CardInput, now = new Date()): CardAssessment {
  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, field: "cardName", error: "Enter the name on the card." };
  }

  const number = cardDigits(input.number);
  if (!number) {
    return { ok: false, field: "cardNumber", error: "Enter a card number." };
  }
  if (!luhnValid(number)) {
    return { ok: false, field: "cardNumber", error: "Check the card number and try again." };
  }
  if (number === DECLINE_PAN) {
    return { ok: false, field: "cardNumber", error: "Your card was declined." };
  }

  const match = /^(\d{2})\s*\/\s*(\d{2}|\d{4})$/.exec(input.exp.trim());
  if (!match) {
    return { ok: false, field: "cardExp", error: "Use the expiry format MM/YY." };
  }
  const month = Number(match[1]);
  let year = Number(match[2]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) {
    return { ok: false, field: "cardExp", error: "Enter a valid expiry month." };
  }
  const expiresAt = new Date(year, month, 1);
  if (now >= expiresAt) {
    return { ok: false, field: "cardExp", error: "This card has expired." };
  }

  const cvc = cardDigits(input.cvc);
  if (cvc.length < 3 || cvc.length > 4) {
    return { ok: false, field: "cardCvc", error: "Enter the 3 or 4 digit security code." };
  }

  return { ok: true, last4: number.slice(-4) };
}
