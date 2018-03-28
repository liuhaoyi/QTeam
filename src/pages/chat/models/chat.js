import ChatWatcher from '../../../utils/ChatWatcher'
export default{
    namespace:"chat",
    state:{
        recv_messages:[],
        rosters:[],
        send_message:'',
        // json{
        //     type:'s',//s:发送消息；r：接收消息；
        //     from:'',
        //     to:'',
        //     body:'',
        //     time:''
        // }
    },
    reducers:{
        send(state,{payload:{recv_messages}}){
            return{...state,recv_messages:state.recv_messages.concat(recv_messages)};
        },
        receive(state,{payload:{recv_messages}}){
            return{...state,recv_messages:state.recv_messages.concat(recv_messages)};
        },
        getRosters(state,{payload:{rosters}}){
            return{...state,rosters:rosters};
        },
    },
    subscriptions:{
        watcherChatEvent({dispatch}){
           return window.ChatWatcher.chatEvent((from,type,data)=>{
                let v = from + "---" + data+"\n";
                dispatch({
                    type:'chat/receive',
                    payload:{recv_messages:[v]},
                });
           });
        },
        connectWatcher({dispatch}){
            return window.ChatWatcher.connectionListen((status)=>{
                 alert(status);   
            });
        },
        rosterWatcher({dispatch}){
            return window.ChatWatcher.rosterListen((rosters)=>{
                dispatch({
                    type:'chat/getRosters',
                    payload:{rosters:[rosters]},
                });
            });
        }
    }
}