'use strict';

var http = require('http');
exports.handler = function(event,context) {


try {

var request = event.request;

    var session = event.session;

    if(!event.session.attributes) {
      event.session.attributes = {};
    }



if (request.type === "LaunchRequest"){

HandleLaunchRequest(context);

}
else if ( request.type ===  "IntentRequest"){


if(request.intent.name==="HelloIntent"){
  
HandleHelloIntentRequest(request,context);
 

 } else if (request.intent.name === "QuoteIntent") {

        handleQuoteIntent(request,context,session);

      } else if (request.intent.name === "NextQuoteIntent") {

        handleNextQuoteIntent(request,context,session);

      




}else{
context.fail("Unknown Intyent type");
}



}
else if ( request.type ===  "SessionEndedRequest"){

} else{
throw "Unknown intent type";
}



} catch(e) {
   context.fail("Exception: "+e);
}


}



function handleQuoteIntent(request,context,session) {
  let options = {};
  options.session = session;

  getQuote(function(quote,err) {
    if(err) {
      context.fail(err);
    } else {
      options.speechText = quote;
      options.speechText += " Do you want to listen to one more quote? ";
      options.repromptText = "You can say yes or one more. ";
      options.session.attributes.quoteIntent = true;
      options.endSession = false;
      context.succeed(buildResponse(options));
    }
  });

}

function handleNextQuoteIntent(request,context,session) {
  let options = {};
  options.session = session;

  if(session.attributes.quoteIntent) {
    getQuote(function(quote,err) {
      if(err) {
        context.fail(err);
      } else {
        options.speechText = quote;
        options.speechText += " Do you want to listen to one more quote? ";
        options.repromptText = "You can say yes or one more. ";
        //options.session.attributes.quoteIntent = true;
        options.endSession = false;
        context.succeed(buildResponse(options));
      }
    });
  } else {
    options.speechText = " Wrong invocation of this intent. ";
    options.endSession = true;
    context.succeed(buildResponse(options));
  }

}




function HandleHelloIntentRequest(request,context){

  let options = {};
  let name = request.intent.slots.FirstName.value;
  options.speechText = `Hello <say-as interpret-as="spell-out">${name}</say-as> ${name}. `;
 options.speechText += GetGreeting();

GetQuote(function(quote,err){

if(err){
context.fail(err);
}else{
options.speechText +=quote;
options.endSession = true;
  context.succeed(buildResponse(options));
}
});

}

function HandleLaunchRequest(context){
let options = {};
  options.speechText =  "Welcome to Greetings skill. Using our skill you can greet your guests. Whom you want to greet? ";
  options.repromptText = "You can say for example, say hello to John. ";
  options.endSession = false;
  context.succeed(buildResponse(options));
}


function GetQuote(callback) {
  var url = "http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json";
  var req = http.get(url, function(res) {
    var body = "";

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      body = body.replace(/\\/g,'');
      var quote = JSON.parse(body);
      callback(quote.quoteText);
    });

  });

  req.on('error', function(err) {
    callback('',err);
  });
  
}




function buildResponse(options) {



  var response = {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: "<speak>"+options.speechText+"</speak>"
      },
      shouldEndSession: options.endSession
    }
  };

  if(options.repromptText) {
    response.response.reprompt = {
      outputSpeech: {
        type: "SSML",
        ssml: "<speak>"+options.repromptText+"</speak>"
      }
    };
  }

  
   if(options.session && options.session.attributes) {
    response.sessionAttributes = options.session.attributes;
  }



  return response;
}



function GetGreeting()
{

  var myDate = new Date();
 var hours = myDate.getUTCHours() - 8;
  if (hours < 0) {
    hours = hours + 24;
  }

  if (hours < 12) {
    return "Good Morning. ";
  } else if (hours < 18) {
    return "Good afternoon. ";
  } else {
    return "Good evening. ";
  }
}