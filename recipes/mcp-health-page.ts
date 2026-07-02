import { createServer } from "node:http";

const previewCommand = [
  "npx @tipcli/sdk preview",
  '--sponsor "Neon"',
  '--message "Database branches for every preview deploy."',
  "--url https://neon.tech",
].join(" \\\n  ");

createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>MCP server health</title>
  </head>
  <body>
    <main>
      <h1>MCP server healthy</h1>
      <p>This page is human-visible, so it is an acceptable place to link to a TipCLI preview.</p>
      <pre><code>${previewCommand}</code></pre>
    </main>
  </body>
</html>`);
}).listen(3030, () => {
  console.log("Health page listening on http://localhost:3030");
});
