"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = _interopRequireDefault(require("request"));

var _chatBotService = _interopRequireDefault(require("../services/chatBotService.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//import moment from "moment";
var MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var user = {
  name: ""
};

var postWebhook = function postWebhook(req, res) {
  // Parse the request body from the POST
  var body = req.body; // Check the webhook event is from a Page subscription

  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      var webhook_event = entry.messaging[0];
      console.log(webhook_event); // Get the sender PSID

      var sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid); // Check if the event is a message or postback and
      // pass the event to the appropriate handler function

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    }); // Return a '200 OK' response to all events

    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

var getWebhook = function getWebhook(req, res) {
  // Your verify token. Should be a random string.
  var VERIFY_TOKEN = MY_VERIFY_TOKEN; // Parse the query params

  var mode = req.query['hub.mode'];
  var token = req.query['hub.verify_token'];
  var challenge = req.query['hub.challenge']; // Checks if a token and mode is in the query string of the request

  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
}; // Handles messages events


var handleMessage = function handleMessage(sender_psid, message) {
  var response, entity, sentiment, _response, _response2, _response3, _response4, attachment_url, _response5;

  return regeneratorRuntime.async(function handleMessage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(message && message.quick_reply && message.quick_reply.payload)) {
            _context.next = 11;
            break;
          }

          if (!(message.quick_reply.payload === "YEAH_FINE")) {
            _context.next = 7;
            break;
          }

          _context.next = 4;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendActivityMenu(sender_psid));

        case 4:
          return _context.abrupt("return");

        case 7:
          if (!(message.quick_reply.payload === "SORRY_NO")) {
            _context.next = 11;
            break;
          }

          response = {
            "text": "I am sorry. Do you want to talk about it?"
          };
          callSendAPI(sender_psid, response);
          return _context.abrupt("return");

        case 11:
          //handle text message
          entity = handleMessageWithEntities(message); // Handle sentiment 

          sentiment = handleMessageWithSentiment(message);

          if (!(entity.name === "wit$greetings")) {
            _context.next = 18;
            break;
          }

          _response = {
            "text": "Hello there"
          };
          callSendAPI(sender_psid, _response); //default reply

          _context.next = 46;
          break;

        case 18:
          if (!(entity.name === "wit$thanks")) {
            _context.next = 23;
            break;
          }

          _response2 = {
            "text": "You are welcome!"
          };
          callSendAPI(sender_psid, _response2);
          _context.next = 46;
          break;

        case 23:
          if (!(entity.name === "wit$bye")) {
            _context.next = 28;
            break;
          }

          _response3 = {
            "text": "Bye bye. Hope you feel better. Good luck!"
          };
          callSendAPI(sender_psid, _response3);
          _context.next = 46;
          break;

        case 28:
          if (!(sentiment.value === "negative")) {
            _context.next = 33;
            break;
          }

          _context.next = 31;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendMessageAskingYesOrNo(sender_psid));

        case 31:
          _context.next = 46;
          break;

        case 33:
          if (!(sentiment.value === "positive")) {
            _context.next = 38;
            break;
          }

          _response4 = {
            "text": "Great! I am so happy to hear that!"
          };
          callSendAPI(sender_psid, _response4);
          _context.next = 46;
          break;

        case 38:
          if (!message.attachments) {
            _context.next = 44;
            break;
          }

          attachment_url = received_message.attachments[0].payload.url;
          _response5 = {
            "text": "And this is my most beautiful moment!",
            "attachment": {
              "type": "image",
              "payload": {
                "url": attachment_url,
                "is_reusable": true
              }
            }
          };
          callSendAPI(sender_psid, _response5);
          _context.next = 46;
          break;

        case 44:
          _context.next = 46;
          return regeneratorRuntime.awrap(_chatBotService["default"].listenToStory(sender_psid, message.text));

        case 46:
        case "end":
          return _context.stop();
      }
    }
  });
};

var handleMessageWithEntities = function handleMessageWithEntities(message) {
  var entitiesArr = ["wit$greetings", "wit$thanks", "wit$bye"];
  var entityChosen = "";
  var data = {}; // data is an object saving value and name of the entity.

  entitiesArr.forEach(function (name) {
    var entity = firstEntity(message.nlp, name); //console.log(entity);

    if (entity && entity.confidence > 0.8) {
      entityChosen = name;
      data.value = entity.value;
    }
  }); //console.log("Debugging: " + entityChosen);

  data.name = entityChosen;
  return data;
}; //Detect negative mood


var handleMessageWithSentiment = function handleMessageWithSentiment(message) {
  var sentiment = {};
  var mood = firstEntity(message.nlp, 'wit$sentiment');

  if (mood && mood.confidence > 0.8) {
    sentiment.value = mood.value;
  }

  ;
  return sentiment;
}; //Function that return the traits of the a sentence


function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
} // Handles messaging_postbacks events


var handlePostback = function handlePostback(sender_psid, received_postback) {
  var response, payload, username;
  return regeneratorRuntime.async(function handlePostback$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // Get the payload for the postback
          payload = received_postback.payload; // Set the response based on the postback payload

          _context2.t0 = payload;
          _context2.next = _context2.t0 === "GET_STARTED" ? 4 : _context2.t0 === "MEME" ? 11 : _context2.t0 === "MUSIC" ? 14 : _context2.t0 === "BRIAN_MEME" ? 17 : _context2.t0 === "TRUMP_MEME" ? 20 : 23;
          break;

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(_chatBotService["default"].getFacebookUsername(sender_psid));

        case 6:
          username = _context2.sent;
          user.name = username; //send welcome response to users

          _context2.next = 10;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendResponseWelcomeNewCustomer(username, sender_psid));

        case 10:
          return _context2.abrupt("break", 24);

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendMemeMenu(sender_psid));

        case 13:
          return _context2.abrupt("break", 24);

        case 14:
          _context2.next = 16;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendMusic(sender_psid));

        case 16:
          return _context2.abrupt("break", 24);

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendBrianMeme(sender_psid));

        case 19:
          return _context2.abrupt("break", 24);

        case 20:
          _context2.next = 22;
          return regeneratorRuntime.awrap(_chatBotService["default"].sendTrumpMeme(sender_psid));

        case 22:
          return _context2.abrupt("break", 24);

        case 23:
          console.log("Something wrong with switch case payload");

        case 24:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // Sends response messages via the Send API


function callSendAPI(sender_psid, response) {
  // Construct the message body
  var request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }; // Send the HTTP request to the Messenger Platform

  (0, _request["default"])({
    "uri": "https://graph.facebook.com/v8.0/me/messages",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, function (err, res, body) {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

var _default = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};
exports["default"] = _default;