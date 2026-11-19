export type RouteName =
  | 'home'
  | 'about'
  | 'academic'
  | 'projects'
  | 'project-detail'
  | 'notes'
  | 'note-detail'
  | 'milestones'
  | 'connect'
  | 'admin'
  | 'not-found';

export interface RouteMatch {
  routeName: RouteName;
  params: Record<string, string>;
  pathname: string;
}

/**
 * Normalizes a raw pathname, stripping trailing slashes except for root
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  // Remove search/hash if present
  const cleaned = path.split('?')[0].split('#')[0];
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    return cleaned.slice(0, -1);
  }
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

/**
 * Pure route matcher that resolves pathnames to route names and extracted parameters.
 */
export function matchRoute(rawPath: string): RouteMatch {
  const pathname = normalizePath(rawPath);

  if (pathname === '/' || pathname === '') {
    return { routeName: 'home', params: {}, pathname: '/' };
  }
  if (pathname === '/about') {
    return { routeName: 'about', params: {}, pathname };
  }
  if (pathname === '/academic') {
    return { routeName: 'academic', params: {}, pathname };
  }
  if (pathname === '/projects') {
    return { routeName: 'projects', params: {}, pathname };
  }
  if (pathname.startsWith('/projects/')) {
    const id = pathname.slice('/projects/'.length).trim();
    if (id) {
      return { routeName: 'project-detail', params: { id }, pathname };
    }
  }
  if (pathname === '/notes') {
    return { routeName: 'notes', params: {}, pathname };
  }
  if (pathname.startsWith('/notes/')) {
    const id = pathname.slice('/notes/'.length).trim();
    if (id) {
      return { routeName: 'note-detail', params: { id }, pathname };
    }
  }
  if (pathname === '/milestones') {
    return { routeName: 'milestones', params: {}, pathname };
  }
  if (pathname === '/connect') {
    return { routeName: 'connect', params: {}, pathname };
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const subpath = pathname.slice('/admin'.length).replace(/^\//, '');
    return { routeName: 'admin', params: { subpath }, pathname };
  }

  return { routeName: 'not-found', params: {}, pathname };
}
