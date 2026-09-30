import { createContext, useContext } from "react";

export interface Nav {
  home: () => void;
  zoom: () => void;
  invest: () => void;
  settings: () => void;
  /** Open a placeholder for parts of the KBC app outside this demo. */
  demo: (title: string) => void;
}

const noop = () => undefined;
export const NavContext = createContext<Nav>({ home: noop, zoom: noop, invest: noop, settings: noop, demo: noop });
export const useNav = () => useContext(NavContext);
