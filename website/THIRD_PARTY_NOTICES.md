# Third-party notices

The IAP Codex distribution uses Node standard libraries and its own local modules. Node and Codex are not redistributed.

The website retains its original dependency terms. This list records the installed direct dependencies; transitive packages are pinned in website/package-lock.json and retain their own notices.

| Package | Version | Declared license |
|---|---|---|
| @base-ui/react | 1.7.0 | MIT |
| @cloudflare/vite-plugin | 1.37.1 | MIT |
| @cloudflare/workers-types | 4.20260515.1 | MIT OR Apache-2.0 |
| @openai/sites-vite-plugin | 0.2.0 | MIT |
| @shadcn/react | 0.3.0 | MIT |
| @tailwindcss/postcss | 4.2.1 | MIT |
| @types/node | 22.19.19 | MIT |
| @types/react | 19.2.14 | MIT |
| @types/react-dom | 19.2.3 | MIT |
| @vitejs/plugin-react | 6.0.2 | MIT |
| @vitejs/plugin-rsc | 0.5.26 | MIT |
| class-variance-authority | 0.7.1 | Apache-2.0 |
| clsx | 2.1.1 | MIT |
| cmdk | 1.1.1 | MIT |
| date-fns | 4.1.0 | MIT |
| embla-carousel-react | 8.5.2 | MIT |
| input-otp | 1.4.2 | MIT |
| lucide-react | 1.31.0 | ISC |
| oxfmt | 0.61.0 | MIT |
| oxlint | 1.76.0 | MIT |
| oxlint-tsgolint | 7.0.2001 | MIT |
| react | 19.2.6 | MIT |
| react-day-picker | 9.8.1 | MIT |
| react-dom | 19.2.6 | MIT |
| react-resizable-panels | 4.5.8 | MIT |
| react-server-dom-webpack | 19.2.6 | MIT |
| recharts | 3.8.0 | MIT |
| shadcn | 4.18.0 | MIT |
| tailwind-merge | 3.6.0 | MIT |
| tailwindcss | 4.2.1 | MIT |
| tw-animate-css | 1.4.0 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| vinext | 1.0.0-beta.5 | MIT |
| vite | 8.0.13 | MIT |
| wrangler | 4.92.0 | MIT OR Apache-2.0 |

Vendored UI components, use-mobile.ts and utils.ts originate from the shadcn-based starter; preserve [the MIT license](LICENSE-shadcn-MIT.txt). License texts from installed packages are collected in [LICENSES-dependencies.txt](LICENSES-dependencies.txt). Packages not installed on this platform must retain their licenses when installed on another platform.

Lucide includes ISC and MIT notices, both retained in the collected text. No third-party font files are bundled. macOS system speech is excluded from the current public demo; see [PROVENANCE.md](PROVENANCE.md).

Sites scaffolding and configuration retain their original terms and are not claimed as exclusively authored by this project. The IAP-specific Apache license scope is enumerated in [LICENSE.md](LICENSE.md).

## Demo background music (2026-09-24)

"Inspired" Kevin MacLeod (incompetech.com)
Licensed under [Creative Commons: By Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

- [Original track](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600022) (ISRC USUAN1600022)
- [Licensing information](https://incompetech.com/music/royalty-free/licenses/)
- Changes: first 99 seconds, volume adjustment (target -24 LUFS), 1.5-second fade-in, 5-second fade-out, AAC conversion and synchronization with the IAP demo.
- The soundtrack contains only this instrumental music. It contains no narration or macOS system speech.
- The music remains Kevin MacLeod's work under CC BY 4.0; it is not IAP-authored music. Keep its credit and license when sharing the video.
