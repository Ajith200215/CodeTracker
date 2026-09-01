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

          // Determine target email
          const emailToUse = rawEmail 
            ? rawEmail 
            : (rawId.includes("@") ? rawId.toLowerCase() : `${rawId.toLowerCase()}@srmist.edu.in`);

          if (!emailToUse && !rawId) return null;

          const assignedRole = credentials?.role === "TEACHER" ? Role.TEACHER : Role.STUDENT;
          const regNoVal = credentials?.regNo || (assignedRole === Role.STUDENT ? (rawId || "2026-CS-0142") : undefined);
          const nameVal = credentials?.name?.trim() || emailToUse.split("@")[0].replace(".", " ");

          // Search existing user by email or regNo
          let user = await db.user.findFirst({
            where: {
              OR: [
                { email: emailToUse },
                ...(regNoVal ? [{ regNo: regNoVal }] : []),
              ],
            },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email: emailToUse,
                name: nameVal,
                role: assignedRole,
                regNo: regNoVal,
                branch: credentials?.branch || "CSE Core",
              },
            });
          } else {
            // Update profile info if newly registered
            user = await db.user.update({
              where: { id: user.id },
              data: {
                name: credentials?.name ? nameVal : user.name,
                regNo: regNoVal || user.regNo,
                branch: credentials?.branch || user.branch,
                role: assignedRole,
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth Authorize Error]:", error);
          return null;
        }
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
