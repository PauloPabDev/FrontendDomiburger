import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        // No hay valor en localStorage, se retorna el valor inicial.
        return initialValue;
      }
      // Intentamos parsear el valor obtenido
      return JSON.parse(item);
    } catch (error) {
      // Si hay error, eliminamos el valor corrupto para evitar futuros problemas
      window.localStorage.removeItem(key);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Permitir que 'value' pueda ser una función que reciba el valor actual.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
    }
  };

  return [storedValue, setValue];
}

export { useLocalStorage };
