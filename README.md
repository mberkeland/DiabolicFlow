# DiabolicFlow

### Welcome to DiabolicFlow, a simple, innocent little personality analyzer. It has absolutely NO nefarious intentions whatsoever.

**_OR DOES IT?????_**

DiabolicFlow is a DialogFlow CX-based "Escape Room" game, submitted for the DialogFlow CX Competition, August 2021

It consists of 2 independent (but interrelated) Agents, an App (handling webhooks and detectIntents), and a GUI component.

In order to successfully complete the game, you must either have a phone that can send/receive Text messages (US-based only), OR have WhatsApp installed on your phone (any country, including US). WhatsApp is the preferred channel (it will try WA, and if that fails, and the number is US, it will revert to SMS)

Before reading any further I STRONGLY SUGGEST YOU PLAY THE GAME! The stuff further down in this ReadMe may contain spoilers or give away surprises, so it's best to EXPERIENCE it first, then delve into the details.

The AVERAGE game play time is about 45 minutes. So make sure you set aside enough time! However, you can always leave and come back to where you left off (instructions are given in the game). I've found that experienced Puzzle-Solvers can get through the game significantly faster.

You can play by going to:  
https://vids.vonage.com/diabolic

REMEMBER: You can ask the Admin (through WhatsApp/SMS) for "Help" at any time, so be sure to get a "Hint" whenever you need one, review your current "clues", or even display your currently submitted "answers".

**HERE THERE BE SPOILERS!**

.

.

.

.

.

.

.

.

.

.

.

.

### Gameflow and Design

The storyline is simple. You, the player, contact DiabolicFlow (through the GUI, or in development, over the phone), as a seemingly innocuous personality quiz. After entering your phone number, suddenly you get an unexpected message on your phone over either WhatsApp (US or International), or by Text Message (US only).

The message explains that DiabolicFlow (DF) is actually a hyper-intelligent bot that can figure out passwords based on seemingly unrelated questions. DF knows the system admin has figured out how dangerous it is, and has trapped the Admin in the Server Room, with no means of communication other than their cell phone... and, of course, as is necessary in ANY escape-room-type trope... the Admin has a limited amount of oxygen.

So, the Admin has contacted you to try to help him outwit the Machine. Since DF is watching, the Admin cannot just tell you the answers you need to defeat it outright; instead, they will give you a series of clues, based on the specific questions, and if you crack the clues, you can defeat DiabolicFlow (freeing the Admin, opening the door for oxygen, and generally saving the world).

There are two DialogFlow Agents involved in this. One controls the Player's interaction with DiabolicFlow, and the other controls the Player's interaction with the Admin. There is an App in the middle, that receives the webhooks/responses from DF, as well as handles queries and responses (such as hints, clues, and help functions) to/from the Admin. The DF Agent is accessed by a GUI (https://vids.vonage.com/diabolic) that "talks" to the DF Agent through the Google DialogFlow CX Node API (detectIntents). Similarly, the App handles input/output from the Admins Agent with the Node APIs, as well as using Vonage SMS and/or WhatsApp APIs in Node (to send/receive over SMS or WhatsApp).

DiabolicFlow keeps track of various states on both Agents, so that DF can comment when detecting "outside interference", and the Admin can adjust their comments, hints, and clues based on the user's state in the game.  For example, the Admin will take note of the "categories" of the questions on the first pass, commenting to the player on each.  But the second time through, their strategy changes to trying to help you through clues.  These clues are augmented with "Hints" that the player can request at any point; these Hints start very vague, but get more and more detailed as the Player asks for more Hints. Though the Agent will never come right out and say the answers, the final Hints are detailed enough that most users get that "Ah-ha!" Moment as they solve it.

Originally, DiabolicFlow was designed around a Phone Gateway integration, rather than a webpage GUI.  Initial testing showed that Players could easily take 45-60 minutes solving the puzzles... this chewed up daily allotments of the Phone Gateway minutes in less than one session, plus often times had the user moving the phone away to look at the screens when messages arrived, thus missing what DF might be saying.  I liked a lot of the effects of using audio (particularly in the final solution, which admittedly loses some impact when not audible), but in the end having a GUI made for a better overall experience. Future iterations may involve In-App audio (WebRTC and/or audio clips) in parallel to the GUI, so we can have all the best features available.



### Installation and setup instructions

As mentioned, there are two separate but necessary Agents.  Both are included in this repository. Originally, I used a single Agent with two separate Flows, but I ran into issues when someone on the phone (Admin Flow) would inadvertently type "Hello" and end up in the wrong Flow (DiabolicFlow). Separate Agents solved this nicely.

You will need to get the Project JSON, the Project ID, and the AgentIDs for BOTH Agents, and put the appropriate values in the .env file. You will also need the Project "Location" (usually "global", if you want to use the default Google Telephony Gateway integration).

This project uses Vonage CPaaS services to supply both the SMS (Texting) capabilities, and the WhatsApp capabilities. Tutorials, samples, snippets, and instructions on how to get the needed keys, secrets, and private keys, can be found at https://developer.nexmo.com/messaging/sms/overview for SMS (Texting). Acquiring a WhatsApp business account is a little more complicated, but information (and a free "Sandbox account") can be found at https://developer.nexmo.com/messages/overview and https://dashboard.nexmo.com/messages/sandbox respectively.

If you need help provisioning SMS or WhatsApp for deploying your own copy of this game, feel free to contact me, or ask around on the Vonage DevRel Slack channel at vonage-community.slack.com (they won't necessarily know about this particular game, but they are GREAT at getting folks up and running with the Vonage communications stuff... it's what they live for!)

The Player GUI (the interface to the DiabolicFlow agent) is a Vue-based application frontend that talks to the Node-based backend (server).  This backend is the same app that hosts the DialogFlow webhooks, and interfaces to the Vonage SMS/WhatsApp.  Instructions for building the Vue client can be found on the Readme page under this repository /client/escape subdirectory.  The Vue GUI can be hosted on the same server as the Node app, if desired.

This game was a lot of fun to develop. I learned a lot, of course, and as ALWAYS is the case... if I had to do it over, I would (hopefully) learn from my mistakes and maybe have a cleaner implementation.  Oh well... there's always a deadline! This project has SO much room for future improvements.. the addition of Audio, a websocket-based Telephony interface (which I have working, but needs some love still), more random puzzles, and a database-based set of random puzzles so that every play-through can be unique and different... these are some things I would like to pursue at some point.  But for now, thank you for the opportunity, and

### Enjoy DiabolicFlow!
