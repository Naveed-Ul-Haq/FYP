import React, { createContext, useState, ReactNode, useContext } from 'react';

export interface Alert {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (message: string, type: Alert['type'], title?: string) => void;
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (message: string, type: Alert['type'], title?: string) => {
    const id = Date.now().toString();
    const newAlert = { id, message, title, type };
    setAlerts((prev) => [...prev, newAlert]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => removeAlert(id), 3000);
  };

  const showAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Date.now().toString();
    const newAlert = { ...alert, id };
    setAlerts((prev) => [...prev, newAlert]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => removeAlert(id), 3000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, showAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
