const Bull = require('bull')
const ShipmentService =require('./shipmentService.js');
const ExcelParser =require('../utils/excelParser.js');
const AwsS3Wrapper =require('./awsS3Wrapper.js');
const { shipmentSchemaValidation } =require('../utils/validateSchema.js');
const AppError =require('../utils/appError.js');
const redisConfig = require('../config/redis-config.js');
const bullQueue = new Bull('excelProcessingQueue', redisConfig);

bullQueue.process(async (job) => {
  const { key } = job.data;
  const errors = [];
  try {
    const s3Data = await AwsS3Wrapper.getObject(key);
    const excelParser = new ExcelParser(s3Data.Body);
    const excelData = excelParser.toJson();
    const processedData = await excelParser.processExcelData(excelData);

    // Joi validation
    processedData.forEach((data) => {
      const val = shipmentSchemaValidation.validate(data);
      if (val.error) errors.push(val.error.message);
    });
    if (errors.length > 0) {   
      const errorMessage = errors.join(', ');
    // throw errors;
      return new AppError(errorMessage, 400);
    } 
    // Save data to the database
    await ShipmentService.saveShipmentToMongoDB(processedData);
  }
  catch (error) {
    console.error(`Error processing Excel file with key ${key}:`, error);
    return new AppError('Error while processing excel file', 500);
  }
});

// Handling Events
bullQueue.on('completed', (job) => {
  console.log(`Processing completed for job ${job.id}`);
});

bullQueue.on('failed', (job, error) => {
  console.error(`Processing failed for job ${job.id}:`, error);
});

const enqueueExcelProcessing = async (key) => {
  await bullQueue.add({ key });
}
module.exports ={bullQueue, enqueueExcelProcessing}
