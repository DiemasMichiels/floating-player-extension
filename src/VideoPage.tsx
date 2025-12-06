import { useEffect } from 'react'
import { FloatingVideo } from '@/floatingVideo/FloatingVideo'
import { useVideoStore } from '@/useVideoStore'
import styles from './VideoPage.module.scss'

export const VideoPage = () => {
  const videoElement = useVideoStore((state) => state.videoElement)
  const searchForVideo = useVideoStore((state) => state.searchForVideo)

  useEffect(() => {
    if (!videoElement) {
      searchForVideo()
    }
  }, [videoElement, searchForVideo])

  if (!videoElement) {
    return null
  }

  return (
    <div className={styles.videoPage}>
      <FloatingVideo videoElement={videoElement} />
    </div>
  )
}
