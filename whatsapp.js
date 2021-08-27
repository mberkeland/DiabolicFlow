'use strict'
const request = require('request');
const Vonage = require('@vonage/server-sdk');
const send = require('send');

var vonage;
var msgCallback;

class Whatsapp {
    constructor(callback = null) {
        this.init = this.init.bind(this);
        msgCallback = callback;
    }
    async init() {
        try {
            vonage = new Vonage({
                apiKey: process.env.WA_API_KEY,
                apiSecret: process.env.WA_API_SECRET,
                applicationId: process.env.WA_APP_ID,
                privateKey: './wa.key'
            });
            console.log("WA Connector set up for key " + process.env.WA_API_KEY);
        } catch (err) {
            console.log("WA Object init error: ", err);
        }
    }
    async wasend(number, obj) {
        var date = new Date().toLocaleString();
        console.log("Sending object to: " + number + " at " + date);
        try {
            vonage.channel.send(
                { "type": "whatsapp", "number": number },
                { "type": "whatsapp", "number": process.env.WA_NUMBER },
                obj,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        if (err.body && err.body.invalid_parameters) {
                            console.log("Invalid object: ", err.body.invalid_parameters)
                            console.log("Offending object: ", obj)
                        }
                    } else {
                        console.log("WA Object sent");
                    }
                }
            );
        } catch (err) {
            console.log("Error sending WA object: ", err);
        }
    };
    async registerWA(number, url, type = 'incoming') {
        request.post('https://vids.vonage.com/wa/register', {
            headers: {
                "content-type": "application/json",
            },
            json: true,
            body: {
                phone: number,
                url: url,
                type: type,
                service: "wa"
            },
        },
            function (error, response, body) {
                if (error) {
                    console.log("Error posting to WA redirector ", error);
                }
            }
        );
    }
    async event(req, id) {
    }
}
module.exports = Whatsapp;
