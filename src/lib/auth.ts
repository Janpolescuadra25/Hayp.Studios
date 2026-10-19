import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/owner",
  },
  providers: [
    CredentialsProvider({
      name: "Owner Credentials",
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

        try {
          if ("ownerAccount" in db) {
            const owner = await (db as any).ownerAccount.findUnique({
              where: { email },
            });

            if (owner && owner.passwordHash) {
              const isOwnerValid = await bcrypt.compare(password, owner.passwordHash);
              if (isOwnerValid) {
                try {
                  await (db as any).ownerAccount.update({
                    where: { id: owner.id },
                    data: { lastLogin: new Date() },
                  });
                } catch {
                  // Non-fatal if lastLogin update fails
                }

                return {
                  id: owner.id,
                  email: owner.email,
                  name: owner.name ?? "Studio Owner",
                  role: owner.role ?? "OWNER",
                };
              }
            }
          }
        } catch (error) {
          console.error("OwnerAccount auth lookup error:", error);
        }

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (user && user.passwordHash && (user.role === "ADMIN" || user.role === "OWNER")) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name ?? "Studio Owner",
                role: user.role,
              };
            }
          }
        } catch (error) {
          console.error("User auth lookup error:", error);
        }

        const envEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? process.env.OWNER_EMAIL);
        const envPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? process.env.OWNER_PASSWORD_HASH;

        if (envEmail && envPasswordHash && email === envEmail) {
          const isEnvValid = await bcrypt.compare(password, envPasswordHash);
          if (isEnvValid) {
            return {
              id: "owner-admin",
              email: envEmail,
              name: "Studio Owner",
              role: "OWNER",
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "OWNER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id =
          typeof token.id === "string" ? token.id : undefined;
        (session.user as { id?: string; role?: string }).role =
          (token.role as string) || "OWNER";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
