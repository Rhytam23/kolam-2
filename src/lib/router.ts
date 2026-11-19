import React, { useEffect, useState } from 'react';

/*
 * A very small router: one page per path, using the browser's history so the back and forward
 * buttons work and every page has its own address (for example /alpana).
 */

const NAVIGATE = 'app:navigate';

/**
 * In the single-file preview the page lives at someone else's address, so pages are switched in
 * memory instead of in the address bar (VITE_ROUTER=memory).
 */
const MEMORY = import.meta.env.VITE_ROUTER === 'memory';
let memoryPath = '/';
let memoryHash = '';

const currentPath = () => {
  if (MEMORY) return memoryPath;
  return typeof window === 'undefined' ? '/' : window.location.pathname.replace(/\/+$/, '') || '/';
};
const currentHash = () => (MEMORY ? memoryHash : window.location.hash);
let memorySearch = '';
export const currentSearch = () => (MEMORY ? memorySearch : window.location.search);

/** Goes to a page within the app. A hash scrolls to that part of the page once it is shown. */
export const navigate = (to: string) => {
  const url = new URL(to, 'http://app' + (MEMORY ? memoryPath : window.location.pathname));
  if (MEMORY) {
    const same = url.pathname === memoryPath;
    memoryPath = url.pathname;
    memoryHash = url.hash;
    memorySearch = url.search;
    if (same && url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.dispatchEvent(new Event(NAVIGATE));
    return;
  }
  if (url.pathname === currentPath() && url.hash && !url.search) {
    history.pushState(null, '', url.pathname + url.hash);
    document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  history.pushState(null, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(NAVIGATE));
};

export const usePath = () => {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener(NAVIGATE, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAVIGATE, update);
    };
  }, []);
  // After a new page is shown: go to its #part if there is one, otherwise to the top.
  useEffect(() => {
    const id = currentHash().slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
    else window.scrollTo(0, 0);
  }, [path]);
  return path;
};

/** A link to a page of the app, opened without reloading. */
export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }> = ({ to, onClick, children, ...props }) =>
  React.createElement('a', {
    ...props,
    href: to,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(to);
    },
  }, children);
