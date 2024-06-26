/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {

    console.log("Using Webhook")
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }
    console.log('1')

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");
    console.log('2')
    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    console.log('3')
    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log('4')

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    console.log('5')

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", {
            status: 400,
        });
    }
    console.log('6')
    // Get the ID and type
    const { id } = evt.data;
    const eventType = evt.type;
    console.log("ID && Type OK")
    console.log(`ID: ${id}, Type: ${eventType}`)

    // CREATE
    if (eventType === "user.created") {
        let { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        console.log('ID:', id);
        console.log('Email Addresses:', email_addresses);
        console.log('Image URL:', image_url);
        console.log('First Name:', first_name);
        console.log('Last Name:', last_name);
        console.log('Username:', username);
        if (!username) {
            if (first_name || last_name) {
                username = `${first_name} ${last_name}`
            }
            else {
                username = id
            }
        }

        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username,
            firstName: first_name,
            lastName: last_name,
            photo: image_url,
        };

        console.log(`User: ${user}`)
        if (!user) {
            return new Response("Error occured -- no User fetched from webhook", {
                status: 400,
            });
        }

        console.log("will use DB")
        const newUser = await createUser(user);
        console.log("used DB")



        // Set public metadata
        if (newUser) {
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: newUser._id,
                },
            });
        }

        return NextResponse.json({ message: "OK", user: newUser });
    }

    // UPDATE
    if (eventType === "user.updated") {
        let { id, image_url, first_name, last_name, username } = evt.data;

        if (!username) {
            if (first_name || last_name) {
                username = `${first_name} ${last_name}`
            }
            else {
                username = id
            }
        }

        const user = {
            firstName: first_name,
            lastName: last_name,
            username: username,
            photo: image_url,
        };

        const updatedUser = await updateUser(id, user);

        return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // DELETE
    if (eventType === "user.deleted") {
        const { id } = evt.data;

        console.log(`ID: ${id} will be using DB`)
        const deletedUser = await deleteUser(id!);
        console.log("Used DB, DB OK")

        return NextResponse.json({ message: "OK", user: deletedUser });
    }

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log("Webhook body:", body);

    return new Response("", { status: 200 });
}