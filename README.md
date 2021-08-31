# DiabolicFlow

### Welcome to DiabolicFlow, a simple, innocent little personality analyzer. It has absolutely NO nefarious intentions whatsoever.

***OR DOES IT?????***

DiabolicFlow is a DialogFlow CX-based "Escape Room" game, submitted for the DialogFlow CX Competition, August 2021

It consists of 2 independent (but interrelated) Agents, an App (handling webhooks and detectIntents), and a GUI component.

In order to successfully complete the game, you must either have a phone that can send/receive Text messages (US-based only), OR have WhatsApp installed on your phone (any country, including US). WhatsApp is the preferred channel (it will try WA, and if that fails, and the number is US, it will revert to SMS)

Before reading any further I STRONGLY SUGGEST YOU PLAY THE GAME! The stuff in the ReadMe may contain spoilers or give away surprises, so it's best to EXPERIENCE it first, then delve into the details.

The AVERAGE game play time is about 45 minutes. So make sure you set aside enough time! However, you can always leave and come back to where you left off (instructions are given in the game). I've found that experienced Puzzle-Solvers
can get through the game significantly faster.

You can play by going to:  
https://vids.vonage.com/diabolic

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

The storyline is simple.  You, the player, contact DiabolicFlow (through the GUI, or in development, over the phone), as a seemingly innocuous personality quiz. After entering your phone number, suddenly you get an unexpected message on your phone over either WhatsApp (US or International), or by Text Message (US only).

The message explains that DiabolicFlow (DF) is actually a hyper-intelligent bot that can figure out passwords based on seemingly unrelated questions. DF knows the system admin has figured out how dangerous it is, and has trapped the admin in the Server Room, with no means of communication other than his cell phone... and, of course, as is necessary in ANY escape-room-type trope... with a limited amount of oxygen.

So, the Admin has contacted you to try to help him outwit the Machine.  Since DF is watching, the Admin cannot just tell you the answers you need to defeat him outright; instead, he will give you a series of clues, based on the specific questions, and if you crack the clues, you can defeat DiabolicFlow (freeing the Admin, opening the door for oxygen, and generally saving the world).

There are two DialogFlow Agents involved in this.  Once controls the Player's interaction with DiabolicFlow, and the other controls the Player's interaction with the Admin.  There is an App in the middle, that receives the web hooks/responses from DF, as well as handles queries and responses (such as hints, clues, and help functions) to/from the Admin.  The DF Agent is accessed by a GUI (https://vids.vonage.com/diabolic) that "talks" to the DF Agent through the Google DialogFlow CX Node API (detectIntents).  Similarly, the App handles input/output from the Admins Agent with the Node APIs, as well as using Vonage SMS and/or WhatsApp APIs in Node (to send/receive over SMS or WhatsApp).  



ToDo: Add installation and setup instructions

ToDo: Discuss challenges inherent within a multi-channel parallel-flow mind-bending adventure
