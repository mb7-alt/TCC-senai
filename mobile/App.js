import { StatusBar } from 'expo-status-bar';
import { Home } from './Telas/Home';
import { Login } from './Telas/Login';
import { useState } from 'react';

export default function App() {
    const [logado, setLogado] = useState(false);

    return (
        <>
        <StatusBar style="auto" />
        {logado ? <Home /> : <Login onLoginSucess={() => setLogado(true)} />}
        </>
    );
}