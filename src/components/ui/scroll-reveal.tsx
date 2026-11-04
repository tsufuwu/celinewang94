"use client";

import * as React from "react";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "fly-up" | "fly-left" | "fly-right" | "scale-up";
  delay?: number; // Delay in milliseconds
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = "fly-up",
  delay = 0,
  threshold = 0.12,
  className = "",
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If browser doesn't support IntersectionObserver, show immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node); // Reveal once
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const animationClass = React.useMemo(() => {
    switch (animation) {
      case "fly-left":
        return "reveal-hidden-left";
      case "fly-right":
        return "reveal-hidden-right";
      case "scale-up":
        return "reveal-hidden-scale";
      case "fly-up":
      default:
        return "reveal-hidden";
    }
  }, [animation]);

  const delayStyle: React.CSSProperties = {
    ...style,
    transitionDelay: delay > 0 ? `${delay}ms` : undefined,
  };

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? "reveal-visible" : ""} ${className}`.trim()}
      style={delayStyle}
      {...props}
    >
      {children}
    </div>
  );
}

