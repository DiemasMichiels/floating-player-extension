import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './VideoPicker.module.scss'
import { IconPictureInPictureTopFilled } from '@tabler/icons-react'

type MediaElement = HTMLVideoElement | HTMLIFrameElement

type VideoPickerProps = {
  onSelect: (element: MediaElement) => void
}

type PickerButtonProps = {
  element: MediaElement
  onSelect: (element: MediaElement) => void
}

const PickerButton = ({ element, onSelect }: PickerButtonProps) => {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updatePosition = () => {
      const rect = element.getBoundingClientRect()
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    const observer = new ResizeObserver(updatePosition)
    observer.observe(element)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      observer.disconnect()
    }
  }, [element])

  // Don't render if element is too small
  if (position.width < 100 || position.height < 100) {
    return null
  }

  return createPortal(
    <div
      className={styles.pickerOverlay}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
    >
      <button
        className={styles.pickerIcon}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onSelect(element)
        }}
        title='Float this video'
      >
        <IconPictureInPictureTopFilled />
      </button>
    </div>,
    document.body,
  )
}

export const VideoPicker = ({ onSelect }: VideoPickerProps) => {
  const [mediaElements, setMediaElements] = useState<MediaElement[]>([])
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  useEffect(() => {
    const findMediaElements = () => {
      const videos = Array.from(document.getElementsByTagName('video')).filter(
        (v) => v.offsetWidth > 100 && v.offsetHeight > 100,
      )

      const iframes = Array.from(
        document.getElementsByTagName('iframe'),
      ).filter((iframe) => {
        if (iframe.offsetWidth < 100 || iframe.offsetHeight < 100) return false
        const src = iframe.src.toLowerCase()
        return (
          src.includes('player') ||
          src.includes('embed') ||
          src.includes('video') ||
          src.includes('youtube') ||
          src.includes('vimeo') ||
          src.includes('mediadelivery') ||
          iframe.allowFullscreen
        )
      })

      const elements = [...videos, ...iframes]
      setMediaElements(elements)

      // Auto-select if only one element found
      if (elements.length === 1 && !hasAutoSelected) {
        setHasAutoSelected(true)
        onSelect(elements[0])
      }
    }

    findMediaElements()

    // Re-scan periodically in case videos load dynamically
    const interval = setInterval(findMediaElements, 2000)

    return () => clearInterval(interval)
  }, [onSelect, hasAutoSelected])

  return (
    <>
      {mediaElements.map((element, index) => (
        <PickerButton key={index} element={element} onSelect={onSelect} />
      ))}
    </>
  )
}
