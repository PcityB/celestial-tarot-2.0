import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../authContext';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle, doSendEmailVerification } from '../../auth';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes} from '@fortawesome/free-solid-svg-icons'
import './Auth.css'

const RegisterModal = ({ handleSwitchToLogin, handleCloseAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [ipAddress, setIpAddress] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    useEffect(() => {
        const fetchIpAddress = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                setIpAddress(response.data.ip);
            } catch (error) {
                console.error('Error fetching IP address:', error);
            }
        };

        fetchIpAddress();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                const userCredential = await doCreateUserWithEmailAndPassword(email, password);
                const { uid, email: userEmail } = userCredential.user;

                const celestialRef = doc(db, 'celestial', uid);
                await setDoc(celestialRef, {
                    uid: uid,
                    email: userEmail,
                    ipAddress: ipAddress,
                    createdAt: serverTimestamp()
                });

                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setErrorMessage('');
                handleCloseAuth()
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Email already in use');
                    setIsRegistering(false)
                } else {
                    setErrorMessage(error.message);
                    setIsRegistering(false)
                }
            }
        }
    };

    const handleSignInWithGoogle = async () => {
        try {
            setIsRegistering(true);
            await doSignInWithGoogle(); 
            setIsRegistering(false);
            handleCloseAuth()
        } catch (error) {
            setErrorMessage(error.message);
            setIsRegistering(false);
        }
    };

    return (
        <>
            <main className='auth-modal register'>
                <form onSubmit={onSubmit}>
                    <div className="close" onClick={handleCloseAuth} >
                        <FontAwesomeIcon icon={faTimes} />
                        Close
                    </div>
                    <div>
                        <label>Email :</label>
                        <input
                            disabled={isRegistering}
                            type="email"
                            autoComplete='email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Password :</label>
                        <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='new-password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Confirm Password :</label>
                        <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='off'
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <span>{errorMessage}</span>
                    )}

                    <button
                        type="submit"
                        disabled={isRegistering && !isEmailVerified}
                    >
                        {isRegistering && !isEmailVerified ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <div>
                        <button onClick={handleSignInWithGoogle} disabled={isRegistering}>
                            {isRegistering ? 'Signing In with Google...' : 'Or Sign In with Google'}
                        </button>
                    </div>
                    <p  className='switch'>
                        Already have an account? {'   '}
                        <button onClick={handleSwitchToLogin}>Sign In</button>
                    </p>
                </form>
          
            </main>
        </>
    );
};

export default RegisterModal;
