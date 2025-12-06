import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { useVideoStore } from '@/useVideoStore'

export const useVideoListener = (videoElement: HTMLVideoElement | null) => {
  const {
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setIsBuffering,
  } = useVideoStore(
    useShallow((state) => ({
      setIsPlaying: state.setIsPlaying,
      setCurrentTime: state.setCurrentTime,
      setDuration: state.setDuration,
      setVolume: state.setVolume,
      setIsMuted: state.setIsMuted,
      setIsBuffering: state.setIsBuffering,
    })),
  )

  useEffect(() => {
    if (!videoElement) return

    // Handler for play event
    const handlePlay = () => {
      setIsPlaying(true)
      setCurrentTime(videoElement.currentTime * 1000)
      setDuration(videoElement.duration * 1000)
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
      setIsBuffering(false)
    }

    // Handler for pause event
    const handlePause = () => {
      setIsPlaying(false)
      setCurrentTime(videoElement.currentTime * 1000)
      setDuration(videoElement.duration * 1000)
      setIsBuffering(false)
    }

    // Handler for seeking
    const handleSeeking = () => {
      setCurrentTime(videoElement.currentTime * 1000)
      setDuration(videoElement.duration * 1000)
    }

    // Handler for rate change
    const handleRateChange = () => {
      setCurrentTime(videoElement.currentTime * 1000)
      setDuration(videoElement.duration * 1000)
    }

    // Handler for time update
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime * 1000)
    }

    // Handler for duration change
    const handleDurationChange = () => {
      setDuration(videoElement.duration * 1000)
    }

    // Handler for volume change
    const handleVolumeChange = () => {
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
    }

    // Handler for buffering state
    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    // Add event listeners
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('seeking', handleSeeking)
    videoElement.addEventListener('ratechange', handleRateChange)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('durationchange', handleDurationChange)
    videoElement.addEventListener('volumechange', handleVolumeChange)
    videoElement.addEventListener('waiting', handleWaiting)
    videoElement.addEventListener('playing', handlePlaying)
    videoElement.addEventListener('canplay', handleCanPlay)

    // Initialize state with current video state
    setIsPlaying(!videoElement.paused)
    setCurrentTime(videoElement.currentTime * 1000)
    setDuration(videoElement.duration * 1000)
    setVolume(videoElement.volume)
    setIsMuted(videoElement.muted)
    setIsBuffering(videoElement.readyState < 3)

    // Clean up event listeners
    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('seeking', handleSeeking)
      videoElement.removeEventListener('ratechange', handleRateChange)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('durationchange', handleDurationChange)
      videoElement.removeEventListener('volumechange', handleVolumeChange)
      videoElement.removeEventListener('waiting', handleWaiting)
      videoElement.removeEventListener('playing', handlePlaying)
      videoElement.removeEventListener('canplay', handleCanPlay)
    }
  }, [
    videoElement,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setIsBuffering,
  ])
}
