import $ from 'jquery';
import{Strophe} from 'strophe';
import * as Jid from './Jid'
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
    }
    connect=(bosh_service,userid,domain,resource,pwd)=>{
        this.myJid = userid+'@'+domain+'/'+resource;
        this.myPwd = pwd;
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
            var body = elems[0];
            for(var event of this.groupChatEvents){
                event(from,type,window.Strophe.getText(body));
            }
        }
        return true;
    };
    onPresence=(pres)=>{
        alert(pres);
        let from = pres.getAttribute('from');
        let type = pres.getAttribute('type');
        alert('from=' + from + ",type=" + type);
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
}
window.ChatWatcher = new ChatWatcher();
export default window.ChatWatcher;