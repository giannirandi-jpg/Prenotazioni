import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.SMTP_URL,
      from: process.env.SMTP_FROM,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      // attach the database id on session for convenience
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = (user.isAdmin ?? false);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
