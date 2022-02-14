import React, { Children, Component } from 'react';
import '../App.css';
import Frame from '../game/Frame';


class List extends Component {

    render() {
        return (<>
            <ul className="listContainer">
                {this.props.data.map(item =>
                (<li key={item.id}>
                    {React.cloneElement(this.props.children, item)}
                </li>))}
                </ul>
        </>);
    }
}

export default List;