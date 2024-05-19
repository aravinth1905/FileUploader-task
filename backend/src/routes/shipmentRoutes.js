const express=require('express')
const router=express.Router();

const { s3Uploader, s3Validator } = require('../middlewares/uploads');
const{uploadFile,getAllFileDetails,exportExcelFile}=require('../controllers/shipmentController');

router.post('/upload_excel', s3Uploader.single('file'), s3Validator(),uploadFile);
router.get('/upload_excel', getAllFileDetails);
router.get('/export', exportExcelFile);
module.exports=router