import $ from 'jquery';
import {Strophe,$msg,$pres} from 'strophe.js';
// import { Strophejs} from 'strophejs-plugin-roster'
import * as Jid from './Jid'
window.Strophe = Strophe;
window.$msg = $msg;
window.$pres = $pres;

class ChatWatcher{
    constructor(props){
        this.connection = null;
        this.connected =false;
        this.myJid = null;
        this.myPwd = null;
        this.chatEvents = []; //点对点消息事件列表；
        this.groupChatEvents = [];  //工作组消息事件列表；
        this.connectionListens=[];
        this.rosterListens=[];
        this.rosterStatusEvents = [];
        this.groupJidStatusEvents = [];
    }
    connect=(bosh_service,userid,domain,resource,pwd)=>{
        this.myJid = userid+'@'+domain+'/'+resource;
        this.myPwd = pwd;
        // console.log(Strophe);
        this.connection = new window.Strophe.Connection(bosh_service);
        this.connection.connect(this.myJid,this.myPwd,this.onConnect);
    }
    onConnect=(status)=>{
        //回调Subscriptions；
        for (var Action of this.connectionListens){
            Action(status);
        }
        if (status === window.Strophe.Status.CONNFAIL) {
            alert("连接失败");
        } else if (status === window.Strophe.Status.AUTHFAIL) {
            alert("登录失败");
        } else if (status === window.Strophe.Status.DISCONNECTED) {
            alert("断开连接");
            this.connected = false;
        } else if (status === window.Strophe.Status.CONNECTED) {
            alert("连接成功，可以开始聊天了！");
            this.connected = true;
            // 当接收到<message>节，调用onMessage回调函数
            this.connection.addHandler(this.onMessage, null, 'message', null, null, null);
            this.connection.addHandler(this.onPresence, null, 'presence', null, null, null);
            // this.connection.roster.init(this.connection);

            // var roster;
            // this.connection.roster.get(function (result) {
            //     roster = result;
            // });
            // 首先要发送一个<presence>给服务器（initial presence）
            this.connection.send(window.$pres().tree());
        }
    }
    onMessage=(msg)=>{
        let from = msg.getAttribute('from');
        let type = msg.getAttribute('type');
        let elems = msg.getElementsByTagName('body');
        //点对点消息；
        if (type == "chat" && elems.length > 0) {
            var body = elems[0];
            for (var event of this.chatEvents) { // 遍历Array  
                event(from,type,window.Strophe.getText(body));  
            }
        }else if (type == "groupchat" && elems.length > 0) {
            //工作组消息；
            var body = window.Strophe.getText(elems[0]);
            for(var event of this.groupChatEvents){
                console.log("groupchat=" + body);
                event(from,type,body);
            }
        }
        return true;
    };
    onPresence=(pres)=>{
        try{
            // let from = pres.getAttribute('from');
            // let type = pres.getAttribute('type');
            // alert('from=' + from + ",type=" + type);
            let fromJid = $(pres).attr("from");
            // let fromBareJid = window.Strophe.getBareJidFromJid(fromJid);
            // let myBareJid = window.Strophe.getBareJidFromJid(this.connection.jid);
            let type = $(pres).attr("type");
            let show = $(pres).children("show").text();
            let statusMsg = $(pres).children("status").text();

            let x = $(pres).children("x");
            // <presence xmlns="jabber:client" to="liuhy@server1/pc" id="1rcFv-140" from="jsjl@conference.server1/wc">
            //     <status>离开</status>
            //     <priority>0</priority>
            //     <show>away</show>
            //     <c xmlns="http://jabber.org/protocol/caps" hash="sha-1" node="http://www.igniterealtime.org/projects/smack" ver="TJuVIXqTCVfJSthaPu4MtTbaf9A="/>
            //     <x xmlns="http://jabber.org/protocol/muc#user">
            //         <item jid="wc@server1/Spark 2.8.3.579" affiliation="owner" role="moderator"/>
            //     </x>
            // </presence>"
            let fromGroupUserJid = null;
            if(null!=x){
               let ns =  x.attr("xmlns");
               if(ns=='http://jabber.org/protocol/muc#user'){
                   //工作组成员状态变化；
                   fromGroupUserJid = x.children("item").attr("jid");
               }
            }


            console.log(`fromJid=${fromJid};type=${type};show=${show};status=${statusMsg}`);
            if(type==undefined && statusMsg!=null && null==fromGroupUserJid){
                console.log("状态变化中........");
                for(var event of this.rosterStatusEvents){
                    event({jid:fromJid,status:statusMsg});
                }
            }else if(null!=fromGroupUserJid){
                //工作组成员状态变化；
                console.log(`工作组成员${fromGroupUserJid}fromGroupUserJid状态变化中........`);
                for(var event of this.groupJidStatusEvents){
                    event({groupJid:fromJid,fromGroupUserJid:fromGroupUserJid,status:statusMsg});
                }
            }
        }catch(e){
            console.log(e);
        }
        
    }
    sendMessage=(to,type,body)=>{
        if(this.connected){
            var msg = window.$msg({
                to: to, 
                from: this.myJid, 
                type: type
            }).c("body", null, body);
            this.connection.send(msg);
            return true;
        }
        return false;
    };
    sendGroupMessage=(to,body)=>{
        if(this.connected){
            var msg = window.$msg({
                from: this.myJid, 
                to: to, 
                type: 'groupchat',
            }).c("body", null, body);
            this.connection.send(msg.tree());
            return true;
        }
        return false;
    };
    sendRosterIq=()=>{
        var iq = window.$iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
        this.connection.sendIQ(iq, (a)=>{
            var _array = new Array();
            $(a).find('item').each(function(){
                var jid = $(this).attr('jid'); // jid
                // console.log('jid',jid);
                _array.push(jid);
            });
            for(var Action of this.rosterListens ){
                Action(_array);
            }  
        });
    };
    //发送presence消息，加入工作组；
    joinGroup=(groupJid)=>{
        console.log(`joinGroup,groupJid=${groupJid}`);
        this.connection.send(window.$pres({
			from: this.myJid,
			to: groupJid + "/" + Jid.getBareJid(this.myJid)
		}).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree());
    }
    chatEvent=(event)=>{
        this.chatEvents.push(event);
    }
    groupChatEvent=(event)=>{
        this.groupChatEvents.push(event);
    }
    connectionListen=(action)=>{
        this.connectionListens.push(action);
    }
    rosterListen=(action)=>{
        this.rosterListens.push(action);
    }
    rosterStatusEvent=(event)=>{
        this.rosterStatusEvents.push(event);
    }
    groupJidStatusEvent=(event)=>{
        this.groupJidStatusEvents.push(event);
    }
    
}
window.ChatWatcher = new ChatWatcher();
export default window.ChatWatcher;