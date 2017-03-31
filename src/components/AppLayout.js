import React, { Component } from 'react';
import { Router, Route, Link, Switch } from 'react-router'
// https://reacttraining.com/react-router/web/example/basic
// Router version 4 changed from passing in the browserHistory class to passing an instance of browserHistory

import AppMenu from './AppMenu' // Keep in mind, not {Appmenu}

import { Layout, Radio } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

import { browserHistory } from 'react-router'


import {getTopicRepoList, RankAsMenus, getTrendingBatch } from '../data/gitlogs'
import {getAwesomeMenus} from '../data/awesome'
import {getSimAsMenus} from '../data/yasiv'

import AppHead from './AppHead'


class AppLayout extends React.Component {

  state = {
    menuData: []
  }

  componentDidMount() {
    const that = this;
    console.log('did mount applayout')
    console.log(this.props)

    const {history} = this.props;

    function setMenuAndFetch(menu) {
      // Todo: exception handle
      that.setState({
        menuData: menu,
        menuLoading: false,
        similarUrl: '',
      });
      // http://stackoverflow.com/questions/36187134/react-router-2-0-programmatically-change-route-url-not-updated
      browserHistory.push('/repo/' + menu[0].list[0].key)
    }

    const unlisten = history.listen((location, action) => {
      // location is an object like window.location
      console.log(action.location.pathname)
      const pathname = action.location.pathname
      if(pathname.startsWith('/repo/')) {
        if(pathname.endsWith('/similar')) {
          that.setState({
            menuLoading: true,
          })
          getSimAsMenus(action.params.repo.replace('___', '/'), (menu)=>{
            setMenuAndFetch(menu);
          })
        } else {
          that.setState({
            menuLoading: false,
            similarUrl: `/repo/${action.params.repo}/similar`
          })
        }
      } else {
        that.setState({
          menuLoading: true,
          similarUrl: '',
        })
      }
      if(pathname.startsWith('/topic/')) {
        // fetch app menu data
        // reload to first readme
        var topic = pathname.replace('/topic/', '')
        getTopicRepoList(topic, (menu)=>{
          // Todo: adapter
          setMenuAndFetch(menu);
        })
      }
      if(pathname === '/topics') {
        // hide sidebar menu
        that.setState({
          menuData: [],
          menuLoading: false
        });
      }

      // Default type repos list
      if(pathname === '/awesome' || pathname === '/') {
        getAwesomeMenus((menu)=>{
          setMenuAndFetch(menu);
        })
      }

      if(pathname === '/trending') {
        getTrendingBatch((menu)=>{
          setMenuAndFetch(menu);
        })
      }

      if(pathname === '/rank') {
        setMenuAndFetch(RankAsMenus);
      }
    })
  }

  componentWWillUnMount() {
    // unlisten history changes
  }


  render(props) {
    console.log('render applayout')

    return (
      <Layout>
        <AppHead similarUrl={this.state.similarUrl} />
        <Layout className="ga-main">
          { !!this.state.menuData.length && (
            <Sider width={250} style={{ background: '#fff' }}>
              <AppMenu data={this.state.menuData} loading={this.state.menuLoading} mode="inline" />
            </Sider>
          )}
          <Layout className="ga-content">
            {this.props.content}
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default AppLayout;
