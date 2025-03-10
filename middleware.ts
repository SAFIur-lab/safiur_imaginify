import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const isPublicRoute = createRouteMatcher([
  "/api/webhooks/clerk",
]);

export default clerkMiddleware((_auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
