import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import Draggable from 'react-draggable'
import styles from './DraggableWrapper.module.scss'

type Position = {
  x: number
  y: number
}

type Size = {
  width: number
  height: number
}

type DraggableWrapperProps = {
  children: ReactNode
  className?: string
  headerContent?: ReactNode
  onClose?: () => void
  storageKey?: string
  bounds?: string
  defaultWidth?: number
  resizable?: boolean
  showResizeHandle?: boolean
  defaultVertical?: boolean
  onVerticalChange?: (isVertical: boolean) => void
}

export interface DraggableWrapperRef {
  setSize: (width: number, height?: number, isVertical?: boolean) => void
  setVertical: (isVertical: boolean) => void
  isVertical: boolean
}

export const DraggableWrapper = forwardRef<
  DraggableWrapperRef,
  DraggableWrapperProps
>(
  (
    {
      children,
      storageKey = 'draggablePosition',
      bounds = 'body',
      defaultWidth = 640,
      resizable = true,
      showResizeHandle = true,
      defaultVertical = false,
      onVerticalChange,
    },
    ref,
  ) => {
    const [controlledPosition, setControlledPosition] = useState<Position>({
      x: 50,
      y: 50,
    })
    const [size, setSize] = useState<Size>({
      width: defaultWidth,
      height: defaultWidth * (9 / 16),
    })
    const [isVertical, setIsVertical] = useState(defaultVertical)
    const [isResizing, setIsResizing] = useState(false)
    const draggableRef = useRef<HTMLDivElement>(null)
    const resizeRef = useRef<{
      startX: number
      startY: number
      startWidth: number
      startHeight: number
    } | null>(null)

    const getAspectRatio = useCallback((vertical: boolean) => {
      return vertical ? 16 / 9 : 9 / 16
    }, [])

    const calculateHeight = useCallback(
      (currentWidth: number, vertical: boolean) => {
        return currentWidth * getAspectRatio(vertical)
      },
      [getAspectRatio],
    )

    const calculateWidth = useCallback(
      (currentHeight: number, vertical: boolean) => {
        return currentHeight / getAspectRatio(vertical)
      },
      [getAspectRatio],
    )

    const saveState = useCallback(
      async (position: Position, currentSize: Size, vertical: boolean) => {
        try {
          if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({
              [storageKey]: position,
              [`${storageKey}_size`]: currentSize,
              [`${storageKey}_vertical`]: vertical,
            })
          }
        } catch (error) {
          console.log('Error saving state:', error)
        }
      },
      [storageKey],
    )

    const updateVertical = useCallback(
      (vertical: boolean) => {
        setIsVertical(vertical)
        onVerticalChange?.(vertical)

        // Recalculate size for new orientation
        setSize((prevSize) => {
          const newHeight = calculateHeight(prevSize.width, vertical)
          return { width: prevSize.width, height: newHeight }
        })

        // Save immediately
        setSize((currentSize) => {
          saveState(controlledPosition, currentSize, vertical)
          return currentSize
        })
      },
      [onVerticalChange, calculateHeight, controlledPosition, saveState],
    )

    useImperativeHandle(ref, () => ({
      setSize: (
        width: number,
        height?: number,
        isVerticalParam: boolean = isVertical,
      ) => {
        setSize((prevSize) => {
          let newWidth = Math.max(320, width)
          let newHeight = height
            ? Math.max(180, height)
            : calculateHeight(newWidth, isVerticalParam)

          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight

          if (newWidth > viewportWidth) {
            newWidth = viewportWidth
            newHeight = calculateHeight(newWidth, isVerticalParam)
          }

          if (newHeight > viewportHeight) {
            newHeight = viewportHeight
            newWidth = calculateWidth(newHeight, isVerticalParam)
          }

          if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
            const updatedSize = { width: newWidth, height: newHeight }
            saveState(controlledPosition, updatedSize, isVertical)
            return updatedSize
          }
          return prevSize
        })
      },
      setVertical: updateVertical,
      get isVertical() {
        return isVertical
      },
    }))

    useEffect(() => {
      const loadSavedState = async () => {
        try {
          if (typeof chrome === 'undefined' || !chrome.storage) {
            console.warn(
              'chrome.storage is not available. Skipping state loading.',
            )
            setSize({
              width: defaultWidth,
              height: calculateHeight(defaultWidth, defaultVertical),
            })
            return
          }

          const storage = await chrome.storage.local.get([
            storageKey,
            `${storageKey}_size`,
            `${storageKey}_vertical`,
          ])
          const savedPosition = storage[storageKey]
          const savedSize = storage[`${storageKey}_size`]
          const savedVertical = storage[`${storageKey}_vertical`]

          // Load vertical first
          const vertical = savedVertical ?? defaultVertical
          setIsVertical(vertical)
          onVerticalChange?.(vertical)

          if (
            savedPosition &&
            typeof savedPosition.x === 'number' &&
            typeof savedPosition.y === 'number'
          ) {
            setControlledPosition(savedPosition)
          }

          if (
            savedSize &&
            typeof savedSize.width === 'number' &&
            typeof savedSize.height === 'number'
          ) {
            const adjustedHeight = calculateHeight(savedSize.width, vertical)
            setSize({ width: savedSize.width, height: adjustedHeight })
          } else {
            setSize({
              width: defaultWidth,
              height: calculateHeight(defaultWidth, vertical),
            })
          }
        } catch (error) {
          console.log('Error loading state:', error)
        }
      }

      loadSavedState()
    }, [
      storageKey,
      defaultWidth,
      defaultVertical,
      calculateHeight,
      onVerticalChange,
    ])

    const handleMouseDownResize = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        resizeRef.current = {
          startX:
            (e as React.MouseEvent).clientX ||
            (e as React.TouchEvent).touches[0].clientX,
          startY:
            (e as React.MouseEvent).clientY ||
            (e as React.TouchEvent).touches[0].clientY,
          startWidth: size.width,
          startHeight: size.height,
        }
      },
      [size],
    )

    useEffect(() => {
      if (!isResizing) return

      const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!resizeRef.current) return

        const x =
          (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX
        const y =
          (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY
        const deltaX = x - resizeRef.current.startX
        const deltaY = y - resizeRef.current.startY

        const currentAspectRatio = getAspectRatio(isVertical)
        const delta = Math.max(deltaX, deltaY / currentAspectRatio)

        let newWidth = Math.max(320, resizeRef.current.startWidth + delta)
        let newHeight = calculateHeight(newWidth, isVertical)

        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        if (newWidth > viewportWidth) {
          newWidth = viewportWidth
          newHeight = calculateHeight(newWidth, isVertical)
        }

        if (newHeight > viewportHeight) {
          newHeight = viewportHeight
          newWidth = calculateWidth(newHeight, isVertical)
        }

        setSize((prevSize) => {
          if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
            return { width: newWidth, height: newHeight }
          }
          return prevSize
        })
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        resizeRef.current = null
        saveState(controlledPosition, size, isVertical)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchend', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }, [
      isResizing,
      controlledPosition,
      size,
      saveState,
      isVertical,
      calculateHeight,
      calculateWidth,
      getAspectRatio,
    ])

    useEffect(() => {
      let timeoutId: NodeJS.Timeout

      const handleWindowResizeAndAspectRatioChange = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (!draggableRef.current) return

          const currentPosition = { ...controlledPosition }
          const currentSize = { ...size }
          let needsUpdate = false

          const currentCalculatedHeight = calculateHeight(
            currentSize.width,
            isVertical,
          )

          if (
            Math.abs(currentSize.height - currentCalculatedHeight) > 1 ||
            currentSize.width === defaultWidth
          ) {
            currentSize.height = currentCalculatedHeight
            needsUpdate = true
          }

          const viewportWidth = document.documentElement.clientWidth
          const viewportHeight = document.documentElement.clientHeight

          if (currentSize.width > viewportWidth) {
            currentSize.width = viewportWidth
            currentSize.height = calculateHeight(currentSize.width, isVertical)
            needsUpdate = true
          }

          if (currentSize.height > viewportHeight) {
            currentSize.height = viewportHeight
            currentSize.width = calculateWidth(currentSize.height, isVertical)
            needsUpdate = true
          }

          if (currentPosition.x + currentSize.width > viewportWidth) {
            currentPosition.x = Math.max(0, viewportWidth - currentSize.width)
            needsUpdate = true
          }
          if (currentPosition.x < 0) {
            currentPosition.x = 0
            needsUpdate = true
          }

          if (currentPosition.y + currentSize.height > viewportHeight) {
            currentPosition.y = Math.max(0, viewportHeight - currentSize.height)
            needsUpdate = true
          }
          if (currentPosition.y < 0) {
            currentPosition.y = 0
            needsUpdate = true
          }

          if (needsUpdate) {
            setControlledPosition(currentPosition)
            setSize(currentSize)
            saveState(currentPosition, currentSize, isVertical)
          }
        }, 100)
      }

      handleWindowResizeAndAspectRatioChange()
      window.addEventListener('resize', handleWindowResizeAndAspectRatioChange)

      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener(
          'resize',
          handleWindowResizeAndAspectRatioChange,
        )
      }
    }, [
      controlledPosition,
      size,
      saveState,
      isVertical,
      calculateHeight,
      calculateWidth,
      defaultWidth,
    ])

    return (
      <Draggable
        nodeRef={draggableRef as React.RefObject<HTMLDivElement>}
        handle='.draggable-handle'
        bounds={bounds}
        position={controlledPosition}
        disabled={isResizing}
        onStop={(_, position) => {
          setControlledPosition({ x: position.x, y: position.y })
          saveState(position, size, isVertical)
        }}
        onDrag={(_, position) => {
          setControlledPosition({ x: position.x, y: position.y })
        }}
      >
        <div
          ref={draggableRef}
          className={styles.draggableWrapper}
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            position: 'relative',
            cursor: isResizing ? 'se-resize' : 'auto',
          }}
        >
          <div
            style={{
              display: 'contents',
              pointerEvents: isResizing ? 'none' : 'auto',
            }}
          >
            {children}
          </div>
          {resizable && (
            <div
              className={styles.resizeHandle}
              onMouseDown={handleMouseDownResize}
              onTouchStart={handleMouseDownResize}
              style={{
                zIndex: 3,
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '20px',
                height: '20px',
                cursor: 'se-resize',
                color: '#fff',
                backgroundColor: 'transparent',
                opacity: showResizeHandle ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                }}
              >
                <path
                  d='M 5,15 L 15,5 M 10,15 L 15,10 M 15,15 L 15,15'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  fill='none'
                  opacity='0.5'
                />
              </svg>
            </div>
          )}
        </div>
      </Draggable>
    )
  },
)
