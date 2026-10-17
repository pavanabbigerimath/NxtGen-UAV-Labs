import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { checkRateLimit, clientIdentifier, type TierName } from "./rate-limit";

/** Uniform JSON envelope for every API route. */
export type ApiError = {
  error: string;
  code: string;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit & { status?: number }) {
  return NextResponse.json({ data, success: true }, { status: init?.status ?? 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ data, success: true }, { status: 201 });
}

export function fail(message: string, status = 400, code = "bad_request", details?: unknown) {
  return NextResponse.json<ApiError>({ error: message, code, details }, { status });
}

export const unauthorized = () => fail("Authentication required.", 401, "unauthorized");
export const forbidden = (msg = "You do not have permission to perform this action.") =>
  fail(msg, 403, "forbidden");
export const notFound = (what = "Resource") => fail(`${what} not found.`, 404, "not_found");
export const tooMany = (reset: number) =>
  NextResponse.json<ApiError>(
    { error: "Too many requests. Please slow down.", code: "rate_limited" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
        "X-RateLimit-Reset": String(reset)
      }
    }
  );

/**
 * Rate-limit gate for a route handler.
 * Returns a 429 NextResponse when the caller is over budget, otherwise null.
 */
export async function guardRateLimit(
  tier: TierName,
  req: Request,
  userId?: string | null
): Promise<NextResponse | null> {
  const result = await checkRateLimit(tier, clientIdentifier(req, userId));
  if (!result.success) return tooMany(result.reset);
  return null;
}

/** Parse + validate a JSON body, converting Zod failures into 422s. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<
  { ok: true; data: T } | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: fail("Request body must be valid JSON.", 400, "invalid_json") };
  }

  try {
    return { ok: true, data: schema.parse(raw) };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        response: fail("Validation failed.", 422, "validation_error", error.flatten().fieldErrors)
      };
    }
    throw error;
  }
}

export function handleRouteError(error: unknown, context: string) {
  console.error(`[api:${context}]`, error);
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error." : String((error as Error)?.message ?? error);
  return fail(message, 500, "internal_error");
}

/** Cursor/offset pagination helpers. */
export function getPagination(url: URL, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(url.searchParams.get("limit") ?? defaultLimit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}
