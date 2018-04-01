import React from 'react';
import {connect} from 'dva';
import {Menu, Icon,Input,Button} from 'antd';
import styles from './GroupChat.css';

class GroupChat extends React.Component{
    constructor(props){
        super();
        this.state={
            selected_group:{groupJid:'',groupName:'默认群组'},
            send_message:'',
        };
    }
    sendMessageHandler=()=>{
        if(this.state.send_message=='') return ;
        let toGroupJid = this.state.selected_group.groupJid;
        //  + "/" + window.ChatWatcher.myJid;
        let body = this.state.send_message;
        let isSended = window.ChatWatcher.sendGroupMessage(toGroupJid,body);
        if(isSended){
            // this.props.dispatch({
            //     type:'groupchat/send',
            //     payload:{recv_messages:[
            //         {
            //             from:window.ChatWatcher.myJid,
            //             to:toGroupJid,
            //             body:body,
            //             time:'',
            //             type:'SEND'
            //         }
            //     ]},
            // });
           this.setState({send_message:''});
        }
    }
    handleClick=(e)=>{
        this.setState({
            selected_group:{groupJid:e.key,groupName:e.key}
        });
        this.props.dispatch({
            type:'groupchat/getGroup2Messages',
            payload:{selected_group:{groupJid:e.key,groupName:e.key}},
        });
    }
    render(){
        const {TextArea} = Input;
        return (
            <div className={styles.groupchat_form}>
                <div>
                工作组
               <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    onClick={this.handleClick}
                    >
                    {
                        this.props.groups.map((item)=>{
                            //发送presence消息加入工作组；
                            window.ChatWatcher.joinGroup(item.groupJid);
                            return (
                                <Menu.Item key={item.groupJid}>
                                    <span>{item.groupName}</span>
                                </Menu.Item>
                            )
                        })
                    }
                </Menu>
                </div>
                <div>
                    <div>
                        {this.state.selected_group.groupName}
                    </div>
                    <div>
                        <TextArea ref="txtRecv" placeholder="接收消息" rows={10} value={this.props.group2messages.map((item)=>{
                            return item.from +" ::: " + item.body + "\n"; 
                        })}/>
                    </div>
                    <div className={styles.send_message}>
                        <div className={styles.send_message_field}>
                            <Input rows={1} ref="txtSend" placeholder="消息内容......" onChange={(e)=>this.setState({send_message:e.target.value})} value={this.state.send_message}  autosize="false" onPressEnter={this.sendMessageHandler}/>
                        </div>
                        <div>
                            <Button default onClick={this.sendMessageHandler}>发送消息</Button>
                        </div>
                    </div>
                </div>
                <div>
                    工作组成员区域
                </div>
            </div>
        );
    }
}
function mapStateToProps(state){
    const {recv_messages,group2messages,groups} =state.groupchat;
    return {recv_messages,group2messages,groups};
}
export default connect(mapStateToProps)(GroupChat);