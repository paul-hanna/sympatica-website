import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    artist: z.string().optional(),
    director: z.string(),
    category: z.enum(['commercial', 'music-video']),
    year: z.number().int().min(2000).max(2100),
    youtube_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'Must be an 11-char YouTube video ID, not a URL'),
    preview_clip: z.string().startsWith('/', 'Must be an absolute path under /public'),
    poster: z.string().startsWith('/', 'Must be an absolute path under /public'),
    stills: z.array(z.string().startsWith('/', 'Must be an absolute path under /public')).optional(),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).optional(),
    order: z.number().int().default(100),
  }).superRefine((data, ctx) => {
    if (data.category === 'commercial' && !data.client) {
      ctx.addIssue({ code: 'custom', message: 'Commercials require client', path: ['client'] });
    }
    if (data.category === 'music-video' && !data.artist) {
      ctx.addIssue({ code: 'custom', message: 'Music videos require artist', path: ['artist'] });
    }
  }),
});

const directors = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/directors' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    order: z.number().int().default(100),
  }),
});

const featured = defineCollection({
  loader: file('content/site/featured.json'),
  schema: z.object({
    id: z.string(),
    slugs: z.array(z.string()).min(1).max(5),
  }),
});

const contact = defineCollection({
  loader: file('content/site/contact.json'),
  schema: z.object({
    id: z.string(),
    email: z.string().email(),
    city: z.string(),
    typeform_id: z.string(),
  }),
});

export const collections = { projects, directors, featured, contact };
