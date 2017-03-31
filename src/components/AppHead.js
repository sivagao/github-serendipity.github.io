import { Menu, Icon, Tag } from 'antd';
import { Router, Route, Link, Switch } from 'react-router'
import React, { Component } from 'react';
import { Layout, Radio } from 'antd';

const { Header, Content, Footer, Sider } = Layout;


const dataSources = ['Awesome', 'Trending', 'Rank', 'Topics'];

const AppHead = (props) => (
  <Header className="ga-header">
    <Link to="/" className="logo link link--surinami">
      <span data-letters-l="Github " data-letters-r="Serendipity">Github Serendipity</span>
    </Link>

    <Menu mode="horizontal">
      {dataSources.map((s)=>{
        let v = s.toLowerCase()
        return (
          <Menu.Item key={v}>
            <Link to={'/'+v}>{s}</Link>
          </Menu.Item>
        )
      })}
      {/* Todo: 当是 topic 时候，也显示在 menu 上用于展示 */}
      {props.similarUrl && (
        <Menu.Item key='Similar'>
          <Link to={props.similarUrl}>Similar</Link>
        </Menu.Item>
      )}

    </Menu>

    {props.similarUrl && (
      <Tag className="view-repo">
        <a href={'//github.com/'+props.similarUrl.replace('/repo/', '').replace('/similar', '').replace('___', '/')} target="_blank"> View On Github</a>
      </Tag>
    )}
  </Header>
)

export default AppHead
