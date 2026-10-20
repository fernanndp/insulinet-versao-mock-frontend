import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  formatUnits,
} from "../../utils/formatters";

type Props = {
  value: string;
};

const DURATION_MS = 700;

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

/**
 * Shows a unit count and, when the value changes after the first render,
 * counts from the previous figure to the new one so the change is noticed.
 * The first render is never animated.
 */
export default function AnimatedUnits({
  value,
}: Props) {
  const parsed = Number(value);
  const target = Number.isNaN(parsed) ? 0 : parsed;

  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;

    if (from === target) {
      return;
    }

    const duration = prefersReducedMotion()
      ? 0
      : DURATION_MS;

    const startedAt = performance.now();

    let frame = 0;

    function tick(now: number) {
      const progress =
        duration === 0
          ? 1
          : Math.min(
              Math.max(
                (now - startedAt) / duration,
                0
              ),
              1
            );

      const eased = 1 - (1 - progress) ** 3;

      // Whole numbers while counting; the exact value on arrival
      const next =
        progress === 1
          ? target
          : Math.round(
              from + (target - from) * eased
            );

      shownRef.current = next;
      setShown(next);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <strong
      className={
        shown === target
          ? undefined
          : "is-updating"
      }
    >
      {formatUnits(String(shown))}
    </strong>
  );
}
