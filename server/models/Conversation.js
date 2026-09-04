import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant']
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Chat'
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
)

conversationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.messages?.forEach(m => delete m._id)
    return ret
  }
})
const Conversation = mongoose.model('Conversation', conversationSchema)
export default Conversation
