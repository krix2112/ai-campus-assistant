"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Mic, MicOff, AlertCircle } from "lucide-react";
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
    stopListening,
  } = useSpeechRecognition((transcript) => {
    onChange(transcript.slice(0, MAX_CHARS));
  });

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading && rateLimitSeconds === 0) {
      stopListening();
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!val.trim() && isListening) {
      stopListening();
    }
    onChange(val);
  };

  const charCount = input.length;
  const isNearLimit = charCount >= 450;
  const isOverLimit = charCount > MAX_CHARS;
  const isSendDisabled = !input.trim() || isLoading || isOverLimit || rateLimitSeconds > 0;

  return (
    <div className="w-full bg-surface/95 border-t-[1.5px] border-ink p-3 sm:p-4 rounded-b-card">
      <div className="flex flex-col gap-2">
        {/* Rate Limit Warning */}
        {rateLimitSeconds > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink bg-accent/20 border-[1.5px] border-ink px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
            <span>
              RATE LIMIT ACTIVE: WAIT <strong>{rateLimitSeconds}S</strong> BEFORE NEXT QUERY.
            </span>
          </div>
        )}

        {/* Speech Permission Error Notification */}
        {speechError && (
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-ink bg-accent/15 border-[1.5px] border-ink px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={clearSpeechError}
              className="text-accent hover:text-ink font-bold uppercase underline text-[11px]"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Live Audio Waveform Indicator when Recording */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-accent/15 border-[1.5px] border-ink rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <span className="text-xs font-mono font-bold uppercase text-ink">
                LISTENING (EN-IN)... SPEAK YOUR QUESTION
              </span>
            </div>
            {/* 5 Waveform bars */}
            <div className="flex items-center gap-1 h-5" aria-hidden="true">
              <span className="w-1 bg-ink rounded-full wave-bar-1" />
              <span className="w-1 bg-accent rounded-full wave-bar-2" />
              <span className="w-1 bg-ink rounded-full wave-bar-3" />
              <span className="w-1 bg-accent rounded-full wave-bar-4" />
              <span className="w-1 bg-ink rounded-full wave-bar-5" />
            </div>
          </div>
        )}

        {/* Input Box Container */}
        <div className="relative flex items-end gap-2 bg-paper border-[1.5px] border-ink rounded-[12px] p-2 shadow-hard-sm focus-within:shadow-hard focus-within:-translate-y-0.5 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={isLoading || rateLimitSeconds > 0}
            maxLength={MAX_CHARS}
            placeholder={
              isListening
                ? "Listening..."
                : "Ask about hostel curfew, library timings, clubs, mess..."
            }
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 max-h-32 min-h-[38px] py-1.5 px-2 bg-transparent text-sm text-ink placeholder:text-ink/40 resize-none focus:outline-none leading-relaxed font-body"
            aria-label="Ask a campus question"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
            {/* Voice Input Button with Concentric Pulse Effect */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading || rateLimitSeconds > 0}
                aria-label={isListening ? "Stop voice recording" : "Start voice input"}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`relative p-2 rounded-full border-[1.5px] border-ink transition-all ${
                  isListening
                    ? "bg-accent text-ink shadow-hard-sm"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-ink" aria-hidden="true" />
                    {/* Concentric pulse rings */}
                    <span className="absolute -inset-1 rounded-full border-[1.5px] border-accent animate-ping pointer-events-none" />
                  </>
                ) : (
                  <Mic className="w-4 h-4 text-ink" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isSendDisabled}
              aria-label="Send message"
              title="Send message"
              className={`p-2 rounded-full border-[1.5px] border-ink transition-all flex items-center justify-center ${
                isSendDisabled
                  ? "bg-surface-muted text-ink/30 cursor-not-allowed border-ink/40"
                  : "bg-accent text-ink hover:bg-accent-hover active:translate-x-0.5 active:translate-y-0.5 shadow-hard-sm"
              }`}
            >
              <ArrowUp className="w-4 h-4 text-ink stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Helper footer text and character counter */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-ink/60">
          <span className="hidden sm:inline">
            ENTER TO SEND • SHIFT+ENTER FOR NEWLINE
          </span>
          <span
            className={`ml-auto font-mono ${
              isNearLimit ? (isOverLimit ? "text-accent font-bold" : "text-accent") : "text-ink/60"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
};
