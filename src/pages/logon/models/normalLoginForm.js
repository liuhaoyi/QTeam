import key from 'keymaster'
import {routerRedux} from 'dva/router'
export default{
    namespace:"logon",
    state:{
        userName:"",
        password:"",
    },
    reducers:{
        logon(state,{payload:{userName,password}}){
            return {...state,userName,password}
        }
    },
    subscriptions:{
        keyboardWatcher({ dispatch }) {
            key('a', () => { 
                alert('key press...');
                dispatch({type:'count/add'}) ;
            });
        },
        connectWatcher({dispatch}){
            return window.ChatWatcher.connectionListen((status)=>{
                    // alert(status);   
                if(status == window.Strophe.Status.CONNECTED){
                    ////// Inside Effects
                    dispatch(routerRedux.push('/chat'));
                }
            });
        } 
    }
}