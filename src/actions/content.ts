"use server";

import { updateTag } from "next/cache";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";

export async function subscribeNewsletter(_prev: { error?: string; message?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email." };
  }
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });
  return { message: "You are on the list. We write rarely." };
}

export async function submitReview(_prev: { error?: string; message?: string } | null, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to leave a review." };

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the review and try again." };
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return { error: "That object is no longer available." };

  await prisma.review.upsert({
    where: { userId_productId: { userId: session.sub, productId: product.id } },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      author: session.name,
    },
    create: {
      productId: product.id,
      userId: session.sub,
      author: session.name,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });
  updateTag("catalog");
  return { message: "Thank you. Your review is live." };
}
