# Moto Vasić - Prodaja Moto Vozila

## 1. Project Description
**Moto Vasić** je sajt za prodaju moto vozila za decu i odrasle: ATV kvadova, kros motora, bagija, skutera i dodatne opreme. Ciljna grupa su moto entuzijasti svih uzrasta. Sve je na srpskom jeziku.

## 2. Page Structure
- `/` - Početna (Home) - Hero sekcija, istaknuti proizvodi, kategorije
- `/shop` - Shop (lista proizvoda sa filterima)
- `/proizvod/:id` - Stranica pojedinačnog proizvoda
- `/o-nama` - O nama
- `/kontakt` - Kontakt
- `/blog` - Blog
- `/blog/:slug` - Blog detalj
- `/admin` - Admin panel

## 3. Core Features
- [x] Pregled proizvoda sa slikama
- [x] Filtriranje proizvoda po kategorijama
- [x] Pretraga proizvoda
- [x] Stranica pojedinačnog proizvoda
- [x] Kontakt forma
- [x] Blog sa CMS
- [x] SEO optimizacija
- [x] Admin panel sa CRUD operacijama

## 4. Data Model Design
Koristi postojeće Supabase tabele:
- `product_categories` - kategorije proizvoda (sa parent_id za podkategorije)
- `product_items` - proizvodi (sa media JSONB, slug, SEO polja)
- `product_variants` - varijante proizvoda
- `product_skus` - SKU podaci
- `blog_categories` - blog kategorije
- `blog_posts` - blog članci
- `order_headers` - porudžbine
- `order_items` - stavke porudžbine

## 5. Backend / Third-party Integration Plan
- **Supabase**: Baza podataka, auth, storage
- **Shopify**: Ne treba za sada
- **Stripe**: Ne treba za sada (telefon/WhatsApp porudžbine)

## 6. Development Phase Plan

### Phase 1: Baza podataka + Home + Shop stranice
- [x] Postaviti bazu sa proizvodima i kategorijama
- [x] Izgraditi Početnu i Shop stranicu

### Phase 2: Single Product + Kontakt + O nama + Blog
- [x] Završiti stranicu proizvoda, kontakt, O nama
- [x] Blog sistem sa CMS

### Phase 3: Admin panel + SEO
- [x] Admin panel sa CRUD
- [x] SEO meta podaci
- [x] Podkategorije i galerija

### Phase 4: Moto transformacija
- [x] Transformacija iz dečije u moto tematiku
- [x] Novi logo, boje, tekstovi
- [x] Prilagođene kategorije za ATV, motore, bagije, skutere