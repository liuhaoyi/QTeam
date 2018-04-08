import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import styles from './NormalLoginForm.css'
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let BOSH_SERVICE = 'http://192.168.170.26:7070/http-bind/';
        //获取登录名和密码；
        let userName = this.props.form.getFieldValue('userName');
        let password = this.props.form.getFieldValue('password');
        window.ChatWatcher.connect(BOSH_SERVICE,userName,'server1','pc',password);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className={styles.login_form}>
        <FormItem>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>Remember me</Checkbox>
          )}
          <a className={styles.login_form_forgot} href="">Forgot password</a>
          <Button type="primary" htmlType="submit" className={styles.login_form_button}>
            Log in
          </Button>
          Or <a href="">register now!</a>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(NormalLoginForm);
