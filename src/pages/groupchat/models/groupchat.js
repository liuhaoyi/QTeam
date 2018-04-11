import * as Jid from '../../../utils/Jid';
import * as service from '../services/groupchat';
export default{
    namespace:'groupchat',
    state:{
        recv_messages:[],
        messages:[],
        group2messages:[],
        selected_group:{groupJid:'',groupName:'默认群组'},
        groups:[],
    },
    reducers:{
        send(state,{payload:{recv_messages}}){
            state.recv_messages = state.recv_messages.concat(recv_messages);
            let group2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.selected_group.groupJid || toBareJid==state.selected_group.groupJid;
            });
            return{...state,group2messages:group2messages};
        },
        receive(state,{payload:{recv_messages}}){
            state.recv_messages = state.recv_messages.concat(recv_messages);
            let group2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.selected_group.groupJid  || toBareJid==state.selected_group.groupJid ;
            });
            return{...state,group2messages:group2messages};
        },
        getGroup2Messages(state,{payload:{selected_group}}){
            state.selected_group = selected_group;
            let group2messages = state.recv_messages.filter((item)=>{
                let fromBareJid = Jid.getBareJid(item.from);
                let toBareJid = Jid.getBareJid(item.to);
                return fromBareJid==state.selected_group.groupJid || toBareJid==state.selected_group.groupJid;
            });
            return{...state,group2messages:group2messages,selected_group:selected_group};
        },
        getGroups(state,{payload:{groups}}){
            return{...state,groups:groups};
        }
    },
    effects:{
        *fetchGroupByUserName({payload:{userName}},{put,call}){
            const {data,headers} = yield call(service.fetchGroupByUserName,userName);

            // let groups = data.map((item)=>{
            //     return item.userName;
            // });
            yield put({
                type:'getGroups',
                payload:{
                    groups:data,
                },
            });
        }
    },
    subscriptions:{
        setupGroupChat({dispatch,history}){
            return history.listen(({pathname,query})=>{
                if(pathname==='/groupchat'){
                    dispatch({ 
                        type:'groupchat/fetchGroupByUserName',
                        payload:{userName:Jid.getBareJid(window.ChatWatcher.myJid)}
                    });
                }
            });
        },
        watcherGroupChatEvent({dispatch}){
            return window.ChatWatcher.groupChatEvent((from,type,data)=>{
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
    }
}