import fs from 'fs';
import yaml from 'js-yaml';

import { marked } from 'marked';
import { BLOG_BASE, getPermalink } from './permalinks';
import { APP_BLOG } from "astrowind:config"
import type { Category } from '~/types';

export const toMarkdown = async (markdown, options = { bare: false }) => {
  const md = await marked.parse(markdown.trim())
  return options.bare ? removeParagraphTags(md) : md
}

export const removeParagraphTags = (str: string): string => {
  return str.slice(3, -5);
};

export const getCategory = (category: string): Category => APP_BLOG.tlo.categories[category];

export const getMorePosts = (): string => getPermalink([BLOG_BASE, '2'].join('/'));

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
interface Airdate {
  airdate: Date,
  start_time: string,
  end_time: string,
  timezone?: string,
  location: string,
  notes: string | null
}

type Schedule = Airdate[]