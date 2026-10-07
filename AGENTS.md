## Session Notes

Record important learnings from past conversations here so future sessions in this project can recall context. Keep concise and actionable.

- App renamed to **Chronos Focus** (domain: cronosfocus.com, note spelling — no "h" in domain). Web: site/base in `astro.config.mjs` now `https://cronosfocus.com` + `/`, `public/CNAME` added, zustand persist key is `chronos-focus-storage`. Mobile bundle IDs now `com.shubhamlathiyaio.chronosfocus.*`, Dart package `chronos_focus_mobile`. Firebase project is still `zen-task-bc783` — google-services.json package_name was updated locally, so register the new Android app ID in the Firebase console and re-download google-services.json.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
