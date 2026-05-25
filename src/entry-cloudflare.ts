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

let lastSsrError: unknown = undefined;
const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (args[0] instanceof Error || (args[0] && typeof args[0] === "object" && "message" in (args[0] as Record<string, unknown>))) {
    lastSsrError = args[0];
  }
  originalConsoleError(...args);
};

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

      interface ServerHandler {
        (
          request: Request,
          env: Env,
          ctx: unknown,
        ): Promise<Response> | Response;
        fetch?: (
          request: Request,
          env: Env,
          ctx: unknown,
        ) => Promise<Response> | Response;
        default?: {
          fetch?: (
            request: Request,
            env: Env,
            ctx: unknown,
          ) => Promise<Response> | Response;
        };
      }

      const handler = serverHandler as unknown as ServerHandler;

      let response: Response;
      if (typeof handler === "function") {
        response = await handler(request, env, ctx);
      } else if (handler && typeof handler.fetch === "function") {
        response = await handler.fetch(request, env, ctx);
      } else if (
        handler &&
        handler.default &&
        typeof handler.default.fetch === "function"
      ) {
        response = await handler.default.fetch(request, env, ctx);
      } else {
        throw new Error(
          "Unable to find fetch handler on imported server module",
        );
      }

      if (response.status >= 500) {
        const body = await response.clone().text();
        const captured = lastSsrError;
        const detail = captured instanceof Error
          ? { message: captured.message, stack: captured.stack }
          : { raw: String(captured) };
        console.error("SSR error response:", body.slice(0, 1000));
        return new Response(
          JSON.stringify({
            error: "SSR returned error status",
            status: response.status,
            captured: detail,
            body: body.slice(0, 2000),
          }),
          {
            status: 500,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : "";
      return new Response(JSON.stringify({ error: msg, stack }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
