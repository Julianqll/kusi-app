"use client"

import { useState, useEffect, useCallback } from 'react'

interface SpeechSynthesisOptions {
  text: string
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = useCallback(({ 
    text, 
    language = 'es-ES', 
    rate = 0.8, 
    pitch = 1, 
    volume = 1 
  }: SpeechSynthesisOptions) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser')
      setPermissionError('La síntesis de voz no está soportada en este navegador')
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
      setHasPermission(true)
      setPermissionError(null)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
      setIsPaused(false)
      
      // Manejar diferentes tipos de errores
      switch (event.error) {
        case 'not-allowed':
          setPermissionError('Se requiere permiso del usuario para reproducir audio')
          break
        case 'audio-busy':
          setPermissionError('El audio está ocupado, intente nuevamente')
          break
        case 'audio-hardware':
          setPermissionError('Error de hardware de audio')
          break
        case 'network':
          setPermissionError('Error de red')
          break
        case 'synthesis-unavailable':
          setPermissionError('Síntesis de voz no disponible')
          break
        default:
          setPermissionError('Error de síntesis de voz')
      }
    }

    try {
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Error starting speech synthesis:', error)
      setPermissionError('No se pudo iniciar la síntesis de voz')
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSupported, isSpeaking])

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isSupported, isPaused])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported])

  return {
    isSupported,
    isSpeaking,
    isPaused,
    hasPermission,
    permissionError,
    speak,
    pause,
    resume,
    stop
  }
}
