"use client";
import { useState } from "react";
//import { fetchEventSource } from "@microsoft/fetch-event-source";
import { toast } from "sonner";
//import { DataField } from "@/components/agentCreator/agentBuilder/dataField";
import { DataField } from "./dataField"
//import { generateSchema } from "@/app/actions";
import { useProvidersStore } from '@/stores/providers/store'
import { DataInput } from "./dataInput";
import { DataOutput } from "./dataOutput";
import type { JSONSchema7 } from "json-schema";

type AgentBuilderProps = React.HTMLAttributes<HTMLDivElement>;

export function AgentBuilder({}: AgentBuilderProps) {
  //const { instructions, actions } = useProvidersStore();
  const [tableMode, setTableMode] = useState<boolean>(false);
  const [data, setData] = useState<object[] | string>("");
  const [inputData, setInputData] = useState<string | object>(""); 
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [extractLoading, setExtractLoading] = useState<boolean>(false);
  const [result, setResult] = useState<(object | null)[]>(
    data && typeof data !== "string" ? (data as object[]).map(() => null) : [],
  );

  const generate = async () => {
    setSchemaLoading(true);
    // if (!instructions) {
    //   toast.error("Failed to generate schema", {
    //     description: `No schema instructions found!`,
    //   });
    //   setSchemaLoading(false);
    //   return;
    // }
    //const json_schema = await generateSchema(instructions.schema_description);
    //actions.updateInstructions({ json_schema });
    setSchemaLoading(false);
  };

  const apply = async () => {
    // if (!instructions?.json_schema || !inputData) {
    //   toast.error("Failed to apply schema", {
    //     description: `${!inputData ? "Input data not found. " : ""}${
    //       !instructions?.json_schema ? "Schema not found." : ""
    //     }`,
    //   });
    //   return;
    // }
    setExtractLoading(true);
    const inputRows =
      Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === "object"
        ? (inputData as object[]).map((row) => JSON.stringify(row))
        : [inputData];

    // fetchEventSource("/api/apply_all", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     json_schema: instructions.json_schema,
    //     input_rows: inputRows,
    //   }),
    //   onmessage(event) {
    //     const { index, result } = JSON.parse(event.data);
    //     if (index >= 0) {
    //       setResult((prev) => {
    //         const next = [...prev];
    //         next[index] = result;
    //         return next;
    //       });
    //     }
    //   },
    //   onerror(err) {
    //     console.error("SSE error:", err);
    //   },
    //   onclose() {
    //     setExtractLoading(false);
    //   },
    // });
  };


  const dummyJsonSchema7: JSONSchema7 = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Article",
    type: "object",
    properties: {
      author: {
        type: "string" as const,
        description: "Name of the article author",
      },
      date: {
        type: "string" as const,
        format: "date",
        description: "Publication date",
      },
      title: {
        type: "string" as const,
        description: "Title of the article",
      },
      content: {
        type: "string" as const,
        description: "Main content of the article",
      },
      tags: {
        type: "array" as const,
        items: { type: "string" as const },
        description: "Tags associated with the article",
      },
      views: {
        type: "integer" as const,
        minimum: 0,
        description: "Number of views",
      },
    },
    required: ["author", "date", "title"],
  };



  // console.log("tableMode", tableMode);
  // console.log("data", data);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 h-full min-h-0">
      <div className="grid grid-cols-2 gap-8 w-full h-full min-h-0">
        {/* left column - schema and description */}
        <div className="grid grid-rows-3 gap-4 w-full h-full min-h-0">
          <DataField
            title="Schema Description"
            data={{}}
            // setData={(data: string | object) => {
            //   if (typeof data === "string") {
            //     actions.updateInstructions({ schema_description: data });
            //   } else {
            //     actions.updateInstructions({ schema_description: "" });
            //   }
            // }}
            setData={(data: string | object) => {
              if (typeof data === "string") {
                console.log("Fake update: JSON schema string", data);
              } else {
                console.log("Fake update: JSON schema object", data);
              }
            }}
            className="row-span-1 min-h-0"
            placeholder="Describe the data task you want your agent to perform (e.g. 'Extract the author and date of a news article.')..."
          />
          <DataField
            title="Extraction Schema"
            data={{}}
            // setData={(data: string | object) => {
            //   if (typeof data === "string") {
            //     actions.updateInstructions({ json_schema: {} });
            //   } else {
            //     actions.updateInstructions({ json_schema: data });
            //   }
            // }}
            setData={(data: string | object) => {
              if (typeof data === "string") {
                console.log("Fake update: JSON schema string", data);
              } else {
                console.log("Fake update: JSON schema object", data);
              }
            }}
            dataLoading={schemaLoading}
            buttonTitle="Generate Schema"
            onButtonClick={generate}
            className="row-span-2 min-h-0"
            // disabled={!instructions?.schema_description?.trim()} 
          />
        </div>
        {/* right column - input data and result */}
        <div className="grid grid-rows-3 gap-4 w-full h-full min-h-0">
          <DataInput
            title="Input Data"
            setData={setInputData}
            tableMode={tableMode}
            setTableMode={setTableMode}
            className="row-span-1 min-h-0"
            placeholder="Enter your input data for the agent here as text or upload a CSV/Excel file..."
          />
          <DataOutput
            title="Extracted Data"
            jsonSchema={dummyJsonSchema7}
            result={result}
            tableMode={tableMode}
            buttonTitle="Extract Data"
            onButtonClick={apply}
            // disabled={!inputData 
            //   || !instructions?.json_schema
            //   || (Array.isArray(inputData) && inputData.length === 0)} 
            className="row-span-2 min-h-0"
            dataLoading={extractLoading}
          />
        </div>
      </div>
    </div>
  );
}