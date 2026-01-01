// Track active state per tab
const activeStates = new Map<number, boolean>()

chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'FLOAT_VIDEO' })
    }
  } catch (error) {
    console.log('Error sending message:', error)
  }
})

// Listen for state changes from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'STATE_CHANGED' && sender.tab?.id) {
    const tabId = sender.tab.id
    const isActive = message.isActive

    activeStates.set(tabId, isActive)
    updateIcon(tabId, isActive)
  }
})

// Update icon based on state
const updateIcon = (tabId: number, isActive: boolean) => {
  if (isActive) {
    // Small green dot with minimal background
    chrome.action.setBadgeText({ tabId, text: ' ' })
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#0b5124' })
    chrome.action.setTitle({
      tabId,
      title: 'Floating Player (Active - click to close)',
    })
  } else {
    chrome.action.setBadgeText({ tabId, text: '' })
    chrome.action.setTitle({ tabId, title: 'Floating Player' })
  }
}

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  activeStates.delete(tabId)
})

// Reset icon when navigating to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    activeStates.delete(tabId)
    updateIcon(tabId, false)
  }
})
