const fs = require('fs');
require('dotenv').config();

const Cloudant = require('@cloudant/cloudant');

const cloudant = Cloudant({ url: process.env.CLOUDANT_URL, plugins: { iamauth: { iamApiKey: process.env.CLOUDANT_APIKEY } } });

//used to add the classificaton result to the database(json) after uploading the image
async function addToDB(filename, classification) {

    //set up data source
    let db = cloudant.use('image_classification');
    let data = await db.get('image_data');
    //set up new object to insert into the database
    let newClassification = {};
    newClassification.id = filename;
    newClassification.classes = await classification;
    data.images.push(newClassification);

    //insert data to database
    db.insert(data);

    return true;
}

//used in the create_gallery module to retrieve the classification for use in the gallery html
async function getDBcontent() {
    let db = cloudant.use('image_classification');
    let data = await db.get('image_data');
    return data.images;
}
module.exports.addToDB = addToDB;
module.exports.getDBcontent = getDBcontent;