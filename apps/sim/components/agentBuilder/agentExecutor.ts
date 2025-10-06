import { AgentBuilderBlockHandler } from '@/executor/handlers'
import type { AgentInputs } from '@/executor/handlers/agent/types'
import type { ExecutionContext } from '@/executor/types'
import type { SerializedBlock, SerializedWorkflow } from '@/serializer/types'

export const executeAgentBlock = async ({
  inputData,
  schema,
  apiKey,
}: {
  inputData: string | object
  schema: string | object
  apiKey: string
}) => {
  const agentHandler = new AgentBuilderBlockHandler()

  const block = {
    id: 'agent-builder-1',
    position: { x: 100, y: 200 },
    config: {
      tool: 'openai',
      params: {
        model: 'gpt-4.1', //TODO dropdown
        apiKey: apiKey,
        userPrompt: '', //TODO infill
        responseFormat: schema,
      },
    },
    inputs: {
      systemPrompt: 'string',
      userPrompt: 'string',
      model: 'string',
      apiKey: 'string',
      responseFormat: 'json',
    },
    outputs: {
      model: 'string',
      content: 'string',
      responseFormat: schema,
    },
    metadata: {
      id: 'agentBuilderButton',
    },
    enabled: true,
  } as SerializedBlock

  const inputs: AgentInputs = {
    model: 'gpt-4.1',
    apiKey: apiKey,
    userPrompt: [inputData],
    responseFormat: schema, // TODO to json
  }

  const executionContext: ExecutionContext = {
    workflowId: 'test-workflow', //TODO: get workflowId
    blockStates: new Map(),
    blockLogs: [],
    metadata: {
      startTime: new Date().toISOString(),
      duration: 0,
    },
    environmentVariables: {},
    decisions: {
      router: new Map(),
      condition: new Map(),
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

  let cleanedOutput: object = {}

  const output = await agentHandler.execute(block, inputs, executionContext)
  // Remove unwanted fields
  if (output && typeof output === 'object') {
    const { toolCalls, providerTiming, cost, tokens, ...rest } = output as any
    cleanedOutput = rest
  }

  return cleanedOutput
}
