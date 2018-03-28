import * as userService from '../services/users'
import CEF3 from '../../cef/cef3'
export default{
    namespace :'users',
    state:{
        list:[],
        total:null,
        page:null,
    },
    reducers:{
        save(state,{payload:{data:list,total,page}}){
            return{...state,list,total,page};
        },
    },
    effects:{
        *fetch({payload:{page=1}},{call,put}){
            const{data,headers}=yield call(userService.fetch,{page});
            yield put({
                type:'save',
                payload:{
                    data,
                    total:parseInt(headers['x-total-count'],10),
                    page:parseInt(page,10),
                },
            });
        },
        *remove({payload:id},{call,put,select}){
            CEF3.click_alert(id);
            yield call(userService.remove,id);
            const page = yield select(state=>state.users.page);
            yield put({type:'fetch',payload:{page}});
        },
        *patch({payload:{id,values}},{call,put,select}){
            yield call(userService.patch,id,values);
            const page = yield select(state=>state.users.page);
            yield put({type:'fetch',payload:{page}});
        },
        *create({payload:values},{call,put,select}){
            yield call(userService.create,values);
            const page=yield select(state=>state.users.page);
            yield put({type:'fetch',payload:{page}});
            
        },
    },
    subscriptions:{
        setup({dispatch,history}){
            return history.listen(({pathname,query})=>{
                if(pathname==='/users'){
                    dispatch({type:'fetch',payload:query});
                }
            });
        },
        chatwatcher({dispatch}){
            return window.ChatWatcher.chatEvent((from,type,data)=>{
                alert("users--->from=" + from + ";data="+data);
           });  
        }
    },
};