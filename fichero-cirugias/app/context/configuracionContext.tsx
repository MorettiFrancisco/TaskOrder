import React, { createContext, useContext, useState, ReactNode } from 'react';

type FontSize = 'pequeño' | 'mediano' | 'grande';

interface ConfiguracionContextProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    fontSize: FontSize;
    setFontSize: (value: FontSize) => void;
}

const ConfiguracionContext = createContext<ConfiguracionContextProps | undefined>(undefined);

export const useConfiguracion = () => {
    const context = useContext(ConfiguracionContext);
    if (!context) throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
    return context;
};

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState<FontSize>('mediano');

    return (
        <ConfiguracionContext.Provider
            value={{ darkMode, setDarkMode, fontSize, setFontSize }}
        >
            {children}
        </ConfiguracionContext.Provider>
    );
}