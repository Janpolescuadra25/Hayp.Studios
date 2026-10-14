import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const normalizeEmail = (value: string | undefined): string | null => {
  const email = value?.trim().toLowerCase();
  return email ? email : null;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Studio Owner",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email as string | undefined);
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const envEmail = normalizeEmail(process.env.ADMIN_EMAIL);
        const envPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

        if (envEmail && envPasswordHash && email === envEmail) {
          const isOwnerValid = await bcrypt.compare(password, envPasswordHash);
          if (isOwnerValid) {
            return {
              id: "owner-admin",
              email: envEmail,
              name: "Studio Owner",
              role: "ADMIN",
            };
          }
        }

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user || user.role !== "ADMIN" || !user.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "Studio Admin",
            role: user.role,
          };
        } catch (error) {
          console.error("Auth DB lookup error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = typeof token.id === "string" ? token.id : undefined;
        (session.user as { id?: string; role?: string }).role = (token.role as string) || "USER";
      }
      return session;
    },
  },
};