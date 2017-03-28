import React, { Component } from 'react';
import './App.css';

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


const dataSources = ['Trending', 'Rank', 'Awesome', 'Topics'];

import {getTopicRepoList, TagTopicsAsMenus, getTrendingBatch } from '../data/gitlogs'
import {getAwesomeMenus} from '../data/awesome'

const INavHeader = (props) => (
  <Header style={{ background: '#fff', padding: 0 }}>

    <Menu mode="horizontal">
      {/* Todo: need logo <div className="logo" style={{ display: 'inline', color: '#fff', 'font-size': '24px'}}>
        Plaza Repo
      </div> */}
      {dataSources.map((s)=>{
        let v = s.toLowerCase()
        return (
          <Menu.Item key={v}>
            <Link to={'/'+v}>
              {v}
            </Link>
          </Menu.Item>
        )
      })}
      {/* Todo: 当是 topic 时候，也显示在 menu 上用于展示 */}
    </Menu>
  </Header>
)

class AppLayout extends React.Component {

  state = {
    menuData: TagTopicsAsMenus
  }

  componentDidMount() {
    const that = this;
    console.log('did mount applayout')
    console.log(this.props)

    const {history} = this.props;

    const unlisten = history.listen((location, action) => {
      // location is an object like window.location
      console.log(action.location.pathname)
      const pathname = action.location.pathname
      if(pathname.startsWith('/topic/')) {
        // fetch app menu data
        // reload to first readme
        var topic = pathname.replace('/topic/', '')
        getTopicRepoList(topic, (menu)=>{
          // Todo: adapter
          that.setState({
            menuData: menu
          })
        })
      }
      if(pathname === '/topics') {
        // hide sidebar menu
      }

      if(pathname === '/awesome') {
        getAwesomeMenus((menu)=>{
          that.setState({
            menuData: menu
          })
        })
      }

      if(pathname === '/trending') {
        getTrendingBatch((menu)=>{
          that.setState({
            menuData: menu
          })
        })
      }
    })
  }

  componentWWillUnMount() {
    // unlisten history changes
  }


  render(props) {
    console.log('render applayout')

    return (
      <div>
        <Layout>
          <INavHeader />
          <Layout>
            <Sider width={200} style={{ background: '#fff' }}>
              <AppMenu data={this.state.menuData}  mode="inline" />
              {/* onClick={(key)=>this.handleSelectRepo(key)} */}
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>

              <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
                {this.props.children}
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>

    )
  }
}

// const AppLayout = (props)=> {
//   return (
//     <div>
//
//     </div>
//   )
// }

//
// class AppLayout extends React.Component {
//
//   // state = {
//   //   collapsed: false,
//   //   mode: 'inline',
//   // }
//
//   onCollapse(collapsed){
//     console.log(collapsed);
//     this.setState({
//       collapsed,
//       mode: collapsed ? 'vertical' : 'inline',
//       reporeadme: '# This is a header\n\nAnd this is a paragraph'
//     });
//   }
//   handleSelectRepo(key) {
//     // fetch repo readme. setState
//     // let self = this;
//     // getReadme(key, (content)=>{
//     //   self.setState({
//     //     reporeadme: content
//     //   })
//     // })
//   }
//   render(props) {
//
//
//     if(this.props) {
//       console.log(this.props)
//     }
//
//     // check route params set
//
//     return (
//
//
//       // <Layout className="app-layout">
//       //   <Sider
//       //     collapsible
//       //     collapsed={this.state.collapsed}
//       //     onCollapse={this.onCollapse}>

//       //     <AppMenu data={rankData} onClick={(key)=>this.handleSelectRepo(key)} mode="inline" />
//       //   </Sider>
//       //   <Layout>
//       //     <INavHeader />
//       //     <Content style={{ margin: '16px' }}>
//       //       <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
//       //         <Route path="/" component={GitlogTopics} />
//       //         <Route path="/repo/:repo" component={ReadmePanel} />
//       //         <Route component={ReadmePanel} />
//       //       </div>
//       //     </Content>
//       //     <Footer style={{ textAlign: 'center' }}>
//       //       Ant Design ©2016 Created by Ant UED
//       //     </Footer>
//       //   </Layout>
//       // </Layout>
//     );
//   }
// }

export default AppLayout;
