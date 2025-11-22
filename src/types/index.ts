export type Country = 'AU' | 'NZ';

export enum TransactionType {
  PURCHASE = 'Purchase',
  MOTO = 'MOTO',
  RECURRING = 'Recurring',
}

export type Phone = string;

export type Payment = {
  totalAmount: number;
  currencyCode: 'AUD';
  invoiceReference?: string;
  invoiceDescription?: string;
  invoiceNumber?: string;
};

export type LineItem = {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  totalAmount: number;
};

export type ShippingMethod =
  | 'Unknown'
  | 'LowCost'
  | 'DesignatedByCustomer'
  | 'International'
  | 'Military'
  | 'NextDay'
  | 'StorePickup'
  | 'TwoDayService'
  | 'ThreeDayService'
  | 'Other';

export type Address = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: Country;
};

export type Title = 'Mr' | 'Ms' | 'Mrs' | 'Miss' | 'Dr' | 'Sir' | 'Prof';

export type Customer = {
  reference?: string;
  title?: Title;
  firstName: string;
  lastName: string;
  companyName?: string;
  jobDescription?: string;
  email: string;
  phone: Phone;
  mobile?: string;
  comments?: string;
  fax?: string;
  url?: string;
  address?: Partial<Omit<Address, 'country' | 'postalCode'>> &
    Pick<Address, 'country' | 'postalCode'>;
  cardDetails: Card;
};

export type ShippingAddress = {
  shippingMethod?: ShippingMethod;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: Phone;
  fax?: string;
  address?: Partial<Omit<Address, 'country'>> & {
    country: 'au';
  };
};

export type Card = {
  Name: string;
  Number: string;
  ExpiryMonth: string;
  ExpiryYear: string;
  CVN: string;
};

export type Transaction = {
  transactionType: TransactionType;
  customer: Customer;
  shippingAddress: ShippingAddress;
  payment: Payment;
  lineItems: LineItem[];
  options?: string[];
  partnerId?: string;
};

export type SectionProps = {
  title: string;
  children?: React.ReactNode;
};

export type PrepareTransactionErr = {
  type: string;
  message: string;
  stack: string;
};

export type PrepareTransactionErrCallback = (err: PrepareTransactionErr) => void;

export type EwayPaymentSuccess = {
  status: string;
  accessCode: string;
};

export type EwayPaymentError = {
  errors: string;
  errorMessages: string[];
};

export type MakePaymentCallback = (
  ewaySuccessCallback?: (ewayPaymentSuccess: EwayPaymentSuccess) => void,
  ewayErrorCallback?: (ewayPaymentError: EwayPaymentError) => void,
) => void;

export type EwayCredentials = {
  EWAY_API_KEY: string;
  EWAY_END_POINT: string;
  EWAY_API_PASSWORD: string;
  EWAY_PUBLIC_KEY: string;
};

declare module 'react-native' {
  interface NativeModulesStatic {
    EwayPaymentInitialize: {
      initializeEway: () => void;
      prepareTransaction: (
        transaction: Transaction,
        successCallback?: () => void,
        errorCallback?: PrepareTransactionErrCallback,
      ) => void;
      makePayment: MakePaymentCallback;
      getEwayCredentials: () => EwayCredentials;
      encryptCardDetails: (cardDetails: Pick<Card, 'Number' | 'CVN'>) => {
        data: {
          number: string;
          cvn: string;
        };
      };
    };
  }
}

export const transaction: Transaction = {
  transactionType: TransactionType.PURCHASE,
  payment: {
    totalAmount: 200,
    currencyCode: 'AUD',
  },
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    address: {
      country: 'AU',
      postalCode: '12345',
      street1: '123 Main St',
      street2: 'Apt 1',
      city: 'Anytown',
      state: 'NSW',
    },
    cardDetails: {
      Name: 'Eway test',
      Number: '5105105105105100',
      ExpiryMonth: '02',
      ExpiryYear: '26',
      CVN: '123',
    },
  },
  shippingAddress: {
    address: {
      country: 'au',
      postalCode: '5042',
      street1: '10 Selgar Avenue',
      street2: '',
      city: 'TONSLEY',
      state: 'SA',
    },
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
  },
  lineItems: [
    {
      sku: '123456',
      description: 'Test Item',
      quantity: 1,
      unitPrice: 200,
      tax: 0,
      totalAmount: 200,
    },
  ],
};
