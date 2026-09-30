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
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: SpeechRecognitionErrorEventLike) => void;
  onend: () => void;
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
          .webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        try {
          const recognition = new SpeechRecognitionConstructor();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = "en-IN";

          recognition.onresult = (event: SpeechRecognitionEventLike) => {
            const transcript = Array.from({ length: event.results.length })
              .map((_, i) => event.results[i][0].transcript)
              .join("");
            if (transcript) {
              onTranscript(transcript);
            }
          };

          recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
            } else if (event.error !== "no-speech") {
              setErrorMessage(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
          setIsSupported(true);
        } catch {
          setIsSupported(false);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setErrorMessage(null);

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    errorMessage,
    clearError: () => setErrorMessage(null),
    toggleListening,
  };
}
