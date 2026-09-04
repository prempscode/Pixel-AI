import Conversation from '../models/Conversation.js'
import getAIResponse from '../services/langchainService.js'

const makeTitle = text => {
  const cleaned = text.trim().replace(/\s+/g, ' ')
  return cleaned.length > 50 ? cleaned.slice(0, 50) + '...' : cleaned
}

export const sendMessage = async (req, res) => {
  const { id } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content required' })
  }

  try {
    let conversation
    if (id === 'new') {
      conversation = await Conversation.create({
        userId: req.user.id,
        title: makeTitle(content),
        messages: []
      })
    } else {
      conversation = await Conversation.findOne({
        _id: id,
        userId: req.user.id
      })
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }
    }

    const userMsg = { role: 'user', content: content.trim() }
    conversation.messages.push(userMsg)

    const aiReply = await getAIResponse(conversation.messages)

    const aiMsg = { role: 'assistant', content: aiReply }
    conversation.messages.push(aiMsg)

    await conversation.save()

    res.json({
      conversationId: conversation._id,
      userMessage: userMsg,
      aiMessage: aiMsg
    })
  } catch (err) {
    console.error('sendMessage error:', err.message)
    res.status(500).json({ error: 'Failed to get AI response' })
  }
}

// Lists all of the current user's conversations (sidebar list).
export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .select('title createdAt updatedAt') // skip messages for the list view
      .sort({ updatedAt: -1 }) // newest first
    res.json({ conversations })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
}

export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json({ conversation })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
}
