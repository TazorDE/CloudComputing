//import fs
const fs = require('fs');

//import Handlebars
const Hbs = require('handlebars');

//import module
const classificationdb = require('./add_cassification_to_db');

async function generateGallery() {
    let allimagedata = classificationdb.getDBcontent();
    //set up data to be sent to the template
    let data={
        image: await allimagedata
    }
    //load template
    let hbstemplate = fs.readFileSync('./templates/gallery.handlebars');
    //compile template
    let template = Hbs.compile(hbstemplate.toLocaleString());
    //render template to string
    let html = template(await data);
    //return template
    return html;
}

module.exports.generateGallery = generateGallery;