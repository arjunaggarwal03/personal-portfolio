# Local Log media publishing

## Export from Apple Photos

In Photos, select the items, choose **File → Export → Export Unmodified Original**, include filename information if useful, and export into a new local directory. The scanner reads that directory recursively; it never reads the Photos library database.

```bash
npm run log:scan -- /absolute/path/to/export
open .log-workspace/contact-sheet.html
```

The scan hashes every supported photo/video, detects exact duplicates, groups likely Live Photo pairs by directory and basename, reads dimensions/duration, and creates small local previews. Edit `.log-workspace/selection.json`: set `selected` on chosen items, supply alt text/captions, and replace the entry placeholder values. Re-running against identical bytes produces the same item IDs and previews.

No scan uploads data. Originals are never changed. The scanner does not request, retain, or emit GPS or face metadata. The ignored `.log-workspace` does contain absolute local paths and previews, so it should still be treated as private local state.

## Dry run and publish

```bash
npm run log:publish -- .log-workspace/selection.json --dry-run
npm run log:publish -- .log-workspace/selection.json
```

Dry-run validates selected files, dimensions, duration, and alt text and prints the exact provider plan without credentials. Publishing requires the Cloudinary or Mux variables documented in `.env.example`.

Images are rotated, bounded to 2400 px, encoded as WebP, and written without source EXIF before upload. Videos are remuxed with ffmpeg and all container metadata removed before Mux upload. Export privacy still remains the author's responsibility: review both the visual content and any provider-side settings before publishing. Upload IDs derive from content hashes. Three workers run concurrently with exponential retry. `.log-workspace/publish-checkpoints.json` records provider upload stages and complete records, so reruns resume Mux processing and skip completed bytes instead of creating a second asset. The committed catalog is updated only after every selected item is complete.

The tool creates a private draft MDX entry and prints its preview route. If the file already exists, it preserves all hand-written prose and only reports the path; it never overwrites it.

Committed: schemas, catalog records, MDX, source code, SVG fixtures. Not committed: exports, originals, derivatives, thumbnails, selection manifests, checkpoints, credentials, GPS data, or face metadata.
