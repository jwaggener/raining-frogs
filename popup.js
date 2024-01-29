// not being used
// https://stackoverflow.com/questions/45179138/sending-message-from-popup-to-content-script-chrome-extension

document.addEventListener("DOMContentLoaded", runFunction);

function runFunction() {
  // let button = document.getElementById('btn');
  // console.log('adding the onclick')
  // button.addEventListener('click', clickFunction);
}

function clickFunction(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    console.log('here in the click function');
    // chrome.tabs.sendMessage(tabs[0].id, {type:"getText"}, function(response){
    //   alert(response)
    //   $("#text").text(response);
    // });


    chrome.tabs.sendMessage( tabs[0].id, { message:"HELLLLLLOOO!" } );
  });
}