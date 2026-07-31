# Publishing personal Log media

The publishing tools turn a local Apple Photos export into catalog records and a private Log draft. Originals and previews remain outside Git.

## Scan and select

Export unmodified originals from Photos into a new local directory, then run:

```bash
npm run log:scan -- /absolute/path/to/export
open .log-workspace/contact-sheet.html
```

The scanner reads the export recursively, hashes supported files, detects exact duplicates, pairs likely Live Photos, extracts only the metadata needed for selection, and creates local previews. It does not read the Photos library database or upload anything.

Use the contact sheet to select and order media, choose the cover, and write alt text and captions. Save the resulting selection manifest in `.log-workspace`. Treat that directory as private because it contains previews and local paths.

## Plan and publish

```bash
npm run log:publish -- .log-workspace/selection.json --dry-run
npm run log:publish -- .log-workspace/selection.json
```

Dry run validates every selected item and reports the exact plan without credentials. Publishing reads provider settings from `.env.local`, uploads images through the Cloudinary SDK, and creates resumable direct uploads through the Mux SDK.

The tool strips image metadata, removes video container metadata, and uses content-derived provider IDs. Checkpoints record completed provider stages so a rerun can recover without creating duplicate assets. Catalog and MDX updates use temporary files and atomic renames after every upload succeeds.

The generated Log entry is private. Review its ordering, cover, alt text, captions, and prose locally before changing visibility.

## Repository boundary

Commit source code, schemas, catalog metadata, and reviewed Log MDX. Do not commit originals, generated previews, contact sheets, selection manifests, checkpoints, credentials, or provider exports. Deterministic integration fixtures belong under `tests/fixtures/`, not in the public media catalog.
