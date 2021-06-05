var blessed = require('blessed')
, contrib = require('blessed-contrib')
, screen = blessed.screen(),
axios = require('axios');

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=';
var SITE = process.argv.slice(2);
const URL = SITE[0] ? SITE[0] : 'https://contactform.dev/';
const DEBUG_ENABLED = false;

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

var desktopScore = grid.set(0, 0, 4, 4, contrib.donut,
  {
  label: 'Score of ' + SITE[0] + ' Updating every second',
  radius: 16,
  arcWidth: 4,
  yPadding: 2,
  data: [{label: 'Light House Score', percent: 0}]
})


/**
 * Get Page Score
 */
function updateScore(){
  let FCP = 0;
  var color = "green";
  if (FCP >= 0.25) color = "cyan";
  if (FCP >= 0.5) color = "yellow";
  if (FCP >= 0.75) color = "red";

  axios.get(ENDPOINT+URL).then(function (response) {
    let score = response.data.lighthouseResult.categories.performance.score;
    let cleanScore = (Math.round(score * 100*100) / 100).toFixed();
    desktopScore.setData([{percent: cleanScore, label: 'Desktop', 'color': color}]);
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
}

setInterval(function() {
  updateScore();
  screen.render()
}, 1000)


function randomColor() {
  return [Math.random() * 255,Math.random()*255, Math.random()*255]
}

var log = grid.set(0, 4, 4, 8, contrib.log,
  { fg: randomColor()
  , selectedFg: randomColor()
  , label: 'CWV Data of ' + SITE[0]})

  /**
  * CWV Informations
  */
setInterval(function() {
  axios.get(ENDPOINT+URL).then(function (response) {
    let score = response.data.lighthouseResult.categories.performance.score;
    let cleanScore = (Math.round(score * 100*100) / 100).toFixed();
    let MAX_FCP = response.data.lighthouseResult.audits['max-potential-fid'].displayValue;
    let UNMINIFIED_CSS = response.data.lighthouseResult.audits['unminified-css'].displayValue;
    let UNMINIFIED_CSS_TITLE = response.data.lighthouseResult.audits['unminified-css'].title;
    let SPEED_INDEX_TITLE = response.data.lighthouseResult.audits['speed-index'].title;
    let SPEED_INDEX = response.data.lighthouseResult.audits['speed-index'].displayValue;
    let MODERN_IMAGE = response.data.lighthouseResult.audits['modern-image-formats'].displayValue;
    let MODERN_IMAGE_TITLE = response.data.lighthouseResult.audits['modern-image-formats'].title;
    let LCP_TITLE = response.data.lighthouseResult.audits['largest-contentful-paint'].title;
    let LCP = response.data.lighthouseResult.audits['largest-contentful-paint'].displayValue;


    log.log('Overall Score ' + cleanScore);
    log.log('Max Potential First Input Delay ' + MAX_FCP);
    log.log(UNMINIFIED_CSS_TITLE + ' ' + UNMINIFIED_CSS);
    log.log(SPEED_INDEX_TITLE + ' ' + SPEED_INDEX);
    log.log(MODERN_IMAGE_TITLE + ' ' + MODERN_IMAGE);
    log.log(LCP_TITLE + ' ' + LCP);
    screen.render()
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
  
}, 2000)


var LCP_LCD = grid.set(4,0,3,4, contrib.lcd,
  {
    label: "LCP (Largest Contentful Paint)",
    segmentWidth: 0.06,
    strokeWidth: 0.1,
    elements: 5,
    display: '...',
    elementSpacing: 4,
    elementPadding: 2
  }
);

setInterval(function(){
  
  axios.get(ENDPOINT+URL).then(function (response) {
    let LCP = response.data.lighthouseResult.audits['largest-contentful-paint'].displayValue;
    LCP_LCD.setDisplay(LCP);
    LCP_LCD.setOptions({
      color: randomColor(),
      elementPadding: 4
    });
  
    screen.render()
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
  
}, 1500);


var FMP_LCD = grid.set(7,0,3,4, contrib.lcd,
  {
    label: "FMP (First Meaningful Paint)",
    segmentWidth: 0.06,
    strokeWidth: 0.1,
    elements: 5,
    display: '...',
    elementSpacing: 4,
    elementPadding: 2
  }
);

setInterval(function(){
  
  axios.get(ENDPOINT+URL).then(function (response) {
    let LCP = response.data.lighthouseResult.audits['first-meaningful-paint'].displayValue;
    FMP_LCD.setDisplay(LCP);
    FMP_LCD.setOptions({
      color: randomColor(),
      elementPadding: 4
    });
  
    screen.render()
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
  
}, 1500);



var interactive_LCD = grid.set(9.8,0,3,4, contrib.lcd,
  {
    label: "Time to Interactive",
    segmentWidth: 0.06,
    strokeWidth: 0.1,
    elements: 5,
    display: '...',
    elementSpacing: 4,
    elementPadding: 2
  }
);

setInterval(function(){
  
  axios.get(ENDPOINT+URL).then(function (response) {
    let interactive = response.data.lighthouseResult.audits['interactive'].displayValue;
    interactive_LCD.setDisplay(interactive);
    interactive_LCD.setOptions({
      color: randomColor(),
      elementPadding: 4
    });
  
    screen.render()
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
  
}, 1500);


var moreInfo =grid.set(4,4,8,8, contrib.markdown);
moreInfo.setMarkdown('# Please wait.. All the data is loading .... This might take a minute or two.')
setInterval(function(){
  
  axios.get(ENDPOINT+URL).then(function (response) {
    let interactive = response.data.lighthouseResult.audits['interactive'].displayValue;
    let unused_css_rules = response.data.lighthouseResult.audits['unused-css-rules'].displayValue;
    let mainthread_work = response.data.lighthouseResult.audits['mainthread-work-breakdown'].displayValue;
   
    moreInfo.setMarkdown('# Time to Interactive \nTime to interactive is the amount of time it takes '+
    'for the page to become fully interactive. [Learn more](https://web.dev/interactive/).:  ' + interactive +
     '\n'+
     '# Reduce unused CSS : ' + unused_css_rules +
     '\n'+
     '# Minimizes main-thread work: ' + mainthread_work +
     '\n'+
     '### Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this. [Learn more](https://web.dev/mainthread-work-breakdown/) '
     )
    screen.render()
  }).catch(function (error) {
    if(DEBUG_ENABLED){
      console.log(error);
    }
  });
  
}, 1500);

