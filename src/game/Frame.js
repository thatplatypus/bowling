import React, { Component } from 'react';
import '../App.css';

class Frame extends Component {


    render() {
        return (<>
            <div className="frameContainer">
                <div className="frameContainerTopBar">
                    <span style={{ float: "left", font: "bold",}}>Frame {this.props.frame}</span><span>{this.props.roll1}</span>|<span>{this.props.roll2}</span>
                </div>
                <div className="frameContainerBottomBar">
                    <span>{this.props.runningScore}</span>
                 </div>
            </div>
        </>);
    }
}

export default Frame;