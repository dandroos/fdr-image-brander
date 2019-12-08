var express = require('express');
var router = express.Router();


router.post('/', (req, res)=>{
    var storage = multer.diskStorage({
        destination: (req, file, cb)=>{
          cb(null, 'public')
        },
        filename: (req,file, cb)=>{
          cb(null, Date.now() + ' - ' + file.originalname)
        }
      })
      var upload = multer({ storage: storage}).single('file')
    
      upload(req,res,(err)=>{
        return res.status(200).send(req.file)
      })
})


module.exports = router;
