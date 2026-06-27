import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Prerender the home page at build time (SSG).
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Prerender },

  // Everything else stays client-rendered: admin, membership, and
  // param routes (news/:id, events/:id, ...) that need runtime data/auth.
  { path: '**', renderMode: RenderMode.Client },
];
