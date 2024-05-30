const { expect } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
chai.use(sinonChai);

const proxyquire = require('proxyquire').noCallThru();
const bullService = require('../../src/services/bullService.js');
const shipmentModule = require('../../src/filemodules/shipmentModule.js');
const ExcelGenerator= require('../../src/services/excel-generator.js')
const AwsS3Wrapper=require('../../src/services/awsS3Wrapper.js');
describe('uploadFile', () => {
  let req, res, next;

  before(() => {
    target = proxyquire('../../src/controllers/shipmentController.js', {});
  });
  beforeEach(() => {
    req = {
      file: null,
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });
  afterEach(()=>{
    sinon.verify();
    sinon.restore();
  })
  it('should return 400 if no file is uploaded', async () => {
    await target.uploadFile(req, res, next);
    expect(res.status).to.have.been.calledWith(400);
    expect(res.json).to.have.been.calledWith({ error: 'No file uploaded.' });
  });

  it('should enqueue file processing and return 200 status', async () => {
    req.file = { key: 'demo.xlsx' };
    const enqueueStub = sinon.stub(bullService, 'enqueueExcelProcessing').resolves();

    await target.uploadFile(req, res, next);
    expect(enqueueStub).to.have.been.calledWith('demo.xlsx');
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ status: 'success', message: 'File queued for processing.' });

    enqueueStub.restore();
  });

  it('should return 500 if enqueueing fails', async () => {
    req.file = { key: 'demo.xlsx' };
    const enqueueStub = sinon.stub(bullService, 'enqueueExcelProcessing').rejects(new Error('Failed to enqueue'));

    await target.uploadFile(req, res, next);

    expect(enqueueStub).to.have.been.calledWith('demo.xlsx');
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ error: 'Failed to enqueue task.' });

    enqueueStub.restore();
  });
});
describe('getAllFileDetails', () => {
  let req, res, next, excelParserStub, processedDataStub;
  class ExcelParserMock{
    constructor(s3BufferData){
      this.s3BufferData=s3BufferData;
    }
    toJson() {
      return excelParserStub();
    }
    processExcelData(jsonData){
      return processedDataStub();
    }
  }
  before(() => {
    target = proxyquire('../../src/controllers/shipmentController.js', {
      '../../src/utils/excelParser.js':ExcelParserMock
    });
  });
  beforeEach(() => {
    req = {
      file: null,
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });
  afterEach(()=>{
    sinon.verify();
    sinon.restore();
  })
  it('should return 404 if no shipments are found', async () => {
    const findStub = sinon.stub(AwsS3Wrapper, 'getAllItemsFromS3').resolves([]);
    await target.getAllFileDetails(req, res, next);
    expect(findStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ error: 'No files found in S3.' });
  });

  it('should return 200 and the shipment data if shipments are found', async () => {
    const files=['demo.xlsx']
    const filesStub = sinon.stub(AwsS3Wrapper, 'getAllItemsFromS3').resolves(files)
    const key = ['demo.xlsx'];
    const fileData={
      Body: ' 50 4b 03 04 14 00 00 00 08 00 81 53 93 58 a4 9b 55 ac db 00 00 00 3b 02 00 00 0b 00 14 00 5f 72 65 6c 73 2f 2e 72 65 6c 73 01 00 10 00 00 00 00 00 00 ... 7305 more bytes'
    };

    const processedData=[{
      'Shipment Type': 'Aloha',
      'Order Number': 'MAMA-10',
    }];
   
    const findStub = sinon.stub(AwsS3Wrapper, 'getObject').resolves(fileData)
    
    excelParserStub=sinon.stub().returns(processedData)
    processedDataStub=sinon.stub().returns(processedData);

    
    await target.getAllFileDetails(req, res, next);
    expect(filesStub).to.have.been.calledOnce;
    expect(findStub).to.have.been.calledOnce;
    expect(excelParserStub).to.have.been.calledOnce;
    expect(processedDataStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ status: 'success', data: processedData });
  });

  it('should return 500 if fetching shipments fails', async () => {
    const error = new Error('Failed to fetch shipments');
    const filesStub = sinon.stub(AwsS3Wrapper, 'getAllItemsFromS3').rejects(error);

    await target.getAllFileDetails(req, res, next);

    expect(filesStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ error: 'Failed to fetch items from S3.' });
  });
});

describe('exportExcelFile', () => {
  let req, res, next;
  let target;
  let generateXlsStub;

  class ExcelGeneratorMock {
    constructor(data) {
      this.data = data;
    }
    generateXls() {
      return generateXlsStub();
    }
  }

  before(() => {
    target = proxyquire('../../src/controllers/shipmentController.js', {
      '../../src/filemodules/shipmentModule.js': shipmentModule,
      '../../src/services/excel-generator.js': ExcelGeneratorMock,
    });
  });

  beforeEach(() => {
    req = {};
    res = {
      setHeader: sinon.stub(),
      writeHead: sinon.stub(),
      end: sinon.stub(),
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {

    sinon.restore();
  });

  it('should return 404 if no shipments are found', async () => {
    const findStub = sinon.stub(shipmentModule, 'find').resolves([]);

    await target.exportExcelFile(req, res, next);

    expect(findStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ error: 'No shipments found.' });
  });

  it('should set headers and return the generated Excel file if shipments are found', async () => {
    const shipmentData = [{ id: 1, name: 'Shipment 1' }, { id: 2, name: 'Shipment 2' }];
    const excelData = 'someExcelDataBase64';
    const findStub = sinon.stub(shipmentModule, 'find').resolves(shipmentData);
    generateXlsStub = sinon.stub().returns(excelData); 

    await target.exportExcelFile(req, res, next);

    expect(findStub).to.have.been.calledOnce;
    expect(generateXlsStub).to.have.been.calledOnce;
    expect(res.setHeader).to.have.been.calledWith('Content-Disposition', 'attachment; filename=shipment-list.xlsx');
    expect(res.setHeader).to.have.been.calledWith('Content-Transfer-Encoding', 'binary');
    expect(res.writeHead).to.have.been.calledWith(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    expect(res.end).to.have.been.calledWith(Buffer.from(excelData, 'base64'));
  });

  it('should return 500 if fetching shipments fails', async () => {
    const error = new Error('Failed to fetch shipments');
    const findStub = sinon.stub(shipmentModule, 'find').rejects(error);

    await target.exportExcelFile(req, res, next);

    expect(findStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ error: 'Failed to fetch shipments.' });
  });
});