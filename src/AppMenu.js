import React, { Component } from 'react';
import './App.css';

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;

import RepoData from './data';
// { "_id" : "tmallfe/tmallfe.github.io", "countall" : 174, "desc" : "天猫前端" }

let repoStore = [[Infinity, 1000], [1000, 500], [500, 200], [200, 0]].map((c)=>{
  let list = RepoData.filter((i)=>{
    return c[0] > i.countall && i.countall >= c[1];
  }).sort( (a, b) => (b.countall - a.countall))
  .map((i)=>{
    return {
      key: i._id,
      name: i._id.split('/')[1] + ' ' + i.countall,
      description: i.desc
    }
  });
  return {
    key: c.toString(),
    name: 'Between ' + c.toString() + ' stars',
    list: list
  }
})

class AppMenu extends React.Component {
  handleSelectRepo() {
    console.log('fefdfdfd')
  }
  render() {
    const submenusElems = repoStore.map((i)=>{

      let menuItemsElems = i.list.map((ii)=>{
        return (
          <Menu.Item key={ii.key}>{ii.name}</Menu.Item>
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
    return (
      <Menu inlineIndent="12" mode={this.props.mode}
        defaultOpenKeys={['Infinity,1000']}
        onClick={({key})=>this.props.onClick(key)}>
        {/* theme="dark" */}
        {/* defaultSelectedKeys={['6']} */}
        {submenusElems}
      </Menu>
    );
  }
}

export default AppMenu;
