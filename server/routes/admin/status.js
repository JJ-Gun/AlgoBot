import { Router } from 'express'
import { getHealthState } from '../../db/healthMonitor.js'

const router = Router()

router.get('/', (req, res) => {
  const state = getHealthState()
  res.json({
    bot: state.bot,
    melo: state.melo,
    kokoro: state.kokoro,
    resources: state.resources,
    lastChecked: state.lastChecked,
  })
})

export default router