import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

function base64ToBytes(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return bytes;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

async function tokenExchange(
  body: URLSearchParams,
): Promise<GoogleTokenResponse> {
  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token endpoint error ${resp.status}: ${text}`);
  }
  return resp.json() as Promise<GoogleTokenResponse>;
}

async function getAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const data = await tokenExchange(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  );
  return data.access_token;
}

async function getDriveAccessToken(
  env: Env,
  userId: string,
): Promise<string | null> {
  const row = await env.DB.prepare(
    "SELECT google_refresh_token FROM users WHERE id = ?",
  )
    .bind(userId)
    .first();
  if (!row?.google_refresh_token) return null;
  return getAccessToken(
    row.google_refresh_token as string,
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  );
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

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySession(cookie: string, secret: string) {
  const [userId, hex] = cookie.split(".");
  if (!userId || !hex) return null;
  const expected = await signSession(userId, secret);
  if (constantTimeEqual(cookie, expected)) return userId;
  return null;
}

async function uploadToDrive(
  accessToken: string,
  base64Data: string,
  mimeType: string,
  filename: string,
): Promise<string | null> {
  const binaryData = base64ToBytes(base64Data);

  const metaResp = await fetch(GOOGLE_DRIVE_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: filename,
      parents: ["appDataFolder"],
    }),
  });
  if (!metaResp.ok) {
    const text = await metaResp.text();
    console.error("Drive metadata create error", metaResp.status, text);
    return null;
  }
  const fileData = await metaResp.json();
  const fileId = fileData.id;
  if (!fileId) return null;

  const uploadResp = await fetch(
    `${GOOGLE_DRIVE_UPLOAD}/${fileId}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mimeType,
      },
      body: binaryData,
    },
  );
  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    console.error("Drive upload error", uploadResp.status, text);
    return null;
  }
  return fileId;
}

async function deleteDriveFile(accessToken: string, fileId: string) {
  await fetch(`${GOOGLE_DRIVE_API}/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
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
        "SELECT * FROM entries WHERE user_id = ? AND id != 'custom_shelves_sync' ORDER BY date DESC",
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

      interface AddEntryData {
        title: string;
        note?: string;
        mood?: string;
        collection?: string;
        tags?: string[];
        place?: string;
        tape?: string;
        rotate?: number;
        date?: string;
        gdriveFileId?: string;
        photoDataUrl?: string;
        photoDataUrls?: string[];
      }

      const data = (await request.json()) as AddEntryData;
      const id = crypto.randomUUID().replace(/-/g, "").substring(0, 8);
      const date = data.date || new Date().toISOString().split("T")[0];
      let gdriveFileId = data.gdriveFileId || null;
      let photoDataUrl = data.photoDataUrl || null;

      const photoUrls =
        data.photoDataUrls || (photoDataUrl ? [photoDataUrl] : []);
      const driveIds: string[] = [];

      if (photoUrls.length > 0) {
        const accessToken = await getDriveAccessToken(env, userId);
        if (accessToken) {
          for (let i = 0; i < photoUrls.length; i++) {
            const urlStr = photoUrls[i];
            if (!urlStr.startsWith("data:image")) continue;

            const matches = urlStr.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const filename = `momentstash_${id}_${date}_${i}.${mimeType.split("/")[1]}`;

              try {
                const fileId = await uploadToDrive(
                  accessToken,
                  base64Data,
                  mimeType,
                  filename,
                );
                if (fileId) driveIds.push(fileId);
              } catch (e) {
                console.error(`Drive upload error for photo ${i}`, e);
              }
            }
          }

          if (driveIds.length > 0) {
            gdriveFileId = driveIds.join(",");
            photoDataUrl = null;
          } else {
            const firstBase64 = photoUrls.find((url) =>
              url.startsWith("data:"),
            );
            if (firstBase64) {
              photoDataUrl = firstBase64;
            }
          }
        } else {
          const firstBase64 = photoUrls.find((url) => url.startsWith("data:"));
          if (firstBase64) {
            photoDataUrl = firstBase64;
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
        const accessToken = await getDriveAccessToken(env, userId);
        if (accessToken) {
          const ids = String(entry.gdrive_file_id).split(",");
          for (const fileId of ids) {
            try {
              await deleteDriveFile(accessToken, fileId.trim());
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

    // 2c. Update entry
    if (path === "/api/entries" && request.method === "PUT") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      interface UpdateEntryData {
        id: string;
        title?: string;
        note?: string;
        mood?: string;
        collection?: string;
        tags?: string[];
        place?: string;
        tape?: string;
        rotate?: number;
        date?: string;
        photoDataUrls?: string[];
      }

      const data = (await request.json()) as UpdateEntryData;
      if (data.title !== undefined) {
        const photoUrls = data.photoDataUrls || [];
        let finalGDriveFileId: string | null = null;
        let finalPhotoDataUrl: string | null = null;

        if (photoUrls.length > 0) {
          const accessToken = await getDriveAccessToken(env, userId);
          if (accessToken) {
            const driveIds: string[] = [];
            let existingDriveIds: string[] = [];
            const existingEntry = await env.DB.prepare(
              "SELECT gdrive_file_id FROM entries WHERE id = ? AND user_id = ?",
            )
              .bind(data.id, userId)
              .first();
            if (existingEntry && existingEntry.gdrive_file_id) {
              existingDriveIds = String(existingEntry.gdrive_file_id)
                .split(",")
                .map((id) => id.trim());
            }

            for (let i = 0; i < photoUrls.length; i++) {
              const urlStr = photoUrls[i];
              if (urlStr.startsWith("data:image")) {
                const matches = urlStr.match(/^data:(image\/\w+);base64,(.+)$/);
                if (matches) {
                  const mimeType = matches[1];
                  const base64Data = matches[2];
                  const dateStr =
                    data.date || new Date().toISOString().split("T")[0];
                  const filename = `momentstash_${data.id}_${dateStr}_${i}.${mimeType.split("/")[1]}`;
                  try {
                    const fileId = await uploadToDrive(
                      accessToken,
                      base64Data,
                      mimeType,
                      filename,
                    );
                    if (fileId) driveIds.push(fileId);
                  } catch (e) {
                    console.error("Drive upload error", e);
                  }
                }
              } else if (urlStr.includes("/api/photo")) {
                try {
                  const urlObj = new URL(urlStr, "http://localhost");
                  const idxStr = urlObj.searchParams.get("index");
                  const idx = idxStr ? parseInt(idxStr, 10) : 0;
                  if (idx >= 0 && idx < existingDriveIds.length) {
                    driveIds.push(existingDriveIds[idx]);
                  }
                } catch (e) {
                  console.error("Error parsing existing photo URL", e);
                }
              }
            }

            if (driveIds.length > 0) {
              finalGDriveFileId = driveIds.join(",");
              finalPhotoDataUrl = null;
            } else {
              const firstBase64 = photoUrls.find((p) => p.startsWith("data:"));
              if (firstBase64) {
                finalPhotoDataUrl = firstBase64;
              }
            }
          } else {
            const firstBase64 = photoUrls.find((p) => p.startsWith("data:"));
            if (firstBase64) {
              finalPhotoDataUrl = firstBase64;
            }
          }
        }

        await env.DB.prepare(
          `UPDATE entries SET title = ?, note = ?, mood = ?, collection_name = ?, tags_json = ?, place = ?, tape = ?, rotate = ?, gdrive_file_id = ?, photoDataUrl = ? WHERE id = ? AND user_id = ?`,
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
            finalGDriveFileId,
            finalPhotoDataUrl,
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

    // 2d. Sync custom empty shelves list
    if (path === "/api/shelves" && request.method === "GET") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const row = await env.DB.prepare(
        "SELECT note FROM entries WHERE user_id = ? AND id = 'custom_shelves_sync'",
      )
        .bind(userId)
        .first<{ note: string }>();

      const shelves = row?.note ? JSON.parse(row.note) : [];
      return new Response(JSON.stringify(shelves), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/api/shelves" && request.method === "POST") {
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const shelves = (await request.json()) as string[];
      const shelvesJson = JSON.stringify(shelves);

      await env.DB.prepare(
        `INSERT INTO entries (id, user_id, title, note, mood, collection_name, tags_json, place, tape, rotate, date, created_at)
         VALUES ('custom_shelves_sync', ?, '__custom_shelves__', ?, '', '', '[]', '', 'pink', 0, '1970-01-01', ?)
         ON CONFLICT(id) DO UPDATE SET note = ?`,
      )
        .bind(userId, shelvesJson, Date.now(), shelvesJson)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Google OAuth Start
    if (path === "/api/auth/google") {
      if (!env.GOOGLE_CLIENT_ID) {
        return new Response("Missing Google Client ID", { status: 500 });
      }

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
      authUrl.searchParams.set(
        "redirect_uri",
        `${url.origin}/api/auth/callback`,
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set(
        "scope",
        "https://www.googleapis.com/auth/drive.appdata profile email",
      );

      return Response.redirect(authUrl.toString(), 302);
    }

    // 4. Google OAuth Callback
    if (path === "/api/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("No code provided", { status: 400 });

      const scope = url.searchParams.get("scope") || "";
      const grantedDrive = scope.includes("drive.appdata");

      const tokens = await tokenExchange(
        new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${url.origin}/api/auth/callback`,
          grant_type: "authorization_code",
        }),
      );

      const userResp = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!userResp.ok) {
        const text = await userResp.text();
        throw new Error(`Userinfo error ${userResp.status}: ${text}`);
      }
      const data = await userResp.json();

      const googleId = data.id || "unknown";
      const email = data.email || "unknown@google.com";
      const name = data.name || "Stash User";

      const existing = await env.DB.prepare(
        "SELECT * FROM users WHERE email = ?",
      )
        .bind(email)
        .first();

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
          "Set-Cookie": `momentstash_session=${sessionString}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`,
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

      await env.DB.prepare("DELETE FROM entries WHERE user_id = ?")
        .bind(userId)
        .run();
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

      const response = new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
      response.headers.set(
        "Set-Cookie",
        "momentstash_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
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
        "momentstash_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
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

      if (
        entry.photoDataUrl &&
        String(entry.photoDataUrl).startsWith("data:")
      ) {
        const matches = String(entry.photoDataUrl).match(
          /^data:(image\/\w+);base64,(.+)$/,
        );
        if (matches) {
          const bytes = base64ToBytes(matches[2]);
          return new Response(bytes, {
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

      const accessToken = await getDriveAccessToken(env, userId);
      if (!accessToken) return new Response("No Drive auth", { status: 401 });

      const driveResp = await fetch(
        `${GOOGLE_DRIVE_API}/${targetFileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!driveResp.ok) {
        const text = await driveResp.text();
        throw new Error(`Drive fetch error ${driveResp.status}: ${text}`);
      }

      return new Response(driveResp.body, {
        headers: {
          "Content-Type": driveResp.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new Response("API route not found", { status: 404 });
  } catch (err: unknown) {
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
