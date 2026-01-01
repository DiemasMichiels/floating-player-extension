import { FloatingVideo } from '@/floatingVideo/FloatingVideo'
import styles from './VideoPage.module.scss'
import { FloatingIframe } from './floatingIframe/FloatingIframe'

type MediaElement = HTMLVideoElement | HTMLIFrameElement

type VideoPageProps = {
  selectedElement: MediaElement
  onClose: () => void
}

export const VideoPage = ({ selectedElement, onClose }: VideoPageProps) => {
  const isVideo = selectedElement instanceof HTMLVideoElement
  const isIframe = selectedElement instanceof HTMLIFrameElement

  if (!isVideo && !isIframe) {
    return null
  }

  return (
    <div className={styles.videoPage}>
      {isVideo ? (
        <FloatingVideo videoElement={selectedElement} onClose={onClose} />
      ) : (
        <FloatingIframe iframeElement={selectedElement} onClose={onClose} />
      )}
    </div>
  )
}
