import { useRef, useEffect } from 'react'
import {
  DraggableWrapper,
  DraggableWrapperRef,
} from '@/draggableWrapper/DraggableWrapper'
import { IframeControls } from '../controls/IframeControls'
import styles from './FloatingIframe.module.scss'

type FloatingIframeProps = {
  iframeElement: HTMLIFrameElement
  onClose: () => void
}

export const FloatingIframe = ({ iframeElement, onClose }: FloatingIframeProps) => {
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<DraggableWrapperRef>(null)
  const originalIframeRef = useRef<{
    iframe: HTMLIFrameElement
    parent: Element
    nextSibling: Node | null
  } | null>(null)

  // Move iframe to floating window
  useEffect(() => {
    if (iframeContainerRef.current && iframeElement.parentElement) {
      const parentInfo = {
        iframe: iframeElement,
        parent: iframeElement.parentElement,
        nextSibling: iframeElement.nextSibling,
      }
      originalIframeRef.current = parentInfo

      iframeElement.style.width = '100%'
      iframeElement.style.height = '100%'
      iframeElement.style.border = 'none'

      iframeContainerRef.current.appendChild(iframeElement)

      return () => {
        if (parentInfo.nextSibling) {
          parentInfo.parent.insertBefore(iframeElement, parentInfo.nextSibling)
        } else {
          parentInfo.parent.appendChild(iframeElement)
        }
        iframeElement.style.width = ''
        iframeElement.style.height = ''
        iframeElement.style.border = ''
      }
    }
  }, [iframeElement])

  const handleClose = () => {
    if (originalIframeRef.current) {
      const { iframe, parent, nextSibling } = originalIframeRef.current
      iframe.style.width = ''
      iframe.style.height = ''
      iframe.style.border = ''
      if (nextSibling) {
        parent.insertBefore(iframe, nextSibling)
      } else {
        parent.appendChild(iframe)
      }
    }
    onClose()
  }

  return (
    <DraggableWrapper
      ref={draggableRef}
      storageKey='floating-iframe-position'
      showResizeHandle={true}
      isVerticalAspectRatio={false}
    >
      <div
        ref={iframeContainerRef}
        className={styles.iframeContainer}
        style={{ cursor: 'pointer' }}
      />
      <IframeControls
        onClose={handleClose}
        onTheaterMode={() =>
          draggableRef.current?.setSize(window.innerWidth, window.innerHeight)
        }
        onFullscreen={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            iframeElement.requestFullscreen()
          }
        }}
      />
    </DraggableWrapper>
  )
}
