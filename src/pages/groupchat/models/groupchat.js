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
        groupMembers:[],
        group2Members:[],
        isGroupChatClicked:false,
        // {
        //     groupId:'',
        //     groupMember:[
        //         {
        //             jid:'',
        //             role:'',
        //             status:'',
        //         },
        //     ]
        // }

        // {
        //     groupId:'',
        //     groupName:'',
        //     groupMembers:[{
        //         groupId:'',
        //         jid:'',
        //         role:'',
        //         status:''
        //     }]
        // }
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
        getGroups(state,{payload:{groups,groupMembers}}){
            state.isGroupChatClicked=true;
            //发送presence消息加入工作组；
            groups.map((item)=>{
                window.ChatWatcher.joinGroup(item.groupJid);
            });
            return{...state,groups:groups,groupMembers:groupMembers};
        },
        getGroupMemberByGroupId(state,{payload:{groupId,groupMembers}}){
            state.groupMembers = groupMembers.concat({groupId:groupId,groupMember:groupMembers});

            let group2Members = state.groupMembers.filter((item)=>{
                let _groupId = Jid.getBareJid(item.groupId);
                return _groupId==groupId;
            });
            return{...state,groupMembers:groupMembers,group2Members:group2Members};
        },
        group2Members(state,{payload:{selected_group}}){
            state.selected_group = selected_group;
            let group2Members = state.groupMembers.filter((item)=>{
                let groupId = Jid.getBareJid(item.groupId);
                return groupId==state.selected_group.groupJid;
            });
            return{...state,group2Members:group2Members,selected_group:selected_group};
        },
        groupJidStatusEvent(state,{payload:{groupStatus}}){
            state.groupMembers = state.groupMembers.map((item)=>{
                if(item.jid==Jid.getBareJid(groupStatus.fromGroupUserJid)){
                    item.status = groupStatus.status;
                }
                return item;
            });
            let group2Members = state.group2Members.map((item)=>{
                console.log(`item.jid=${item.jid};groupStatus.fromGroupUserJid=${Jid.getBareJid(groupStatus.fromGroupUserJid)}`)
                if(item.jid==Jid.getBareJid(groupStatus.fromGroupUserJid)){
                    item.status = groupStatus.status;
                }
                return item;
            });
            return{...state,group2Members:group2Members};
        },
    },
    effects:{
        *fetchGroupByUserName({payload:{userName}},{put,call,select}){
            const _isGroupChatClicked=yield select(state=>state.groupchat.isGroupChatClicked);

            if(!_isGroupChatClicked){
                const {data,headers} = yield call(service.fetchGroupByUserName,userName);
                let group_data = data;
                let _array = new Array();
                for(var _group of group_data){
                    const {data,headers} = yield call(service.getGroupMemberByGroupId,_group.groupJid);
                    let _data = data.map((item)=>{
                        return {...item,status:'离线'};
                    });
                    _array = _array.concat(_data);
                }

                yield put({
                    type:'getGroups',
                    payload:{
                        groups:group_data,
                        groupMembers:_array,
                    },
                });
            }
        },
        *fetchGroupMemberByGroupId({payload:{selected_group}},{put,call}){
            const {data,headers} = yield call(service.getGroupMemberByGroupId,selected_group.groupJid);
            let _data = data.map((item)=>{
                return {...item,status:'离线'};
            });
            yield put({
                type:'getGroupMemberByGroupId',
                payload:{
                    groupId:selected_group.groupJid,
                    groupMembers:_data,
                },
            });
        },
    },
    subscriptions:{
        setupGroupChat({dispatch,history,location}){
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
         groupJidStatusEventWatcher({dispatch}){
            return window.ChatWatcher.groupJidStatusEvent((item)=>{
                dispatch({
                    type:'groupchat/groupJidStatusEvent',
                    payload:{groupStatus:item},
                });
            });
        },
    }
}