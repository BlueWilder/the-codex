import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TrustSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TrustSlider({ value, onChange, disabled }: TrustSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartedRef = useRef(false);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return Math.round(pct);
  }, [value]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const newValue = getValueFromPosition(e.clientX);
    onChange(newValue);
  }, [disabled, getValueFromPosition, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.stopPropagation();
    touchStartedRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      touchStartedRef.current = true;
      setIsDragging(true);
    }, 50);
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    touchStartedRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      onChange(newValue);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartedRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      onChange(newValue);
    };

    const handleEnd = () => {
      setIsDragging(false);
      touchStartedRef.current = false;
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isDragging, getValueFromPosition, onChange]);

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative w-full",
        disabled && "pointer-events-none opacity-40"
      )}
      data-testid="trust-slider"
    >
      <div
        ref={trackRef}
        className="relative w-full cursor-pointer"
        style={{ height: "24px", padding: "7px 0" }}
        onClick={handleTrackClick}
      >
        <div
          style={{
            height: "10px",
            borderRadius: "5px",
            background: "linear-gradient(to right, #8B0000, #D4B896 50%, #1A4B8C)",
          }}
        />
      </div>
      <div
        className="absolute top-0 -translate-x-1/2"
        style={{
          left: `${value}%`,
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: "#C9A227",
          boxShadow: "0 2px 4px rgba(0,0,0,0.4), 0 0 0 2px rgba(201,162,39,0.3)",
          cursor: disabled ? "default" : "grab",
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-testid="trust-slider-knob"
      />
    </div>
  );
}
