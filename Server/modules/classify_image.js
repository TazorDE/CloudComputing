//import file system implementation
const fs = require('fs');

//set up visual recognition
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({
        apikey: process.env.VISUAL_RECOGNITION_APIKEY,
    }),
    serviceUrl: process.env.VISUAL_RECOGNITION_URL
});

async function classify_image(image) {
    let imagefile = await fs.createReadStream(`${image}`).on('error', onError);

    function onError(err){
        console.log('Error encountered! \n');
    }

    let params = {
        imagesFile: imagefile,
        threshold: 0.6
    };

    let result = await visualRecognition.classify(params).catch(err => {
        // console.log(err);
        return 400
    })
    if(result != 400){
        return result.result.images;
    }else{
        return 400;
    }
}

exports.classify_image = classify_image;