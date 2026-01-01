import clsx from 'clsx'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useShallow } from 'zustand/shallow'
import {
  DraggableWrapper,
  DraggableWrapperRef,
} from '@/draggableWrapper/DraggableWrapper'
import { useVideoStore } from '@/useVideoStore'
import { useVideoListener } from '@/useVideoListener'
import { Controls } from '../controls/Controls'
import styles from './FloatingVideo.module.scss'

type FloatingVideoProps = {
  videoElement: HTMLVideoElement
  onClose: () => void
}

export const FloatingVideo = ({ videoElement, onClose }: FloatingVideoProps) => {
  const [showControls, setShowControls] = useState(true)
  const [isVertical, setIsVertical] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number | undefined>()

  const videoContainerRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<DraggableWrapperRef>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useVideoListener(videoElement)

  const { isBuffering, isPlaying, setVideoElement } = useVideoStore(
    useShallow((state) => ({
      isBuffering: state.isBuffering,
      isPlaying: state.isPlaying,
      setVideoElement: state.setVideoElement,
    })),
  )

  // Set video element in store so Controls can access it
  useEffect(() => {
    setVideoElement(videoElement)
    return () => setVideoElement(null)
  }, [videoElement, setVideoElement])

  // Resize observer for container width
  useEffect(() => {
    if (!videoContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(videoContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Move video element to floating window, restore on unmount
  useEffect(() => {
    if (!videoContainerRef.current || !videoElement.parentElement) return

    const originalParent = videoElement.parentElement
    const originalNextSibling = videoElement.nextSibling

    videoContainerRef.current.appendChild(videoElement)

    return () => {
      if (originalNextSibling) {
        originalParent.insertBefore(videoElement, originalNextSibling)
      } else {
        originalParent.appendChild(videoElement)
      }
    }
  }, [videoElement])

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }

    setShowControls(true)

    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      setShowControls(true)
    } else {
      resetHideTimer()
    }
  }, [isPlaying, resetHideTimer])

  const handleVideoClick = useCallback(() => {
    if (videoElement.paused) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  }, [videoElement])

  return (
    <DraggableWrapper
      ref={draggableRef}
      storageKey='floating-video-position'
      showResizeHandle={showControls}
      isVerticalAspectRatio={isVertical}
    >
      <div
        ref={videoContainerRef}
        className={clsx(styles.videoContainer, {
          [styles.verticalVideo]: isVertical,
        })}
        onMouseMove={resetHideTimer}
        onClick={handleVideoClick}
        style={{ cursor: 'pointer' }}
      >
        {isBuffering && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
      <Controls
        show={showControls}
        onClose={onClose}
        onTheaterMode={() =>
          draggableRef.current?.setSize(
            window.innerWidth,
            window.innerHeight,
            isVertical,
          )
        }
        isVertical={isVertical}
        onOrientationChange={setIsVertical}
        containerWidth={containerWidth}
      />
    </DraggableWrapper>
  )
}
