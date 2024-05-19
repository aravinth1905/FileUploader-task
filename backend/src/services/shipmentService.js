const shipmentModel = require('../filemodules/shipmentModule.js')
const AppError =require('../utils/appError.js');

class ShipmentService {
  static async saveShipmentToMongoDB(data) {
    try {
      const savedShipment = await shipmentModel.insertMany(data);
      return savedShipment;
    } catch (error) {
      console.error('Error saving shipment data to MongoDB:', error);
      return next(new AppError('Error saving shipment data to MongoDB.', 500));
    }
  }
}

module.exports = ShipmentService;