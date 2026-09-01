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
        const idInput = (credentials?.loginId || credentials?.email || "").trim();
        if (!idInput) return null;

        const assignedRole = credentials?.role === "TEACHER" ? Role.TEACHER : Role.STUDENT;

        // Search user by email or regNo
        let user = await db.user.findFirst({
          where: {
            OR: [
              { email: idInput.toLowerCase() },
              { regNo: idInput },
            ],
          },
        });

        if (!user) {
          const userEmail = idInput.includes("@") ? idInput.toLowerCase() : `${idInput.toLowerCase()}@srmist.edu.in`;
          const regNoVal = credentials?.regNo || (assignedRole === Role.STUDENT ? idInput : undefined);

          user = await db.user.create({
            data: {
              email: userEmail,
              name: credentials?.name || idInput.split("@")[0].replace(".", " "),
              role: assignedRole,
              regNo: regNoVal,
              branch: credentials?.branch || "CSE Core",
            },
          });
        } else if (credentials?.regNo || credentials?.branch) {
          await db.user.update({
            where: { id: user.id },
            data: {
              regNo: credentials?.regNo || user.regNo,
              branch: credentials?.branch || user.branch,
            },
          }).catch(() => null);
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
