//import fs
const fs = require('fs');

//import Handlebars
const Hbs = require('handlebars');

//import module
const classificationdb = require('./add_cassification_to_db');

async function generateGallery() {
    let allimagedata = classificationdb.getDBcontent();

    let data={
        image: await allimagedata
    }
    let hbstemplate = fs.readFileSync('./templates/gallery.handlebars');
    let template = Hbs.compile(hbstemplate.toLocaleString());
    let html = template(await data);
    
    return html;
}

module.exports.generateGallery = generateGallery;