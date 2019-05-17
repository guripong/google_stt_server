var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/',function(req,res,next){
  console.log('post왔당');

  main()
.catch(console.error);


});

async function main() {
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
//  const fileName = './speech.mp3';

  const fileName = './resources/ManualTest.wav';
  //const fileName = './resources/audio.raw';
  //const fileName = './resources/commercial_mono.wav';

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString('base64');

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };


  // Detects speech in the audio file
  const response = await client.recognize(request);
  var getdata=response[0].results[0].alternatives[0];
 // console.log(response[0].results[0].alternatives);

  //const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
  //console.log(`Transcription: ${transcription}`);
  console.log(getdata);
}

module.exports = router;
