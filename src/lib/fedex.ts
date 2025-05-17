export function formatFreightRateRequest(shipmentData) {
  // Get account number from either the proper structure or directly from the string
  const accountNumberValue = 
    shipmentData.accountNumber?.value || 
    shipmentData.accountNumber || 
    "802255209";

  // Create properly structured request object
  const request = {
    accountNumber: {
      value: accountNumberValue
    },
    rateRequestControlParameters: {
      returnTransitTimes: true,
      servicesNeededOnRateFailure: true,
      variableOptions: "FREIGHT_GUARANTEE",
      rateSortOrder: "SERVICENAMETRADITIONAL"
    },
    freightRequestedShipment: {
      shipper: {
        address: formatAddress(shipmentData.originAddress),
        contact: {
          personName: shipmentData.contactInfo.personName,
          emailAddress: shipmentData.contactInfo.emailAddress,
          phoneNumber: shipmentData.contactInfo.phoneNumber,
          companyName: shipmentData.contactInfo.companyName || "Your Company"
        }
      },
      recipient: {
        address: formatAddress(shipmentData.destinationAddress),
        contact: {
          personName: shipmentData.contactInfo.personName,
          emailAddress: shipmentData.contactInfo.emailAddress,
          phoneNumber: shipmentData.contactInfo.phoneNumber
        }
      },
      serviceType: "FEDEX_FREIGHT_PRIORITY",
      preferredCurrency: "GBP",
      shippingChargesPayment: {
        paymentType: "SENDER",
        payor: {
          responsibleParty: {
            address: formatAddress(shipmentData.originAddress),
            contact: {
              personName: shipmentData.contactInfo.personName,
              emailAddress: shipmentData.contactInfo.emailAddress,
              phoneNumber: shipmentData.contactInfo.phoneNumber,
              companyName: shipmentData.contactInfo.companyName || "Your Company"
            },
            accountNumber: {
              value: accountNumberValue
            }
          }
        }
      },
      rateRequestType: ["LIST"],
      shipDateStamp: new Date().toISOString().split('T')[0],
      requestedPackageLineItems: formatPackageLineItems(shipmentData.packageDetails),
      totalPackageCount: shipmentData.packageDetails.length,
      totalWeight: shipmentData.packageDetails.reduce((sum, pkg) => sum + (parseFloat(pkg.weight) || 0), 0),
      freightShipmentDetail: {
        role: "SHIPPER",
        accountNumber: {
          value: accountNumberValue
        },
        declaredValueUnits: "GBP",
        shipmentDimensions: {
          length: 10,
          width: 10,
          height: 10,
          units: "CM"
        },
        lineItem: formatFreightLineItems(shipmentData.packageDetails),
        clientDiscountPercent: 0,
        fedExFreightBillingContactAndAddress: {
          address: formatAddress(shipmentData.originAddress),
          contact: {
            personName: shipmentData.contactInfo.personName,
            emailAddress: shipmentData.contactInfo.emailAddress,
            phoneNumber: shipmentData.contactInfo.phoneNumber,
            companyName: shipmentData.contactInfo.companyName || "Your Company"
          }
        },
        declaredValuePerUnit: {
          amount: shipmentData.packageDetails[0]?.declaredValue?.toString() || "100",
          currency: "GBP"
        },
        totalHandlingUnits: shipmentData.packageDetails.length,
        alternateBillingParty: {
          address: formatAddress(shipmentData.originAddress),
          accountNumber: {
            value: accountNumberValue
          }
        }
      },
      freightShipmentSpecialServices: {
        specialServiceTypes: ["FREIGHT_GUARANTEE"],
        freightGuaranteeDetail: {
          freightGuaranteeType: "GUARANTEED_DATE",
          guaranteeTimestamp: new Date(Date.now() + 86400000).toISOString() // Next day
        }
      }
    }
  };

  // Log for debugging
  console.log('Formatted FedEx Freight Request:', JSON.stringify(request, null, 2));
  return request;
}

function formatAddress(address) {
  if (!address) {
    throw new Error('Address is required');
  }

  if (!address.countryCode) {
    console.error('Missing country code in address:', JSON.stringify(address));
    throw new Error('Country code is required for all addresses');
  }

  // Convert country code to FedEx expected format
  let countryCode = address.countryCode.toUpperCase();
  if (countryCode === 'GB' || countryCode === 'UK') {
    countryCode = 'GB'; // FedEx might prefer 'GB' over 'UK'
  }

  // For UK addresses, set a proper region code
  let stateOrProvinceCode = 'Texas';
  if (countryCode === 'GB' && !stateOrProvinceCode) {
    stateOrProvinceCode = 'ENG'; // England as default for UK
  }

  const formattedAddress = {
    streetLines: [
      address.street1 || '',
      address.street2 || ''
    ].filter(Boolean),
    city: address.city || '',
    stateOrProvinceCode: stateOrProvinceCode,
    postalCode: address.postalCode || '',
    countryCode: countryCode,
    residential: address.residential || false
  };

  return formattedAddress;
}

function formatPackageLineItems(packages, currency = 'GBP') {
  return packages.map((pkg, index) => ({
    subPackagingType: pkg.packagingType || 'BOX',
    groupPackageCount: 1,
    contentRecord: [{
      itemNumber: `item_${index + 1}`,
      receivedQuantity: 1,
      description: "Freight shipment",
      partNumber: `part_${index + 1}`
    }],
    declaredValue: pkg.declaredValue ? {
      amount: pkg.declaredValue.toString(),
      currency: currency
    } : {
      amount: "100",
      currency: currency
    },
    weight: {
      units: pkg.weightUnit || 'KG',
      value: parseFloat(pkg.weight) || 0
    },
    dimensions: {
      length: parseFloat(pkg.dimensions.length) || 10,
      width: parseFloat(pkg.dimensions.width) || 10,
      height: parseFloat(pkg.dimensions.height) || 10,
      units: pkg.dimensions.unit || 'CM'
    },
    associatedFreightLineItems: [{
      id: `item_${index + 1}`
    }]
  }));
}

function formatFreightLineItems(packages) {
  return packages.map((pkg, index) => ({
    handlingUnits: 1,
    subPackagingType: pkg.packagingType || 'BOX',
    description: "Freight shipment",
    weight: {
      units: pkg.weightUnit || 'KG',
      value: parseFloat(pkg.weight) || 0
    },
    pieces: 1,
    volume: {
      units: "CUBIC_FT",
      value: 0
    },
    freightClass: "CLASS_050",
    purchaseOrderNumber: `PO_${index + 1}`,
    id: `item_${index + 1}`,
    hazardousMaterials: "NONE",
    dimensions: {
      length: parseFloat(pkg.dimensions.length) || 10,
      width: parseFloat(pkg.dimensions.width) || 10,
      height: parseFloat(pkg.dimensions.height) || 10,
      units: pkg.dimensions.unit || 'CM'
    }
  }));
}