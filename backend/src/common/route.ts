import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// This is a temporary mock authentication setup
// In production, this would be replaced with OAuth2/SAML integration with university SSO
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "University Credentials",
      credentials: {
        universityId: { label: "University ID", type: "text", placeholder: "BAU12345" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Mock authentication logic
        // In production, this would validate against university SSO
        if (!credentials?.universityId || !credentials?.password) {
          return null;
        }

        // Mock admin user
        if (credentials.universityId === "ADMIN001" && credentials.password === "admin") {
          return {
            id: "admin-id",
            universityId: "ADMIN001",
            name: "Library Administrator",
            email: "admin@bahcesehir.edu.tr",
            role: "ADMIN",
          };
        }

        // Mock student users
        const studentCredentials = [
          { id: "stu001-id", universityId: "STU001", name: "Ahmet Yılmaz", email: "student1@bahcesehir.edu.tr", password: "student1" },
          { id: "stu002-id", universityId: "STU002", name: "Ayşe Kaya", email: "student2@bahcesehir.edu.tr", password: "student2" },
          { id: "stu003-id", universityId: "STU003", name: "Mehmet Demir", email: "student3@bahcesehir.edu.tr", password: "student3" },
        ];

        const user = studentCredentials.find(
          (user) => user.universityId === credentials.universityId && user.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            universityId: user.universityId,
            name: user.name,
            email: user.email,
            role: "STUDENT",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.universityId = user.universityId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.universityId = token.universityId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "temporary-secret-for-development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
