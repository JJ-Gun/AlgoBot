import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware } from './middleware/auth.js'
import { adminMiddleware } from './middleware/admin.js'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import noticeRouter from './routes/notice.js'
import inquiryRouter from './routes/inquiry.js'
import adminStatsRouter from './routes/admin/stats.js'
import adminStatusRouter from './routes/admin/status.js'
import adminLogsRouter from './routes/admin/logs.js'
import adminNoticeRouter from './routes/admin/notice.js'
import adminInquiryRouter from './routes/admin/inquiry.js'

dotenv.config()

const app = express()
const PORT = process.env.SERVER_PORT || 3000

app.use(cors({ origin: process.env.WEB_URL }))
app.use(express.json())

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/notices', noticeRouter)
app.use('/inquiries', inquiryRouter)

app.use('/admin/stats', authMiddleware, adminMiddleware, adminStatsRouter)
app.use('/admin/status', authMiddleware, adminMiddleware, adminStatusRouter)
app.use('/admin/logs', authMiddleware, adminMiddleware, adminLogsRouter)
app.use('/admin/notices', authMiddleware, adminMiddleware, adminNoticeRouter)
app.use('/admin/inquiries', authMiddleware, adminMiddleware, adminInquiryRouter)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})

export default app