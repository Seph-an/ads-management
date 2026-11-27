# Ads Management

A mobile-first landing page for advertising on Facebook, Instagram, and Google. The example shows what a business might get for its ad spend. The enquiry form prepares a WhatsApp message for the visitor to review and send.

## Preview

Open `index.html` directly or serve the directory over HTTP.

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

Then open http://localhost:3000. The static page includes a prebuilt React bundle, so preview and hosting require no installation or build.

## Order inbox demo

Edit the example messages and playback in `src/order-inbox.jsx` and the phone styling in `order-inbox.css`. Rebuild `assets/order-inbox.js` after editing the React source and commit the refreshed bundle with the source changes.

```sh
npm ci
npm run build
```

## Search indexing

Serve this directory at the root of a public HTTPS site so crawlers can reach the landing page and `/robots.txt`. The HTML allows indexing and link following. Add a canonical URL once the production domain is known.

## Photography

The hero depicts an illustrative Nairobi solar equipment shop. The image was generated for this page. The order notification and accompanying SVG use the same illustrative figures as the interactive Meta Ads example.
