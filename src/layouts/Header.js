import {Menu,Icon} from 'antd';
import Link from 'umi/link';

function Header({location}){
    return (
        <Menu 
            selectedKeys ={[location.pathname]}
            mode="horizontal"
            theme="dark"
            >
            <Menu.Item key="/">
                <Link to="/"> <Icon type="home"/>home</Link>
            </Menu.Item>
            <Menu.Item key="/logon">
             <Link to="/logon">logon</Link>
            </Menu.Item>
            <Menu.Item key="/users">
                <Link to="/users"><Icon type="bars"/>users</Link>
            </Menu.Item>
            <Menu.Item key="/chat">
                <Link to="/chat">chat</Link>
            </Menu.Item>
            <Menu.Item key="/groupchat">
                <Link to="/groupchat">groupchat</Link>
            </Menu.Item>
            <Menu.Item key="/404">
                <Link to="/page-you-dont-know"><Icon type="frown-circle" />404</Link>
            </Menu.Item>
        </Menu>
    )
}
export default Header;