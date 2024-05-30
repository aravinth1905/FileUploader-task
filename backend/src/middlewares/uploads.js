const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, S3BucketName, } = require('../config/s3Config');
const { v4: uuidv4 } = require('uuid');
const diskLimits = {
    fileSize: 8000000 
};

const s3Storage = multerS3({

    s3: S3Client,
    bucket: S3BucketName,
    acl: 'public-read',

    metadata(req, file, cb) {
      cb(null, { original_name: file.originalname });
    },
    key: function (req, file, cb) {
      const uid=uuidv4();
      cb(null, `file-${uid}-${file.originalname}`);
    },
  });
  
const s3Uploader = multer({ storage: s3Storage, limits: diskLimits});
function isSupportedPandoFileType(fileType) {
    return [
      'xls',
      'xlm',
      'xlsx',
      'xlsm',
      'csv',
      ].includes(fileType.toLowerCase());
  }
  const s3Validator = () => async (req, res, next) => {
    const fileData = req.file;
    const fileType = fileData.key.split('.').pop();
    if (!isSupportedPandoFileType(fileType)) {
      res.status(400).json(`Unsupported file type: ${fileType}, bucket: ${fileData.bucket}, file: ${fileData.key}`);
      return;
    }  
    next();
  };
  
  module.exports = {s3Uploader, s3Validator };
  