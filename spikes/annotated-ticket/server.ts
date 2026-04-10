const port = Number(Bun.env.PORT ?? 8011);
const rootUrl = new URL('./', import.meta.url);

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

const server = Bun.serve({
  port,
  development: true,
  async fetch(request) {
    const requestUrl = new URL(request.url);
    const pathname = normalizePathname(requestUrl.pathname);

    if (!pathname) {
      return new Response('Bad request', { status: 400 });
    }

    const fileUrl = new URL(`.${pathname}`, rootUrl);
    const file = Bun.file(fileUrl);

    if (!(await file.exists())) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    const contentType = contentTypeFor(pathname) || file.type;
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    return new Response(file, { headers });
  },
});

console.log(`Annotated ticket spike listening on http://localhost:${server.port}`);

function normalizePathname(pathname: string) {
  const decoded = decodeURIComponent(pathname);
  const candidate = decoded === '/' ? '/index.html' : decoded;

  if (candidate.includes('\0')) {
    return null;
  }

  const segments = candidate.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '..')) {
    return null;
  }

  return candidate;
}

function contentTypeFor(pathname: string) {
  const extension = pathname.slice(pathname.lastIndexOf('.'));
  return contentTypes.get(extension) ?? null;
}
