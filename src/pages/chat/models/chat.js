import ChatWatcher from '../../../utils/ChatWatcher'
import * as service from '../services/chat'
import * as Jid from '../../../utils/Jid'
export default{
    namespace:"chat",
    state:{
        recv_messages:[],
        // recv_messages:[{
        //     from:'l1@server1',
        //     to:'liuhaoyi@server1',
        //     body:'nihao',
        //     time:'2017-03-30 17:20:20',
        //     type:'RECV'}],
        rosters:[],
        send_message:'',
        chat_roster:'',
        roster2messages:[],
    },
    reducers:{
        send(state,{payload:{recv_messages}}){
            state.recv_messages = state.recv_messages.concat(recv_messages);
            let roster2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.chat_roster || toBareJid==state.chat_roster;
            });
            return{...state,roster2messages:roster2messages};
        },
        receive(state,{payload:{recv_messages}}){
            state.recv_messages = state.recv_messages.concat(recv_messages);
            let roster2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.chat_roster || toBareJid==state.chat_roster;
            });
            return{...state,roster2messages:roster2messages};
        },
        getRosters(state,{payload:{rosters}}){
            console.log(rosters);
            //rosters {
            //     jid:'',
            //     status:'',
            // }
            rosters = rosters.map((item)=>{
                return {jid:item,status:'离线'};
            })
            return{...state,rosters:rosters};
        },
        rosterStatusEvent(state,{payload:{roster}}){
            let rosters  = state.rosters.map((item)=>{
                if(item.jid==Jid.getBareJid(roster.jid)){
                    item.status=roster.status;
                }
                return item;
            });
            return{...state,rosters:rosters};
        },
        getRoster2Messages(state,{payload:{chat_roster}}){
            state.chat_roster = chat_roster;
            let roster2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.chat_roster || toBareJid==state.chat_roster;
            });
            return{...state,roster2messages:roster2messages,chat_roster:chat_roster};
        },
    },
    effects:{
        *fetchRosters({payload:id},{put,select,call}){
            const {data,headers} = yield call(service.fetchRosters,id);

            let rosters = data.map((item)=>{
                return item.userName;
            });
            yield put({
                type:'getRosters',
                payload:{
                    rosters,
                },
            });
        }
    },
    subscriptions:{
        watcherChatEvent({dispatch}){
           return window.ChatWatcher.chatEvent((from,type,data)=>{
                let v = {
                            from:from,
                            to:window.ChatWatcher.myJid,
                            body:data,
                            time:'',
                            type:'RECV',
                        };
                dispatch({
                    type:'receive',
                    payload:{recv_messages:[v]},
                });
           });
        },
        connectWatcher({dispatch}){
            return window.ChatWatcher.connectionListen((status)=>{
                //  alert(status);   
            });
        },
        rosterWatcher({dispatch}){
            return window.ChatWatcher.rosterListen((rosters)=>{
                dispatch({
                    type:'chat/getRosters',
                    payload:{rosters:[rosters]},
                });
            });
        },
        rosterStatusEventWatcher({dispatch}){
            return window.ChatWatcher.rosterStatusEvent((rosters)=>{
                dispatch({
                    type:'chat/rosterStatusEvent',
                    payload:{roster:rosters},
                });
            });
        },
        setupChat({dispatch,history}){
            return history.listen(({pathname,query})=>{
                if(pathname==='/chat'){
                    dispatch({ 
                        type:'chat/fetchRosters',
                        payload:{id:"31"}
                    });
                }
            });
        },
    }
}