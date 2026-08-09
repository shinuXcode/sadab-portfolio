import React from 'react';
import RuntimeError from './pages/RuntimeError';
export default class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false}}
  static getDerivedStateFromError(){return {hasError:true}}
  componentDidCatch(error){console.error(error)}
  render(){return this.state.hasError?<RuntimeError/>:this.props.children}
}
