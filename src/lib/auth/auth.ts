import prisma from "@/lib/db/prisma";
import { RoleName } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";

  if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET IS UNDEFINED AT RUNTIME");
}


export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as RoleName,
          profileImage: user.profileImage ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.profileImage = user.profileImage ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as RoleName,
        profileImage: token.profileImage as string | null,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
