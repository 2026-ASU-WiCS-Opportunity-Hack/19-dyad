import { getRouteHandlers } from "@propelauth/nextjs/server/app-router";
import type { NextRequest } from "next/server";

const POST_LOGIN_REDIRECT_COOKIE = "wial-post-login-redirect";

function sanitizeRedirectPath(value: string | undefined) {
  if (!value || !value.startsWith("/")) {
    return "/admin";
  }
  return value;
}

const routeHandlers = getRouteHandlers({
  postLoginRedirectPathFn: (request: NextRequest) => {
    const redirectPath = request.cookies.get(POST_LOGIN_REDIRECT_COOKIE)?.value;
    return sanitizeRedirectPath(redirectPath);
  }
});

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return routeHandlers.getRouteHandler(request, { params: await context.params });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return routeHandlers.postRouteHandler(request, { params: await context.params });
}
