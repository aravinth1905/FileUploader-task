const xlsx =require('xlsx');
const AppError =require('./appError.js');

class ExcelParser {
  constructor(S3BufferData = '') {
    this.S3BufferData = S3BufferData;
  }

  toJson() {
    const workbook = xlsx.read(this.S3BufferData);
    const wsname = workbook.SheetNames;
    let json = xlsx.utils.sheet_to_json(workbook.Sheets[wsname[0]], {
      defval: '',
    });
    json = this.removeAsteriskMethod(json);
    this.headers = Object.keys(json[0] || {});
    return json;
  }

  async processExcelData(excelData) {
    
    try {
      const processedShipments = [];

      for (const shipmentData of excelData) {
        const {
          'Shipment Type': shipmentType,
          'Order Number': orderNumber,
          'Order Type (STO/PO/SO/RO)': orderType,
          'Primary Mode': primaryMode,
          'Expected Delivery Date': expectedDeliveryDate,
          Incoterm: incoterm,
          'Source Reference ID': sourceLocationName,
          'Destination Reference ID': destinationLocationName,
          'Cargo Type': cargoType,
          'Material Code': materialCode,
          Quantity: quantity,
          'Quantity Unit': quantityUnit,
          'Shipment Number': shipmentNumber,
        } = shipmentData;

        // Create a new shipment object with only the required fields
        const shipment = {
          shipmentType,
          orderNumber,
          orderType,
          primaryMode,
          expectedDeliveryDate: new Date(expectedDeliveryDate),
          incoterm,
          sourceLocation: sourceLocationName,
          destinationLocation: destinationLocationName,
          cargoType,
          materialCode,
          quantity,
          quantityUnit,
          shipmentNumber,
        };

        processedShipments.push(shipment);
      }

      return processedShipments;
    } catch (error) {
      console.error(error);
      return next(new AppError('Error saving shipment data to MongoDB.', 500));
    }
  }

  removeAsteriskMethod(data) {
    return data.map((record) => {
      return Object.entries(record).reduce(
        (transformedRecord, [key, value]) => {
          const trimmedKey = key.trim().replace('*', '');
          transformedRecord[trimmedKey] =
            typeof value === 'string' ? value.trim() : value;
          return transformedRecord;
        },
        {}
      );
    });
  }
}

module.exports = ExcelParser;
