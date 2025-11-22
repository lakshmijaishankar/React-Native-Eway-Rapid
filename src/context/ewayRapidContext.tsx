import React, { createContext, useContext, useMemo } from 'react';
import { EwayCredentials, MakePaymentCallback, Transaction } from '../types';
import {
  GenerateCustomerToken,
  TransactionErrorState,
  useEwayRapidPayment,
} from '../hooks/useEwayRapidPayment';

type EwayRapidPaymentProviderProps = {
  children: React.ReactNode;
};

type EwayRapidPaymentContextType = {
  readonly ewayCredentials: EwayCredentials;
  paymentState: TransactionErrorState;
  handleMakePayment: MakePaymentCallback;
  prepareTransactionPromise: (
    transaction: Transaction,
    sucess: () => void,
    errorCallback: () => void,
  ) => void;
  getTransactionRecord: <T>(accessCode: string) => Promise<T | Error>;
  generateCustomerToken: ({
    customer,
  }: GenerateCustomerToken) => Promise<
    { Customer: { TokenCustomerID: string | null }; Errors: string | null } | Error
  >;
};

const EwayRapidPaymentContext = createContext<EwayRapidPaymentContextType | undefined>(undefined);
const { Provider } = EwayRapidPaymentContext;

export function EwayRapidPaymentProvider({ children }: EwayRapidPaymentProviderProps) {
  const ewayRapidPayment = useEwayRapidPayment();

  const value = useMemo(
    () => ({
      ...ewayRapidPayment,
      ewayCredentials: ewayRapidPayment.ewayCredentials,
    }),
    [ewayRapidPayment],
  );

  return <Provider value={value}>{children}</Provider>;
}

export function useEwayRapidPaymentContext() {
  const context = useContext(EwayRapidPaymentContext);
  if (!context) {
    throw new Error('useEwayRapidPaymentContext must be used within EwayRapidPaymentProvider');
  }
  return context;
}
