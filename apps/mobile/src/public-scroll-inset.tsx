import {createContext,useContext} from 'react';

// Presentation only: the measured floating dock clears scroll content, not its viewport.
const Context=createContext(0);
export const PublicScrollInsetProvider=Context.Provider;
export function usePublicScrollInset():number{return useContext(Context);}
