/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  ANTHROPIC_API_KEY: string;
  AIRTABLE_API_KEY: string;
  AIRTABLE_BASE_ID: string;
}
