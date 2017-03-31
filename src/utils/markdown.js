import React from 'react';

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text)
}

// https://github.com/rexxars/react-markdown/issues/69 Headings are missing anchors / ids
export function HeadingRenderer(props) {
  var children = React.Children.toArray(props.children)
  var text = children.reduce(flatten, '')
  var slug = text.toLowerCase().replace(/\W/g, '-')
  return React.createElement('h' + props.level, {id: slug}, props.children)
}

import {uriTransformer} from 'react-markdown';
const isABsUriReg = new RegExp('^(?:[a-z]+:)?//', 'i');

function stripSlash(url) {
  return url.replace(/^\//, '');
}

// https://github.com/rexxars/react-markdown/issues/65 Opening link in a new tab
export function LinkRenderer(prefix, props) {
  if(props.href.startsWith('#')) {
    return <a href={props.href}>{props.children}</a>
  }
  return <a href={props.href} className="markdown-link" target="_blank">{props.children}</a>
}

export function ImageRenderer(prefix, props) {
  if(!isABsUriReg.test(props.src)) {
    props.src = prefix + props.src
  }
  return <img src={props.src} {...props} />
}

export function transformLinkUri(prefix, uri) {
  uri = uriTransformer(uri)
  if (uri.startsWith('#')) return uri;
  if(isABsUriReg.test(uri)) return uri;
  return prefix + stripSlash(uri);
}

export function transformImageUri(prefix, uri) {
  if(isABsUriReg.test(uri)) return uri;
  return prefix + stripSlash(uri);
}
