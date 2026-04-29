# Lviv Croissants — Recipe Cards Sandbox

Веб-додаток для створення та керування технологічними картами круасанів
з автоматичним розрахунком собівартості, фудкосту та PDF-експортом 1-в-1
за стандартом мережі.

## Можливості

- Довідник інгредієнтів (UA/EN, одиниці, ціна за од., % втрат при
  холодній/тепловій обробці).
- Редактор техкарток з live-прев'ю PDF.
- Автоматичний розрахунок:
  - собівартість = Σ (нетто × ціна),
  - фудкост (грн) = ціна нетто − собівартість,
  - фудкост (%) = собівартість / ціна нетто × 100%.
- PDF-експорт у стандартному форматі (Calibri/Carlito, brand green
  `#7D9622`, водяний знак, футер з версією).
- Автозбереження + історія версій.
- Дублювання карток.

## Стек

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM (SQLite для dev, Postgres для production)
- Puppeteer (Chrome) для рендеру PDF

## Локальний запуск

```bash
npm install
cp .env.example .env             # за потреби, налаштуйте DATABASE_URL
npx prisma migrate dev            # створить локальну SQLite БД
npx tsx prisma/seed.ts            # завантажить демо-картку Herring
npm run dev
```

Відкрийте http://localhost:3000.

## Структура

```
src/
  app/
    page.tsx                     # головна
    ingredients/                 # довідник інгредієнтів
    recipes/                     # список + редактор
    print/[id]/                  # print-ready HTML (для PDF та iframe-прев'ю)
    api/                         # REST API
  components/
    RecipeCard.tsx               # PDF-шаблон (1-в-1 за стандартом)
  lib/
    db.ts                        # Prisma client singleton
    cost.ts                      # розрахунки
    pdf.ts                       # Puppeteer-обгортка
    types.ts                     # спільні типи
prisma/
  schema.prisma                  # модель даних
  seed.ts                        # демо-картка Herring
```

## Тестова картка

Після `npx tsx prisma/seed.ts` буде створена картка `Herring` 1-в-1 за
вашим референсним PDF (з усіма 11 інгредієнтами, 7 кроками технології,
фудкостом 95 грн / 56.16 грн собівартість).

## Production deploy (Vercel + Supabase)

Один раз:

1. **Supabase** — створіть проєкт у https://supabase.com/dashboard, регіон
   `eu-central-1`. Settings → Database → Connection string (URI) →
   скопіюйте.
2. **Prisma schema** — у `prisma/schema.prisma` замініть
   `provider = "sqlite"` на `provider = "postgresql"`.
3. **Заллийте схему** у Supabase:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
   ```
4. **Vercel** — імпортуйте репозиторій (https://vercel.com/new), додайте
   environment variable `DATABASE_URL` з тим самим значенням, що в
   Supabase. Натисніть Deploy.

`vercel.json` уже містить правильні налаштування для Puppeteer (60s
timeout, 1024MB memory для PDF-роуту).
