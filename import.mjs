/**
 * Moto Vasić - Full Product Import Script
 * Supabase: sfglamzkxetrhcfbthhb.supabase.co
 *
 * Run: $env:SUPABASE_SERVICE_KEY="eyJ..." ; node import.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// ─── CONFIG ──────────────────────────────────────────────────
const SUPABASE_URL        = "https://sfglamzkxetrhcfbthhb.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const STORAGE_BUCKET      = "product-images";
const CSV_PATH            = "./products.csv";
const CONCURRENCY         = 5;
const SKIP_EXISTING_IMAGES = true;
// ─────────────────────────────────────────────────────────────

if (!SUPABASE_SERVICE_KEY) {
  console.error("\n❌  SUPABASE_SERVICE_KEY nije setovan!");
  console.error('    $env:SUPABASE_SERVICE_KEY="eyJ..." ; node import.mjs\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── HELPERS ─────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`[${new Date().toISOString().slice(11,19)}] ${msg}\n`);
}

function parsePrice(raw) {
  if (!raw) return 0;
  const match = String(raw).match(/[\d.,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/\./g, "").replace(",", "."), 10) || 0;
}

function slugify(text) {
  const map = { č:"c",ć:"c",š:"s",ž:"z",đ:"dj",Č:"c",Ć:"c",Š:"s",Ž:"z",Đ:"dj" };
  return text
    .replace(/[čćšžđČĆŠŽĐ]/g, m => map[m] || m)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function urlToStoragePath(url) {
  try {
    const u = new URL(url);
    const afterUploads = u.pathname.split("/wp-content/uploads/")[1];
    if (!afterUploads) return `products/${path.basename(u.pathname)}`;
    return `products/${afterUploads.replace(/\//g, "-")}`;
  } catch {
    return `products/${path.basename(url)}`;
  }
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; import-bot/1.0)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToStorage(buffer, storagePath, contentType = "image/jpeg") {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function pLimit(tasks, concurrency) {
  const queue = [...tasks];
  const workers = Array(Math.min(concurrency, queue.length)).fill(null).map(async () => {
    while (queue.length) await queue.shift()();
  });
  await Promise.all(workers);
}

// ─── STEP 1: BUCKET (već kreiran ručno, samo log) ────────────
async function ensureBucket() {
  log(`✓ Bucket '${STORAGE_BUCKET}' - kreiran ručno, nastavljam...`);
}

// ─── STEP 2: CLEAR ───────────────────────────────────────────
async function clearExistingData() {
  log("Brisanje postojećih podataka...");
  const tables = ["product_skus","product_variants","product_items","product_categories"];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().gte("id", 0);
    if (error) log(`  ⚠ ${table}: ${error.message}`);
    else log(`  ✓ Obrisano: ${table}`);
  }
}

// ─── STEP 3: CATEGORIES ──────────────────────────────────────
async function insertCategories(rows) {
  log("Kreiranje kategorija...");
  const catMap = new Map();
  for (const row of rows) {
    if (!row.kategorije) continue;
    const parts = row.kategorije.split(" | ").map(s => s.trim());
    for (let i = 0; i < parts.length; i++) {
      if (!catMap.has(parts[i]))
        catMap.set(parts[i], { name: parts[i], parent: i > 0 ? parts[i-1] : null });
    }
  }

  const sorted = [...catMap.values()].sort((a,b) => {
    if (!a.parent && b.parent) return -1;
    if (a.parent && !b.parent) return 1;
    return 0;
  });

  const nameToId = new Map();
  let sortOrder = 0;
  for (const cat of sorted) {
    const parentId = cat.parent ? (nameToId.get(cat.parent) ?? null) : null;
    const { data, error } = await supabase
      .from("product_categories")
      .insert({ name: cat.name, slug: slugify(cat.name), parent_id: parentId, sort_order: sortOrder++ })
      .select("id")
      .single();
    if (error) log(`  ⚠ Kategorija '${cat.name}': ${error.message}`);
    else nameToId.set(cat.name, data.id);
  }

  log(`✓ Kategorije: ${nameToId.size} kreirano`);
  return nameToId;
}

// ─── STEP 4: IMAGES ──────────────────────────────────────────
async function processImages(rows) {
  log("Skupljanje URL-ova slika...");
  const urlSet = new Set();
  for (const row of rows) {
    if (row.glavna_slika?.trim()) urlSet.add(row.glavna_slika.trim());
    if (row.sve_slike) {
      for (const u of row.sve_slike.split(" | ")) {
        const t = u.trim(); if (t) urlSet.add(t);
      }
    }
  }

  const urls = [...urlSet];
  log(`Nađeno ${urls.length} jedinstvenih slika. Download i upload...`);

  const urlToPublic = new Map();
  let done = 0, failed = 0;

  let existingNames = new Set();
  if (SKIP_EXISTING_IMAGES) {
    const { data: existing } = await supabase.storage
      .from(STORAGE_BUCKET).list("products", { limit: 10000 });
    if (existing) existing.forEach(f => existingNames.add(f.name));
    if (existingNames.size > 0) log(`  ${existingNames.size} slika već postoji, preskačem...`);
  }

  const tasks = urls.map(url => async () => {
    const storagePath = urlToStoragePath(url);
    const filename = path.basename(storagePath);

    if (SKIP_EXISTING_IMAGES && existingNames.has(filename)) {
      urlToPublic.set(url, supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl);
      done++;
      return;
    }

    try {
      const contentType = url.endsWith(".png") ? "image/png" :
                          url.endsWith(".webp") ? "image/webp" : "image/jpeg";
      const buf = await downloadImage(url);
      urlToPublic.set(url, await uploadToStorage(buf, storagePath, contentType));
      done++;
      if (done % 100 === 0) log(`  Uploadovano: ${done}/${urls.length} (${failed} grešaka)`);
    } catch (err) {
      failed++;
      urlToPublic.set(url, url);
      if (failed <= 10) log(`  ⚠ Slika fail: ${filename} — ${err.message}`);
    }
  });

  await pLimit(tasks, CONCURRENCY);
  log(`✓ Slike završene: ${done} ok, ${failed} fail`);
  return urlToPublic;
}

// ─── STEP 5: PRODUCTS ────────────────────────────────────────
async function insertProducts(rows, categoryMap, imageMap) {
  log(`Upisivanje ${rows.length} proizvoda...`);
  let totalInserted = 0, totalFailed = 0;
  const BATCH = 50;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const payloads = [];

    for (const row of batch) {
      let categoryId = null;
      if (row.kategorije) {
        const cats = row.kategorije.split(" | ").map(s => s.trim());
        categoryId = categoryMap.get(cats[cats.length - 1]) ?? null;
      }

      const imageUrls = [];
      if (row.glavna_slika?.trim()) imageUrls.push(row.glavna_slika.trim());
      if (row.sve_slike) {
        for (const u of row.sve_slike.split(" | ")) {
          const t = u.trim();
          if (t && !imageUrls.includes(t)) imageUrls.push(t);
        }
      }
      const media = imageUrls.map(url => ({ url: imageMap.get(url) || url, type: "image" }));

      let variantDetails = [];
      try { variantDetails = row.variation_detalji_json ? JSON.parse(row.variation_detalji_json) : []; } catch {}

      let variantsOptions = null;
      try { variantsOptions = row.varijante_json ? JSON.parse(row.varijante_json) : null; } catch {}

      let attributes = null;
      try { attributes = row.atributi_json ? JSON.parse(row.atributi_json) : null; } catch {}

      payloads.push({
        product: {
          name: row.naziv || "Nepoznat proizvod",
          slug: slugify(row.naziv || "proizvod"),
          sku: row.sku || null,
          brand: row.brend || null,
          category_id: categoryId,
          status: row.na_stanju === "da" ? "active" : "inactive",
          price: parsePrice(row.cena),
          stock: row.na_stanju === "da" ? 999 : 0,
          discount_enabled: false,
          discount_price: null,
          short_description: row.kratki_opis || null,
          description: row.dugi_opis || null,
          media,
          attributes,
          variants_options: variantsOptions,
          meta_title: row.naziv || null,
          meta_description: row.kratki_opis?.slice(0, 160) || null,
        },
        variantDetails,
        sku: row.sku,
      });
    }

    const { data: insertedRows, error } = await supabase
      .from("product_items")
      .insert(payloads.map(p => p.product))
      .select("id");

    if (error) {
      log(`  ❌ Batch ${i}–${i+BATCH}: ${error.message}`);
      totalFailed += batch.length;
      continue;
    }

    totalInserted += insertedRows.length;

    // Variants + SKUs
    const variantInserts = [];
    const skuInserts = [];
    for (let j = 0; j < insertedRows.length; j++) {
      const productId = insertedRows[j].id;
      const { variantDetails, sku } = payloads[j];
      if (sku) skuInserts.push({ product_id: productId, sku });
      for (const v of variantDetails) {
        const varImg = v.slika ? (imageMap.get(v.slika) || v.slika) : null;
        variantInserts.push({
          product_id: productId,
          sku: v.sku || null,
          price: v.cena || 0,
          stock: v.na_stanju ? 999 : 0,
          attributes: v.atributi || {},
          media: varImg ? [{ url: varImg, type: "image" }] : [],
        });
      }
    }

    if (variantInserts.length > 0) {
      const { error: ve } = await supabase.from("product_variants").insert(variantInserts);
      if (ve) log(`  ⚠ Varijante: ${ve.message}`);
    }
    if (skuInserts.length > 0) {
      const { error: se } = await supabase.from("product_skus").insert(skuInserts);
      if (se) log(`  ⚠ SKU: ${se.message}`);
    }

    if ((i + BATCH) % 500 === 0 || i + BATCH >= rows.length) {
      log(`  Proizvodi: ${totalInserted} upisano, ${totalFailed} grešaka`);
    }
  }

  log(`✓ Proizvodi završeni: ${totalInserted} upisano, ${totalFailed} grešaka`);
}

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Moto Vasić - Import na novi Supabase projekat");
  console.log("═══════════════════════════════════════════════\n");

  log("Učitavanje CSV...");
  const rows = parse(fs.readFileSync(CSV_PATH), {
    columns: true, skip_empty_lines: true, bom: true,
  });
  log(`✓ CSV: ${rows.length} proizvoda`);

  await ensureBucket();
  await clearExistingData();
  const categoryMap = await insertCategories(rows);
  const imageMap    = await processImages(rows);
  await insertProducts(rows, categoryMap, imageMap);

  console.log("\n═══════════════════════════════════════════════");
  console.log("  ✅  Import završen!");
  console.log("═══════════════════════════════════════════════\n");
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
