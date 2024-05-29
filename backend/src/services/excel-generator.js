/* global logger */
const xlsx = require('xlsx');

class ExcelGenerator {
  constructor(data) {
    this.data = this.flattenData(data);
    this.sheetName="shipment";
  }

  flattenData(data) {
    console.log('datass', data);
    return data.map(item => ({
      shipmentType: item.shipmentType,
      orderNumber: item.orderNumber,
      orderType: item.orderType,
      primaryMode: item.primaryMode,
      expectedDeliveryDate: item.expectedDeliveryDate.toISOString().split('T')[0], // Format date
      incoterm: item.incoterm,
      sourceLocation: item.sourceLocation,
      destinationLocation: item.destinationLocation,
      cargoType: item.cargoType,
      materialCode: item.materialCode,
      quantity: item.quantity,
      quantityUnit: item.quantityUnit,
      shipmentNumber: item.shipmentNumber
    }));
  }
  generateXls(options = { cellDates: true, dateNF: 'dd/MM/yyyy' }) {
    try {
      const workBook = xlsx.utils.book_new();
      const workSheet = xlsx.utils.json_to_sheet(this.data, options);
      xlsx.utils.book_append_sheet(workBook, workSheet, this.sheetName);
      return xlsx.write(workBook, { type: 'buffer', bookType: 'xlsx', compression: true });
    } catch (error) {
      return error;
    }
  }

}

module.exports = ExcelGenerator;
