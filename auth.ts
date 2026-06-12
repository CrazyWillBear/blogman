import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedLogin, parseAllowlist } from "@/lib/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ profile }) {
      const allowlist = parseAllowlist(process.env.ADMIN_GITHUB_LOGINS);
      const login =
        typeof profile?.login === "string" ? profile.login : undefined;
      return isAllowedLogin(login, allowlist);
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
