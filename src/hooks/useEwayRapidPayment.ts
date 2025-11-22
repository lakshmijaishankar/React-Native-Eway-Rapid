import { useCallback, useRef, useState } from 'react';
import { EwayPaymentInitialize } from '../native-modules';
import { Card, MakePaymentCallback, PrepareTransactionErr, Transaction } from '../types';
const { getEwayCredentials, makePayment, prepareTransaction, encryptCardDetails } =
  EwayPaymentInitialize;

export type TransactionErrorState = {
  transactionError: PrepareTransactionErr | null;
  paymentError: PrepareTransactionErr | null;
};

export type GenerateCustomerToken = {
  customer: Pick<Transaction['customer'], 'firstName' | 'lastName' | 'title' | 'cardDetails'> & {
    country: string;
  };
};

export function useEwayRapidPayment() {
  const [paymentState, setPaymentState] = useState<TransactionErrorState>({
    paymentError: null,
    transactionError: null,
  });
  const ewayCredentials = useRef<ReturnType<typeof getEwayCredentials>>(getEwayCredentials());

  const handleMakePayment = useCallback<MakePaymentCallback>((successCallback, errorCallback) => {
    makePayment(
      ewayPaymentSuccess => {
        successCallback?.(ewayPaymentSuccess);
      },
      ewayPaymentError => {
        errorCallback?.(ewayPaymentError);
      },
    );
  }, []);

  const prepareTransactionPromise = useCallback(
    (transaction: Transaction, sucess: () => void, errorCallback: () => void) => {
      const promise = new Promise((resolve, reject) => {
        prepareTransaction(
          transaction,
          () => resolve(undefined),
          error => {
            setPaymentState(prevState => ({
              ...prevState,
              transactionError: error,
            }));
            reject(error);
          },
        );
      });
      promise.then(sucess).catch(errorCallback);
    },
    [],
  );

  const getTransactionRecord = useCallback(async <T>(accessCode: string) => {
    const { EWAY_END_POINT, EWAY_API_PASSWORD, EWAY_API_KEY } = ewayCredentials.current;
    const url = buildEwayUrl(EWAY_END_POINT, 'transaction');
    const headers = buildEwayHeaders(EWAY_API_KEY, EWAY_API_PASSWORD);
    try {
      const response = await fetch(`${url}/${accessCode}`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transaction record');
      }
      return (await response.json()) as T;
    } catch (error) {
      return error as Error;
    }
  }, []);

  const generateCustomerToken = useCallback(async ({ customer }: GenerateCustomerToken) => {
    const { EWAY_END_POINT, EWAY_API_PASSWORD, EWAY_API_KEY } = ewayCredentials.current;
    try {
      const url = buildEwayUrl(EWAY_END_POINT, 'transaction');
      const headers = buildEwayHeaders(EWAY_API_KEY, EWAY_API_PASSWORD, {
        'Content-Type': 'application/json',
      });
      const body = {
        Customer: {
          Title: customer.title,
          FirstName: customer.firstName,
          LastName: customer.lastName,
          CardDetails: customer.cardDetails,
          Country: customer.country,
        },
        Payment: {
          TotalAmount: 0,
        },
        Method: 'CreateTokenCustomer',
        TransactionType: 'Purchase',
      };
      const init: RequestInit = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      };

      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error('Failed to generate customer token');
      }
      return (await response.json()) as {
        Customer: { TokenCustomerID: string | null };
        Errors: string | null;
      };
    } catch (error) {
      return error as Error;
    }
  }, []);

  return {
    ewayCredentials: ewayCredentials.current,
    handleMakePayment,
    prepareTransactionPromise,
    getTransactionRecord,
    generateCustomerToken,
    paymentState,
  };
}

export const encryptCardNumAndCvn = (cardDetails: Pick<Card, 'Number' | 'CVN'>) =>
  encryptCardDetails(cardDetails);

export const buildEwayUrl = (
  ewayBaseUrl: string,
  path: 'transaction' | 'accesscodes' | 'encrypt' | 'customer',
) => `${ewayBaseUrl}${path}`;

export const buildEwayHeaders = (username: string, pwd: string, headers: HeadersInit_ = {}) => {
  const header: HeadersInit_ = {
    Authorization: `Basic ${btoa(username + ':' + pwd)}`,
    ...headers,
  };
  return header;
};
