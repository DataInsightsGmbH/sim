import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Table } from "lucide-react";
import { JsonEditor } from "json-edit-react";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./dataTable";
import { JSONSchema7 } from "json-schema";
import JsonSkeleton from "./jsonSkeleton";
import TableSkeleton from "./tableSkeleton";

const transparentTheme = {
  styles: {
    container: {
      backgroundColor: "transparent",
    },
    string: {
      color: "var(--accent)",
    },
    key: {
      color: "var(--accent)", 
    },
    number: {
      color: "var(--accent)",
    },
    boolean: {
      color: "var(--accent)",
    },
    null: {
      color: "var(--accent)",
    },
  },
};

type DataOutputProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  jsonSchema: JSONSchema7;
  result: (object | null)[];
  tableMode: boolean;
  dataLoading?: boolean;
  buttonTitle?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
};

export function DataOutput({
  title,
  jsonSchema,
  result,
  tableMode = false,
  dataLoading = false,
  buttonTitle,
  onButtonClick,
  disabled,
  ...props
}: DataOutputProps) {
  const columns =
    Object.keys(jsonSchema).length > 0 && jsonSchema?.properties // TODO: there has to be a better way
      ? (Object.keys(jsonSchema?.properties).map((key) => ({
          accessorKey: key,
          header: key,
        })) as ColumnDef<string | object | null, string>[])
      : [];
  const tableData = result.map((row) => {
    if (!row) return row;
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value),
      ]),
    );
  });

  const copyToClipboard = async (results: (object | null)[], title: string) => {
    const text =
      results.length > 1
        ? JSON.stringify(results, null, "\t")
        : JSON.stringify(results[0], null, "\t");

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        description: `Content from ${title} has been copied.`,
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: `Could not copy text to clipboard: ${error}`,
      });
    }
  };

  return (
    <div
      {...props}
      className={`relative flex flex-col h-full bg-muted rounded-xl ${props.className ?? ""}`}
    >
      <div className="p-2 px-4 w-full flex flex-row items-center justify-between">
        <h2 className="z-10 font-medium">{title}</h2>
        {buttonTitle && (
          <Button 
            onClick={onButtonClick} 
            className="z-10 hover:bg-accent hover:text-white" 
            size="sm"
            disabled={disabled}>
            {buttonTitle}
          </Button>
        )}
      </div>
      <div className="px-4">
        <Separator />
      </div>
      <div className="flex flex-1 flex-col h-0 rounded-b-xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          {!tableMode && (
            dataLoading ? (
              <JsonSkeleton />
            ) : (
              <JsonEditor
                data={result[0] ?? {}}
                theme={transparentTheme}
                restrictEdit={true}
              />
            )
          )}
          {tableMode && (
            dataLoading ? (
              < TableSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={tableData as object[]} // fallback to empty array
                allowSelectColumns={false}
                selectedColumns={[]}
                setSelectedColumns={() => {}}
              />
            )
          )}
        </div>
        <Button
          onClick={() => copyToClipboard(result, title)}
          className="absolute bottom-2 right-5 z-10 bg-muted/50"
          size="icon"
          variant="ghost"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
