import fs from 'fs';
import yaml from 'js-yaml';

import type { Category, Newsletter } from '~/types';
import type { PaginateFunction } from 'astro';

import { marked } from 'marked';
import { APP_BLOG } from "astrowind:config"
import { getCollection, type CollectionEntry } from 'astro:content';

import { cleanSlug } from './permalinks';
import { BLOG_BASE, getPermalink } from './permalinks';
import { generatePermalink } from './blog';

// Utility Functions

export const toMarkdown = async (markdown, options = { bare: false }) => {
  const md = await marked.parse(markdown.trim())
  return options.bare ? removeParagraphTags(md) : md
}

export const removeParagraphTags = (str: string): string => {
  return str.slice(3, -5);
};

export const getCategory = (category: string): Category => APP_BLOG.tlo.categories[category];

export const getMorePosts = (): string => getPermalink([BLOG_BASE, '2'].join('/'));

// Schedule Stuff

function loadSchedule(): Schedule {
  // Load entire schedule
  const schedule = yaml.load(fs.readFileSync('src/schedule.yaml', 'utf8')) as Schedule
  return schedule.slice(0, 15)
}

function localTimezone(): string {
  return `[${Intl.DateTimeFormat().resolvedOptions().timeZone}]`
}

export const schedule = loadSchedule()
export const localTimeZone = localTimezone()

// Newsletter Stuff

const loadNewsletters = async function (): Promise<Array<Newsletter>> {
  const newsletters = await getCollection('newsletter');
  const normalizedNewsletters = newsletters.map(async (newsletter) => await getNormalizedNewsletter(newsletter));

  const results = (await Promise.all(normalizedNewsletters))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())

  return results;
};

let _newsletters: Array<Newsletter>;

export const getStaticPathsNewsletterIndex = async ({ paginate }: { paginate: PaginateFunction }) => {
  // Fetch all newsletters
  const newsletters = await fetchNewsletters();

  // Paginate the newsletters
  return paginate(
    newsletters, {
      params: { newsletter: 'newsletters' },
      pageSize: 10,
    }
  );
};

export const getStaticPathsNewsletter = async () => {
  return (await fetchNewsletters()).flatMap((newsletter) => ({
    params: {
      newsletter: newsletter.permalink,
    },
    props: { newsletter },
  }));
};

export const fetchNewsletters = async (): Promise<Array<Newsletter>> => {
  if (!_newsletters) {
    _newsletters = await loadNewsletters();
  }
  return _newsletters;
};

const getNormalizedNewsletter = async (post: CollectionEntry<'newsletter'>): Promise<Newsletter> => {
  const { id, slug: rawSlug = '', data } = post;
  // const { Content, remarkPluginFrontmatter } = await post.render();
  const { Content } = await post.render();

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt: rawExcerpt,
    image,
    tags: rawTags = [],
    author,
    issue,
    metadata = {},
    // TLO
    newsletter,
  } = data;

  const slug = cleanSlug(rawSlug); // cleanSlug(rawSlug.split('/').pop());
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  // TLO

  const excerpt = await toMarkdown(rawExcerpt, { bare: true });

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id, slug, publishDate, category: 'newsletters' }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    tags: tags,
    author: author,

    metadata,

    Content: Content,
    // or 'content' in case you consume from API

    // readingTime: remarkPluginFrontmatter?.readingTime,

    // TLO
    issue,
    newsletter,
  };
};

interface Airdate {
  airdate: Date,
  start_time: string,
  end_time: string,
  timezone?: string,
  location: string,
  notes: string | null
}

type Schedule = Airdate[]
