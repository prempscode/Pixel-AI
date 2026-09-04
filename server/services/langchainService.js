import { ChatGroq } from '@langchain/groq'
import {
  HumanMessage,
  AIMessage,
  SystemMessage
} from '@langchain/core/messages'

const getAIResponse = async messages => {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024
  })

  const langchainMessages = messages.map(m => {
    if (m.role === 'user') return new HumanMessage(m.content)
    if (m.role === 'assistant') return new AIMessage(m.content)
    return new HumanMessage(m.content)
  })

  const systemMessage = new SystemMessage(
    'You are a helpful, concise AI assistant. Answer clearly and use simple language.'
  )

  const response = await llm.invoke([systemMessage, ...langchainMessages])

  return response.content
}

export default getAIResponse
