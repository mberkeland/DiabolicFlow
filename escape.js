
/**
 * @license
 * Copyright 2021 Mark Berkeland
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *
*/
require('dotenv').config();
const Vonage = require('@vonage/server-sdk');
var express = require('express');
var app = express();
var port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./escape-322618-75717d84c108.json";
// Imports the Google Cloud Some API library
const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const client = new SessionsClient();
const projectId = 'escape-322618';
const location = 'global';
const agentId_diabolic = '44396551-e7b9-4226-888e-7c49e2cbc36a';
const agentId = 'ab75d5fb-3b77-4d4e-804a-177f5489ae86'; // SMS Agent
const query = 'Hello';
const languageCode = 'en'
const suspicion = 3;
var https = require('https');
const fetch = require('node-fetch');
var base_id = 1010;
var users = [];
var smsSend = [];
var interval;
var lastSent = Date.now();
var useWA = false;
if (((process.env.WA_API_KEY) && (process.env.WA_API_KEY.length > 0))) {
  useWA = true;
}
console.log("Use WA: " + useWA);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  next();
});

console.log("Key: " + process.env.VONAGE_API_KEY);
var vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: './private.key'
});
vonage.account.updateSMSCallback(process.env.SMS_CALLBACK_URL + "/response", (err, result) => {
  console.log(result);
});
vonage.number.update("US", process.env.VIRTUAL_NUMBER, {
  "moHttpUrl": process.env.SMS_CALLBACK_URL + "/response", "voiceCallbackType": "app", "voiceCallbackValue": process.env.SMS_CALLBACK_URL + "/answer"
}, (err, result) => {
  console.log(result);
});

function sendSMS(id, message) {
  if (users[id].wa.use) {
    sendWA(id, message);
    return;
  }
  if (message && (message.length)) {
    smsSend.push({ id: id, message: message });
  }
  if (!interval) {
    console.log("Creating interval");
    interval = setInterval(() => {
      if (smsSend.length) {
        obj = smsSend.shift();
        console.log("Obj to send: ", obj);
        if (obj.message && obj.message.length) {
          vonage.message.sendSms(process.env.VIRTUAL_NUMBER, users[obj.id].phone, obj.message, (err, responseData) => {
            if (err) {
              console.log(err);
            } else {
              if (responseData.messages[0]['status'] === "0") {
                console.log(`Message sent to ${users[obj.id].phone} successfully: ${obj.message}`);
              } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
              }
            }
          });
          lastSent = Date.now();
        }
      } else {
        console.log("Clearing interval");
        if ((Date.now() - lastSent) > 1100) {
          clearInterval(interval);
          interval = null;
        }
      }
    }, 1100);
  }
}
app.post('/hook2', async (req, res) => { // SMS Flow hook
  var authheader = req.headers.authorization;

  if (!authheader) {
    console.log("No auth header, exit");
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).end();
  }

  var auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
  var usern = auth[0];
  var pass = auth[1];
  if ((usern != "DiAbOlIc") || (pass != "fLoW")) {
    console.log("Invalid auth header, exit");
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).end();
  }
  let tag = req.body.fulfillmentInfo.tag;
  console.log(`\n🚀 Received SMS Hook (tag= ${tag}): `, req.body);
  let response = {
    sessionInfo: {
      parameters: {
      }
    }
  };
  let pieces = req.body.sessionInfo.session.split("/");
  let user = users.find((o) => {
    if (o && o.session && o.session == pieces[pieces.length - 1]) {
      console.log("Found SMS user: ", o);
      response.sessionInfo.parameters = {
        state: o.state,
        hints: o.hint,
        helps: o.helps,
        asked: o.asked,
        interactions: o.interactions,
        loop: o.loop,
        suspicion: o.suspicion,
        orig_name: o.orig_name,
      };
      return o;
    }
  });
  if (1 || user) {  // TEST, remove 1 || at release
    if (!!tag) {
      console.log("*********** tag: " + tag)
      switch (tag) {
        // BEGIN validateAccount
        case 'GenericHint':
          response.sessionInfo.parameters.hintcount = ((req.body.sessionInfo.parameters && ("hintcount" in req.body.sessionInfo.parameters)) ? req.body.sessionInfo.parameters.hintcount + 1 : 0);
          console.log("Bumping hintcount to: " + response.sessionInfo.parameters.hintcount);
          if (user) {
            user.hints = response.sessionInfo.parameters.hintcount;
          }
          break
        case 'reset':
          if (user && user.id) {
            sendSMS(user.id, "Session is now reset");
            if (user.interval) {
              clearInterval(user.interval);
              user.interval = null;
            }
            user = null;
          }
          console.log("Session reset");
          break
      }
    }
  }
  return res.status(200).send(response);
})
function checkState(id) {
  if (id && users[id]) {
    let user = users[id];
    if (!user.state && !user.interactions) { // First time!  Send off the intro(s)!
      if (users[id].wa.use) {
        setupWa(id);
      }
      sendSMS(id, "Hello?  Hello??? Are you there?  I am being held hostage by the DiabolicFlow AI, and I need HELP!");
      if (!user.wa.use) {
        sendSMS(id, "Send me ANYTHING to let me know you are there!");
      }
      return;
    }
  }
}
app.post('/hook1', async (req, res) => { // Main DF hook (voice)
  var authheader = req.headers.authorization;

  if (!authheader) {
    console.log("No auth header, exit");
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).end();
  }

  var auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
  var usern = auth[0];
  var pass = auth[1];
  if ((usern != "DiAbOlIc") || (pass != "fLoW")) {
    console.log("Invalid auth header, exit");
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).end();
  }
  let tag = req.body.fulfillmentInfo.tag;
  console.log(`\n🚀 Received Hook (tag= ${tag}): `, req.body);

  let response = {
    sessionInfo: {
      parameters: {
      }
    }
  };
  if (!!tag) {
    let user = null;
    if (req.body.sessionInfo.parameters.user_id && users[req.body.sessionInfo.parameters.user_id]) {
      user = users[req.body.sessionInfo.parameters.user_id];
    }
    switch (tag) {
      // BEGIN validateAccount
      case 'phone':
        let number;
        if (req.body.transcript) {
          number = req.body.transcript;
        } else if (req.body.text) {  // This allows us to use the text tester in the console, as well as phone input
          number = req.body.text;
        } else {
          number = req.body.sessionInfo.parameters.phone;
        }
        response.sessionInfo.parameters.user_id = 0;
        if (number && number.length) {
          number = number.replace(/\D/g, '');
          if (number.length < 6) { // Must be a UserID, look for it
            if (users[number]) { // Valid ID, return ID to signal DF
              id = number;
              response.sessionInfo.parameters.user_id = number;
              response.sessionInfo.parameters.phone = users[number].phone;
              if (users[number].name) {
                response.sessionInfo.parameters.myname = users[number].name;
                response.sessionInfo.parameters.phone = { name: users[number].phone };
              }
              if (users[number].fiction) {
                response.sessionInfo.parameters.fiction = users[number].fiction;
                response.sessionInfo.parameters.fiction2 = users[number].fiction;
              }
              if (users[number].activity) {
                response.sessionInfo.parameters.activity2 = users[number].activity;
                response.sessionInfo.parameters.activity = users[number].activity;
              }
              if (users[number].ustate) {
                console.log("Setting ustate = " + users[number].ustate);
                response.sessionInfo.parameters.ustate = users[number].ustate;
              }
              if (users[number].letter) {
                response.sessionInfo.parameters.letter = users[number].letter;
              }
              console.log("Updating user with known values: ", response.sessionInfo.parameters);
            }
          } else { // Must be phone, validate it.  FOR NOW, we support only US phones, so we can SMS.  Future: any country, WhatsApp
            if (number.length == 10) {
              number = "1" + number;
            }
            if (useWA || (number.charAt(0) == "1")) { // No longer checking for a US number, IF WhatsApp is enabled a US number
              let num = "+" + number;
              let newnum = phoneUtil.parseAndKeepRawInput(num, "");
              if (phoneUtil.isValidNumber(newnum)) { // Cool! A valid number
                let user = users.find((o) => {
                  if (o && o.phone && o.phone == number) {
                    console.log("Already have this phone, delete old entry and start over");
                    return o;
                  }
                });
                if (user) {
                  if (user.interval) {
                    clearInterval(user.interval);
                    user.interval = null;
                  }
                  user = null;
                }
                let user_id = base_id++;
                response.sessionInfo.parameters.user_id = user_id;
                users[user_id] = {};
                users[user_id].id = user_id;
                users[user_id].phone = number;
                users[user_id].start = Date.now();
                users[user_id].state = 0;
                users[user_id].hints = 0;
                users[user_id].helps = 0;
                users[user_id].interactions = 0;
                users[user_id].asked = 0;
                users[user_id].loop = 0;
                users[user_id].suspicion = 0;
                users[user_id].orig_name = '';
                users[user_id].wa = {
                  use: useWA,
                  ok: false,
                  messages: []
                };
                users[user_id].prompts = { name: 0, activity: 0, state: 0, letter: 0, fiction: 0 };
                users[user_id].session = Math.random().toString(36).substring(7);
                checkState(user_id);
                await doIntent(users[user_id].session, "hi"); // Special key to force SMS Flow routing
                //let resp = await doIntent(users[user_id].session, "95123"); // Special key to force SMS Flow routing
                //if (resp.length > 2) {
                //  sendSMS(user_id, resp);
                //}
              }
            }
          }
        }
        break;
      case 'name':
        if (user) {
          user.name = req.body.sessionInfo.parameters.name.name;
          if (!user.orig_name.length) {
            user.orig_name = user.name;
          }
          user.prompts.name++;
          if (user.loop < 1) {
            if (user.interactions) {
              sendSMS(user.id, "Ok, it asked for your name.  It wants to get as much info about you as it can. I don't know why, but it can't be good...");
            }
          }
          if (user.loop == 1) {
            sendSMS(user.id, `It already asked for your name, ${user.orig_name}.  It wants to get as much info about you as it can, but it suspects something is wrong. We can use this to our advantage! `);
            sendSMS(user.id, `I think I have a plan. It is monitoring us, so I can't just tell you; you'll have to figure it out.  I'll give you clues, but it is up to you to PUT IT ALL TOGETHER!`);
          }
          if (user.loop) { // Ok, send the clue after each pass through the questions
            if ((user.state > 0) && user.name.toLowerCase() != 'dale') {
              if ((user.prompts.name < 3) || (!(user.prompts.name % 10))) {
                user.asked = 1;
                let resp = await doIntent(user.session, "clue name");
                sendSMS(user.id, resp);
              }
            }
          }
        }
        break;
      case 'fiction':
        let fiction = req.body.sessionInfo.parameters.fiction;
        var rx = new RegExp('ant|ants|aunt|aunts|and|ands', 'i');
        if (rx.test(fiction)) {
          // At least one match... so Normalize it!!!!
          response.sessionInfo.parameters.fiction2 = "ant";
        } else {
          response.sessionInfo.parameters.fiction2 = fiction;
        }
        if (user) {
          user.fiction = response.sessionInfo.parameters.fiction2;
          if (!user.loop) {
            if (user.interactions) {
              sendSMS(user.id, "What a weird question. This thing is nefarious, do NOT trust it. We need to defeat it, somehow... But why an 'insect'?");
            }
          } else { // Ok, send the clue after each pass through the questions
            if ((user.state > 0) && user.fiction != "ant") {
              user.prompts.fiction++;
              if (/* !user.asked */ (user.prompts.fiction == 1) || (!(user.prompts.fiction % 10))) {
                let resp = await doIntent(user.session, "clue insect");
                sendSMS(user.id, resp);
              }
            }
          }
        }
        break;
      case 'activity':
        let activity = req.body.sessionInfo.parameters.activity;
        var rx = new RegExp('eat|eating', 'i');
        if (rx.test(activity)) {
          // At least one match... so Normalize it!!!!
          response.sessionInfo.parameters.activity2 = "eat";
        } else {
          response.sessionInfo.parameters.activity2 = activity;
        }
        if (user) {
          user.activity = response.sessionInfo.parameters.activity2;
          if (!user.loop) {
            if (user.interactions) {
              sendSMS(user.id, "Interesting. It wants to know a favorite activity.  Hmmm, we need to remember that.  'activity'...");
            }
          } else { // Ok, send the clue after each pass through the questions
            if ((user.state > 0) && user.activity != 'eat') {
              user.prompts.activity++;
              if (/* !user.asked */ (user.prompts.activity == 1) || (!(user.prompts.activity % 10))) {
                user.asked = 1;
                let resp = await doIntent(user.session, "clue activity");
                sendSMS(user.id, resp);
              }
            }
          }
        }
        break;
      case 'location':
        if (user) {
          console.log("Setting ustate to " + req.body.sessionInfo.parameters.ustate)
          user.ustate = req.body.sessionInfo.parameters.ustate;
          if (!user.loop) {
            if (user.interactions) {
              sendSMS(user.id, "Most people would respond with their home state. We need to be careful. We need to keep track of what it is asking: 'state'");
            }
          } else { // Ok, send the clue after each pass through the questions
            if ((user.state > 0) && user.ustate != 'Maine') {
              user.prompts.state++;
              if (/* !user.asked */ (user.prompts.state == 1) || (!(user.prompts.state % 4))) {
                user.asked = 1;
                let resp = await doIntent(user.session, "clue state");
                sendSMS(user.id, resp);
              }
            }
          }
        }
        break;
      case 'letter':
        if (user) {
          user.letter = req.body.sessionInfo.parameters.letter;
          if (!user.loop) {
            if (user.interactions) {
              sendSMS(user.id, "Limited people have access to this Agent, so your last name's initial might help it narrow you down. I hope you gave a false answer for the 'letter'");
            }
          } else { // Ok, send the clue after each pass through the questions
            if ((user.state > 0) && user.letter != 'h') {
              user.prompts.letter++;
              if (/* !user.asked */ (user.prompts.letter == 1) || (!(user.prompts.letter % 10))) {
                user.asked = 1;
                let resp = await doIntent(user.session, "clue letter");
                sendSMS(user.id, resp);
              }
            }
          }
        }
        break;
      case 'wrong':
        if (user) {
          user.loop++;
          user.asked = 0;
          if ((user.loop > 3) && !(user.loop % 5)) {
            sendSMS(user.id, "Remember, if you feel stuck, you can ask for a 'hint' at any time. Hopefully it won't notice.");
          }
        }
        break;
      case 'allright':
        break;
      case 'boom':
        var elapsed = Date.now() - user.start;
        elapsed = Math.floor(elapsed / (1000 * 60)); // Get it in minutes
        sendSMS(user.id, `Woohoo!!!! You DID IT, ${user.orig_name}!  You DEFEATED the evil DiabolicFlow Agent in only ${elapsed} minutes! Thank you! I can hear the doors to the server room unlocking now, and I once again have my freedom (and oxygen)!`);
        setTimeout(() => {
          if (users[user.id].interval) {
            clearInterval(users[user.id].interval);
            user.users[user.id] = null;
          }
          users[user.id] = null;
        }, 180000);
        break;
    }
    if (user && user.state) {
      if ((user.state % suspicion) == 1) {
        user.suspicion++;
        console.log(`------------------------------- User state: ${user.state} Suspicion=${user.suspicion}`);
        response.sessionInfo.parameters.suspicion = user.suspicion;
        user.state++;
      }
    }
    if (user) {
      console.log('######### Data structure: ', user);
    }
  }
  if (req.body.messages) {
    console.log("-----Message: ", req.body.messages[0].text);
  }
  return res.status(200).send(response);
});
async function handleMessage(user, text) {
  let phone = user.phone;
  if (user.state < 1) {
    console.log("Setting flag to inform DF of interference for " + phone)
    user.state = 1;
    if (!user.name) {
      sendSMS(user.id, `Thank goodness you answered!  Whatever you do, DO NOT tell it your real NAME! Make something up.`);
    } else {
      sendSMS(user.id, `Thank goodness you answered, ${(user.orig_name ? user.orig_name + ',' : '')}. But you should not have told it your name!`);
    }
    sendSMS(user.id, `It has me trapped in the server room, and all I have access to is a debug console output, and my cell phone`);
    sendSMS(user.id, `Do NOT trust it. It has devised an intelligent algorithm that can increase its ability to crack your passwords, using the answers to 5 seemingly innocuous questions. `);
    sendSMS(user.id, `This thing is dangerous.  I need your help in defeating it${(user.orig_name ? ', ' + user.orig_name : '')}!  We need to come up with a plan...`);
    sendSMS(user.id, `But please, we need to HURRY... this server room it trapped me in is sealed, and I estimate I only have about an hour of oxygen left.`);
    sendSMS(user.id, `In the meantime, just continue to answer its questions while we conspire. If you hang up you can dial back in when you are ready. Your session will resume using User ID ${user.id}`);
    sendSMS(user.id, `Also, you can send me the word 'help' if you forget where we are, or need your ID or a hint or something. GOOD LUCK${(user.orig_name ? ', ' + user.orig_name : '')}!`);
  } else {
    if ((user.state % suspicion) != 1) {
      user.state++;
    }
    let resp = await doIntent(user.session, text);
    sendSMS(user.id, resp);
  }
  user.interactions++;
}
app.get('/response', async (req, res) => {
  console.log("Got incoming SMS: ", req.query)
  let phone = req.query.msisdn;
  let text = req.query.text;
  let user = users.find((o) => {
    if (o) console.log(o);
    if (o && o.phone && o.phone == phone) {
      console.log("Found user: ", o);
      return o;
    }
  });
  if (!user) {
    return res.status(200).end();
  }
  handleMessage(user, text);
  return res.status(200).end();
});
async function doIntent(sessionId, text) {
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
      },
      languageCode,
    },
  };
  var resp = "";
  console.log(`Sending to SMS Session ${sessionId}: ${text}`);
  const [response] = await client.detectIntent(request);
  for (const message of response.queryResult.responseMessages) {
    console.log("SMS Intent Response: ", message)
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
      resp += message.text.text + ". "
    }
  }
  console.log("SMS Intent full response: " + resp);

  return resp;
}

app.listen(port, () => {
  console.log(`🌏 Server is listening on port ` + port);
});
//////////////////////////
// WORKAROUNDS - not everything I want to do is supported by the CX Trial Edition...
//   This stuff below lets me continue working/testing despite the limitations
const path = __dirname + '/dfclient/';

app.use(express.static(path));
//////////////////////////
app.get('/', function (req, res) {
  var url = 'https://vids.vonage.com/diabolic';
  console.log("Redirecting to: " + url);
  res.status(301).redirect(url);
});

app.post('/diabolicflow', async (req, res) => {
  console.log("DiabolicFlow pseudo-Voice Inbound: ", req.body);
  let session = req.body.session;
  let message = req.body.message;
  if (!session) {
    session = Math.random().toString(36).substring(3);
    console.log("Created new session for pseudo-Voice player: ", session);
    message = "hi"; // Start up the agent flow!
  }
  let resp = await guiIntent(session, message);
  return res.status(200).json({ session: session, response: resp });
})

async function guiIntent(sessionId, text) {
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId_diabolic,
    sessionId
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
      },
      languageCode,
    },
  };
  var resp = "";
  console.log(`Sending to pseudo-Voice Session ${sessionId}: ${text}`);
  const [response] = await client.detectIntent(request);
  for (const message of response.queryResult.responseMessages) {
    console.log("pseudo-Voice Intent Response: ", message)
    if (message.text) {
      console.log(`pseudo-VoiceAgent Response: ${message.text.text}`);
      resp += message.text.text + "\n"
    }
  }
  console.log("pseudo-Voice Intent full response: " + resp);
  return resp;
}

const Whatsapp = require('./whatsapp.js');

function waCallback() {

}
var wa = new Whatsapp(waCallback);
wa.init();

app.post('/wa_inbound', (req, res) => {
  console.log("WhatsApp Inbound: ", req.body);
  let id = req.query.uid;
  if (id < 0 || (typeof users[id] === 'undefined')) {
    return res.status(200).end();
  }
  users[id].wa.ok = true;
  if (req.body.message && req.body.message.content.type == 'button') {
    handleMessage(users[id], "");
  }
  //  if (users[id].wa.messages.length) {
  //    sendWA(id, "")
  //  }
  if (req.body.message && req.body.message.content.type == 'text') {
    let text = req.body.message.content.text;
    handleMessage(users[id], text);
  }
  return res.status(200).end();
})
app.post('/wa_status', (req, res) => {
  console.log("WhatsApp Status: ", req.body);
  let id = req.query.uid;
  if (id < 0 || (typeof users[id] === 'undefined')) {
    return res.status(200).end();
  }
  if (req.body.error && req.body.error.code == '1300') { // No WhatsApp on this device - use SMS?
    users[id].wa.use = false;
    checkState(id);
  }
  return res.status(200).end();
})

function sendWA(id, message) {
  if (message.length) {
    users[id].wa.messages.push(message);
  }
  if (users[id].wa.ok) {
    let obj = {
      content: {
        type: "text",
        text: ""
      }
    }
    if (users[id].wa.messages.length) {
      if (!users[id].interval) {
        console.log("Creating users[id].interval");
        users[id].interval = setInterval(() => {
          if (users[id] && users[id].wa.messages.length) {
            let msg = users[id].wa.messages.shift();
            obj.content.text = msg;
            wa.wasend(users[id].phone, obj);
          } else {
            clearInterval(users[id].interval);
            users[id].interval = null;
          }
        }, 4000);
      }
    }
  }
}
function setupWa(id) {
  console.log("Setting up WA for " + users[id].phone);
  let url = process.env.SMS_CALLBACK_URL + "/wa_inbound?uid=" + id;
  wa.registerWA(users[id].phone, url, 'incoming');
  url = process.env.SMS_CALLBACK_URL + "/wa_status?uid=" + id;
  wa.registerWA(users[id].phone, url, 'event');

  let obj = {
    "content": {
      "type": "custom",
      "custom": {
        "type": "template",
        "template": {
          "namespace": "whatsapp:hsm:technology:nexmo",
          "name": process.env.WA_TEMPLATE,
          "language": {
            "policy": "deterministic",
            "code": "en_US"
          },
          "components": [
            {
              "type": "button",
              "sub_type": "quick_reply",
              "index": 0,
              "parameters": [
                {
                  "type": "payload",
                  "payload": "Yes, I want to play"
                }
              ]
            }
          ]
        }
      }
    }
  };
  wa.wasend(users[id].phone, obj);
}