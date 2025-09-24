"use client";
import { useState } from "react";
import { DataField } from "./dataField"
import { DataInput } from "./dataInput";
import { DataOutput } from "./dataOutput";
import type { JSONSchema7 } from "json-schema";
import { createLogger } from '@/lib/logs/console/logger'
import { useSubBlockValue } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/components/sub-block/hooks/use-sub-block-value'
import { apiKey } from "@sim/db";
import { env } from '@/lib/env'
import { executeAgentBlock } from "./agentExecutor";
import { useSchemaGenerator } from "./useSchemaGenerator";

type AgentBuilderProps = React.HTMLAttributes<HTMLDivElement> & {
  blockId: string;
  subBlockId: string;
  schemaValue?: string;
  descriptionValue?: string;
};

const logger = createLogger('AgentBlock')

export function AgentBuilder({
  blockId,
  subBlockId,
  schemaValue: propValue,
  descriptionValue: value,
}: AgentBuilderProps) {
  const [tableMode, setTableMode] = useState<boolean>(false);
  const [data, setData] = useState<object[] | string>("");
  const [inputData, setInputData] = useState<string | object>(""); 
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [extractLoading, setExtractLoading] = useState<boolean>(false);
  const [result, setResult] = useState<(object | null)[]>(
    data && typeof data !== "string" ? (data as object[]).map(() => null) : [],
  );

  const [schema, setSchema] = useState<object | string>({})
  const [storeDescription, setStoreDescription] = useSubBlockValue(blockId, `${subBlockId}_description`, false);
  const {
    schemaDescription,
    setSchemaDescription,
    handleGenerateSchema,
    updatePromptValue,
  } = useSchemaGenerator(storeDescription?.toString() || "", setSchema, setSchemaLoading, blockId, subBlockId);


  const apply = async () => {
    setExtractLoading(true)

    const openaiApiKey = env.OPENAI_API_KEY || ""

    try {
      const cleanedOutput = await executeAgentBlock({
        inputData,
        schema: schema,
        apiKey: openaiApiKey,
      });
      setResult([cleanedOutput]);
    } catch (err) {
      console.error(err);
    } finally {
      setExtractLoading(false);
    }
  }

  const json7Schema: JSONSchema7 | undefined =
  typeof schema === "object" && schema !== null
    ? {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        additionalProperties: false,
        ...schema,
      }
    : undefined;



  return (
    <div className="flex flex-1 flex-col gap-4 p-4 h-full min-h-0">
      <div className="grid grid-cols-2 gap-8 w-full h-full min-h-0">
        <div className="grid grid-rows-3 gap-4 w-full h-full min-h-0 ">
          <DataField
            title="Schema Description"
            data={schemaDescription}
            setData={(data: string | object) => {
              logger.info("setting Data")
              if (typeof data === "string") {
                setSchemaDescription(data)
                updatePromptValue(data)
              }
            }}
            className="row-span-1 min-h-0"
            placeholder="Describe the data task you want your agent to perform (e.g. 'Extract the author and date of a news article.')..."
            blockId={blockId}
            subBlockId={subBlockId}
          />
          <DataField
            title="Extraction Schema"
            data={schema}
            setData={(data: string | object) => {
              if (typeof data === "string") {
                console.log("Manual update: JSON schema string", data)
              } else {
                console.log("Manual update: JSON schema object", data)
              }
            }}
            dataLoading={schemaLoading}
            buttonTitle="Generate Schema"
            onButtonClick={handleGenerateSchema}
            className="row-span-2 min-h-0"
            blockId={blockId}
            subBlockId={subBlockId}
            codeEditor={true}
          />
        </div>

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
            jsonSchema={json7Schema || {}}
            result={result}
            tableMode={tableMode}
            buttonTitle="Extract Data"
            onButtonClick={apply}
            className="row-span-2 min-h-0"
            dataLoading={extractLoading}
          />
        </div>
      </div>
    </div>
  );
}