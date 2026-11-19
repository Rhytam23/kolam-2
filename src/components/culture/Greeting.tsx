import React, { useState } from 'react';
import { LANGUAGES, useI18n } from '../../lib/i18n';
import { useCulture } from './CultureContext';

const DISMISSED = 'chittara_lang_offer';

const dismissed = () => {
  try { return localStorage.getItem(DISMISSED) === '1'; } catch { return false; }
};

/**
 * The greeting of the art form at the door, in its own script, and (once) an offer to show the
 * interface in the tradition's language when the app has it.
 */
const Greeting: React.FC<{ className?: string }> = ({ className = '' }) => {
  const kit = useCulture();
  const { lang, setLang } = useI18n();
  const [hidden, setHidden] = useState(dismissed);
  const offer = kit.suggestedLang && kit.suggestedLang !== lang && !hidden ? LANGUAGES.find(l => l.code === kit.suggestedLang) : undefined;

  const close = () => {
    setHidden(true);
    try { localStorage.setItem(DISMISSED, '1'); } catch { /* storage may be blocked */ }
  };

  return (
    <div className={className}>
      <p className="text-brass-light">
        <span lang={kit.greeting.lang} className="font-script text-2xl">{kit.greeting.word}</span>
        <span className="ml-2 text-sm uppercase tracking-widest text-rice/80">{kit.greeting.meaning}</span>
      </p>
      {offer && (
        <p className="mt-2 text-sm text-rice/90">
          <button type="button" className="underline decoration-brass/60 underline-offset-4 hover:text-brass-light" onClick={() => { setLang(offer.code); close(); }}>
            <span lang={offer.code}>{offer.name}</span>
          </button>
          <button type="button" className="ml-3 text-rice/70 hover:text-rice" onClick={close} aria-label="Dismiss language offer">×</button>
        </p>
      )}
    </div>
  );
};

export default Greeting;
