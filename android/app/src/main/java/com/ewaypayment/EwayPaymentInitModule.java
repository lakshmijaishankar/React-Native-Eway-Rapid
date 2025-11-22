package com.ewaypayment;

import android.util.Log;


import androidx.annotation.NonNull;

import com.ewaypayments.sdk.android.RapidAPI;
import com.ewaypayments.sdk.android.RapidConfigurationException;
import com.ewaypayments.sdk.android.beans.CardDetails;
import com.ewaypayments.sdk.android.beans.Customer;
import com.ewaypayments.sdk.android.beans.LineItem;
import com.ewaypayments.sdk.android.beans.NVPair;
import com.ewaypayments.sdk.android.beans.Payment;
import com.ewaypayments.sdk.android.beans.ShippingDetails;
import com.ewaypayments.sdk.android.beans.Transaction;
import com.ewaypayments.sdk.android.beans.TransactionType;
import com.ewaypayments.sdk.android.entities.EncryptItemsResponse;
import com.ewaypayments.sdk.android.entities.SubmitPayResponse;
import com.ewaypayments.sdk.android.entities.UserMessageResponse;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.ewaypayments.sdk.android.beans.Address;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.IOException;
import java.util.ArrayList;


public class EwayPaymentInitModule extends ReactContextBaseJavaModule {
    private final static String NAME = "EwayPaymentInitialize";
    private final Transaction transaction;

    public EwayPaymentInitModule(ReactApplicationContext context) {
        super(context);
        this.transaction = new Transaction();
        RapidAPI.RapidEndpoint = BuildConfig.EWAY_END_POINT;
        RapidAPI.PublicAPIKey = BuildConfig.EWAY_PUBLIC_KEY;
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void initializeEway() {
        Log.i("Eway Payment-->", "Initialize");
    }

    @NonNull
    @ReactMethod
    private WritableMap getEwayCredentials() {
        WritableMap map = Arguments.createMap();
        map.putString("EWAY_API_KEY", BuildConfig.EWAY_API_KEY);
        map.putString("EWAY_END_POINT", BuildConfig.EWAY_END_POINT);
        map.putString("EWAY_API_PASSWORD", BuildConfig.EWAY_API_PASSWORD);
        map.putString("EWAY_PUBLIC_KEY", BuildConfig.EWAY_PUBLIC_KEY);
        return map;
    }

    @ReactMethod
    public void prepareTransaction(@NonNull ReadableMap transaction, @NonNull Callback successCallback, @NonNull Callback errorCallback) {
        Log.i("transaction", transaction.toString());
        try {
            ReadableMapKeySetIterator iterator = transaction.keySetIterator();
            while (iterator.hasNextKey()) {
                String objectKey = iterator.nextKey();
                switch (objectKey) {
                    case "payment":
                        ReadableMap paymentObj = transaction.getMap(objectKey);
                        if (paymentObj != null) {
                            this.transaction.setPayment(preparePayment(paymentObj));
                        }
                        break;
                    case "customer":
                        ReadableMap customerObj = transaction.getMap(objectKey);
                        if (customerObj != null) {
                            this.transaction.setCustomer(prepareCustomer(customerObj, errorCallback));
                        }
                        break;
                    case "lineItems":
                        ReadableArray lineItemsArr = transaction.getArray(objectKey);
                        if (lineItemsArr != null) {
                            this.transaction.setLineItems(prepareLineItems(lineItemsArr));
                        }
                        break;
                    case "shippingAddress":
                        ReadableMap shippingAddressObj = transaction.getMap(objectKey);
                        if (shippingAddressObj != null) {
                            this.transaction.setShippingDetails(prepareShippingAddress(shippingAddressObj));
                        }
                        break;
                    default:
                        break;
                }
            }
            successCallback.invoke();
        } catch (Exception e) {
            // Handle general exception
            WritableMap errorMap = Arguments.createMap();
            errorMap.putString("type", e.getClass().getSimpleName());
            errorMap.putString("message", e.getMessage() != null ? e.getMessage() : "An error occurred while preparing transaction");
            errorMap.putString("stack", Log.getStackTraceString(e));
            errorCallback.invoke(errorMap);
            Log.e("message -->", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    private void makePayment(@NonNull Callback ewaySuccessCallback, @NonNull Callback ewayErrorCallback) {
        WritableMap writableMap = Arguments.createMap();
        WritableArray writableArray = Arguments.createArray();
        try {
            this.transaction.setTransactionType(TransactionType.Purchase);
            SubmitPayResponse submitPayResponse = RapidAPI.submitPayment(this.transaction);
            String errors = submitPayResponse.getErrors();
            if (errors == null) {
                writableMap.putString("status", submitPayResponse.getStatus());
                writableMap.putString("accessCode", submitPayResponse.getAccessCode());
                ewaySuccessCallback.invoke(writableMap);
                return;
            }
            UserMessageResponse userMessageResponse = RapidAPI.userMessage("EN", errors);
            for (String item : userMessageResponse.getErrorMessages()) {
                writableArray.pushString(item);
            }
            writableMap.putString("errors", errors);
            writableMap.putArray("errorMessages", writableArray);
            ewayErrorCallback.invoke(writableMap);
        } catch (IOException | RapidConfigurationException exp) {
            Log.e("makePayment exp", exp.getMessage());
        }
    }

    private Payment preparePayment(@NonNull ReadableMap prepMapObjToPayment) {
        ReadableMapKeySetIterator paymentIterator = prepMapObjToPayment.keySetIterator();
        Payment payment = new Payment();
        while (paymentIterator.hasNextKey()) {
            String key = paymentIterator.nextKey();
            switch (key) {
                case "totalAmount":
                    payment.setTotalAmount(Double.valueOf(prepMapObjToPayment.getDouble(key)).intValue());
                    break;
                case "currencyCode":
                    payment.setCurrencyCode(String.valueOf(prepMapObjToPayment.getString(key)));
                    break;
                case "invoiceReference":
                    payment.setInvoiceReference(String.valueOf(prepMapObjToPayment.getString(key)));
                    break;
                case "invoiceDescription":
                    payment.setInvoiceDescription(String.valueOf(prepMapObjToPayment.getString(key)));
                    break;
                case "invoiceNumber":
                    payment.setInvoiceNumber(String.valueOf(prepMapObjToPayment.getString(key)));
                    break;
                default:
            }
        }
        return payment;
    }

    private ArrayList<LineItem> prepareLineItems(@NonNull ReadableArray lineItemsArray) {
        ArrayList<LineItem> lineItems = new ArrayList<>();
        for (int i = 0; i <= lineItemsArray.size() - 1; i++) {
            ReadableMap lineItemMap = lineItemsArray.getMap(i);
            LineItem lineItem = new LineItem();
            lineItemMap.getEntryIterator().forEachRemaining(item -> {
                switch (item.getKey()) {
                    case "sku":
                        lineItem.setSKU(String.valueOf(item.getValue()));
                        break;
                    case "description":
                        lineItem.setDescription(String.valueOf(item.getValue()));
                        break;
                    case "quantity":
                        lineItem.setQuantity(Double.valueOf(item.getValue().toString()).intValue());
                        break;
                    case "unitPrice":
                        lineItem.setUnitCost(Double.valueOf(item.getValue().toString()).intValue());
                        break;
                    case "tax":
                        lineItem.setTax(Double.valueOf(item.getValue().toString()).intValue());
                        break;
                    case "totalAmount":
                        lineItem.setTotal(Double.valueOf(item.getValue().toString()).intValue());
                        break;
                    default:
                }
            });
            lineItems.add(lineItem);
        }
        Log.i("total line items", lineItems.size() + "");
        return lineItems;
    }

    private Customer prepareCustomer(@NonNull ReadableMap customerMap, @NonNull Callback errorCallback) {
        ReadableMapKeySetIterator iterator = customerMap.keySetIterator();
        Customer customer = new Customer();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (key) {
                case "firstName":
                    customer.setFirstName(String.valueOf(customerMap.getString(key)));
                    break;
                case "lastName":
                    customer.setLastName(String.valueOf(customerMap.getString(key)));
                    break;
                case "companyName":
                    customer.setCompanyName(String.valueOf(customerMap.getString(key)));
                    break;
                case "jobDescription":
                    customer.setJobDescription(String.valueOf(customerMap.getString(key)));
                    break;
                case "email":
                    customer.setEmail(String.valueOf(customerMap.getString(key)));
                    break;
                case "phone":
                    customer.setPhone(String.valueOf(customerMap.getString(key)));
                    break;
                case "mobile":
                    customer.setMobile(String.valueOf(customerMap.getString(key)));
                    break;
                case "comments":
                    customer.setComments(String.valueOf(customerMap.getString(key)));
                    break;
                case "fax":
                    customer.setFax(String.valueOf(customerMap.getString(key)));
                    break;
                case "title":
                    customer.setTitle(String.valueOf(customerMap.getString(key)));
                    break;
                case "url":
                    customer.setUrl(String.valueOf(customerMap.getString(key)));
                    break;
                case "address":
                    ReadableMap addressObj = customerMap.getMap(key);
                    if (addressObj != null) {
                        customer.setAddress(prepareAddress(addressObj));
                    }
                    break;
                case "cardDetails":
                    ReadableMap cardDetailsObj = customerMap.getMap(key);
                    if (cardDetailsObj != null) {
                        customer.setCardDetails(prepareCardDetails(cardDetailsObj, errorCallback));
                    }
                    break;
                default:
                    break;
            }
        }
        return customer;
    }

    private ShippingDetails prepareShippingAddress(@NonNull ReadableMap shippingMap) {
        ReadableMapKeySetIterator iterator = shippingMap.keySetIterator();
        ShippingDetails shippingDetails = new ShippingDetails();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (key) {
                case "address":
                    ReadableMap addressObj = shippingMap.getMap(key);
                    if (addressObj != null) {
                        shippingDetails.setShippingAddress(prepareAddress(addressObj));
                    }
                    break;
                case "firstName":
                    shippingDetails.setFirstName(String.valueOf(shippingMap.getString(key)));
                    break;
                case "lastName":
                    shippingDetails.setLastName(String.valueOf(shippingMap.getString(key)));
                    break;
                case "email":
                    shippingDetails.setEmail(String.valueOf(shippingMap.getString(key)));
                    break;
                case "phone":
                    shippingDetails.setPhone(String.valueOf(shippingMap.getString(key)));
                    break;
                case "fax":
                    shippingDetails.setFax(String.valueOf(shippingMap.getString(key)));
                    break;
                default:
                    break;
            }
        }
        return shippingDetails;
    }

    private CardDetails prepareCardDetails(@NonNull ReadableMap cardObj, @NonNull Callback errorCallback) {
        CardDetails cardDetails = new CardDetails();
        try {
            ReadableMapKeySetIterator iterator = cardObj.keySetIterator();
            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                NVPair nvPair = new NVPair(key, cardObj.getString(key));
//                Log.i(key, "" + cardObj.getString(key));
                switch (key) {
                    case "Name":
                        cardDetails.setName(nvPair.getValue());
                        break;
                    case "ExpiryMonth":
                        cardDetails.setExpiryMonth(nvPair.getValue());
                        break;
                    case "ExpiryYear":
                        cardDetails.setExpiryYear(nvPair.getValue());
                        break;
                    default:
                        break;
                }
            }
            // Encrypt card details
            String cardNum = cardObj.getString("Number");
            String cvn = cardObj.getString("CVN");
            EncryptItemsResponse encryptItemsResponse = encryptCard(cardNum, cvn);
            Log.i("encryptItemsResponse size()", encryptItemsResponse.getItems() + "");
            cardDetails.setNumber(encryptItemsResponse.getItems().get(0).getValue());
            cardDetails.setCVN(encryptItemsResponse.getItems().get(1).getValue());
        } catch (RapidConfigurationException | IOException e) {
            // Build error payload
            WritableMap errorMap = Arguments.createMap();
            errorMap.putString("type", e.getClass().getSimpleName());
            errorMap.putString("message", e.getMessage() != null ? e.getMessage() : "Unknown error");
            errorMap.putString("stack", Log.getStackTraceString(e));
            // Pass JSON object to JS
            errorCallback.invoke(errorMap);
            Log.e("prepareCardDetails", "Error: " + e.getMessage());
        }
        return cardDetails;
    }

    private Address prepareAddress(@NonNull ReadableMap addressMap) {
        Address address = new Address();
        ReadableMapKeySetIterator iterator = addressMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (key) {
                case "street1":
                    address.setStreet1(String.valueOf(addressMap.getString(key)));
                    break;
                case "street2":
                    address.setStreet2(String.valueOf(addressMap.getString(key)));
                    break;
                case "city":
                    address.setCity(String.valueOf(addressMap.getString(key)));
                    break;
                case "state":
                    address.setState(String.valueOf(addressMap.getString(key)));
                    break;
                case "country":
                    address.setCountry(String.valueOf(addressMap.getString(key)));
                    break;
                case "postalCode":
                    address.setPostalCode(String.valueOf(addressMap.getString(key)));
                    break;
                default:
                    break;
            }
        }
        return address;
    }

    private EncryptItemsResponse encryptCard(@NonNull String cardNumber, @NonNull String cvn) throws RapidConfigurationException, IOException {
        ArrayList<NVPair> values = new ArrayList<>();
        values.add(new NVPair("Number", cardNumber));
        values.add(new NVPair("CVN", cvn));
        return RapidAPI.encryptValues(values);
    }

    @ReactMethod
    private WritableMap encryptCardDetails(@NonNull ReadableMap cardObj) {
        WritableMap writableMap = Arguments.createMap();
        try {
            EncryptItemsResponse encryptItemsResponse = encryptCard(cardObj.getString("Number"), cardObj.getString("CVN"));
            // Create nested data object with number and cvn
            WritableMap dataMap = Arguments.createMap();
            dataMap.putString("number", encryptItemsResponse.getItems().get(0).getValue());
            dataMap.putString("cvn", encryptItemsResponse.getItems().get(1).getValue());

            writableMap.putMap("data", dataMap);
        } catch (Exception e) {
            Log.e("encryptCardDetails", "Error: " + e.getMessage());
        }
        return writableMap;
    }

}