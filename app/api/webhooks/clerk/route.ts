import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";

export async function POST(req: Request) {
  console.log("📩 Webhook received");

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ ERROR: WEBHOOK_SECRET is missing");
    return new Response("Webhook secret is missing", { status: 500 });
  }

  try {
    // Log incoming headers
    console.log("📌 Headers:", JSON.stringify([...req.headers.entries()]));

    // Extract headers manually
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ ERROR: Missing Svix headers");
      return new Response("Error: Missing Svix headers", { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    console.log("📌 Webhook Body:", body);

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
      console.error("❌ ERROR: Webhook verification failed:", err);
      return new Response("Error: Webhook verification failed", { status: 400 });
    }

    // Extract event data
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`✅ Webhook verified: ${eventType} for user ID: ${id}`);

    // Handle different event types
    if (eventType === "user.created") {
      console.log("👤 Creating user...");

      const { email_addresses, image_url, first_name, last_name, username } = evt.data;

      if (!email_addresses?.length) {
        console.error("❌ ERROR: No email address found for new user.");
        return new Response("Error: No email address found", { status: 400 });
      }

      const user = {
        clerkId: id || "",
        email: email_addresses[0].email_address,
        username: username || `user_${id}`,
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url || "",
      };

      try {
        const newUser = await createUser(user);
        console.log("✅ User created:", newUser);

        if (newUser) {
          if (typeof id === "string") {
            await clerkClient.users.updateUserMetadata(id, {
              publicMetadata: { userId: newUser._id },
            });
          } else {
            console.error("❌ ERROR: Invalid user ID");
            return new Response("Error: Invalid user ID", { status: 400 });
          }
        }

        return NextResponse.json({ message: "User created", user: newUser });
      } catch (error) {
        console.error("❌ ERROR: Creating user failed", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      console.log("🔄 Updating user...");
      const { image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name || "",
        lastName: last_name || "",
        username: username || `user_${id}`,
        photo: image_url || "",
      };

      try {
        if (typeof id === "string") {
          const updatedUser = await updateUser(id, user);
          console.log("✅ User updated:", updatedUser);
          return NextResponse.json({ message: "User updated", user: updatedUser });
        } else {
          console.error("❌ ERROR: Invalid user ID");
          return new Response("Error: Invalid user ID", { status: 400 });
        }
      } catch (error) {
        console.error("❌ ERROR: Updating user failed", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      console.log("🗑 Deleting user...");
      try {
        if (typeof id === "string") {
          const deletedUser = await deleteUser(id);
          console.log("✅ User deleted:", deletedUser);
          return NextResponse.json({ message: "User deleted", user: deletedUser });
        } else {
          console.error("❌ ERROR: Invalid user ID");
          return new Response("Error: Invalid user ID", { status: 400 });
        }
      } catch (error) {
        console.error("❌ ERROR: Deleting user failed", error);
        return new Response("Error deleting user", { status: 500 });
      }
    }

    console.log("⚠️ Unhandled webhook type:", eventType);
    return new Response("Unhandled event type", { status: 200 });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
