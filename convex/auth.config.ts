/**
 * Convex Auth Configuration
 * -------------------------
 * Tells Convex to trust JWTs issued by Clerk.
 * 
 * Setup steps:
 * 1. In Clerk Dashboard → JWT Templates → Create new "Convex" template
 * 2. Copy the "Issuer" URL (looks like: https://your-app.clerk.accounts.dev)
 * 3. Set it as CLERK_JWT_ISSUER_DOMAIN in Convex dashboard environment variables
 * 
 * After this, every Convex mutation/query automatically knows
 * which Clerk user is making the request via ctx.auth.getUserIdentity()
 */
export default {
  providers: [
    {
      // Clerk's JWT issuer URL — set this in Convex dashboard env vars
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
