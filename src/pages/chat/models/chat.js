import ChatWatcher from '../../../utils/ChatWatcher'
import * as service from '../services/chat'
export default{
    namespace:"chat",
    state:{
        recv_messages:[],
        rosters:[],
        send_message:'',
        chat_roster:'',
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