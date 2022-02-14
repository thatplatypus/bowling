import React, { Children, Component } from 'react';
import '../App.css';

class List extends Component {

    //Generic wrapper for a React list
    render() {
        return (<>
            <ul className="listContainer">
                {this.props.data.map(item =>
                (<li className="listCell" key={item.id}>
                    {React.cloneElement(this.props.children, item)}
                </li>))}
                </ul>
        </>);
    }
}

export default List;