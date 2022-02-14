
import './App.css';
import Header from './components/Header'
import Footer from './components/Footer'
import Manager from './game/Manager'


function App() {
    return (
        <div className="App">
            <Header />
            <Manager />
            <Footer />
        </div>
    );
}

export default App;
