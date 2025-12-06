import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { VideoPage } from './src/VideoPage'

let mounted = false

const mountFloatingPlayer = () => {
  if (mounted || document.getElementById('float-video-root')) return

  const root = document.createElement('div')
  root.id = 'float-video-root'
  root.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    pointer-events: none;
  `

  document.body.appendChild(root)

  ReactDOM.createRoot(root).render(
    <StrictMode>
      <VideoPage />
    </StrictMode>,
  )

  mounted = true
}

// Listen for float video message from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'FLOAT_VIDEO') {
    mountFloatingPlayer()
  }
})
