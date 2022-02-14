import React, { Component } from 'react';
import '../App.css';

class Frame extends Component {

    //Reusable component to represent a frame
    render() {
        return (<>
            <div className="frameContainer">
                <div className="frameContainerTopBar">
                    <span style={{ float: "left"}}>Frame {this.props.frame}</span>
                    {this.props.strike && <span style={{ backgroundColor: "black" }}>10</span>} 
                    {!this.props.strike && this.props.spare && <> <span>{this.props.roll1}</span> | <span>◢</span> </>} {this.props.roll3 !== 0 && <span> || {this.props.roll3} </span>}
                    {!this.props.strike && !this.props.spare && <> <span>{this.props.roll1}</span> | <span>{this.props.roll2}</span> </>}
                </div>
                <div className="frameContainerBottomBar">
                    <span>{this.props.runningScore}</span>
                 </div>
            </div>
        </>);
    }
}

export default Frame;