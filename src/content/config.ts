import { z, defineCollection } from 'astro:content';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  schema: z.object({
    // Publishing
    draft: z.boolean().optional(),
    category: z.string().optional(),
    publishDate: z.coerce.date().optional(),
    updateDate: z.date().optional(),

    // Listing
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().optional(),
    excerpt: z.string(),
    tags: z.array(z.string()).optional(),

    // Feature Image
    image: z.string().optional(),
    caption: z.string().optional(),
    // TODO: Badge images

    // Playlists
		airdate: z.string().optional(),
		playlist: z.array(z.object({
      sequence: z.number(),
			song: z.string(),
			artist: z.string().optional(),
			artist_slug: z.string().optional(),
			album: z.string().nullish().optional(),
			time: z.string().nullish().optional(),
			notes: z.string().nullish().optional()
		})).optional(),
    
    // Media
    mixcloud: z.string().optional(),
    youtube: z.string().optional(),

    // Metadata
    metadata: metadataDefinition()
  }),
});

export const collections = {
  post: postCollection,
};
