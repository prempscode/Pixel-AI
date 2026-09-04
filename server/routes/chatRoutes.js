import { Router } from 'express'
import { googleLogin, logout, getMe } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/google', googleLogin)
router.post('/logout', logout)
router.get('/me', auth, getMe) // protected — needs valid JWT cookie

export default router
