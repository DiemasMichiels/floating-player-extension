chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'FLOAT_VIDEO' })
    }
  } catch (error) {
    console.log('Error sending message:', error)
  }
})
