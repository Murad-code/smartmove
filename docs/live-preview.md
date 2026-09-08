# Live preview

The admin panel shows the real website beside the editing form, at phone,
tablet and desktop widths. The owner presses the eye icon in the document
header and the page appears; it updates as the document is saved.

Enabled for **Website pages**, **Services**, **Properties** and the **Home
Page**. Everything else, Media, Enquiries, Users, Business Details and Website
Settings, has no page of its own to show.

---

## How live the preview is

That depends on whether the document autosaves, which is a content-model
decision rather than a preview one.

| Content       | Updates            | Why                                                           |
| ------------- | ------------------ | ------------------------------------------------------------- |
| Website pages | As the owner types | Autosaved drafts, roughly every 800ms                         |
| Services      | As the owner types | The same                                                      |
| Properties    | On Save            | No drafts: the Availability field is the only publish control |
| Home Page     | On Save            | A global with no versions, so saving is publishing            |

Properties deliberately have no draft/published split, because a second "is it
live?" switch beside Availability would confuse a non-technical owner. See
[content-model.md](content-model.md). Preview still earns its place there: it
shows a listing whatever its availability, so the owner can look a property
over before setting it to Available.

The preview pane is not available while a document is being created, because
Payload has nothing to build a URL from until the document exists. Pages and
Services autosave, so they exist almost immediately; a property appears in the
pane after the first Save.

---

## How it works

Three pieces:

1. **`admin.livePreview` in `payload.config.ts`** lists the collections and
   globals that get a pane, and maps a document to a website URL. Root-level
   live preview does nothing for an entity that is not in `collections` or
   `globals`, so an omission there is silent in the admin panel. A test in
   `tests/int/live-preview.int.spec.ts` guards the list.

2. **`?preview=true`** on that URL, built by `previewUrl` in
   `src/lib/preview.ts`. The flag asks a page for unpublished content and for
   the listener described below.

3. **`LivePreview`** (`src/components/layout/LivePreview.tsx`), mounted by the
   four previewable routes. It renders a client component that listens for the
   save message the admin panel posts into the iframe and calls
   `router.refresh()`. Rendered only for a signed-in member of staff, so a
   visitor is never sent the JavaScript.

### The flag grants nothing on its own

`?preview=true` is a public query string and is treated as one. What it
actually gets you is decided by the request's own Payload session cookie, in
`src/lib/preview-session.ts`:

- No session, or a session that is not staff: `previewOptions(null)` returns
  the ordinary anonymous query. An unpublished page is still invisible and a
  hidden property is still a 404.
- A signed-in member of staff: the query runs `draft: true` as that user, so
  the newest autosaved version is what the pane shows.

These are the only website queries that do not run anonymously. Everything else
still passes `overrideAccess: false` with no user, as described in
[architecture.md](architecture.md).

`tests/e2e/live-preview.e2e.spec.ts` covers both halves: that an autosaved
edit reaches the pane, and that the same edit is not in the page a signed-out
visitor gets.

### Why refresh-on-save rather than field-by-field updates

Payload also offers a `useLivePreview` hook that pushes form state into the
page without a round trip. Taking it would mean making the previewed pages
client components, which would pull raw Payload documents into
`src/components` and undo the property domain layer. Refreshing on save keeps
every page a server component, and with autosave the difference is not visible
to the owner.

---

## Adding a previewable collection

1. Add its slug to `admin.livePreview.collections` (or `.globals`) and a branch
   to the `url` function in `payload.config.ts`.
2. Mount `<LivePreview enabled={preview} />` in the route that renders it, with
   `preview` from `previewRequested(await searchParams)`.
3. If the content has drafts, thread `previewQuery` into its lookup the way
   `src/lib/pages.ts` does, so the pane shows unpublished work.
4. Extend `tests/int/live-preview.int.spec.ts`.

Step 2 is the one that is easy to forget: without it the pane loads the page
but never refreshes.
