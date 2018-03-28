import {connect} from 'dva';
import {Component} from 'react';
import Modal, { Input, Button ,List} from 'antd';
import styles from "./Chat.css";
import{Strophe} from 'strophe';
"use strict";

class Chat extends Component{
    constructor(props){
        super();
        this.state={send_message:''};
    }
    sendMessageHandler=()=>{
        if(this.state.send_message=='') return ;
        let to = 'l1@server1';
        let type = 'chat';
        let body = this.state.send_message;
        let isSended = window.ChatWatcher.sendMessage(to,type,body);
        if(isSended){
            let v = window.ChatWatcher.myJid + "---" + body +"\n";
            this.props.dispatch({
                type:'chat/send',
                payload:{recv_messages:[v]},
            });
           // e.target.value="";
           this.setState({send_message:''});
        }
    }
    getRoster=()=>{
        window.ChatWatcher.sendRosterIq();
    }
    render(){
        const { TextArea } = Input;
        return(
            <div className={styles.send_form}>
                <div>
                <List
                    header={<div>好友列表</div>}
                    bordered
                    dataSource={this.props.rosters}
                    renderItem={item => (<List.Item>{item}</List.Item>)}
                    />
                </div>
                <div>
                    {/* <div className={styles.send_message}>
                        <div className={styles.send_message_field}>
                            <Input rows={1} ref="txtUser" placeholder="登录名"  autosize="false"/>
                        </div>
                        <div className={styles.send_message_field}>
                            <Input rows={1} ref="txtPwd" placeholder="密码"  autosize="false"/>
                        </div>
                        <div className={styles.send_message_field}>
                            <Input rows={1} ref="txtResource" placeholder="资源"  autosize="false"/>
                        </div>
                        <div>
                            <Button default onClick={this.connect}>登录</Button>
                        </div>
                    </div> */}
                    <div>
                        <TextArea ref="txtRecv" placeholder="接收消息" rows={10} value={this.props.recv_messages}/>
                    </div>
                    <div className={styles.send_message}>
                        <div className={styles.send_message_field}>
                            <Input rows={1} ref="txtSend" placeholder="消息内容......" onChange={(e)=>this.setState({send_message:e.target.value})} value={this.state.send_message}  autosize="false" onPressEnter={this.sendMessageHandler}/>
                        </div>
                        <div>
                            <Button default onClick={this.sendMessageHandler}>发送消息</Button>
                            <Button default onClick={this.getRoster}>getRoster</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state){
    const {recv_messages,rosters,send_message} =state.chat;
    return {recv_messages,rosters,send_message};
}
export default connect(mapStateToProps)(Chat)