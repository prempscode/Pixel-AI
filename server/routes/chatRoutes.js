import { Router } from 'express'
import {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation
} from '../controllers/chatController.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', listConversations)

router.get('/:id', getConversation)
router.delete('/:id', deleteConversation)

// Messages — :id can be "new" to start a fresh conversation
router.post('/:id/messages', sendMessage)

export default router
