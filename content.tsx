import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { VideoPage } from './src/VideoPage'
import { VideoPicker } from './src/videoPicker/VideoPicker'

type MediaElement = HTMLVideoElement | HTMLIFrameElement

let rootElement: HTMLDivElement | null = null
let reactRoot: ReactDOM.Root | null = null
let currentMode: 'idle' | 'picking' | 'floating' = 'idle'
let selectedElement: MediaElement | null = null
let wasAutoSelected = false

const notifyStateChange = (isActive: boolean) => {
  chrome.runtime.sendMessage({ type: 'STATE_CHANGED', isActive })
}

const createRoot = () => {
  if (rootElement) return

  rootElement = document.createElement('div')
  rootElement.id = 'float-video-root'
  rootElement.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    pointer-events: none;
  `
  document.body.appendChild(rootElement)
  reactRoot = ReactDOM.createRoot(rootElement)
}

const cleanup = () => {
  if (reactRoot) {
    reactRoot.unmount()
    reactRoot = null
  }
  if (rootElement) {
    rootElement.remove()
    rootElement = null
  }
  currentMode = 'idle'
  selectedElement = null
  wasAutoSelected = false
  notifyStateChange(false)
}

const handleSelect = (element: MediaElement, autoSelected = false) => {
  selectedElement = element
  wasAutoSelected = autoSelected
  currentMode = 'floating'
  render()
}

const handleClose = () => {
  // If it was auto-selected (single video), close completely
  // Otherwise go back to picker
  if (wasAutoSelected) {
    cleanup()
  } else {
    selectedElement = null
    currentMode = 'picking'
    render()
  }
}

const render = () => {
  if (!reactRoot) return

  if (currentMode === 'picking') {
    reactRoot.render(
      <StrictMode>
        <VideoPicker onSelect={handleSelect} />
      </StrictMode>
    )
  } else if (currentMode === 'floating' && selectedElement) {
    reactRoot.render(
      <StrictMode>
        <VideoPage selectedElement={selectedElement} onClose={handleClose} />
      </StrictMode>
    )
  }
}

const toggleFloatingPlayer = () => {
  if (currentMode === 'idle') {
    createRoot()
    currentMode = 'picking'
    render()
    notifyStateChange(true)
  } else {
    cleanup()
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'FLOAT_VIDEO') {
    toggleFloatingPlayer()
  }
})
