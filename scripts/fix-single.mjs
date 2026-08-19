// Selepas build satu-fail: tukar <script type="module"> kepada <script> biasa.
// Sebab: pratonton (QuickLook) di iPhone dan sesetengah in-app browser tidak
// menjalankan module script, menyebabkan skrin putih. Bundle satu-fail tiada
// import/export lagi, jadi selamat dijalankan sebagai script biasa.
import fs from "fs";

const file = "dist-single/index.html";
let html = fs.readFileSync(file, "utf8");

if (html.includes("import.meta") || /(^|[;{}\s])await\s/.test(html.split("<script")[0])) {
  console.warn("Amaran: kandungan mungkin memerlukan module script — semakan manual diperlukan.");
}

html = html.replace(/<script type="module" crossorigin>/g, "<script>");
html = html.replace(/<script type="module">/g, "<script>");

// Script biasa TIDAK defer secara automatik — pindahkan bundle ke hujung <body>
// supaya #root sudah wujud sebelum React dijalankan.
const firstScript = html.match(/<script>[\s\S]*?<\/script>/);
if (firstScript && html.indexOf(firstScript[0]) < html.indexOf("<body")) {
  html = html.replace(firstScript[0], "");
  html = html.replace("</body>", `${firstScript[0]}\n</body>`);
}

fs.writeFileSync(file, html);
console.log("fix-single: script module -> script biasa di hujung body ✅");
