import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { JsonEditor } from "json-edit-react";
import JsonSkeleton from "./jsonSkeleton";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


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

type DataFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  data: string | object;
  setData: (data: string | object) => void;
  dataLoading?: boolean;
  buttonTitle?: string;
  onButtonClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DataField({
  title,
  data,
  setData,
  dataLoading = false,
  buttonTitle,
  onButtonClick,
  placeholder,
  disabled,
  ...props
}: DataFieldProps) {
  const isObject = typeof data === "object" && data !== null;

  const copyToClipboard = async (data: string | object, title: string) => {
    const text = isObject ? JSON.stringify(data, null, "\t") : (data as string);

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button 
                    onClick={onButtonClick} 
                    className="z-10 hover:bg-accent hover:text-white" 
                    size="sm"
                    disabled={disabled}
                  >
                    {buttonTitle}
                  </Button>
                </span>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent side="top">
                  To generate a schema you first need to provide a Schema Description.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="px-4">
        <Separator />
      </div>
      <div className="flex flex-1 flex-col h-0 rounded-b-xl overflow-hidden">
        {isObject ? (
          <div className="flex-1 min-h-0 overflow-auto">
            {dataLoading ? (
              <JsonSkeleton />
            ) : (
              <JsonEditor
                data={data}
                setData={(d: unknown) => setData(d as string | object)}
                theme={transparentTheme}
              />
            )}
          </div>
        ) : (
          <Textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="flex-1 resize-none p-4 pt-2 h-full border-none focus-visible:ring-0 font-mono text-sm rounded-xl"
            placeholder={placeholder || "Enter text here..."}
          />
        )}
        <Button
          onClick={() => copyToClipboard(data, title)}
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