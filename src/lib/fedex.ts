// lib/fedex.ts
import { format } from 'date-fns';

interface Address {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

interface Package {
  weight: number;
  weightUnit?: 'KG' | 'LB';
  length: number;
  width: number;
  height: number;
  dimensionUnit?: 'IN' | 'CM';
  freightClass?: string;
  declaredValue?: number;
}

interface ShippingRequest {
  originAddress: Address;
  destinationAddress: Address;
  packages: Package[];
  serviceType?: 'FEDEX_FREIGHT_PRIORITY' | 'FEDEX_FREIGHT_ECONOMY';
  shipDate?: Date;
}

export function formatFreightRateRequest(requestData: ShippingRequest) {
  const fedexAccountNumber = process.env.FEDEX_ACCOUNT_NUMBER!;
  const fedexFreightAccountNumber = process.env.FEDEX_FREIGHT_ACCOUNT_NUMBER || fedexAccountNumber;
  
  const today = new Date();
  const shipDate = requestData.shipDate || today;

  return {
    accountNumber: {
      value: fedexAccountNumber
    },
    rateRequestControlParameters: {
      returnTransitTimes: true,
      servicesNeededOnRateFailure: true,
      variableOptions: "FREIGHT_GUARANTEE",
      rateSortOrder: "SERVICENAMETRADITIONAL"
    },
    freightRequestedShipment: {
      shipper: {
        address: {
          streetLines: [
            process.env.FEDEX_SHIPPER_STREET1!,
            process.env.FEDEX_SHIPPER_STREET2 || ''
          ].filter(Boolean),
          city: process.env.FEDEX_SHIPPER_CITY!,
          stateOrProvinceCode: process.env.FEDEX_SHIPPER_STATE!,
          postalCode: process.env.FEDEX_SHIPPER_POSTAL_CODE!,
          countryCode: process.env.FEDEX_SHIPPER_COUNTRY!,
          residential: false
        }
      },
      recipient: {
        address: {
          streetLines: [
            requestData.destinationAddress.streetLine1,
            requestData.destinationAddress.streetLine2 || ''
          ].filter(Boolean),
          city: requestData.destinationAddress.city,
          stateOrProvinceCode: requestData.destinationAddress.state,
          postalCode: requestData.destinationAddress.postalCode,
          countryCode: requestData.destinationAddress.countryCode,
          residential: false
        }
      },
      serviceType: requestData.serviceType || "FEDEX_FREIGHT_PRIORITY",
      preferredCurrency: "USD",
      shippingChargesPayment: {
        payor: {
          responsibleParty: {
            address: {
              streetLines: [
                process.env.FEDEX_BILLING_STREET1!,
                process.env.FEDEX_BILLING_STREET2 || ''
              ].filter(Boolean),
              city: process.env.FEDEX_BILLING_CITY!,
              stateOrProvinceCode: process.env.FEDEX_BILLING_STATE!,
              postalCode: process.env.FEDEX_BILLING_POSTAL_CODE!,
              countryCode: process.env.FEDEX_BILLING_COUNTRY!,
              residential: false
            },
            contact: {
              personName: "John Taylor",
              emailAddress: "shipping@yourcompany.com",
              phoneNumber: "1234567890",
              companyName: "Your Company"
            },
            accountNumber: {
              value: fedexAccountNumber
            }
          }
        },
        paymentType: "SENDER"
      },
      rateRequestType: ["LIST"],
      shipDateStamp: format(shipDate, 'yyyy-MM-dd'),
      requestedPackageLineItems: requestData.packages.map((pkg, index) => ({
        subPackagingType: "BAG",
        groupPackageCount: 1,
        contentRecord: [
          {
            itemNumber: `ITEM_${index + 1}`,
            receivedQuantity: 1,
            description: "General Goods",
            partNumber: `PART_${index + 1}`
          }
        ],
        declaredValue: {
          amount: (pkg.declaredValue || 100).toString(),
          currency: "USD"
        },
        weight: {
          units: pkg.weightUnit || "KG",
          value: pkg.weight
        },
        dimensions: {
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          units: pkg.dimensionUnit || "IN"
        },
        associatedFreightLineItems: [
          {
            id: `PKG_${index + 1}`
          }
        ]
      })),
      totalPackageCount: requestData.packages.length,
      totalWeight: requestData.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
      freightShipmentDetail: {
        role: "SHIPPER",
        accountNumber: {
          value: fedexFreightAccountNumber
        },
        declaredValueUnits: "USD",
        shipmentDimensions: {
          length: Math.max(...requestData.packages.map(pkg => pkg.length)),
          width: Math.max(...requestData.packages.map(pkg => pkg.width)),
          height: requestData.packages.reduce((sum, pkg) => sum + pkg.height, 0),
          units: requestData.packages[0]?.dimensionUnit || "IN"
        },
        lineItem: requestData.packages.map((pkg, index) => ({
          handlingUnits: 1,
          nmfcCode: "123456",
          subPackagingType: "BAG",
          description: "General Goods",
          weight: {
            units: pkg.weightUnit || "KG",
            value: pkg.weight
          },
          pieces: 1,
          volume: {
            units: "CUBIC_FT",
            value: (pkg.length * pkg.width * pkg.height) / 1728 // Convert cubic inches to cubic feet
          },
          freightClass: pkg.freightClass || "CLASS_050",
          purchaseOrderNumber: `PO_${format(today, 'yyyyMMdd')}`,
          id: `ITEM_${index + 1}`,
          hazardousMaterials: "NON_HAZARDOUS",
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            units: pkg.dimensionUnit || "IN"
          }
        })),
        clientDiscountPercent: 0,
        fedExFreightBillingContactAndAddress: {
          address: {
            streetLines: [
              process.env.FEDEX_BILLING_STREET1!,
              process.env.FEDEX_BILLING_STREET2 || ''
            ],
            city: process.env.FEDEX_BILLING_CITY!,
            stateOrProvinceCode: process.env.FEDEX_BILLING_STATE!,
            postalCode: process.env.FEDEX_BILLING_POSTAL_CODE!,
            countryCode: process.env.FEDEX_BILLING_COUNTRY!,
            residential: false
          },
          contact: {
            personName: "John Taylor",
            emailAddress: "billing@yourcompany.com",
            phoneNumber: "1234567890",
            companyName: "Your Company"
          }
        },
        hazardousMaterialsOfferor: "Your Company",
        declaredValuePerUnit: {
          amount: "100",
          currency: "USD"
        },
        totalHandlingUnits: requestData.packages.length,
        alternateBillingParty: {
          address: {
            streetLines: [
              process.env.FEDEX_BILLING_STREET1!,
              process.env.FEDEX_BILLING_STREET2 || ''
            ],
            city: process.env.FEDEX_BILLING_CITY!,
            stateOrProvinceCode: process.env.FEDEX_BILLING_STATE!,
            postalCode: process.env.FEDEX_BILLING_POSTAL_CODE!,
            countryCode: process.env.FEDEX_BILLING_COUNTRY!,
            residential: false
          },
          accountNumber: {
            value: fedexAccountNumber
          }
        }
      },
      freightShipmentSpecialServices: {
        freightGuaranteeDetail: {
          freightGuaranteeType: "GUARANTEED_DATE",
          guaranteeTimestamp: format(shipDate, "yyyy-MM-dd'T'HH:mm:ss")
        },
        specialServiceTypes: [
          "FREIGHT_GUARANTEE"
        ]
      }
    }
  };
}