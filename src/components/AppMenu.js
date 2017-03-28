import React, { Component } from 'react';
import './App.css';

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
import { Link } from 'react-router';


class AppMenu extends React.Component {
  handleSelectRepo() {
    console.log('fefdfdfd')
  }
  render() {
    // if(!this.props.data) return;
    const submenusElems = this.props.data.map((i)=>{

      let menuItemsElems = i.list.map((ii)=>{
        return (
          <Menu.Item key={ii.key}>
            <Link to={'/repo/'+ii.key}>{ii.name}</Link>
          </Menu.Item>
        )
      })

      return (
        <SubMenu
          key={i.key}
          title={<span className="nav-text">{i.name}</span>}
        >
          {menuItemsElems}
        </SubMenu>
      )
    })
    // const now = new Date()
    // const lastDay = new Date(now.setDate(now.getDate() -1)).toISOString().slice(0, 10)
    return (
      <Menu inlineIndent="12" mode={this.props.mode}
        defaultOpenKeys={['Infinity,1000', 'topic_only', 'trending_first', 'Platforms']}>
        {/* onClick={({key})=>this.props.onClick(key)} */}
        {/* theme="dark" */}
        {/* defaultSelectedKeys={['6']} */}
        {submenusElems}
      </Menu>
    );
  }
}

export default AppMenu;
