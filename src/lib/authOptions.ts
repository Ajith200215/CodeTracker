import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "College Account Sign In",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@college.edu" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.toLowerCase().trim();
        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          const assignedRole = credentials.role === "TEACHER" ? Role.TEACHER : Role.STUDENT;
          user = await db.user.create({
            data: {
              email,
              name: email.split("@")[0].replace(".", " "),
              role: assignedRole,
              regNo: assignedRole === Role.STUDENT ? "2026-CS-0142" : undefined,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

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
          });
        }

        return true;
      } catch (error) {
        console.error("Error during NextAuth signIn callback:", error);
        return true;
      }
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
