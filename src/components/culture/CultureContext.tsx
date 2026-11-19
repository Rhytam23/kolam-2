import React, { createContext, useContext } from 'react';
import { HOME_KIT, type CultureKit } from '../../lib/culture';

const Context = createContext<CultureKit>(HOME_KIT);

/** The cultural kit of the page being shown: its ornament, border band, doorway and wording. */
export const CultureProvider: React.FC<{ kit: CultureKit; children: React.ReactNode }> = ({ kit, children }) => (
  <Context.Provider value={kit}>{children}</Context.Provider>
);

export const useCulture = () => useContext(Context);
