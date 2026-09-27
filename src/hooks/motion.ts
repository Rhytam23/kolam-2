import { useEffect, useRef, useState } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

/** True when the visitor has asked their device for less motion. */
export const useReducedMotion = () => {
    const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCE).matches);
    useEffect(() => {
        const query = window.matchMedia?.(REDUCE);
        if (!query) return;
        const onChange = () => setReduce(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    return reduce;
};

/** Becomes true the first time the element scrolls into view, and stays true. */
export const useInView = <T extends Element>(margin = '0px 0px -12% 0px') => {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) setInView(true);
        }, { rootMargin: margin });
        observer.observe(el);
        return () => observer.disconnect();
    }, [inView, margin]);
    return [ref, inView] as const;
};

/**
 * How far the page has scrolled through a tall element with a sticky child: 0 when its top reaches
 * the top of the screen, 1 when its bottom reaches the bottom of the screen.
 */
export const useScrollProgress = <T extends HTMLElement>(enabled = true) => {
    const ref = useRef<T>(null);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!enabled) return;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const travel = rect.height - window.innerHeight;
            setProgress(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [enabled]);
    return [ref, progress] as const;
};

/** Runs from 0 to 1 over `ms` once `start` becomes true (1 straight away if motion is reduced). */
export const useIntro = (start: boolean, ms = 1600) => {
    const reduce = useReducedMotion();
    const [t, setT] = useState(0);
    useEffect(() => {
        if (!start) return;
        if (reduce) {
            setT(1);
            return;
        }
        let frame = 0;
        const begin = performance.now();
        const tick = (now: number) => {
            const next = Math.min(1, (now - begin) / ms);
            setT(next);
            if (next < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [start, ms, reduce]);
    return t;
};

/** The size of the browser window, kept up to date. */
export const useViewport = () => {
    const read = () => ({ w: typeof window === 'undefined' ? 1280 : window.innerWidth, h: typeof window === 'undefined' ? 800 : window.innerHeight });
    const [size, setSize] = useState(read);
    useEffect(() => {
        const onResize = () => setSize(read());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return size;
};

/**
 * Runs from 0 to 1 over `ms`, starting again whenever `key` changes. With reduced motion it is 1
 * straight away.
 */
export const useTimeline = (ms: number, key: unknown) => {
    const reduce = useReducedMotion();
    const [t, setT] = useState(reduce ? 1 : 0);
    useEffect(() => {
        if (reduce) {
            setT(1);
            return;
        }
        setT(0);
        let frame = 0;
        const begin = performance.now();
        const tick = (now: number) => {
            const next = Math.min(1, (now - begin) / ms);
            setT(next);
            if (next < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [ms, key, reduce]);
    return t;
};
