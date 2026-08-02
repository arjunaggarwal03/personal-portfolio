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

Live Photos retain a pair ID in the manifest. The contact sheet presents the still and motion clip with that shared label. Select the still, motion clip, or both deliberately. Publishing never expands a pair automatically or treats the two files as unrelated discoveries.

## Plan and publish

```bash
npm run log:publish -- .log-workspace/selection.json --dry-run
npm run log:publish -- .log-workspace/selection.json
```

Dry run validates every selected item and reports the exact plan without credentials. Publishing reads provider settings from `.env.local`, uploads images through the Cloudinary SDK, and creates resumable direct uploads through the Mux SDK.

The tool strips image metadata, removes video container metadata, and uses content-derived provider IDs. Checkpoints record completed provider stages so a rerun can recover without creating duplicate assets. Catalog and MDX updates use temporary files and atomic renames after every upload succeeds.

The generated Log entry defaults to private. Review its ordering, cover, alt text, captions, and prose locally before choosing a broader visibility.

## Recovery

`.log-workspace/publish-checkpoints.json` is the recovery record. It can contain Cloudinary records, Mux upload IDs, signed Mux upload URLs, acknowledged byte counts, and completed catalog records. Keep it private.

- If Cloudinary accepts an image and a later step fails, rerunning uses the same content-derived public ID. A provider conflict triggers an SDK lookup of the existing image instead of uploading a duplicate.
- If Mux has created an upload but bytes or processing are incomplete, rerunning retrieves the same upload, resumes after the acknowledged byte range, and waits for the existing asset.
- If every provider operation completed but repository files were not written, completed checkpoint records let a rerun regenerate the catalog and MDX without uploading bytes again.
- If the catalog was written but the MDX rename failed, the matching completed checkpoints make the catalog records safe to reuse on the next run.
- An existing MDX target or an unexplained catalog ID collision is a conflict. The publisher reports it before contacting a provider and does not overwrite the file.

To abandon a partial Mux operation, record its upload ID, cancel or delete it in the Mux dashboard as appropriate, then remove only that hash entry from the local checkpoint before retrying. Cloudinary partials use content-derived IDs and can be inspected or removed in the Cloudinary dashboard. Never delete the whole checkpoint until every partial provider operation has been reviewed.

## Repository boundary

Commit source code, schemas, catalog metadata, and reviewed Log MDX. Do not commit originals, generated previews, contact sheets, selection manifests, checkpoints, credentials, or provider exports. Deterministic integration fixtures belong under `tests/fixtures/`, not in the public media catalog.
