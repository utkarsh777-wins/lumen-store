"use server";

import { redirect } from "next/navigation";

import { clearSession, getSession, setSession } from "@/lib/auth";
import { attachCartToUser } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { safeNextPath } from "@/lib/slug";
import { mergeWishlist } from "@/lib/wishlist";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function login(_prev: { error?: string } | null, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Enter the email and password for your account." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Those details do not match our records." };
  }

  await setSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  await attachCartToUser(user.id);
  await mergeWishlist(user.id);
  redirect(safeNextPath(String(formData.get("next") ?? ""), user.role === "ADMIN" ? "/admin" : "/account"));
}

export async function register(_prev: { error?: string } | null, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with that email already exists. Try signing in." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  await setSession({ sub: user.id, email: user.email, name: user.name, role: "CUSTOMER" });
  await attachCartToUser(user.id);
  await mergeWishlist(user.id);
  redirect("/account");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function updateProfile(_prev: { error?: string; message?: string } | null, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to update your profile." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (name.length < 2) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };

  const taken = await prisma.user.findFirst({ where: { email, NOT: { id: session.sub } } });
  if (taken) return { error: "That email is already in use." };

  const data: { name: string; email: string; passwordHash?: string } = { name, email };
  if (newPassword) {
    if (newPassword.length < 8) return { error: "Use at least 8 characters for a new password." };
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return { error: "The current password does not match." };
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  const user = await prisma.user.update({ where: { id: session.sub }, data });
  await setSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  return { message: "Profile saved." };
}

export async function saveAddress(_prev: { error?: string; message?: string } | null, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to save an address." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const line2 = String(formData.get("line2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const postal = String(formData.get("postal") ?? "").trim();
  const country = String(formData.get("country") ?? "US").trim().toUpperCase();
  const phone = String(formData.get("phone") ?? "").trim();

  if (fullName.length < 2 || line1.length < 3 || city.length < 2 || region.length < 2 || postal.length < 3) {
    return { error: "Complete the address before saving." };
  }
  if (country.length !== 2) return { error: "Use a 2-letter country code." };

  await prisma.address.updateMany({ where: { userId: session.sub }, data: { isDefault: false } });
  const existing = await prisma.address.findFirst({ where: { userId: session.sub }, orderBy: { id: "desc" } });
  const data = { fullName, line1, line2: line2 || null, city, region, postal, country, phone: phone || null, isDefault: true };
  if (existing) {
    await prisma.address.update({ where: { id: existing.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId: session.sub } });
  }
  return { message: "Address saved." };
}
