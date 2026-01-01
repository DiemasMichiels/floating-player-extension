import { create } from 'zustand'

interface VideoStore {
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  currentTime: number
  setCurrentTime: (time: number) => void
  duration: number
  setDuration: (duration: number) => void
  volume: number
  setVolume: (volume: number) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  isBuffering: boolean
  setIsBuffering: (isBuffering: boolean) => void
  videoElement: HTMLVideoElement | null
  setVideoElement: (element: HTMLVideoElement | null) => void
}

export const useVideoStore = create<VideoStore>((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
  volume: 0,
  setVolume: (volume) => set({ volume }),
  isMuted: false,
  setIsMuted: (muted) => set({ isMuted: muted }),
  isBuffering: false,
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  videoElement: null,
  setVideoElement: (element) => set({ videoElement: element }),
}))
