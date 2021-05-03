require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json({
  type: ['application/json', 'text/plain']
}));

const cors = require('cors');
app.use(cors({ origin: '*' }));

app.use(express.static('public'));

const port = process.env.PRODUCTIONPORT;

//import modules
const classifyImage = require('./modules/classify_image');
const createHtml = require('./modules/create_html');
const generateGallery = require('./modules/create_gallery');
const classificationdb = require('./modules/add_cassification_to_db');

//set up multipart/formdata handler/parser
const multer = require('multer');

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "/images"
});

//import file system implementation
const fs = require('fs');
const path = require('path');

//API
app.get('/', express.static(path.join(__dirname, "./public")));

app.post('/uploadImage', upload.single("image"), async (req, res) => {
  let currentTime = new Date;
  let newFilepath = `.\\public\\images\\${currentTime.getFullYear()}${currentTime.getDate()}${currentTime.getDay()}${currentTime.getHours()}${currentTime.getMinutes()}${currentTime.getSeconds()}${currentTime.getMilliseconds()}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `${newFilepath}`);

  //save the uploaded image to ./public/images with the timestamp of the uploading as a name.
  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(tempPath, targetPath, async err => {
      if (err) return handleError(err, res);

      //classify the uploaded image
      async function getClassifyResult() {
        let classifyResults = await classifyImage.classify_image(newFilepath);
        if (classifyResults == 400) {
          //delete file if an error is encountered during classification (i.e. falsely encoded file)
          fs.unlink(targetPath, err => {
            if (err) return handleError(err, res);

            res
              .status(400)
              .contentType("text/plain")
              .send("Only correctly encoded .png files are allowed!");
          });
          return false;
        } else {
          return classifyResults[0].classifiers[0].classes;
        }
      }
      let classification = getClassifyResult();

      if (await classification != false) {
        //add classification to db
        let filename = newFilepath.substring(16);
        classificationdb.addToDB(filename, classification);

        //generate the html for result page
        let resultHTML;
        async function generateHTML() {
          let html = createHtml.create_html(newFilepath, classification);
          resultHTML = await html;
        }

        //serve the result HTML with all information to the user
        generateHTML().then(() => {
          res
            .status(200)
            .contentType("text/html")
            .send(resultHTML);
        })
      }

    });
  } else {
    fs.unlink(tempPath, err => {
      if (err) return handleError(err, res);

      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");
    });
  }
}
);

app.get('/gallery', async (req, res) => {
  let gallery = generateGallery.generateGallery();
  res.status(200).contentType("text/html").send(await gallery);
});

app.listen(port, () => console.log(`Example app listening on http://localhost:${port}`));