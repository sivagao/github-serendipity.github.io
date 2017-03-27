import React, { Component } from 'react';
import './App.css';

import AppMenu from './AppMenu';
import ReadmePanel from './ReadmePanel';

import { Layout, Radio } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function getReadme(name, cb) {
  var apiURL = 'https://api.github.com/repos/' + name + '/readme';

  fetch(apiURL, {
    headers: {
      accept: 'application/vnd.github.v3.raw', // html
    },
  }).then((resp)=>{
    return resp.text()
  }).then((raw)=>{
    cb(raw);
  });
}


class AppLayout extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: false,
      mode: 'inline',
    };
  }
  onCollapse(collapsed){
    console.log(collapsed);
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
      reporeadme: '# This is a header\n\nAnd this is a paragraph'
    });
  }
  handleSelectRepo(key) {
    // fetch repo readme. setState
    let self = this;
    getReadme(key, (content)=>{
      self.setState({
        reporeadme: content
      })
    })
  }
  render() {
    return (
      <Layout className="app-layout">
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" style={{ color: '#fff', 'font-size': '24px'}}>
            Plaza Repo
          </div>
          <AppMenu onClick={(key)=>this.handleSelectRepo(key)} mode={this.state.mode} />
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            Data Source
            <RadioGroup defaultValue="a">
              <RadioButton value="a">Trending</RadioButton>
              <RadioButton value="b">Rank</RadioButton>
              <RadioButton value="c">Awesome</RadioButton>
              <RadioButton value="d">Topics</RadioButton>
            </RadioGroup>
          </Header>
          <Content style={{ margin: '16px' }}>
            {/* <Breadcrumb style={{ margin: '12px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb> */}
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              <ReadmePanel source={this.state.reporeadme} />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2016 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default AppLayout;
