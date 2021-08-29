<template lang="html">
<section class="aChat">
    <div@click="firework=false">
        <Firework v-if="firework" :boxHeight="'100%'" :boxWidth="'100%'" @click="firework=false" />
        <h1>DiabolicFlow</h1>
        <h3>
            A fun, innocent little interactive Personality Test, through an Artificially Intelligent Agent
        </h3>
        <h3>
            DiabolicFlow <b><font color="red">REQUIRES</font></b> use of either WhatsApp or SMS (Text, US only) messaging<br>&emsp; to/from
            the Cell Phone you indicate during the session.
            <h6>For completely innocent, benign purposes, I assure you...</h6>
            You <b><font color="red">MUST</font></b> have this in order to continue.
        </h3>
        <h2><i><b>Be sure to check your phone for messages!</b></i></h2>
        <div v-if="popped">
            <basic-vue-chat :title="'DiabolicFlow'" :new-message="message" @newOwnMessage="onNewOwnMessage" />
        </div>
        </div>
</section>
</template>

<script lang="js">
import {
    FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';
import Firework from '@/components/fireworks.vue';

//import BasicVueChat from "basic-vue-chat";
import BasicVueChat from "basic-vue-chat";
import axios from 'axios';
export default {
    name: 'aChat',
    props: {},
    components: {
        "basic-vue-chat": BasicVueChat,
        Firework,
    },
    data() {
        return {
            message: {},
            NODEDEMO: {},
            popped: true,
            session: null,
            nodeurl: "https://vids.vonage.com/escape",
            HTTP: null,
            messageList: [],
            newMessagesCount: 0,
            isChatOpen: true,
            firework: false,
        }
    },
    methods: {
        addMessage(txt) {
            var id = 1;
            var author = "";
            var color = "font-weight: bold";
            var date = new Date().toLocaleTimeString([], {
                hourCycle: 'h24'
            });
            var msgs = txt.split("\n");
            console.log(msgs);
            var interval = setInterval(() => {
                console.log("Timer pop");
                if (msgs.length > 1) {
                    let msg = msgs.shift();
                    if (msg.length) {
                        console.log("Sending frag: " + msg);
                        this.message = {
                            id: id,
                            author: author,
                            contents: msg,
                            date: date,
                        };
                        if (msg.startsWith('argh')) {
                            console.log("Winner winner")
                            this.firework = true;
                        }
                    }
                } else {
                    clearInterval(interval);
                }
            }, 1000);
            return this.message;
        },
        onNewOwnMessage(msg) {
            console.log(`Sending message to session ${this.session}: ` + msg);
            this.NODEDEMO.post('/diabolicflow', {
                session: this.session,
                message: msg
            }).then(async (result) => {
                console.log("Result: ", result);
                this.session = result.data.session;
                this.addMessage(result.data.response);
                if (result.data.response.startsWith('Thank you. Your user ID')) {
                    this.popup();
                }
                if (result.data.response.startsWith('argh!')) {
                    this.firework = true;
                }
            })
        },
        popup() {
            this.$swal("Warning! Alert!", "DiabolicFlow has detected UNAUTHORIZED ACCESS to your cell phone by a hostile entity! Do NOT respond to any WhatsApp or Text Messages on your phone from unknown entities!", "warning");
        }
    },
    created() {
        if(process.env.NODE_ENV === 'development') {
            this.nodeurl = "https://mberkeland2.ngrok.io";
        }
        this.NODEDEMO = axios.create({
            baseURL: this.nodeurl,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        this.onNewOwnMessage("hello");
    },
    beforeDestroy() {},
}
</script>

<style lang="scss" scoped>
.left {
  float: left;
}

.right {
  float: right;
  padding-right: 5px;
}

.sel {
  padding: 5px;
  font-weight: bold;
}

//@import "@basic-vue-chat/assets/scss/modules/_all.scss";

$primary: red;
$secondary: blue;
$header-color: blue;
$window-height: 200px;
// above the following import you can override default values of variables like $primary
</style>
