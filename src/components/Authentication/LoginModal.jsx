import React, { useState } from 'react';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes} from '@fortawesome/free-solid-svg-icons'; 
import './Auth.css'
import star from '../../assets/ui/star.png'
import logo from '../../assets/images/Other-Pay-Method.png'


const LoginModal = ({ handleSwitchToRegister, handleCloseAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toggle, setToggle] = useState(true)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
                setEmail('');
                setPassword('');
                setErrorMessage('');
                setIsSigningIn(false);
                handleCloseAuth()
            } catch (error) {
                if (error.code === 'auth/invalid-credential') {
                    setErrorMessage('The account does not exist or the email or password entered is incorrect.');
                } else {
                    setErrorMessage(error.message);
                }
                setIsSigningIn(false);
            }
        }
    };
    
    const handleSignInWithGoogle = async () => {
        try {
            setIsSigningIn(true);
            await doSignInWithGoogle(); 
            setIsSigningIn(false);
            handleCloseAuth()
        } catch (error) {
            setErrorMessage(error.message);
            setIsSigningIn(false);
        }
    };

    return (
        <div className='auth-modal login'>
            <form onSubmit={handleSubmit}>     
                <div className="logo">
                    <img src={star} alt="" />
                    <h1>Zoevestica</h1>
                    <img src={star} alt="" />
                </div>
                <div className="toggle">
                    <div className={`login ${toggle ? 'active' : ''}`}  onClick={()=>{setToggle(true)}}>Login</div>
                    <div className={`register ${toggle ? '' : 'active'}`} onClick={()=>{setToggle(false); handleSwitchToRegister()}}>Register</div>
                </div>
                <div className="close" onClick={handleCloseAuth} >
                    <FontAwesomeIcon icon={faTimes} />
                    Close
                </div>
                <div>
                    <input
                        type="email"
                        placeholder='Enter email'
                        autoComplete='email'
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder='Enter password'
                        autoComplete='current-password'
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {errorMessage && (
                    <span>{errorMessage}</span>
                )}

                <div className='google'>
                    <button onClick={handleSignInWithGoogle} disabled={isSigningIn}>
                        <img src={logo} alt="" />
                        {isSigningIn? 'Signing In with Google...' : 'Or Sign In with Google'}
                    </button>
                </div>
                <button type='submit' disabled={isSigningIn}>
                    {isSigningIn ? 'Signing In...' : 'Sign In'}
                </button>
                <p className='switch'>Don't have an account? <button onClick={handleSwitchToRegister}>Register</button></p>
            </form>
            
        </div>
    );
};

export default LoginModal;
