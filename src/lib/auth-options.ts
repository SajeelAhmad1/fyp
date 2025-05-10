// lib/auth-options.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { ROLE } from "@/common/constant/apis-urls";
import axios from "axios";

const prisma = new PrismaClient();

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || '',
          firstName: profile.given_name || profile.name?.split(' ')[0] || '',
          lastName: profile.family_name || profile.name?.split(' ')[1] || '',
          email: profile.email,
          image: profile.picture,
          verified: true,
          loginType: "GOOGLE",
        };
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSettingPassword: { label: "IsSettingPassword", type: "hidden" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          let user;
          if (credentials.isSettingPassword === "true") {
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/password-save`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: credentials.email,
                  newPassword: credentials.password,
                  confirmPassword: credentials.password,
                }),
              }
            );

            if (!response.ok) throw new Error("Failed to set password");
            user = (await response.json()).data;
          } else {
            const response = await axios.post(
              `${process.env.NEXTAUTH_URL}/api/login`,
              {
                email: credentials.email,
                password: credentials.password,
                role: ROLE.CUSTOMER,
              }
            );

            if (response.status !== 200) {
              throw new Error("Invalid credentials");
            }
            user = response.data.data;
          }

          if (!user) return null;

          const customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: user.id },
          });

          return {
            ...user,
            customerProfile: customerProfile || null,
            isProfileComplete: !!customerProfile,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { customerProfile: true },
        });
    
        if (!existingUser) {
          // Create new user for Google sign-in
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              verified: true,
              loginType: "GOOGLE",
              role: ROLE.CUSTOMER,
              customerProfile: {
                create: {
                  firstName: profile?.given_name || user.firstName,
                  lastName: profile?.family_name || user.lastName,
                  // You can add more default profile fields if needed
                }
              }
            },
            include: { customerProfile: true },
          });
          user.id = newUser.id;
          user.customerProfile = newUser.customerProfile;
          user.isProfileComplete = !!newUser.customerProfile;
        } else {
          user.id = existingUser.id;
          user.customerProfile = existingUser.customerProfile;
          user.isProfileComplete = !!existingUser.customerProfile;
          
          // If user exists but doesn't have a profile, create one
          if (!existingUser.customerProfile) {
            const profile = await prisma.customerProfile.create({
              data: {
                userId: existingUser.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
              }
            });
            user.customerProfile = profile;
            user.isProfileComplete = true;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign-in
      if (account && user) {
        token = {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role || ROLE.CUSTOMER,
          loginType: account.provider === "google" ? "GOOGLE" : "CREDENTIALS",
          customerProfile: user.customerProfile || null,
          isProfileComplete: !!user.customerProfile,
          verified: user.verified,
          name: user.customerProfile 
            ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`.trim()
            : '',
        };
      }
    
      // For credential logins
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isProfileComplete = !!user.customerProfile;
        token.customerProfile = user.customerProfile || null;
        token.verified = user.verified;
        token.role = user.role;
        token.loginType = user.loginType;
        token.token = user.token;
        token.name = user.customerProfile 
          ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`.trim()
          : '';
      }
    
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        loginType: token.loginType,
        isProfileComplete: token.isProfileComplete,
        customerProfile: token.customerProfile,
        verified: token.verified,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;