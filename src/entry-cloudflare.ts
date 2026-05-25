import serverHandler from "../dist/server/server.js";
import { handleApiRequest, type Env } from "./server/api";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(
  body: string,
  responseStatus: number,
): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: Env, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env, ctx);
      }

      let response: Response;
      if (typeof serverHandler === "function") {
        response = await (serverHandler as any)(request, env, ctx);
      } else if (
        serverHandler &&
        typeof (serverHandler as any).fetch === "function"
      ) {
        response = await (serverHandler as any).fetch(request, env, ctx);
      } else if (
        serverHandler &&
        (serverHandler as any).default &&
        typeof (serverHandler as any).default.fetch === "function"
      ) {
        response = await (serverHandler as any).default.fetch(
          request,
          env,
          ctx,
        );
      } else {
        throw new Error(
          "Unable to find fetch handler on imported server module",
        );
      }

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
