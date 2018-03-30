import $ from 'jquery';
import{Strophe} from 'strophe';

class ChatWatcher{
    constructor(props){
        this.connection = null;
        this.connected =false;
        this.myJid = null;
        this.myPwd = null;
        this.chatEvents = [];
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
            // 首先要发送一个<presence>给服务器（initial presence）
            this.connection.send(window.$pres().tree());
        }
    }
    onMessage=(msg)=>{
        let from = msg.getAttribute('from');
        let type = msg.getAttribute('type');
        let elems = msg.getElementsByTagName('body');

        if (type == "chat" && elems.length > 0) {
            var body = elems[0];
            for (var event of this.chatEvents) { // 遍历Array  
                event(from,type,window.Strophe.getText(body));  
            }
        }
        return true;
    };
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
    
    chatEvent=(event)=>{
        this.chatEvents.push(event);
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