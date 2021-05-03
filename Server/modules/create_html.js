const path = require('path');
const Hbs = require('handlebars');
const fs = require('fs');

async function create_html(imagepath, classification){

    imagepath = imagepath.substring(8);
    imagepath = '.' + imagepath;
    
    let classes = await classification;

    let data = {
        'imagepath': imagepath,
        'classification': classes
    }

    let hbsTemplate = fs.readFileSync('./templates/result.handlebars');
    let template = Hbs.compile(hbsTemplate.toLocaleString())
    let html = template(data);
    return html;
}

exports.create_html = create_html;
