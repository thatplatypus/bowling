import React, { Component } from 'react';
import logo from '../icons/logo.svg';
import '../App.css';

class Header extends Component {

    constructor() {
        super();
    };

    render() {
        return (
            <header className="App-header" >
                <img className="App-header-logo" src={logo} alt="Logo" height="75vh" width="75vh" />
                <div className="App-header-text">Bowling Game</div>
            </header >
        );
    }
}

export default Header;
