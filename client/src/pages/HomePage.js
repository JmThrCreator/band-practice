import React, { useState } from 'react';

import '../css/Home.scss'

const CreateBoard = () => {

    const [open, setOpen] = useState([]);

    return (
        <div className="create-board" onClick={() => setOpen(!open)}>
            <div className={open ? 'open' : 'closed'}>
                <h2>Create Board</h2>

                <div className="email-input">
                    <label>Email</label>
                    <input type="string"></input>
                </div>
            </div>
        </div>
    )
}

const EnterCode = () => {

    const [open, setOpen] = useState([]);

    return (
        <div className="enter-code" onClick={() => setOpen(!open)}>
            <div className={open ? 'open' : 'closed'}>
                <h2>Enter Code</h2>
            </div>
        </div>
    )
}

const HomePage = () => {

    return (
        <div className="homepage">
            <div className="title">
                <h1>Band Practice</h1>
                <p>Descriptive text that describes some stuff</p>
            </div>

            <div className="buttons">
                <CreateBoard/>
                <EnterCode/>
            </div>
        </div>
    )
}

export default HomePage;