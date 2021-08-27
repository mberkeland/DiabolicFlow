<template lang="html">
<section class="aChat">
    <h2>DiabolicFlow</h2>
    <h3>
      A fun, innocent little interactive Personality Test, through an Artifically Intelligent Agent
    </h3>
    <h4>
      DiabolicFlow sometimes makes use of either WhatsApp or SMS (Text) messaging to/from
      the Cell Phone you indicate during the session.
    </h4>
    <h4>Be sure to check for messages!</h4>
    <div v-if="popped">
        <basic-vue-chat :title="'DiabolicFlow'" :new-message="message" @newOwnMessage="onNewOwnMessage" />
    </div>
</section>
</template>

<script lang="js">
import {
    FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';

//import BasicVueChat from "basic-vue-chat";
import BasicVueChat from "basic-vue-chat";
import axios from 'axios';
export default {
    name: 'aChat',
    props: {},
    components: {
        "basic-vue-chat": BasicVueChat,
    },
    data() {
        return {
            message: {},
            NODEDEMO: {},
            popped: true,
            session: null,
            nodeurl: "https://mberkeland2.ngrok.io",
            HTTP: null,
            messageList: [],
            newMessagesCount: 0,
            isChatOpen: true,
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
            })
        },
    },
    created() {
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
