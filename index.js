import fs from 'fs';
import readline from 'readline';
import {google} from 'googleapis';
import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();
const app = express();
app.use(express.json());
app.use (express.urlencoded({extended:false}));
const [port, ip] = [3009 || process.env.PORT, '127.0.0.1' || process.env.IP];

const OAuth2Client = new google.auth.OAuth2(
  process.env.client_id,
  process.env.client_secret,
  process.env.redirect_uris
);

OAuth2Client.setCredentials({
  access_token : process.env.access_token,
  refresh_token : process.env.refresh_token,
  expiry_date : process.env.expiry_date,
})

const drive = google.drive({
  version: 'v3',
  auth : OAuth2Client
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
      console.log(file)
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
let upload = multer({storage}).single('file');
app.set('view engine', 'ejs')
app.use(express.static(__dirname +'/public'))

app.get('/', (req, res)=> {
    res.status(200).json({message: 'Welcome to google drive uploader'});
})

app.get('/files/new', (req, res)=> {
    res.status(200).render('new');
})

app.post('/files', (req, res)=> {
    const body = fs.createReadStream('uploads/ml-run-data-individual.csv')
    drive.files.create({
    requestBody: {
      name: 'ml-run-data-individual.',
      mimeType: 'text/csv'
    },
    media: {
      mimeType: 'text/csv',
      body: body
    }
  })
  .then(response=> {
    const file = response.id
    res.status(200).json({message: 'We got the file', file})
  })
  .catch(err=>{
    console.log(err.message)
    res.status(err.code).json({message: err.message, statusCode:err.code})
  })
})

app.listen(port, ip, () => {
    console.log(`drive trial app running on port ${port}, and ip ${ip}`)
})