import React, { createContext, useState, ReactNode } from 'react';

export interface BloodRequest {
  id: string;
  title: string;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  hospitalName: string;
  description: string;
  createdAt: Date;
}

interface BloodRequestContextType {
  requests: BloodRequest[];
  addRequest: (request: Omit<BloodRequest, 'id' | 'createdAt'>) => void;
  removeRequest: (id: string) => void;
  updateRequest: (id: string, request: Partial<BloodRequest>) => void;
  getRequestsByBloodType: (bloodType: string) => BloodRequest[];
  getUrgentRequests: () => BloodRequest[];
}

export const BloodRequestContext = createContext<BloodRequestContextType | undefined>(undefined);

export const BloodRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  const addRequest = (request: Omit<BloodRequest, 'id' | 'createdAt'>) => {
    const newRequest: BloodRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setRequests((prev) => [...prev, newRequest]);
  };

  const removeRequest = (id: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const updateRequest = (id: string, request: Partial<BloodRequest>) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...request } : req))
    );
  };

  const getRequestsByBloodType = (bloodType: string) => {
    return requests.filter((req) => req.bloodType === bloodType);
  };

  const getUrgentRequests = () => {
    return requests.filter((req) => req.urgency === 'critical' || req.urgency === 'high');
  };

  return (
    <BloodRequestContext.Provider
      value={{
        requests,
        addRequest,
        removeRequest,
        updateRequest,
        getRequestsByBloodType,
        getUrgentRequests,
      }}
    >
      {children}
    </BloodRequestContext.Provider>
  );
};
