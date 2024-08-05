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
  let schedule = yaml.load(fs.readFileSync('src/schedule.yaml', 'utf8')) as Schedule
  // Filter out dates in the past
  schedule = schedule.filter((entry) => new Date(entry.end) >= new Date())
  // Clean up for display
  schedule = schedule.map((entry) => {
    // Convert start and end times to dates
    const start = new Date(entry.start)
    const end = new Date(entry.end)
    // Format start string
    const start_string = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: entry.timezone,
    }).format(start).replace(`, ${start.getFullYear()}`, '')
    // Location string dictionary
    const locations = {
      kafm: 'KAFM Community Radio, Grand Junction, CO',
      wfit: 'WFIT, Melbourne, FL',
      ltw: 'Louder Than War Radio, UK'
    }
    return {
      start,
      end,
      start_string,
      location: locations[entry.location],
      notes: entry.notes
    }
  })
  // Only return the next five airdates
  return schedule.slice(0, 5)
}

function firstScheduleItem(): Airdate {
  return loadSchedule()[0] || {
    start_string: 'Unknown!',
    location: 'Also unknown!'
  }
}

function localTimezone(): string {
  return `[${Intl.DateTimeFormat().resolvedOptions().timeZone}]`
}

// export const schedule = loadSchedule()
// export const nextAirdate = firstScheduleItem()
export const localTimeZone = localTimezone()
interface Airdate {
  start: Date,
  end: Date,
  start_string: string,
  location: string,
  timezone?: string,
  notes: string | null
}

type Schedule = Airdate[]