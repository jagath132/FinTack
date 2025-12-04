import { Transaction, Category, CSVImportData, ColumnMapping } from "./types";

/* -----------------------------------------------------------
   1. SAFE CSV PARSER — supports quotes, commas & Excel exports
------------------------------------------------------------ */
export function parseCSV(text: string): CSVImportData {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (current !== "" || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current !== "" || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  const headers = rows.length > 0 ? rows[0] : [];
  const dataRows = rows.slice(1);

  const structuredRows = dataRows.map((cols) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });
    return obj;
  });

  return { headers, rows: structuredRows };
}

/* -----------------------------------------------------------
   2. SMART DATE PARSER — supports all global formats
------------------------------------------------------------ */
function parseSmartDate(str: string): Date | null {
  if (!str) return null;
  const v = str.trim();

  // Normal ISO
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(v)) {
    const d = new Date(v.replace(/\//g, "-"));
    return isNaN(d.getTime()) ? null : d;
  }

  // DD-MM-YYYY / DD/MM/YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(v)) {
    const [d, m, y] = v.split(/[-/]/);
    const dt = new Date(`${y}-${m}-${d}`);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // JS fallback
  const js = new Date(v);
  return isNaN(js.getTime()) ? null : js;
}

/* -----------------------------------------------------------
   3. REWRITTEN CSV → TRANSACTION MAPPER (Main Fix)
------------------------------------------------------------ */
export function csvToTransactions(
  csvData: CSVImportData,
  mapping: ColumnMapping,
  categories: Category[],
) {
  const transactions: Transaction[] = [];
  const errors: string[] = [];
  const missingCategories: string[] = [];

  const categoryMap = new Map(
    categories.map((c) => [c.name.toLowerCase(), c.id]),
  );

  csvData.rows.forEach((row, index) => {
    const rowNum = index + 2;

    try {
      const rawDate = row[mapping.date];
      const rawAmount = row[mapping.amount];
      const rawCategory = row[mapping.category] || "";
      const rawType = (row[mapping.type] || "expense").toLowerCase();
      const rawDesc = row[mapping.description] || "";
      const rawNotes = row[mapping.notes] || "";
      const rawTags = row[mapping.tags] || "";

      // ----- DATE -----
      const parsedDate = parseSmartDate(rawDate);
      if (!parsedDate)
        return errors.push(`Row ${rowNum}: Invalid date "${rawDate}"`);

      // ----- AMOUNT -----
      const amount = parseFloat(rawAmount.replace(/,/g, ""));
      if (isNaN(amount))
        return errors.push(`Row ${rowNum}: Invalid amount "${rawAmount}"`);

      // ----- CATEGORY -----
      const catName = rawCategory.trim();
      let categoryId = categoryMap.get(catName.toLowerCase());

      if (!categoryId) {
        if (!missingCategories.includes(catName))
          missingCategories.push(catName);
        categoryId = `missing:${catName.toLowerCase()}`;
      }

      const txn: Transaction = {
        id: crypto.randomUUID(),
        date: parsedDate.toISOString(),
        amount,
        categoryId,
        type: rawType === "income" ? "income" : "expense",
        description: rawDesc || "Imported transaction",
        createdAt: new Date().toISOString(),
      };

      if (rawNotes.trim()) txn.notes = rawNotes.trim();

      if (rawTags.trim()) {
        txn.tags = rawTags
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }

      transactions.push(txn);
    } catch (err) {
      errors.push(
        `Row ${rowNum}: ${
          err instanceof Error ? err.message : "Unexpected import error"
        }`,
      );
    }
  });

  return { transactions, errors, missingCategories };
}

/* -----------------------------------------------------------
   4. EXPORT TRANSACTIONS → CSV
------------------------------------------------------------ */
export function transactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Description",
    "Notes",
    "Tags",
  ];

  const lines = [headers.join(",")];

  transactions.forEach((t) => {
    const line = [
      new Date(t.date).toISOString().split("T")[0],
      t.type,
      categoryMap.get(t.categoryId) || "Unknown",
      t.amount,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "",
      t.tags ? t.tags.join(";") : "",
    ];
    lines.push(line.join(","));
  });

  return lines.join("\n");
}

/* -----------------------------------------------------------
   5. EXPORT CATEGORIES → CSV
------------------------------------------------------------ */
export function categoriesToCSV(categories: Category[]): string {
  const headers = ["Name", "Type", "Color", "Icon"];
  const lines = [headers.join(",")];

  categories.forEach((cat) =>
    lines.push(
      [cat.name, cat.type, cat.color, cat.icon || ""]
        .map((f) => (f.includes(",") ? `"${f}"` : f))
        .join(","),
    ),
  );

  return lines.join("\n");
}

/* -----------------------------------------------------------
   6. DOWNLOAD CSV (unchanged)
------------------------------------------------------------ */
export function downloadCSV(filename: string, content: string): void {
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
