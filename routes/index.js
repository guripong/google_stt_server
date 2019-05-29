var express = require('express');
const multiparty = require('multiparty');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res, next) {
  console.log('post왔당');


  var fname;
  var fakepath;
  var ct;
  var form = new multiparty.Form({
    autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
    uploadDir: 'temp/', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
  });

  var realpath;
  /*
  const form = new multiparty.Form({
      autoFiles: true,
  });
  */

  form.parse(req);
  form.on('field', (name, value) => {
    //console.log(`name:`,name,`value`,value);
    if (name == 'fakepath') {
      fakepath = value;
    }
  });
  form.on('file', (name, file) => {
    //console.log('파일 들어옴');
    console.log(`파일:`, file.originalFilename);
    fname = file.originalFilename;
    realpath = file.path;
    //console.log(file.headers['content-type']);
    ct = file.headers['content-type'];

  });

  form.on('part', function (part) {
    console.log('파트 들어옴');
    //console.log(part);
    var size;
    if (part.filename) {
      size = part.byteCount;
      console.log(`size:`, size);

    } else {
      console.log('다시다시');
      part.resume();
    }

  });

  form.on('progress', function (byteRead, byteExpected) {

    //받는도중 계속 호출
    console.log(' Reading total  ' + byteRead + '/' + byteExpected);

  });

  form.on('error', function (err) {
    console.log('Error parsing form: ' + err.stack);
  });

  var stterror=0;
  form.on('close', () => {
    console.log(`close!!!`);
    //const fileName = './resources/ManualTest.wav';
    var fileName = realpath;

    /*
    let buffer = fs.readFileSync(fileName);
    let result = wav.decode(buffer);
    console.log(`샘플레이트:`,result.sampleRate);
    */
    //console.log(`채널데이타:`,result.channelData);
    
  
    /*
      var process = new ffmpeg(fileName);
      process.then(function (video) {
        // Callback mode
        video.fnAddWatermark('/path/to/retrieve/watermark_file.png', '/path/to/save/your_file_video.mp4', {
          position : 'SE'
        }, function (error, file) {
          if (!error)
            console.log('New video file: ' + file);
        });
      }, function (err) {
        console.log('Error: ' + err);
      });
      */
     var config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      speechContexts:[{
        phrases:["go to the left side","go to the right side","hololo"]
      }]
     };



    main(fileName,config).catch(function (error){
      console.log(error);//console.error
      if(error){
        stterror=1;
      }

    }).then(function (results) {
        console.log('결과:', results);

        fs.unlink(fileName, function(err){
          if( err ) throw err;
          //console.log('file deleted:'+fileName);
        });

      if (stterror == 0) {
        return res.json({
          status: true,
          "fname": fname,
          results: results
        });
      }
      else {
        return res.json({
          status: false,
          "fname": fname,
          results: results
        });
      }
    
      });// cath.then
  });//form.on close
});

async function main(fileName,config) {
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');


  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
  //  const fileName = './speech.mp3';


  //const fileName = './resources/audio.raw';
  //const fileName = './resources/commercial_mono.wav';

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString('base64');

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  

  const request = {
    audio: audio,
    config: config,
  };


  // Detects speech in the audio file
  const response = await client.recognize(request);
  var getdata='';
  console.log('진짜:',response);

  if( (response&&response[0].results) && response[0].results[0].alternatives)
  getdata= response[0].results[0].alternatives[0];
  // console.log(response[0].results[0].alternatives);

  //const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
  //console.log(`Transcription: ${transcription}`);
  //console.log(getdata);
  return getdata;
}

module.exports = router;
