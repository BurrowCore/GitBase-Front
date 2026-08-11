import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import type { RootState, AppDispatch } from '../features/store'
import { logout, checkAuthState, clearError } from '../features/auth/authSlice'
import { authService } from '../services/authService'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isLoggedIn, loading, error } = useSelector(
    (state: RootState) => state.auth
  )

  // Check auth state on mount
  useEffect(() => {
    if (!user) {
      dispatch(checkAuthState())
    }
  }, [dispatch, user])

  const logoutUser = async () => {
    try {
      await dispatch(logout()).unwrap()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    user,
    isLoggedIn,
    loading,
    error,
    logout: logoutUser,
    clearError: clearAuthError
  }
} 