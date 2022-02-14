import React, { Component } from 'react';
import '../App.css';
import Frame from './Frame';
import List from '../components/List'

class FrameList extends Component {

    render() {
        return (<>
            <List data={this.props.data}>
                <Frame
                    />
             </List>
        </>);
    }
}

export default FrameList;