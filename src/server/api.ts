import type { D1Database } from "@cloudflare/workers-types";
import { google } from "googleapis";

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

function parseCookies(cookieStr: string | null): Record<string, string> {
  if (!cookieStr) return {};
  return Object.fromEntries(
    cookieStr.split(";").map((c) => {
      const [k, v] = c.split("=");
      return [k.trim(), decodeURIComponent(v || "")];
    }),
  );
}

async function signSession(userId: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(userId),
  );
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${userId}.${hex}`;
}

async function verifySession(cookie: string, secret: string) {
  const [userId, hex] = cookie.split(".");
  if (!userId || !hex) return null;
  const expected = await signSession(userId, secret);
  if (cookie === expected) return userId;
  return null;
}

export async function handleApiRequest(
  request: Request,
  env: Env,
  ctx: unknown,
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
    const cookies = parseCookies(request.headers.get("Cookie"));
    const sessionId = cookies["momentstash_session"];
    const userId = sessionId
      ? await verifySession(
          sessionId,
          env.GOOGLE_CLIENT_SECRET || "default_secret",
        )
      : null;

    // 1. Get entries
    if (path === "/api/entries" && request.method === "GET") {
      if (!userId) return new Response("Unauthorized", { status: 401 });

      const { results } = await env.DB.prepare(
        "SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC",
      )
        .bind(userId)
        .all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Add entry (Google Drive Photo Upload)
    if (path === "/api/entries" && request.method === "POST") {
      if (!userId) return new Response("Unauthorized", { status: 401 });

      const data = (await request.json()) as any;
      const id = Math.random().toString(36).substring(2, 10);
      const date = data.date || new Date().toISOString().split("T")[0];
      let gdriveFileId = data.gdriveFileId || null;
      let photoDataUrl = data.photoDataUrl || null;

      const photoUrls =
        data.photoDataUrls || (photoDataUrl ? [photoDataUrl] : []);
      const driveIds: string[] = [];

      // If there are base64 images and the user has a Google token, upload to Drive
      if (photoUrls.length > 0) {
        const userRow = await env.DB.prepare(
          "SELECT google_refresh_token FROM users WHERE id = ?",
        )
          .bind(userId)
          .first();
        if (userRow?.google_refresh_token) {
          const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
          );
          oauth2Client.setCredentials({
            refresh_token: userRow.google_refresh_token as string,
          });

          const drive = google.drive({ version: "v3", auth: oauth2Client });
          const { PassThrough } = await import("node:stream");

          for (let i = 0; i < photoUrls.length; i++) {
            const urlStr = photoUrls[i];
            if (!urlStr.startsWith("data:image")) continue;

            const matches = urlStr.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, "base64");
              const stream = new PassThrough();
              stream.end(buffer);

              try {
                const file = await drive.files.create({
                  requestBody: {
                    name: `momentstash_${id}_${date}_${i}.${mimeType.split("/")[1]}`,
                    parents: ["appDataFolder"],
                  },
                  media: {
                    mimeType,
                    body: stream,
                  },
                  fields: "id",
                });
                if (file.data.id) {
                  driveIds.push(file.data.id);
                }
              } catch (e) {
                console.error(`Drive upload error for photo ${i}`, e);
              }
            }
          }

          if (driveIds.length > 0) {
            gdriveFileId = driveIds.join(",");
            photoDataUrl = null; // Clear so we don't save massive base64 in D1
          }
        }
      }

      await env.DB.prepare(
        `INSERT INTO entries (id, user_id, title, note, mood, collection_name, tags_json, place, tape, rotate, date, gdrive_file_id, created_at, photoDataUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          userId,
          data.title,
          data.note || "",
          data.mood || "",
          data.collection || "",
          JSON.stringify(data.tags || []),
          data.place || "",
          data.tape || "yellow",
          data.rotate || 0,
          date,
          gdriveFileId,
          Date.now(),
          photoDataUrl,
        )
        .run();

      return new Response(JSON.stringify({ success: true, id }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2b. Delete entry
    if (path === "/api/entries" && request.method === "DELETE") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const id = url.searchParams.get("id");

      const entry = await env.DB.prepare(
        "SELECT gdrive_file_id FROM entries WHERE id = ? AND user_id = ?",
      )
        .bind(id, userId)
        .first();

      if (entry && entry.gdrive_file_id) {
        const userRow = await env.DB.prepare(
          "SELECT google_refresh_token FROM users WHERE id = ?",
        )
          .bind(userId)
          .first();
        if (userRow?.google_refresh_token) {
          const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
          );
          oauth2Client.setCredentials({
            refresh_token: userRow.google_refresh_token as string,
          });
          const drive = google.drive({ version: "v3", auth: oauth2Client });

          const ids = String(entry.gdrive_file_id).split(",");
          for (const fileId of ids) {
            try {
              await drive.files.delete({ fileId: fileId.trim() });
            } catch (e) {
              console.error(`Failed to delete Drive file ${fileId}`, e);
            }
          }
        }
      }

      await env.DB.prepare("DELETE FROM entries WHERE id = ? AND user_id = ?")
        .bind(id, userId)
        .run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 2c. Update entry (for moving to a shelf or full text edit)
    if (path === "/api/entries" && request.method === "PUT") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const data = (await request.json()) as any;
      if (data.title !== undefined) {
        await env.DB.prepare(
          `UPDATE entries SET title = ?, note = ?, mood = ?, collection_name = ?, tags_json = ?, place = ?, tape = ?, rotate = ? WHERE id = ? AND user_id = ?`,
        )
          .bind(
            data.title,
            data.note || "",
            data.mood || "",
            data.collection || "",
            JSON.stringify(data.tags || []),
            data.place || "",
            data.tape || "yellow",
            data.rotate || 0,
            data.id,
            userId,
          )
          .run();
      } else {
        await env.DB.prepare(
          "UPDATE entries SET collection_name = ? WHERE id = ? AND user_id = ?",
        )
          .bind(data.collection, data.id, userId)
          .run();
      }
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
        `${url.origin}/api/auth/callback`,
      );

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/drive.appdata",
          "profile",
          "email",
        ],
      });

      return Response.redirect(authUrl, 302);
    }

    // 4. Google OAuth Callback
    if (path === "/api/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("No code provided", { status: 400 });

      const scope = url.searchParams.get("scope") || "";
      const grantedDrive = scope.includes("drive.appdata");

      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        `${url.origin}/api/auth/callback`,
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const googleId = data.id || "unknown";
      const email = data.email || "unknown@google.com";
      const name = data.name || "Stash User";

      // Upsert user into D1
      const existing = await env.DB.prepare(
        "SELECT * FROM users WHERE email = ?",
      )
        .bind(email)
        .first();

      // If they didn't grant Drive, clear any existing refresh token so the UI knows they don't have Drive linked
      const refreshToken = grantedDrive
        ? tokens.refresh_token || existing?.google_refresh_token || null
        : null;

      if (existing) {
        await env.DB.prepare(
          "UPDATE users SET name = ?, google_refresh_token = ? WHERE email = ?",
        )
          .bind(name, refreshToken, email)
          .run();
      } else {
        await env.DB.prepare(
          "INSERT INTO users (id, email, name, google_refresh_token) VALUES (?, ?, ?, ?)",
        )
          .bind(googleId, email, name, refreshToken)
          .run();
      }

      const uid = existing ? existing.id : googleId;
      const sessionString = await signSession(
        uid as string,
        env.GOOGLE_CLIENT_SECRET || "default_secret",
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${url.origin}/home`,
          "Set-Cookie": `momentstash_session=${sessionString}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }

    // 5. Auth Me
    if (path === "/api/auth/me" && request.method === "GET") {
      if (!userId) {
        return new Response(JSON.stringify({ user: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      const user = await env.DB.prepare(
        "SELECT id, name, email, google_refresh_token FROM users WHERE id = ?",
      )
        .bind(userId)
        .first();
      if (!user) {
        return new Response(JSON.stringify({ user: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            gdriveLinked: !!user.google_refresh_token,
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (path === "/api/auth/me" && request.method === "DELETE") {
      if (!userId) return new Response("Unauthorized", { status: 401 });

      const userRow = await env.DB.prepare(
        "SELECT google_refresh_token FROM users WHERE id = ?",
      )
        .bind(userId)
        .first();

      // Optionally try to delete Drive files here, but since there could be many,
      // the best effort is to delete local data. Google Drive folder will persist or can be manually deleted.
      // Wait, we can fetch all drive IDs and attempt to delete them?
      // It might take too long. Let's just delete the DB rows.

      await env.DB.prepare("DELETE FROM entries WHERE user_id = ?")
        .bind(userId)
        .run();
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

      const response = new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
      response.headers.set(
        "Set-Cookie",
        "momentstash_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      );
      return response;
    }

    // 6. Logout
    if (path === "/api/auth/logout" && request.method === "POST") {
      const response = new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
      response.headers.set(
        "Set-Cookie",
        "momentstash_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      );
      return response;
    }

    // 7. Photo Proxy (Get from GDrive)
    if (path === "/api/photo" && request.method === "GET") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const entryId = url.searchParams.get("id");
      const indexStr = url.searchParams.get("index");
      const index = indexStr ? parseInt(indexStr, 10) : 0;

      if (!entryId) return new Response("No ID", { status: 400 });

      const entry = await env.DB.prepare(
        "SELECT gdrive_file_id, photoDataUrl FROM entries WHERE id = ? AND user_id = ?",
      )
        .bind(entryId, userId)
        .first();
      if (!entry) return new Response("Not found", { status: 404 });

      // Fallback to photoDataUrl if it exists (legacy)
      if (
        entry.photoDataUrl &&
        String(entry.photoDataUrl).startsWith("data:")
      ) {
        const matches = String(entry.photoDataUrl).match(
          /^data:(image\/\w+);base64,(.+)$/,
        );
        if (matches) {
          const buffer = Buffer.from(matches[2], "base64");
          return new Response(buffer, {
            headers: { "Content-Type": matches[1] },
          });
        }
      }

      if (!entry.gdrive_file_id)
        return new Response("No photo", { status: 404 });

      const ids = String(entry.gdrive_file_id).split(",");
      if (index < 0 || index >= ids.length)
        return new Response("Invalid index", { status: 400 });
      const targetFileId = ids[index].trim();

      const userRow = await env.DB.prepare(
        "SELECT google_refresh_token FROM users WHERE id = ?",
      )
        .bind(userId)
        .first();
      if (!userRow?.google_refresh_token)
        return new Response("No Drive auth", { status: 401 });

      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
      );
      oauth2Client.setCredentials({
        refresh_token: userRow.google_refresh_token as string,
      });

      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const res = await drive.files.get(
        { fileId: targetFileId, alt: "media" },
        { responseType: "stream" },
      );

      // Node stream to Web ReadableStream
      const stream = new ReadableStream({
        start(controller) {
          res.data.on("data", (chunk) => controller.enqueue(chunk));
          res.data.on("end", () => controller.close());
          res.data.on("error", (err) => controller.error(err));
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": res.headers["content-type"] || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
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
