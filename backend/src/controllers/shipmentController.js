
const bullService = require('../services/bullService.js');
const shipmentModel=require('../filemodules/shipmentModule.js')
const ExcelGenerator=require('../services/excel-generator.js');
const AwsS3Wrapper=require('../services/awsS3Wrapper.js');
const ExcelParser=require('../utils/excelParser.js')
const uploadFile = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    } 
    try {
      await bullService.enqueueExcelProcessing(req.file.key); 
      res.status(200).json({ status: 'success', message: 'File queued for processing.' });
    } catch (err) {
      console.error('Error enqueueing task:', err);
      res.status(500).json({ error: 'Failed to enqueue task.' });
    }
  };
  
  const getAllFileDetails = async (req, res, next) => {
    try {
      const files = await AwsS3Wrapper.getAllItemsFromS3();
      if (files.length === 0) {
        return res.status(404).json({ error: 'No files found in S3.' });
      }
      const allData = [];
      for (const key of files) {
        const fileData = await AwsS3Wrapper.getObject(key);     
        const excelParser = new ExcelParser(fileData.Body);
        const jsonData = excelParser.toJson();    
        const processedData = await excelParser.processExcelData(jsonData);
        allData.push(processedData);
        
      }
      res.status(200).json({ status: 'success', data: allData });
    } catch (error) {
      console.error('Error fetching items from S3:', error);
      res.status(500).json({ error: 'Failed to fetch items from S3.' });
    }
  };
  const exportExcelFile = async (req, res, next) => {
    try {
      const allShipments = await shipmentModel.find();
      if (allShipments.length === 0) {
        return res.status(404).json({ error: 'No shipments found.' });
      }
      const excelGen = new ExcelGenerator(allShipments);    
      const excelData = excelGen.generateXls();
      res.setHeader('Content-Disposition', `attachment; filename=shipment-list.xlsx`);
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.writeHead(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      res.end(Buffer.from(excelData, 'base64'));
    } catch (error) {
      console.error('Error fetching shipments:', error);
      res.status(500).json({ error: 'Failed to fetch shipments.' });
    }
   
  };

  module.exports = {uploadFile, getAllFileDetails,exportExcelFile};