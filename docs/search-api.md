# Search and language analysis API

All responses use the existing `{ success, message, data, meta }` envelope. Search results contain the existing `PostResponse` objects, ordered by relevance or distance. Only published posts are searchable; draft and hidden posts are excluded from search, public summaries and comment sentiment.

## Endpoints

- `GET /api/search?q=Spring&type=keyword&limit=20`: case-insensitive Unicode token matching; every query token must occur in the post.
- `GET /api/search?q=Spring&type=semantic&limit=20` or `GET /api/search/semantic?q=Spring&limit=20`: TF-IDF vectors and cosine ranking. An unknown query returns an empty list.
- `POST /api/search/document?limit=20`: authenticated multipart upload, field `file`, PDF or DOCX. Extracted text becomes a TF-IDF query against posts.
- `POST /api/search/image?limit=20`: authenticated multipart upload, field `image`, JPEG or PNG. Rank posts that have an image feature index.
- `POST /api/posts/{id}/search-image`: authenticated multipart upload, field `image`. Only the post owner or an administrator can create or replace that post's image index. The image is decoded locally and only its feature vector is stored. This request does not change the visible cover image.
- `GET /api/posts/nearby?lat=10.77&lng=106.69&radius=5&limit=20`: distance in kilometres, nearest first. Latitude must be -90..90, longitude -180..180, radius greater than zero and at most 500 km. Non-finite numbers are rejected.
- `GET /api/posts/{id}/summary?sentences=3`: one to ten selected sentences, with `postId`, `summary`, `sentences` and `algorithm` in `data`.
- `POST /api/nlp/sentiment`: authenticated JSON `{ "text": "Bài viết rất tốt" }`, at most 10,000 characters. Returns `label` (`positive`, `negative`, `neutral`), signed `score` in -1..1, matched positive/negative counts and algorithm identifier.
- `GET /api/posts/{postId}/comments/{commentId}/sentiment`: analyze an existing comment, checking that it belongs to the specified published post.

Query text is required and limited to 1,000 characters. Result limits must be 1..100. Invalid requests return the project's `INVALID_INPUT` response; inaccessible posts return `POST_NOT_FOUND`. Upload endpoints require a bearer token. Public read endpoints do not increment article view counts.

## Image indexing workflow

1. Create an article and upload its visible cover through the normal post/file APIs.
2. Send the source image bytes to `POST /api/posts/{id}/search-image` using the owner's token.
3. Send an image query to `POST /api/search/image`. Only indexed published articles participate. Re-upload to replace the index when the source image changes.

The backend never fetches arbitrary cover URLs. The `post_image_features` table stores one vector per article, with a database foreign key configured to cascade on article deletion. The current development schema is managed by Hibernate, as with the other project entities.

## Algorithms and current limits

These are reproducible reference implementations written in Java, without pretrained models or AI libraries:

- **Lexical similarity:** Unicode normalization, HTML removal, a small Vietnamese/English stop-word list, logarithmic term frequency, smoothed corpus IDF, and cosine similarity. The route retains the planned `semantic` name for compatibility, but this implementation does **not** understand synonyms or produce learned semantic embeddings.
- **Image similarity:** a 32-bin HSV histogram, 16-bin Sobel edge orientation histogram, and three horizontal symmetric GLCM statistics (contrast, energy, homogeneity), sampled on a 64×64 grid. Feature blocks have weights 0.7/0.2/0.1 before cosine comparison. This measures low-level visual similarity, not objects or image captions.
- **Geospatial:** the Haversine great-circle formula, including coordinates across the antimeridian; this is an in-process calculation, not a PostGIS query.
- **Summaries:** sentence TF-IDF cosine graph, weighted TextRank with damping 0.85, dangling-node redistribution and convergence stopping. Selected sentences retain document order. At most the first 100,000 source characters and 200 sentences are analyzed. This is extractive summarization, not generative rewriting.
- **Sentiment:** small, explicit Vietnamese/English positive and negative lexicons with a two-token negation window. The numeric score is a ratio of matches, **not** a probability or confidence estimate. Sarcasm, domain-specific language and complex negation are not reliably understood.

For bounded memory and runtime, text, image and nearby search currently examine the **most recent 2,000 published articles**; text features use up to 20,000 source characters per article. Consequently older articles outside that window will not be returned. The database stores image vectors as text; TF-IDF is recomputed for each request. Persistent pgvector indexing, PostGIS acceleration, larger-corpus pagination and production load testing remain follow-up work. This implementation does not claim those planned infrastructure features are complete.

PDF/DOCX uploads are limited to 5 MiB and 100,000 extracted characters. PDFs are limited to 100 pages; encrypted files and documents that forbid extraction are rejected. PDFBox extracts text; scanned PDFs requiring OCR are unsupported. DOCX processing reads only `word/document.xml` with DTD and external entity resolution disabled, and rejects archives exceeding 200 entries, 5 MiB per decompressed entry or 20 MiB total. Embedded pictures are not interpreted as document text. JPEG/PNG uploads are limited to 5 MiB and 16 million pixels; decoding subsamples large images. A query image is never stored as an uploaded file.

PDF parsing follows the [PDFBox 3 loading API](https://pdfbox.apache.org/3.0/migration.html). Application and reverse-proxy upload limits must be at least 5 MiB for these endpoints to accept the full documented size.

## Verification

`SearchAlgorithmsTest` covers ranking, unseen vocabulary, Vietnamese Unicode, TextRank order/disconnected graphs, negation, Haversine boundaries and visual similarity. `SearchFileReaderTest` covers PDF/DOCX extraction, XML external-entity rejection, archive expansion limits, invalid inputs and PNG decoding. `SearchApplicationServiceTest` covers publication filtering, real radius filtering, ownership authorization and parent-comment consistency.
