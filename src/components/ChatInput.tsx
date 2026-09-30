"use client";

import React, { useRef, useEffect } from "react";
import { Send, Mic, MicOff, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  rateLimitSeconds?: number;
}

const MAX_CHARS = 500;

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChange,
  onSend,
  isLoading,
  rateLimitSeconds = 0,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isSupported: isSpeechSupported,
    isListening,
    errorMessage: speechError,
    clearError: clearSpeechError,
    toggleListening,
  } = useSpeechRecognition((transcript) => {
    onChange(transcript.slice(0, MAX_CHARS));
  });

  // Focus textarea on load
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && rateLimitSeconds === 0) {
        onSend();
      }
    }
  };

  const charCount = input.length;
  const isNearLimit = charCount >= 450;
  const isOverLimit = charCount > MAX_CHARS;
  const isSendDisabled = !input.trim() || isLoading || isOverLimit || rateLimitSeconds > 0;

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-t border-slate-200/90 py-3 px-4 sm:px-6 sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
        {/* Rate limit warning banner */}
        {rateLimitSeconds > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />
            <span>
              Rate limit active. Please wait <strong>{rateLimitSeconds}s</strong> before sending another message.
            </span>
          </div>
        )}

        {/* Speech permission or error notification */}
        {speechError && (
          <div className="flex items-center justify-between gap-2 text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" aria-hidden="true" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={clearSpeechError}
              className="text-red-700 hover:text-red-900 font-semibold underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input box container */}
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300/80 rounded-2xl p-2 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={isLoading || rateLimitSeconds > 0}
            maxLength={MAX_CHARS}
            placeholder={
              isListening
                ? "Listening... Speak your campus question now"
                : "Ask about courses, library timings, clubs, hostel rules..."
            }
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 max-h-32 min-h-[40px] py-2 px-2 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed"
            aria-label="Ask a campus question"
          />

          <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
            {/* Voice Input Button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading || rateLimitSeconds > 0}
                aria-label={isListening ? "Stop voice listening" : "Start voice input"}
                title={isListening ? "Stop listening" : "Voice input (Web Speech)"}
                className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isListening
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "hover:bg-slate-200/70"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-red-600" aria-hidden="true" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  </>
                ) : (
                  <Mic className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={onSend}
              disabled={isSendDisabled}
              aria-label="Send message"
              title="Send message"
              className={`p-2 rounded-xl transition-all duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSendDisabled
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
              }`}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Footer info: Character counter & hint */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Shift+Enter</kbd> for newline
          </span>
          <span
            className={`ml-auto font-mono ${
              isNearLimit ? (isOverLimit ? "text-red-600 font-bold" : "text-amber-600 font-medium") : "text-slate-500"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
};
