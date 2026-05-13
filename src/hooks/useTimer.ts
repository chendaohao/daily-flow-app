import { useState, useRef, useCallback, useEffect } from "react";

export type TimerMode = "focus" | "break" | "idle";

interface UseTimerReturn {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
}

export function useTimer(
  focusMinutes: number = 50,
  breakMinutes: number = 10,
  onPhaseEnd?: (mode: TimerMode) => void
): UseTimerReturn {
  const [mode, setMode] = useState<TimerMode>("idle");
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPhaseEndRef = useRef(onPhaseEnd);

  useEffect(() => {
    onPhaseEndRef.current = onPhaseEnd;
  }, [onPhaseEnd]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setMode("focus");
    setSecondsLeft(focusMinutes * 60);
    setIsRunning(true);
  }, [clearTimer, focusMinutes]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const skip = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    if (mode === "focus") {
      setMode("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setMode("idle");
      setSecondsLeft(focusMinutes * 60);
    }
  }, [clearTimer, mode, focusMinutes, breakMinutes]);

  const reset = useCallback(() => {
    clearTimer();
    setMode("idle");
    setSecondsLeft(focusMinutes * 60);
    setIsRunning(false);
  }, [clearTimer, focusMinutes]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  useEffect(() => {
    if (!isRunning || secondsLeft > 0) return;

    setIsRunning(false);
    onPhaseEndRef.current?.(mode);

    if (mode === "focus") {
      setMode("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setMode("idle");
      setSecondsLeft(focusMinutes * 60);
    }
  }, [secondsLeft, isRunning, mode, focusMinutes, breakMinutes]);

  return { mode, secondsLeft, isRunning, start, pause, resume, skip, reset };
}
