import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import { parseCSV, csvToTransactions } from "@/lib/csv";
import { CSVImportData, ColumnMapping, Category } from "@/lib/types";

interface CSVImportDialogProps {
  open: boolean;
  categories: Category[];
  onImport: (mapping: ColumnMapping, csvData: CSVImportData) => void;
  onOpenChange: (open: boolean) => void;
}

export default function CSVImportDialog({
  open,
  categories,
  onImport,
  onOpenChange,
}: CSVImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCSVData] = useState<CSVImportData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "map" | "review">("upload");
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Debug: Verify new code is loaded
  console.log("CSVImportDialog loaded with new import success state");

  const requiredColumns = ["date", "amount", "category", "type", "description"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setCSVData(parsed);
      initializeMapping(parsed.headers);
      setStep("map");
      setErrors([]);
    };
    reader.readAsText(file);
  };

  const initializeMapping = (headers: string[]) => {
    const newMapping: ColumnMapping = {};

    // Try to auto-map based on column names
    requiredColumns.forEach((col) => {
      const autoMatch = headers.find((h) =>
        h.toLowerCase().includes(col.toLowerCase()),
      );
      if (autoMatch) {
        newMapping[col] = autoMatch;
      }
    });

    setMapping(newMapping);
  };

  const validateMapping = (): boolean => {
    const missing = requiredColumns.filter((col) => !mapping[col]);
    if (missing.length > 0) {
      setErrors([`Missing required columns: ${missing.join(", ")}`]);
      return false;
    }
    return true;
  };

  const handleMappingChange = (appColumn: string, csvColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [appColumn]: csvColumn === "skip" ? "" : csvColumn,
    }));
  };

  const handleNext = () => {
    if (!validateMapping()) return;

    if (!csvData) return;

    const { transactions: importedTxns, errors: importErrors } =
      csvToTransactions(csvData, mapping, categories);

    if (importErrors.length > 0) {
      setErrors(importErrors);
      setStep("review");
      return;
    }

    if (importedTxns.length === 0) {
      setErrors(["No valid transactions found in CSV"]);
      return;
    }

    setStep("review");
  };

  const handleImport = async () => {
    if (!csvData) return;

    setIsImporting(true);

    // Filter out rows with errors - we'll just import the valid ones
    const { transactions: importedTxns } = csvToTransactions(
      csvData,
      mapping,
      categories,
    );

    if (importedTxns.length === 0) {
      setErrors(["No valid transactions to import"]);
      setIsImporting(false);
      return;
    }

    try {
      await onImport(mapping, csvData);
      setImportSuccess(true);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Failed to import transactions"]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    resetDialog();
    onOpenChange(false);
  };

  const resetDialog = () => {
    setCSVData(null);
    setMapping({});
    setErrors([]);
    setStep("upload");
    setImportSuccess(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDialog();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file and map columns to import transactions
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-900 dark:text-white mb-1">
                Click to upload CSV file
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                or drag and drop
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>Required columns:</strong> Date, Amount, Category, Type,
                Description
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-500 mt-2">
                Optional columns: Notes, Tags
              </p>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === "map" && csvData && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Map CSV columns to application columns:
              </p>
              <div className="space-y-3">
                {requiredColumns.map((appCol) => (
                  <div key={appCol} className="flex items-center gap-3">
                    <label className="font-medium text-slate-700 dark:text-slate-300 w-24 capitalize">
                      {appCol}
                    </label>
                    <Select
                      value={mapping[appCol] || ""}
                      onValueChange={(val) => handleMappingChange(appCol, val)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvData.headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                {/* Optional columns */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    Optional columns (skip if not available):
                  </p>
                  {["notes", "tags"].map((optCol) => (
                    <div key={optCol} className="flex items-center gap-3">
                      <label className="font-medium text-slate-700 dark:text-slate-300 w-24 capitalize text-sm">
                        {optCol}
                      </label>
                      <Select
                        value={mapping[optCol] || "skip"}
                        onValueChange={(val) =>
                          handleMappingChange(optCol, val)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">— Skip —</SelectItem>
                          {csvData.headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CSV Preview */}
            <div className="max-h-48 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    {csvData.headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.rows.slice(0, 3).map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      {csvData.headers.map((header) => (
                        <td
                          key={header}
                          className="px-3 py-2 border border-slate-200 dark:border-slate-700 truncate"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.rows.length > 3 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  ... and {csvData.rows.length - 3} more rows
                </p>
              )}
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetDialog();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === "review" && csvData && (
          <div className="space-y-4">
            {importSuccess ? (
              <>
                <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-400">
                    ✓ All rows validated successfully!
                  </p>
                </Card>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={() => {
                      resetDialog();
                      onOpenChange(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <>
                {errors.length > 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">
                        Found {errors.length} error(s):
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
                        {errors.slice(0, 10).map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                        {errors.length > 10 && (
                          <div>... and {errors.length - 10} more</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-400">
                      ✓ All rows validated successfully!
                    </p>
                  </Card>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setStep("map")}>
                    Back
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={errors.length > 0 || isImporting}
                  >
                    {isImporting ? "Importing..." : "Import Transactions"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
