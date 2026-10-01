import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

/**
 * Demo users database
 * In production, replace with actual database
 */
const DEMO_USERS = [
  {
    id: "1",
    email: "admin@esp32.local",
    password: "esp32admin",
    name: "ESP32 Administrator",
  },
];

/**
 * Custom credentials authenticator
 */
async function authenticateUser(
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string } | null> {
  const user = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  return null;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        return user;
      },
    }),
  ],
});
