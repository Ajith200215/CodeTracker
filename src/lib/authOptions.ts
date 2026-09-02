import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import crypto from "crypto";

function hashPassword(pw?: string): string | null {
  if (!pw) return null;
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "College Account Sign In",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
        regNo: { label: "RegNo", type: "text" },
        branch: { label: "Branch", type: "text" },
      },
      async authorize(credentials) {
        try {
          const rawId = (credentials?.loginId || "").trim();
          const rawEmail = (credentials?.email || "").trim().toLowerCase();
          const inputPassword = credentials?.password || "";
          const hashedPassword = hashPassword(inputPassword);

          const emailToUse = rawEmail 
            ? rawEmail 
            : (rawId.includes("@") ? rawId.toLowerCase() : `${rawId.toLowerCase()}@srmist.edu.in`);

          if (!emailToUse && !rawId) throw new Error("Email or Login ID required");

          // Find the user in the database
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: emailToUse },
                ...(rawId && !rawId.includes("@") ? [{ regNo: rawId }] : []),
              ],
            },
          });

          // 1. If user doesn't exist, they MUST register first
          if (!user) {
            throw new Error("Account not found. Please register first.");
          }

          // 2. If user exists, verify password
          // If the user registered via Google, they might not have a password
          if (!user.password) {
             throw new Error("Please sign in with Google or reset your password.");
          }

          if (user.password !== hashedPassword) {
             throw new Error("Invalid password.");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            section: user.section,
          };
        } catch (error: any) {
          console.error("[Auth Authorize Error]:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true;

      try {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              role: Role.STUDENT,
              regNo: "2026-CS-0142",
            },
          }).catch(() => null);
        }
      } catch (error) {
        console.warn("Error during NextAuth signIn callback:", error);
      }

      return true;
    },

    async jwt({ token }) {
      if (token.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.regNo = dbUser.regNo;
            token.section = dbUser.section;
          } else {
            token.role = token.role || Role.STUDENT;
          }
        } catch (e) {
          token.role = token.role || Role.STUDENT;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || Role.STUDENT;
        (session.user as any).regNo = token.regNo || "2026-CS-0142";
        (session.user as any).section = token.section;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-12345",
};
