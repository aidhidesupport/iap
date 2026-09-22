// Public assets need the project prefix; next/link adds basePath itself.
export function publicAsset(path: string) {
  return `/iap${path}`;
}
