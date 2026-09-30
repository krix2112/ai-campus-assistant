"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const SILENCE_TIMEOUT_MS = 2500;
const HARD_CAP_TIMEOUT_MS = 15000;

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const hasRequestedMicRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hardCapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep onTranscript ref synchronized
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearHardCapTimer = useCallback(() => {
    if (hardCapTimerRef.current) {
      clearTimeout(hardCapTimerRef.current);
      hardCapTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearSilenceTimer();
    clearHardCapTimer();
  }, [clearSilenceTimer, clearHardCapTimer]);

  const stopListening = useCallback(() => {
    clearAllTimers();
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    }
  }, [clearAllTimers]);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer, stopListening]);

  const startHardCapTimer = useCallback(() => {
    clearHardCapTimer();
    hardCapTimerRef.current = setTimeout(() => {
      stopListening();
    }, HARD_CAP_TIMEOUT_MS);
  }, [clearHardCapTimer, stopListening]);

  const initRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === "undefined") return null;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return null;

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = "en-IN";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        resetSilenceTimer();
        startHardCapTimer();
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let hasFinal = false;
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
              hasFinal = true;
              finalTranscript += res[0].transcript;
            } else {
              interimTranscript += res[0].transcript;
            }
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          onTranscriptRef.current(combined);
        }

        if (hasFinal) {
          stopListening();
        } else {
          resetSilenceTimer();
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.error(event.error);

        clearAllTimers();

        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
            break;
          case "no-speech":
            setErrorMessage("No speech was detected. Please try again.");
            break;
          case "audio-capture":
            setErrorMessage("No microphone was found or audio capture failed.");
            break;
          case "network":
            setErrorMessage("Network error during speech recognition.");
            break;
          case "aborted":
            break;
          default:
            setErrorMessage(`Speech recognition error: ${event.error}`);
            break;
        }

        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        clearAllTimers();
        isListeningRef.current = false;
        setIsListening(false);
      };

      return recognition;
    } catch (err: unknown) {
      const errorName = (err as { name?: string })?.name;
      console.error(errorName || "SpeechRecognition init error");
      return null;
    }
  }, [clearAllTimers, resetSilenceTimer, startHardCapTimer, stopListening]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    recognitionRef.current = initRecognition();

    return () => {
      clearAllTimers();
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [initRecognition, clearAllTimers]);

  const toggleListening = useCallback(async () => {
    setErrorMessage(null);

    // If currently listening, stop it immediately
    if (isListeningRef.current) {
      stopListening();
      return;
    }

    // Guard against rapid double triggers
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      // Explicitly request microphone permission on the first click
      if (!hasRequestedMicRef.current && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          let alreadyGranted = false;
          if (navigator.permissions && navigator.permissions.query) {
            try {
              const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
              if (status.state === "granted") {
                alreadyGranted = true;
              }
            } catch {
              // Ignore permissions query error if not supported
            }
          }

          if (!alreadyGranted) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop audio tracks immediately after checking permission
            stream.getTracks().forEach((track) => track.stop());
            // Short delay to allow the OS audio hardware to release before SpeechRecognition binds it
            await new Promise((resolve) => setTimeout(resolve, 80));
          }

          hasRequestedMicRef.current = true;
        } catch (err: unknown) {
          isStartingRef.current = false;
          const errorName = (err as { name?: string })?.name;
          console.error(errorName || "getUserMedia error");
          if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
            setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
          } else {
            setErrorMessage("Microphone access failed. Please check audio settings.");
          }
          return;
        }
      }

      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }

      if (!recognitionRef.current) {
        setErrorMessage("Speech recognition is not supported in this browser.");
        isStartingRef.current = false;
        return;
      }

      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
        resetSilenceTimer();
        startHardCapTimer();
      } catch (startErr: unknown) {
        const errorName = (startErr as { name?: string })?.name;
        if (errorName === "InvalidStateError") {
          // If instance is in a stale state, recreate instance and restart
          try {
            recognitionRef.current = initRecognition();
            recognitionRef.current?.start();
            isListeningRef.current = true;
            setIsListening(true);
            resetSilenceTimer();
            startHardCapTimer();
          } catch (retryErr: unknown) {
            const retryErrorName = (retryErr as { name?: string })?.name;
            console.error(retryErrorName || "SpeechRecognition retry error");
            stopListening();
          }
        } else {
          console.error(errorName || "SpeechRecognition start error");
          stopListening();
        }
      }
    } catch (err: unknown) {
      stopListening();
      const errorName = (err as { name?: string })?.name;
      console.error(errorName || "Voice input start error");
    } finally {
      isStartingRef.current = false;
    }
  }, [initRecognition, resetSilenceTimer, startHardCapTimer, stopListening]);

  return {
    isSupported,
    isListening,
    errorMessage,
    clearError: () => setErrorMessage(null),
    toggleListening,
    stopListening,
  };
}
