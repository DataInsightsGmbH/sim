"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataField } from "./dataField"
import { DataInput } from "./dataInput";
import { DataOutput } from "./dataOutput";
import type { JSONSchema7 } from "json-schema";
import { useWand } from "@/app/workspace/[workspaceId]/w/[workflowId]/hooks/use-wand";
import { useRef } from 'react'
import { createLogger } from '@/lib/logs/console/logger'
import { useSubBlockValue } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/components/sub-block/hooks/use-sub-block-value'
import { AgentBuilderBlockHandler } from "@/executor/handlers"

import { AgentInputs } from "@/executor/handlers/agent/types";
import { ExecutionContext } from "@/executor/types";
import type { SerializedBlock, SerializedWorkflow } from '@/serializer/types'
import { apiKey } from "@sim/db";
import { env } from '@/lib/env'

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

  const [schemaDescription, setSchemaDescription] = useState<string>('')
  const handleStreamStartRef = useRef<() => void>(() => {})
  const handleGeneratedContentRef = useRef<(generatedCode: string) => void>(() => {})
  const handleStreamChunkRef = useRef<(chunk: string) => void>(() => {})
  const [schema, setSchema] = useState<object | string>({})


  const wandConfig = {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert programmer specializing in creating JSON schemas according to a specific format.
    Generate ONLY the JSON schema based on the user's request.
    The output MUST be a single, valid JSON object, starting with { and ending with }.
    The JSON object MUST have the following top-level properties: 'name' (string), 'description' (string), 'strict' (boolean, usually true), and 'schema' (object).
    The 'schema' object must define the structure and MUST contain 'type': 'object', 'properties': {...}, 'additionalProperties': false, and 'required': [...].
    Inside 'properties', use standard JSON Schema properties (type, description, enum, items for arrays, etc.).

    Current schema: {context}

    Do not include any explanations, markdown formatting, or other text outside the JSON object.

    Valid Schema Examples:

    Example 1:
    {
        "name": "reddit_post",
        "description": "Fetches the reddit posts in the given subreddit",
        "strict": true,
        "schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title of the post"
                },
                "content": {
                    "type": "string",
                    "description": "The content of the post"
                }
            },
            "additionalProperties": false,
            "required": [ "title", "content" ]
        }
    }

    Example 2:
    {
        "name": "get_weather",
        "description": "Fetches the current weather for a specific location.",
        "strict": true,
        "schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g., San Francisco, CA"
                },
                "unit": {
                    "type": "string",
                    "description": "Temperature unit",
                    "enum": ["celsius", "fahrenheit"]
                }
            },
            "additionalProperties": false,
            "required": ["location", "unit"]
        }
    }

    Example 3 (Array Input):
    {
        "name": "process_items",
        "description": "Processes a list of items with specific IDs.",
        "strict": true,
        "schema": {
            "type": "object",
            "properties": {
                "item_ids": {
                    "type": "array",
                    "description": "A list of unique item identifiers to process.",
                    "items": {
                        "type": "string",
                        "description": "An item ID"
                    }
                },
                "processing_mode": {
                    "type": "string",
                    "description": "The mode for processing",
                    "enum": ["fast", "thorough"]
                }
            },
            "additionalProperties": false,
            "required": ["item_ids", "processing_mode"]
        }`
    }

  const agentHandler = new AgentBuilderBlockHandler()

  const apply = async () => {
    setExtractLoading(true)

    const openaiApiKey = env.OPENAI_API_KEY

    try {
      const block = {
        id: "agent-builder-1",
        position: { x: 100, y: 200 },
        config: {
          tool: "openai",
          params: {
            model: "gpt-4.1",
            apiKey: openaiApiKey,
            userPrompt: "", //TODO infill
            responseFormat: schema
          }
        },
        inputs: {
          systemPrompt: "string",
          userPrompt: "string",
          model: "string",
          apiKey: "string",
          responseFormat: "json",
        },
        outputs: {
          model: "string",
          content: "string",
          responseFormat: schema
        },
        metadata: {
          id: "agentBuilderButton"
        },
        enabled: true
      } as SerializedBlock

      const inputs: AgentInputs = {
        model: "gpt-4.1",
        apiKey: openaiApiKey,
        userPrompt: [
          inputData 
        ],
        responseFormat: schema, // TODO to json
      }

      const executionContext: ExecutionContext = {
        workflowId: 'test-workflow', //TODO: get workflowId
        blockStates: new Map(),
        blockLogs: [],
        metadata: { 
          startTime: new Date().toISOString(),
          duration: 0 
        },
        environmentVariables: {}, 
        decisions: { 
          router: new Map(), 
          condition: new Map() 
        },
        loopIterations: new Map(),
        loopItems: new Map(),
        completedLoops: new Set(),
        executedBlocks: new Set(),
        activeExecutionPath: new Set(),
        workflow: {
          version: '1.0',
          blocks: [
            block,
            //TODO start block? 
          ],
          connections: [],
          loops: {},
        } as SerializedWorkflow,
      }

    let cleanedOutput: object = {};

    const output = await agentHandler.execute(block, inputs, executionContext);

    // Remove unwanted fields
    if (output && typeof output === "object") {
      const { toolCalls, providerTiming, cost, tokens, ...rest } = output as any;
      cleanedOutput = rest;
    }

    logger.debug("cleanedOutput:", cleanedOutput);
    setResult([cleanedOutput]);

    } catch (err) {
      console.error("Error extracting data:", err)
    } finally {
      setExtractLoading(false)
    }
  }


  const wandHook = useWand({
    wandConfig: wandConfig || { enabled: false, prompt: '' },
    currentValue: schemaDescription,
    onStreamStart: () => handleStreamStartRef.current?.(),
    onStreamChunk: (chunk: string) => handleStreamChunkRef.current?.(chunk),
    onGeneratedContent: (content: string) => handleGeneratedContentRef.current?.(content),
    onGenerationComplete: () => {
        const content = [...(wandHook.conversationHistory || [])]
          .reverse()
          .find((m: any) => m.role === "assistant")?.content

        if (!content) {
          console.warn("No assistant content found.")
          setSchemaLoading(false)
          return
        }

        let parsed: object | string
        try {
          parsed = JSON.parse(content)
          console.log("parsed json schema:", parsed)
        } catch {
          console.warn("Assistant content is not valid JSON, storing as string.")
          parsed = content
        }

        setSchema(parsed)
        setSchemaLoading(false)
      }
  })

  const handleGenerateSchema = () => {
    if (!schemaDescription.trim()) {
      toast.error("Please provide a schema description before generating.")
      return
    }
    setSchemaLoading(true)
    generateCodeStream({ prompt: schemaDescription })
  }

  const generateCodeStream = wandHook?.generateStream || (() => {})
  const updatePromptValue = wandHook?.updatePromptValue || (() => {})
  const isAiStreaming = wandHook?.isStreaming || false

  // persist schema
  const [storeSchema, setStoreSchema] = useSubBlockValue(blockId, `responseFormat`, false, {
    isStreaming: isAiStreaming,
    onStreamingEnd: () => {
      logger.debug('AI streaming ended, value persisted', { blockId, subBlockId })
    },
  })

  const schemaValue = storeSchema

  useEffect(() => {
    handleStreamStartRef.current = () => {
      setSchema('')
    }

    handleGeneratedContentRef.current = (generatedSchema: string) => {
      setSchema(generatedSchema)
      setStoreSchema(generatedSchema)
    }
  }, [setStoreSchema])

  useEffect(() => {
    if (isAiStreaming) return
    const schemaString = schemaValue?.toString() ?? ''
    if (schemaString !== schema) {
      setSchema(schemaString)
    }
  }, [schemaValue, schema, isAiStreaming])


  //persist description
  const [storeDescription, setStoreDescription] = useSubBlockValue(blockId, `${subBlockId}_description`, false, {
    isStreaming: isAiStreaming,
    onStreamingEnd: () => {
      logger.debug('AI streaming ended, value persisted', { blockId, subBlockId })
    },
  })

  const descriptionValue = storeDescription

  useEffect(() => {
    const descriptionString = descriptionValue?.toString() ?? ''
    if (descriptionString && descriptionString !== schemaDescription) {
      setSchemaDescription(descriptionString)
    }
  }, [descriptionValue])

  useEffect(() => {
    const descriptionString = descriptionValue?.toString() ?? ''
    if (schemaDescription && schemaDescription !== descriptionString) {
      setStoreDescription(schemaDescription)
    }
  }, [schemaDescription, descriptionValue, setStoreDescription])

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