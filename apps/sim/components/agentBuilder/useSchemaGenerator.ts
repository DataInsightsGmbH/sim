// useSchemaGenerator.ts
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWand } from "@/app/workspace/[workspaceId]/w/[workflowId]/hooks/use-wand";
import { createLogger } from "@/lib/logs/console/logger";
import { useSubBlockValue } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/components/sub-block/hooks/use-sub-block-value'

const logger = createLogger("useSchemaGenerator");

export const useSchemaGenerator = (
  initialDescription: string,
  setSchema: (schema: object | string) => void,
  setSchemaLoading: (loading: boolean) => void,
  blockId: string,
  subBlockId: string,
) => {
  const [schemaDescription, setSchemaDescription] = useState(initialDescription);

  const handleStreamStartRef = useRef<() => void>(() => {});
  const handleGeneratedContentRef = useRef<(generated: string) => void>(() => {});
  const handleStreamChunkRef = useRef<(chunk: string) => void>(() => {});

  const [schema] = useState<object | string>({})

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

  const generateCodeStream = wandHook?.generateStream || (() => {})
  const updatePromptValue = wandHook?.updatePromptValue || (() => {})
  const isAiStreaming = wandHook?.isStreaming || false

  const handleGenerateSchema = () => {
    if (!schemaDescription.trim()) {
      toast.error("Please provide a schema description before generating.")
      return
    }
    setSchemaLoading(true)
    generateCodeStream({ prompt: schemaDescription })
  }

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


  useEffect(() => {
    handleStreamStartRef.current = () => setSchema("");
    handleGeneratedContentRef.current = (generated: string) => setSchema(generated);
  }, [setSchema]);

  return {
    schemaDescription,
    setSchemaDescription,
    handleGenerateSchema,
    updatePromptValue,
    wandHook,
  };
};
