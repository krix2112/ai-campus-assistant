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
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const onTranscriptRef = useRef(onTranscript);

  // Keep onTranscript ref synchronized
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = "en-IN";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
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
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.error(event.error);

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
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err: unknown) {
      const errorName = (err as { name?: string })?.name;
      console.error(errorName || "SpeechRecognition init error");
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return;
    setErrorMessage(null);

    // If currently listening, stop it
    if (isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    // Guard against rapid double triggers
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      // Explicitly request microphone permission on first click
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop audio tracks immediately after permission check
          stream.getTracks().forEach((track) => track.stop());
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

      if (isListeningRef.current) {
        isStartingRef.current = false;
        return;
      }

      isListeningRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err: unknown) {
      isListeningRef.current = false;
      setIsListening(false);
      const errorName = (err as { name?: string })?.name;
      if (errorName !== "InvalidStateError") {
        console.error(errorName || "SpeechRecognition start error");
      }
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  return {
    isSupported,
    isListening,
    errorMessage,
    clearError: () => setErrorMessage(null),
    toggleListening,
  };
}
