import React, { useState } from 'react';
import { useForm } from "react-hook-form"

import axios from 'axios';

import { useNavigate } from "react-router-dom";

import '../css/Home.scss'

const CreateBoard = () => {

    const { register, setError, clearErrors, formState: { errors } } = useForm();

    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")

    const emailReg = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const getCode = () => {
        let charList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        let length = 15
        let tempCode = ""

        for (let i = 0; i < length; i++) {
            let randomIndex = (Math.round(Math.random()*charList.length));
            tempCode = tempCode+charList.charAt(randomIndex);
        }

        return tempCode
    }

    const onSubmit = async () => {
        let emailReg = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        
        if (email === "" || email === undefined || !emailReg.test(email)) {
            setError("email", {type:"focus", message:"Please enter a valid email"}, {shouldFocus:true})
            return
        }

        let tempCode = getCode()

        try {
            const res = await axios.post(`/api/addBoard`, {code: tempCode, email:email});
            setCode(tempCode)
            clearErrors()
        }
        catch (err) {
            if (err.response.data.message === "email already in use") {
                setError("email", {type:"focus", message:"Email already in use"}, {shouldFocus:true})
            } else {
                console.log(err);
            }
        }
    }

    return (
        <div className="create-board">
            <div className={open ? 'open' : 'closed'}>
                <h2 onClick={() => setOpen(!open)}>Create Board</h2>
                
                <div className="email-input">
                    <label>Email</label>
                    <input type="string" onChange={e => {setEmail(e.target.value)}}></input>
                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                <button className="get-code-button" onClick={onSubmit}>
                    Get Code
                </button>

                <div className="code-output">
                    <label>Code</label>
                    <input type="string" value={code} disabled={true}></input>
                </div>

                <p className="remember-this">Remember this!</p>
            </div>
        </div>
    )
}

const EnterCode = () => {

    const { setError, formState: { errors } } = useForm();

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");

    const onSubmit = async () => {
        if (code.length <= 0) {
            setError("code", {type:"focus", message:"Please enter a valid code"}, {shouldFocus:true})
            return
        }

        try {
            const res = await axios.get(`/api/${code}/board`)
            if (res.data === "valid") {
                navigate(`/board/${code}`);
            }
        } catch (err) {
            if (err.response.data.message === "board does not exist") {
                setError("code", {type:"focus", message:"Please enter a valid code"}, {shouldFocus:true})
            } else {
                console.log(err);
            }
        }
    }

    return (
        <div className="enter-code">
            <div className={open ? 'open' : 'closed'}>
                <h2 onClick={() => setOpen(!open)}>Enter Code</h2>

                <div className="code-input">
                    <label>Code</label>
                    <input type="string" value={code} onChange = {e => {setCode(e.target.value)}}></input>
                    {errors.code && <p>{errors.code.message}</p>}
                </div>

                <button className="enter-code-button" onClick={onSubmit}>
                    Go!
                </button>
                
            </div>
        </div>
    )
}

const HomePage = () => {

    return (
        <div className="homepage">
            <div className="title">
                <h1>Band Practice</h1>
            </div>

            <div className="buttons">
                <CreateBoard/>
                <EnterCode/>
            </div>
        </div>
    )
}

export default HomePage;