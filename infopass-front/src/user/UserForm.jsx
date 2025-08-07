import React from 'react'

const UserForm = ({ userInfo, updateUser, deleteUser }) => {

    const onUpdate = (e) => {
        e.preventDefault()

        const form = e.target
        const email = form.email.value
        const password = form.password.value
        const name = form.name.value
        const phone = form.phone.value
        const address = form.address.value
        const nickname = form.nickName.value

        console.log(email, password, name, phone, address, nickname);

        updateUser( {email, password, name, phone, address, nickname } )
    }

    return (
        <div className="form">
            <h2 className="login-title">UserInfo</h2>

            <form className='login-form' onSubmit={ (e) => onUpdate(e) }>
                <div>
                    <label htmlFor="name">email</label>
                    <input type="text"
                            id='email'
                            placeholder='email'
                            name='email'
                            autoComplete='email'
                            required
                            readOnly
                            defaultValue={ userInfo?.email }
                    />
                </div>

                <div>
                    <label htmlFor="password">password</label>
                    <input type="password"
                            id='passowrd'
                            placeholder='password'
                            name='password'
                            autoComplete='password'
                            required
                    />
                </div>

                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text"
                            id='name'
                            placeholder='name'
                            name='name'
                            autoComplete='name'
                            required
                            defaultValue={ userInfo?.name }
                    />
                </div>

                <div>
                    <label htmlFor="name">phone</label>
                    <input type="text"
                            id='phone'
                            placeholder='phone'
                            name='phone'
                            autoComplete='phone'
                            required
                            defaultValue={ userInfo?.phone }
                    />
                </div>
                <div>
                    <label htmlFor="name">address</label>
                    <input type="text"
                            id='address'
                            placeholder='address'
                            name='address'
                            autoComplete='address'
                            required
                            defaultValue={ userInfo?.address }
                    />
                </div>
                <div>
                    <label htmlFor="name">nickname</label>
                    <input type="text"
                            id='nickname'
                            placeholder='nickname'
                            name='nickname'
                            autoComplete='nickname'
                            required
                            defaultValue={ userInfo?.nickname }
                    />
                </div>
                

                <button type='submit' className='btn btn--form btn-login'>
                    정보 수정     
                </button>
                <button type='button' className='btn btn--form btn-login'
                        onClick={ () => deleteUser(userInfo.userId)} >
                    회원 탈퇴
                </button>
            </form>
        </div>
    )
}

export default UserForm