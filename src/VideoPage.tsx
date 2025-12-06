import { useEffect } from 'react'
import { FloatingVideo } from '@/floatingVideo/FloatingVideo'
import { useVideoStore } from '@/useVideoStore'
import styles from './VideoPage.module.scss'
import { FloatingIframe } from './floatingIframe/FloatingIframe'

export const VideoPage = () => {
  const videoElement = useVideoStore((state) => state.videoElement)
  const searchForVideo = useVideoStore((state) => state.searchForVideo)

  useEffect(() => {
    if (!videoElement) {
      searchForVideo()
    }
  }, [videoElement, searchForVideo])

  // Find iframe only if no video element exists
  const iframeElement =
    !videoElement &&
    document.querySelectorAll('iframe').length > 0 &&
    Array.from(document.querySelectorAll('iframe')).find((iframe) => {
      const src = iframe.src.toLowerCase()
      return (
        src.includes('player') ||
        src.includes('embed') ||
        src.includes('video') ||
        src.includes('mediadelivery') ||
        iframe.allowFullscreen
      )
    })

  const hasVideoIframes = !!iframeElement

  if (!videoElement && !hasVideoIframes) {
    return null
  }

  return (
    <div className={styles.videoPage}>
      {videoElement ? (
        <FloatingVideo videoElement={videoElement} />
      ) : (
        hasVideoIframes && <FloatingIframe iframeElement={iframeElement} />
      )}
    </div>
  )
}
