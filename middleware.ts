import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = ['/', '/api/webhooks/clerk', '/api/webhooks/stripe'];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = new URL(req.url);

  if (publicRoutes.includes(pathname)) {
    return; // Skip middleware for public routes
  }

  const authObject = await auth();

  if (!authObject.userId) {
    // Redirect or handle unauthenticated users
    return new Response("Unauthorized", { status: 401 });
  }

  // Proceed with the request
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};