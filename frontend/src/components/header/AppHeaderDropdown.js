import React, { useContext, useEffect, useState } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/10.png'
import './style.css'
import contextCreator from 'src/pages/context/contextCreator'
import moment, { months } from 'moment/moment'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const context = useContext(contextCreator)
  const {
    getAccountants,
    updateAccountant,
    deleteAccountant,
    getAdmins,
    updateAccountantStatus,
    getStatusUpdate,
  } = context
  const [wait, setWait] = useState('')

  // Function to close the pop-up
  const closePopup = () => {
    setIsPopupOpen(false)
  }

  // Function to decode the token
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (error) {
      return ''
    }
  }

  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem('token')
    const decodedToken = decodeToken(token)
    const email = decodedToken.email
    const adminRole = decodedToken.role
    if (adminRole === 'Accountant') {
      const fetchStatusUpdate = async () => {
        const response = await getStatusUpdate(email)
        if (!response.active) {
          // Remove the token from localStorage (or any other storage you use)
          localStorage.removeItem('token')

          // Redirect to the login page
          navigate('/login') // Replace '/login' with the actual login route
        }
      }
      fetchStatusUpdate()
    }
  }, [])

  const [adminAccountants, setAdminAccountants] = useState([])

  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem('token')

    // Decode the token to get the username
    if (token) {
      const decodedToken = decodeToken(token)
      setUsername(decodedToken.username)
      const adminRole = decodedToken.role

      if (adminRole === 'Admin') {
        const fetchAccountants = async () => {
          try {
            const response = await getAccountants()
            // Assuming the data returned from getAccountants is an array
            // Update the adminAccountants state with the fetched data
            setAdminAccountants(response)

            // Check if adminAccountants array's length is not zero
            if (response.length !== 0) {
              setIsPopupOpen(true)
            }
          } catch (error) {
            console.error('An error occurred while fetching other crops:', error)
          }
        }

        fetchAccountants()
      }
    }
  }, [])

  const [adminsList, setAdminsList] = useState([])
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await getAdmins()
        // Assuming the data returned from getAccountants is an array
        // Update the adminAccountants state with the fetched data
        setAdminsList(response)
      } catch (error) {
        console.error('An error occurred while fetching other crops:', error)
      }
    }

    fetchAdmins()
  }, [])

  const handleLogout = () => {
    // Remove the token from localStorage (or any other storage you use)
    localStorage.removeItem('token')

    // Redirect to the login page
    navigate('/login') // Replace '/login' with the actual login route
  }

  const handleAllow = async (id) => {
    //First run fetch API to update
    setWait('اجازت دی جا رہی ہے')
    const response = await updateAccountant(id)
    if (response.success) {
      setWait('اجازت دے دی گئی')
      const updatedAccountants = adminAccountants.filter((accountant) => accountant._id !== id)
      setAdminAccountants(updatedAccountants)
    } else {
      // setWait('کچھ مسئلہ درپیش آگیا')
      setWait(response.error)
    }
  }

  const handleDecline = async (id) => {
    //First run fetch API to delete
    setWait('مسترد کیا جا رہا ہے')
    const response = await deleteAccountant(id)
    if (response.success) {
      console.log('success')
      setWait('کامیابی سے مسترد کر دیا گیا ہے')
      const updatedAccountants = adminAccountants.filter((accountant) => accountant._id !== id)
      setAdminAccountants(updatedAccountants)
    } else {
      console.log('problem')
      // setWait('کچھ مسئلہ درپیش آگیا')
      setWait(response.message)
    }
  }

  // Function to decode the token
  const getRole = () => {
    try {
      const token = localStorage.getItem('token')
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role
    } catch (error) {
      return ''
    }
  }

  const timeEnd = Date.now()

  const dateConverter = (startDate, timeEnd, type) => {
    const newStartDate = new Date(startDate)
    const newEndDate = new Date(timeEnd)
    let result = moment(newStartDate).diff(newEndDate, type)
    return result
  }

  const timeMaker = (startDate) => {
    const years = dateConverter(startDate, timeEnd, 'years')
    const month = dateConverter(startDate, timeEnd, 'months')
    const days = dateConverter(startDate, timeEnd, 'days')
    const hours = dateConverter(startDate, timeEnd, 'hours')
    const minutes = dateConverter(startDate, timeEnd, 'minutes')
    if (years !== 0) {
      return Math.abs(years) + ' سال پہلے'
    } else if (month !== 0) {
      return Math.abs(month) + ' مہینے پہلے'
    } else if (days !== 0) {
      return Math.abs(days) + ' دن پہلے'
    } else if (hours !== 0) {
      return Math.abs(hours) + ' گھنٹے پہلے'
    } else if (minutes !== 0) {
      return Math.abs(minutes) + ' منٹ پہلے'
    } else {
      return 'ابھی ابھی'
    }
  }

  const controlStatus = async (id, status) => {
    try {
      setWait('Changing Status...')
      const response = await updateAccountantStatus(id, status)
      if (response.success) {
        let updateStatus = !status

        // Update the adminsList to reflect the change in the active field
        const updatedAdminsList = adminsList.map((admin) => {
          if (admin._id === id) {
            return { ...admin, active: updateStatus }
          }
          return admin
        })

        // Set the updated adminsList in your state
        setAdminsList(updatedAdminsList)
        setWait('Status updated successfully')
      } else {
        setWait('Status not updated')
      }
    } catch (error) {
      setWait(error)
    }
  }

  return (
    <div>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-light fw-semibold py-2">{username}</CDropdownHeader>
          <CDropdownItem to="/dashboard" onClick={() => setIsPopupOpen(true)}>
            {getRole() === 'Admin' && (
              <>
                <CIcon icon={cilBell} className="me-2" />
                اکاؤنٹنٹس
                <CBadge color="info" className="ms-2">
                  {adminsList.length}
                </CBadge>
              </>
            )}
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilEnvelopeOpen} className="me-2" />
            ان باکس
            <CBadge color="success" className="ms-2">
              {/* 42 */}
            </CBadge>
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilTask} className="me-2" />
            ٹاسک
            <CBadge color="danger" className="ms-2">
              {/* 42 */}
            </CBadge>
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilCommentSquare} className="me-2" />
            کمنٹس
            <CBadge color="warning" className="ms-2">
              {/* 42 */}
            </CBadge>
          </CDropdownItem>
          <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilUser} className="me-2" />
            پروفائل
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilSettings} className="me-2" />
            سیٹنگز
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilCreditCard} className="me-2" />
            پیمنٹس
            <CBadge color="secondary" className="ms-2">
              {/* 42 */}
            </CBadge>
          </CDropdownItem>
          <CDropdownItem to="/dashboard">
            <CIcon icon={cilFile} className="me-2" />
            پروجیکٹس
            <CBadge color="primary" className="ms-2">
              {/* 42 */}
            </CBadge>
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem onClick={handleLogout}>
            <CIcon icon={cilLockLocked} className="me-2" />
            لاگ آؤٹ
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      {/* Pop-up message */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            {wait}
            <span className="close" onClick={closePopup}>
              &times;
            </span>
            {adminAccountants.map((accountant, index) => (
              <div key={index} className="mb-3">
                <p>{accountant.username} اس سسٹم کو استعمال کرنے کی اجازت چاہتے ہیں۔</p>
                <div className="btn-group" role="group" aria-label="Allow or Decline">
                  <button className="btn btn-success" onClick={() => handleAllow(accountant._id)}>
                    اجازت دیں
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDecline(accountant._id)}>
                    مسترد کر دیں
                  </button>
                </div>
              </div>
            ))}
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>کردار</th>
                  <th>وقت</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {adminsList.map((admin, index) => (
                  <tr key={index}>
                    <td>{admin.username}</td>
                    <td>{admin.role}</td>
                    <td>{timeMaker(admin.date)}</td>
                    <td style={{ color: admin.active ? 'green' : 'red' }}>
                      {admin.active ? 'Active' : 'Inactive'}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          controlStatus(admin._id, admin.active)
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        {admin.active ? 'Inactive' : 'Active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppHeaderDropdown
