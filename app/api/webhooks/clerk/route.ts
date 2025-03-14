import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";

export async function POST(req: Request) {
  // Ensure WEBHOOK_SECRET is set
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is missing in .env.local");
    return new Response("Webhook secret is not set", { status: 500 });
  }

  try {
    // Extract headers manually (avoid using `headers()`)
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers");
      return new Response("Error: Missing Svix headers", { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Error: Webhook verification failed", { status: 400 });
    }

    // Extract event data
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Received webhook: ${eventType} for user ID: ${id}`);

    // Handle different event types
    if (eventType === "user.created") {
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;

      if (!email_addresses?.length) {
        console.error("No email address found for new user.");
        return new Response("Error: No email address found", { status: 400 });
      }

      if (!id) {
        console.error("User ID is undefined");
        return new Response("Error: User ID is undefined", { status: 400 });
      }

      const user = {
        clerkId: id as string,
        email: email_addresses[0].email_address,
        username: username || `user_${id}`,
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url || "",
      };

      try {
        const newUser = await createUser(user);

        if (newUser) {
          await clerkClient.users.updateUserMetadata(id as string, {
            publicMetadata: { userId: newUser._id },
          });
        }

        return NextResponse.json({ message: "User created", user: newUser });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name || "",
        lastName: last_name || "",
        username: username || `user_${id}`,
        photo: image_url || "",
      };

      try {
        if (!id) {
          console.error("User ID is undefined");
          return new Response("Error: User ID is undefined", { status: 400 });
        }
        const updatedUser = await updateUser(id as string, user);
        return NextResponse.json({ message: "User updated", user: updatedUser });
      } catch (error) {
        console.error("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      try {
        if (!id) {
          console.error("User ID is undefined");
          return new Response("Error: User ID is undefined", { status: 400 });
        }
        const deletedUser = await deleteUser(id);
        return NextResponse.json({ message: "User deleted", user: deletedUser });
      } catch (error) {
        console.error("Error deleting user:", error);
        return new Response("Error deleting user", { status: 500 });
      }
    }

    console.log("Unhandled webhook type:", eventType);
    return new Response("Unhandled event type", { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
