import type { D1Database } from "@cloudflare/workers-types";
import { google } from "googleapis";

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export async function handleApiRequest(
  request: Request,
  env: Env,
  ctx: unknown
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // 1. Get entries
    if (path === "/api/entries" && request.method === "GET") {
      const userId = url.searchParams.get("userId") || "default-user";
      
      const { results } = await env.DB.prepare(
        "SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC"
      )
        .bind(userId)
        .all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Add entry (supports Google Drive photo upload logic stub)
    if (path === "/api/entries" && request.method === "POST") {
      const data = await request.json() as any;
      
      const id = Math.random().toString(36).substring(2, 10);
      const userId = "default-user"; // session based in future
      const date = data.date || new Date().toISOString().split("T")[0];
      const gdriveFileId = data.gdriveFileId || null;

      await env.DB.prepare(
        `INSERT INTO entries (id, user_id, title, note, mood, collection_name, tags_json, place, tape, rotate, date, gdrive_file_id, created_at, photoDataUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          userId,
          data.title,
          data.note || "",
          data.mood || "",
          data.collection || "Tiny Joys",
          JSON.stringify(data.tags || []),
          data.place || "",
          data.tape || "yellow",
          data.rotate || 0,
          date,
          gdriveFileId,
          Date.now(),
          data.photoDataUrl || null
        )
        .run();

      return new Response(JSON.stringify({ success: true, id }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2b. Delete entry
    if (path === "/api/entries" && request.method === "DELETE") {
      const id = url.searchParams.get("id");
      await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 2c. Update entry (for moving to a shelf)
    if (path === "/api/entries" && request.method === "PUT") {
      const data = await request.json() as any;
      await env.DB.prepare("UPDATE entries SET collection_name = ? WHERE id = ?")
        .bind(data.collection, data.id)
        .run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 3. Google OAuth Start
    if (path === "/api/auth/google") {
      if (!env.GOOGLE_CLIENT_ID) {
        return new Response("Missing Google Client ID", { status: 500 });
      }
      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        `${url.origin}/api/auth/callback`
      );

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/drive.file", "profile", "email"],
      });

      return Response.redirect(authUrl, 302);
    }

    // 4. Google OAuth Callback
    if (path === "/api/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("No code provided", { status: 400 });

      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        `${url.origin}/api/auth/callback`
      );

      const { tokens } = await oauth2Client.getToken(code);
      
      // Here you would look up the Google user profile and save the tokens to D1.
      // For this implementation, we will redirect back to the app.
      
      return Response.redirect(`${url.origin}/?auth_success=true`, 302);
    }

    return new Response("API route not found", { status: 404 });
  } catch (err: any) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
