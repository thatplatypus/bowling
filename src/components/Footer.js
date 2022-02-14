import React, { Component } from 'react';
import { ReactComponent as Github } from '../icons/github.svg';
import '../App.css';

class Footer extends Component {

    constructor() {
        super();
    };

    render() {
        return (
            <header className="App-footer" >
                <div>2022 Tom Brewer</div>
                <a href="https://github.com/thatplatypus">
                    <Github className="App-footer-logo" alt="Github" />
                </a>
            </header >
        );
    }
}

export default Footer;