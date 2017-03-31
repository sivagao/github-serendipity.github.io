import React, { Component } from 'react';

import { Menu, Icon, Spin, Tooltip } from 'antd';
const SubMenu = Menu.SubMenu;
import { Link } from 'react-router';
import _ from 'lodash'

import {store, hourExpire} from '../utils/store'

class AppMenu extends React.Component {

  state = {}

  render() {
    console.log('rendering menu')
    // default open all menus
    const defaultKeys = ['Infinity,1000', 'topic_only', 'trending_first', 'Platforms', 'similar-repos']
    const openKeys = _.union(defaultKeys, _.map(this.props.data, 'key'))
    // const openKeys =
    // openKeys &&  this.setState({ openKeys })
    const cacheStore = store.get('repo:readdict')
    const submenusElems = this.props.data.map((i)=>{
      let menuItemsElems = i.list.map((ii)=>{
        return (
          <Menu.Item key={ii.key}>
            {ii.description ? (
              <Tooltip title={ii.description} placement="right">
                <Link to={'/repo/'+ii.key}>
                  {cacheStore[ii.key] && <Icon type="check" style={{"color": "green"}} />}
                  {ii.name}
                  <Icon type="info-circle-o" />
                </Link>
              </Tooltip>
            ) : (
              <Link to={'/repo/'+ii.key}>
              {cacheStore[ii.key] && <Icon type="check" style={{"color": "green"}} />}
              {ii.name}
              </Link>
            )}
          </Menu.Item>
        )
      })

      return (
        <SubMenu key={i.key}
          title={<span className="nav-text">{i.name}</span>}>
          {menuItemsElems}
        </SubMenu>
      )
    })

    // const now = new Date()
    // const lastDay = new Date(now.setDate(now.getDate() -1)).toISOString().slice(0, 10)
    return (
      <Spin spinning={this.props.loading}>
        <Menu inlineIndent="12" mode={this.props.mode}
          defaultOpenKeys={openKeys}>
          {submenusElems}
        </Menu>
      </Spin>

    );
  }
}

export default AppMenu;
