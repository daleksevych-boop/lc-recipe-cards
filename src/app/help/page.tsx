import Link from "next/link";

export const metadata = {
  title: "Як користуватись — Lviv Croissants ТК",
};

export default function HelpPage() {
  return (
    <article className="max-w-3xl space-y-5 text-stone-800 leading-relaxed">
      <header>
        <h1 className="text-3xl font-bold">Як користуватись пісочницею</h1>
        <p className="mt-2 text-stone-600">
          Коротка інструкція: довідник інгредієнтів → редактор техкартки →
          експорт у PDF за стандартом мережі.
        </p>
      </header>

      <section>
        <h2 className="mt-6 text-xl font-semibold">1. Заведіть інгредієнти</h2>
        <p className="mt-2">
          Відкрийте{" "}
          <Link href="/ingredients" className="text-[#7D9622] underline">
            Інгредієнти
          </Link>{" "}
          і додайте продукти. Для кожного — назва (UA / EN), одиниця (кг / л /
          шт), ціна за одиницю в грн, % втрат при холодній і тепловій обробці.
        </p>
        <p className="mt-2">
          <b>Швидко завести багато:</b> натисніть «⬆ Імпорт CSV», вставте таблицю
          прямо з Google Sheets (Ctrl+C → Ctrl+V) або завантажте .csv файл.
          Перший рядок — заголовки. Підтримувані заголовки:
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>
            <code className="rounded bg-stone-100 px-1">Назва (UA)</code> —
            обов&apos;язкова
          </li>
          <li>
            <code className="rounded bg-stone-100 px-1">Назва (EN)</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Од.</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Ціна</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Втрати хол. %</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Втрати теп. %</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Постачальник</code>,{" "}
            <code className="rounded bg-stone-100 px-1">Нотатки</code>
          </li>
          <li>
            Одиниці: <code className="rounded bg-stone-100 px-1">кг</code> /{" "}
            <code className="rounded bg-stone-100 px-1">л</code> /{" "}
            <code className="rounded bg-stone-100 px-1">шт</code> або{" "}
            <code className="rounded bg-stone-100 px-1">kg</code> /{" "}
            <code className="rounded bg-stone-100 px-1">l</code> /{" "}
            <code className="rounded bg-stone-100 px-1">pcs</code>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-6 text-xl font-semibold">2. Створіть техкартку</h2>
        <p className="mt-2">
          У{" "}
          <Link href="/recipes" className="text-[#7D9622] underline">
            Техкартках
          </Link>{" "}
          натисніть «+ Нова техкартка». Заповніть:
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>
            <b>Назва (UA / EN)</b>, <b>Код версії</b> (формат як у стандарті —
            напр. <code className="rounded bg-stone-100 px-1">NO | 03.26</code>
            ),
          </li>
          <li>
            <b>Загальна вага</b> (кг) — поле в темно-сірому рядку «Total
            weight» у PDF,
          </li>
          <li>
            <b>Ціна нетто, грн</b> — це ціна продажу без ПДВ; на її основі
            рахується фудкост.
          </li>
        </ul>

        <h3 className="mt-4 text-lg font-semibold">2.1 Склад</h3>
        <p className="mt-2">
          У таблиці складу виберіть інгредієнт зі списку, введіть{" "}
          <b>вагу нетто</b> — система автоматично рахує <b>вагу брутто</b> через
          відсоток втрат:{" "}
          <code className="rounded bg-stone-100 px-1">
            брутто = нетто / (1 − втрати %)
          </code>
          .
        </p>
        <p className="mt-2">
          <b>Ціна на одиницю</b> копіюється з довідника в момент додавання
          (snapshot). Це означає, що коли ви потім поміняєте ціну в довіднику,
          старі техкартки не зміняться, поки ви явно їх не оновите. Так
          зберігається історична собівартість.
        </p>

        <h3 className="mt-4 text-lg font-semibold">2.2 Технологія</h3>
        <p className="mt-2">
          Додайте кроки приготування — це блок «Instructions» у PDF. Кожен крок
          нумерується автоматично.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-xl font-semibold">3. Фудкост</h2>
        <p className="mt-2">За формулою:</p>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>
            <b>Собівартість</b> = Σ (нетто × ціна за одиницю) по всіх
            інгредієнтах
          </li>
          <li>
            <b>Фудкост, грн</b> = Ціна нетто − Собівартість
          </li>
          <li>
            <b>Фудкост, %</b> = Собівартість / Ціна нетто × 100%
          </li>
        </ul>
        <p className="mt-2">
          Якщо фудкост ({">"}35%) або від&apos;ємна сума — підсвічується
          червоним. Цифри показуються лише в редакторі, у PDF їх немає (як у
          вашому стандарті).
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-xl font-semibold">4. Експорт PDF</h2>
        <p className="mt-2">
          Кнопка «Завантажити PDF» у списку техкарток або в редакторі. Файл
          1-в-1 за стандартом мережі: фірмовий зелений, шрифт Carlito (відкритий
          аналог Calibri), водяний знак, нумеровані інструкції, футер з кодом
          версії.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-xl font-semibold">5. Автозбереження і версії</h2>
        <p className="mt-2">
          Редактор зберігає зміни автоматично через ~1 секунду після останньої
          правки. Кожне збереження створює запис у журналі версій (історія
          зберігається в БД, навіть якщо ви видалили рядок чи перейменували
          продукт).
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-xl font-semibold">Часті питання</h2>
        <details className="mt-2 rounded border bg-white p-3">
          <summary className="cursor-pointer font-medium">
            У PDF неправильна вага «Total weight». Чому?
          </summary>
          <div className="mt-2 text-sm">
            У вашому стандарті це окреме поле, яке вводиться вручну (а не сума
            колонки нетто). Заповніть <b>«Загальна вага, кг»</b> у редакторі —
            саме це число піде в PDF.
          </div>
        </details>
        <details className="mt-2 rounded border bg-white p-3">
          <summary className="cursor-pointer font-medium">
            Я поміняв ціну в довіднику — фудкост у старих ТК не змінився
          </summary>
          <div className="mt-2 text-sm">
            Це нормально: ціна копіюється в ТК у момент додавання інгредієнта
            (для історичної точності). Щоб оновити — у редакторі видаліть і
            додайте інгредієнт заново, або змініть ціну вручну в полі «Ціна,
            грн/од.» в таблиці складу.
          </div>
        </details>
        <details className="mt-2 rounded border bg-white p-3">
          <summary className="cursor-pointer font-medium">
            Як швидко завести багато техкарток?
          </summary>
          <div className="mt-2 text-sm">
            Зробіть одну еталонну ТК, потім тисніть «копія» у списку — це
            створить дублікат. Перейменуйте і виправте склад.
          </div>
        </details>
        <details className="mt-2 rounded border bg-white p-3">
          <summary className="cursor-pointer font-medium">
            У PDF мій логотип/декор не такий як у нас в Google Sheets
          </summary>
          <div className="mt-2 text-sm">
            Поки використовується спрощений SVG-круасан. Надішліть мені
            оригінальні SVG/PNG логотипу й декору — підставлю.
          </div>
        </details>
      </section>
    </article>
  );
}
