import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? (params.email as string),
          role: (params.role as string) ?? "patient",
        };
      },
      reset: {
        id: "password-reset",
        type: "email" as const,
        sendVerificationRequest: async ({
          identifier: email,
          token,
        }: {
          identifier: string;
          token: string;
        }) => {
          // Production: replace this block with a real email service (e.g. Resend).
          // For now the code is printed to the Convex dashboard logs so you can
          // copy it during a demo or development session.
          console.log(
            `[DrugScan] Password reset code for ${email} → ${token}`,
          );
        },
      },
    }),
  ],

  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const role = (args.profile as any).role === "admin" ? "admin" : "patient";

      return ctx.db.insert("users", {
        email: (args.profile as any).email ?? undefined,
        name:
          (args.profile as any).name ?? (args.profile as any).email ?? "User",
        role,
        createdAt: Date.now(),
        isAnonymous: false,
      });
    },
  },
});
