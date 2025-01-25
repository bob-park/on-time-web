import { NextRequest } from 'next/server';

/*
 * api prefix
 */
const API_PREFIX = '/api';

const MOCK_SERVICE_HOST = process.env.MOCK_SERVER_HOST;

export async function middleware(req: NextRequest) {
  const { nextUrl, body, method, headers } = req;
  const { pathname } = nextUrl;

  const requestUrl = pathname.substring(API_PREFIX.length);

  const params = nextUrl.searchParams;

  const result = await apiCall(requestUrl, method, headers, params, body);

  return result;
}

async function apiCall(
  url: string,
  method: string,
  headers: Headers,
  params?: URLSearchParams,
  body?: BodyInit | null,
) {
  const result = await fetch(`${MOCK_SERVICE_HOST}${url}${params ? `?${params}` : ''}`, {
    method,
    headers: {
      'Content-Type': headers.get('Content-Type') || '',
    },
    body,
  });

  return result;
}

export const config = {
  matcher: [],
};
