import {connect} from 'dva';
import {Component} from 'react';
import Modal, { Input, Button ,Menu,Icon} from 'antd';
import styles from "./Chat.css";
import{Strophe} from 'strophe';
"use strict";

class Chat extends Component{
    constructor(props){
        super();
        this.state={
            send_message:'',
            chat_roster:'',
        };
    }
    sendMessageHandler=()=>{
        if(this.state.send_message=='') return ;
        let to = this.state.chat_roster;
        let type = 'chat';
        let body = this.state.send_message;
        let isSended = window.ChatWatcher.sendMessage(to,type,body);
        if(isSended){
            let v = window.ChatWatcher.myJid + "---" + body +"\n";
            this.props.dispatch({
                type:'chat/send',
                payload:{recv_messages:[
                    {
                        from:window.ChatWatcher.myJid,
                        to:to,
                        body:body,
                        time:'',
                        type:'SEND'
                    }
                ]},
            });
           // e.target.value="";
           this.setState({send_message:''});
        }
    }
    getRoster=()=>{
        // window.ChatWatcher.sendRosterIq();
        this.props.dispatch({
            type:'chat/fetchRosters',
            payload:{id:"31"},
        });
    }
    rosterItemClick=(item)=>{
        alert(item);
    }
    handleClick=(e)=>{
        this.setState({chat_roster:e.key});
        this.props.dispatch({
            type:'chat/getRoster2Messages',
            payload:{chat_roster:e.key},
        });
    }
    render(){
        const { TextArea } = Input;
        const SubMenu = Menu.SubMenu;
        
        return(
            <div className={styles.send_form}>
                <div>
                        <Menu
                            onClick={this.handleClick}
                            style={{ width: 256 }}
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub2']}
                            mode="inline"
                        >
                            <SubMenu key="sub2" title={<span><Icon type="appstore" /><span>Navigation Two</span></span>}>
                            {
                                this.props.rosters.map((item)=>{
                                    return <Menu.Item key={item}>{item}</Menu.Item>
                                })
                            }
                            </SubMenu>
                            <SubMenu key="sub4" title={<span><Icon type="setting" /><span>Navigation Three</span></span>}>
                                <Menu.Item key="9">Option 9</Menu.Item>
                                <Menu.Item key="10">Option 10</Menu.Item>
                                <Menu.Item key="11">Option 11</Menu.Item>
                                <Menu.Item key="12">Option 12</Menu.Item>
                            </SubMenu>
                        </Menu>
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
                        {this.state.chat_roster}
                    </div>
                    <div>
                        <TextArea ref="txtRecv" placeholder="接收消息" rows={10} value={this.props.roster2messages.map((item)=>{
                            return item.from +" ::: " + item.body + "\n"; 
                        })}/>
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
    const {recv_messages,rosters,send_message,chat_roster,roster2messages} =state.chat;
    return {recv_messages,rosters,send_message,chat_roster,roster2messages};
}
export default connect(mapStateToProps)(Chat)